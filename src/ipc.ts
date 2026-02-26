import { execFile as execFileCb } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { CronExpressionParser } from 'cron-parser';

import {
  DATA_DIR,
  IPC_POLL_INTERVAL,
  MAIN_GROUP_FOLDER,
  TIMEZONE,
} from './config.js';
import { AvailableGroup } from './container-runner.js';
import { createTask, deleteTask, getTaskById, updateTask } from './db.js';
import { isValidGroupFolder } from './group-folder.js';
import { parseTalpaListOutput, updateTunnelCache } from './infrastructure.js';
import { logger } from './logger.js';
import { RegisteredGroup } from './types.js';

export interface IpcDeps {
  sendMessage: (jid: string, text: string) => Promise<void>;
  registeredGroups: () => Record<string, RegisteredGroup>;
  registerGroup: (jid: string, group: RegisteredGroup) => void;
  syncGroupMetadata: (force: boolean) => Promise<void>;
  getAvailableGroups: () => AvailableGroup[];
  writeGroupsSnapshot: (
    groupFolder: string,
    isMain: boolean,
    availableGroups: AvailableGroup[],
    registeredJids: Set<string>,
  ) => void;
}

const execFile = promisify(execFileCb);

const TALPA_BIN = '/run/current-system/sw/bin/talpa';
const HOSTNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
const SERVICE_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/;
const TALPA_COMMANDS = ['dig', 'plug', 'list'] as const;
const STALE_RESPONSE_MS = 5 * 60 * 1000; // 5 minutes

function writeIpcResponse(
  sourceGroup: string,
  requestId: string,
  response: { status: 'success' | 'error'; output?: string; error?: string },
): void {
  const responsesDir = path.join(DATA_DIR, 'ipc', sourceGroup, 'responses');
  fs.mkdirSync(responsesDir, { recursive: true });

  const filePath = path.join(responsesDir, `${requestId}.json`);
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(response, null, 2));
  fs.renameSync(tempPath, filePath);
}

function cleanStaleResponses(ipcBaseDir: string, groupFolders: string[]): void {
  const now = Date.now();
  for (const group of groupFolders) {
    const responsesDir = path.join(ipcBaseDir, group, 'responses');
    if (!fs.existsSync(responsesDir)) continue;
    try {
      for (const file of fs.readdirSync(responsesDir)) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(responsesDir, file);
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > STALE_RESPONSE_MS) {
          fs.unlinkSync(filePath);
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

let ipcWatcherRunning = false;

export function startIpcWatcher(deps: IpcDeps): void {
  if (ipcWatcherRunning) {
    logger.debug('IPC watcher already running, skipping duplicate start');
    return;
  }
  ipcWatcherRunning = true;

  const ipcBaseDir = path.join(DATA_DIR, 'ipc');
  fs.mkdirSync(ipcBaseDir, { recursive: true });

  // Seed tunnel cache on startup
  execFile(TALPA_BIN, ['list'], { timeout: 10_000 })
    .then(({ stdout }) => {
      updateTunnelCache(parseTalpaListOutput(stdout));
      logger.info('Tunnel cache seeded on startup');
    })
    .catch(() => {
      logger.debug('Could not seed tunnel cache (talpa not available)');
    });

  const processIpcFiles = async () => {
    // Scan all group IPC directories (identity determined by directory)
    let groupFolders: string[];
    try {
      groupFolders = fs.readdirSync(ipcBaseDir).filter((f) => {
        const stat = fs.statSync(path.join(ipcBaseDir, f));
        return stat.isDirectory() && f !== 'errors';
      });
    } catch (err) {
      logger.error({ err }, 'Error reading IPC base directory');
      setTimeout(processIpcFiles, IPC_POLL_INTERVAL);
      return;
    }

    const registeredGroups = deps.registeredGroups();

    for (const sourceGroup of groupFolders) {
      const isMain = sourceGroup === MAIN_GROUP_FOLDER;
      const messagesDir = path.join(ipcBaseDir, sourceGroup, 'messages');
      const tasksDir = path.join(ipcBaseDir, sourceGroup, 'tasks');

      // Process messages from this group's IPC directory
      try {
        if (fs.existsSync(messagesDir)) {
          const messageFiles = fs
            .readdirSync(messagesDir)
            .filter((f) => f.endsWith('.json'));
          for (const file of messageFiles) {
            const filePath = path.join(messagesDir, file);
            try {
              const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              if (data.type === 'message' && data.chatJid && data.text) {
                // Authorization: verify this group can send to this chatJid
                const targetGroup = registeredGroups[data.chatJid];
                if (
                  isMain ||
                  (targetGroup && targetGroup.folder === sourceGroup)
                ) {
                  await deps.sendMessage(data.chatJid, data.text);
                  logger.info(
                    { chatJid: data.chatJid, sourceGroup },
                    'IPC message sent',
                  );
                } else {
                  logger.warn(
                    { chatJid: data.chatJid, sourceGroup },
                    'Unauthorized IPC message attempt blocked',
                  );
                }
              }
              fs.unlinkSync(filePath);
            } catch (err) {
              logger.error(
                { file, sourceGroup, err },
                'Error processing IPC message',
              );
              const errorDir = path.join(ipcBaseDir, 'errors');
              fs.mkdirSync(errorDir, { recursive: true });
              fs.renameSync(
                filePath,
                path.join(errorDir, `${sourceGroup}-${file}`),
              );
            }
          }
        }
      } catch (err) {
        logger.error(
          { err, sourceGroup },
          'Error reading IPC messages directory',
        );
      }

      // Process tasks from this group's IPC directory
      try {
        if (fs.existsSync(tasksDir)) {
          const taskFiles = fs
            .readdirSync(tasksDir)
            .filter((f) => f.endsWith('.json'));
          for (const file of taskFiles) {
            const filePath = path.join(tasksDir, file);
            try {
              const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              // Pass source group identity to processTaskIpc for authorization
              await processTaskIpc(data, sourceGroup, isMain, deps);
              fs.unlinkSync(filePath);
            } catch (err) {
              logger.error(
                { file, sourceGroup, err },
                'Error processing IPC task',
              );
              const errorDir = path.join(ipcBaseDir, 'errors');
              fs.mkdirSync(errorDir, { recursive: true });
              fs.renameSync(
                filePath,
                path.join(errorDir, `${sourceGroup}-${file}`),
              );
            }
          }
        }
      } catch (err) {
        logger.error({ err, sourceGroup }, 'Error reading IPC tasks directory');
      }
    }

    cleanStaleResponses(ipcBaseDir, groupFolders);

    setTimeout(processIpcFiles, IPC_POLL_INTERVAL);
  };

  processIpcFiles();
  logger.info('IPC watcher started (per-group namespaces)');
}

export async function processTaskIpc(
  data: {
    type: string;
    taskId?: string;
    prompt?: string;
    schedule_type?: string;
    schedule_value?: string;
    context_mode?: string;
    groupFolder?: string;
    chatJid?: string;
    targetJid?: string;
    // For register_group
    jid?: string;
    name?: string;
    folder?: string;
    trigger?: string;
    requiresTrigger?: boolean;
    containerConfig?: RegisteredGroup['containerConfig'];
    // For talpa_exec
    requestId?: string;
    command?: string;
    hostname?: string;
    service?: string;
  },
  sourceGroup: string, // Verified identity from IPC directory
  isMain: boolean, // Verified from directory path
  deps: IpcDeps,
): Promise<void> {
  const registeredGroups = deps.registeredGroups();

  switch (data.type) {
    case 'schedule_task':
      if (
        data.prompt &&
        data.schedule_type &&
        data.schedule_value &&
        data.targetJid
      ) {
        // Resolve the target group from JID
        const targetJid = data.targetJid as string;
        const targetGroupEntry = registeredGroups[targetJid];

        if (!targetGroupEntry) {
          logger.warn(
            { targetJid },
            'Cannot schedule task: target group not registered',
          );
          break;
        }

        const targetFolder = targetGroupEntry.folder;

        // Authorization: non-main groups can only schedule for themselves
        if (!isMain && targetFolder !== sourceGroup) {
          logger.warn(
            { sourceGroup, targetFolder },
            'Unauthorized schedule_task attempt blocked',
          );
          break;
        }

        const scheduleType = data.schedule_type as 'cron' | 'interval' | 'once';

        let nextRun: string | null = null;
        if (scheduleType === 'cron') {
          try {
            const interval = CronExpressionParser.parse(data.schedule_value, {
              tz: TIMEZONE,
            });
            nextRun = interval.next().toISOString();
          } catch {
            logger.warn(
              { scheduleValue: data.schedule_value },
              'Invalid cron expression',
            );
            break;
          }
        } else if (scheduleType === 'interval') {
          const ms = parseInt(data.schedule_value, 10);
          if (isNaN(ms) || ms <= 0) {
            logger.warn(
              { scheduleValue: data.schedule_value },
              'Invalid interval',
            );
            break;
          }
          nextRun = new Date(Date.now() + ms).toISOString();
        } else if (scheduleType === 'once') {
          const scheduled = new Date(data.schedule_value);
          if (isNaN(scheduled.getTime())) {
            logger.warn(
              { scheduleValue: data.schedule_value },
              'Invalid timestamp',
            );
            break;
          }
          nextRun = scheduled.toISOString();
        }

        const taskId = `task-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
        const contextMode =
          data.context_mode === 'group' || data.context_mode === 'isolated'
            ? data.context_mode
            : 'isolated';
        createTask({
          id: taskId,
          group_folder: targetFolder,
          chat_jid: targetJid,
          prompt: data.prompt,
          schedule_type: scheduleType,
          schedule_value: data.schedule_value,
          context_mode: contextMode,
          next_run: nextRun,
          status: 'active',
          created_at: new Date().toISOString(),
        });
        logger.info(
          { taskId, sourceGroup, targetFolder, contextMode },
          'Task created via IPC',
        );
      }
      break;

    case 'pause_task':
      if (data.taskId) {
        const task = getTaskById(data.taskId);
        if (task && (isMain || task.group_folder === sourceGroup)) {
          updateTask(data.taskId, { status: 'paused' });
          logger.info(
            { taskId: data.taskId, sourceGroup },
            'Task paused via IPC',
          );
        } else {
          logger.warn(
            { taskId: data.taskId, sourceGroup },
            'Unauthorized task pause attempt',
          );
        }
      }
      break;

    case 'resume_task':
      if (data.taskId) {
        const task = getTaskById(data.taskId);
        if (task && (isMain || task.group_folder === sourceGroup)) {
          updateTask(data.taskId, { status: 'active' });
          logger.info(
            { taskId: data.taskId, sourceGroup },
            'Task resumed via IPC',
          );
        } else {
          logger.warn(
            { taskId: data.taskId, sourceGroup },
            'Unauthorized task resume attempt',
          );
        }
      }
      break;

    case 'cancel_task':
      if (data.taskId) {
        const task = getTaskById(data.taskId);
        if (task && (isMain || task.group_folder === sourceGroup)) {
          deleteTask(data.taskId);
          logger.info(
            { taskId: data.taskId, sourceGroup },
            'Task cancelled via IPC',
          );
        } else {
          logger.warn(
            { taskId: data.taskId, sourceGroup },
            'Unauthorized task cancel attempt',
          );
        }
      }
      break;

    case 'refresh_groups':
      // Only main group can request a refresh
      if (isMain) {
        logger.info(
          { sourceGroup },
          'Group metadata refresh requested via IPC',
        );
        await deps.syncGroupMetadata(true);
        // Write updated snapshot immediately
        const availableGroups = deps.getAvailableGroups();
        deps.writeGroupsSnapshot(
          sourceGroup,
          true,
          availableGroups,
          new Set(Object.keys(registeredGroups)),
        );
      } else {
        logger.warn(
          { sourceGroup },
          'Unauthorized refresh_groups attempt blocked',
        );
      }
      break;

    case 'register_group':
      // Only main group can register new groups
      if (!isMain) {
        logger.warn(
          { sourceGroup },
          'Unauthorized register_group attempt blocked',
        );
        break;
      }
      if (data.jid && data.name && data.folder && data.trigger) {
        if (!isValidGroupFolder(data.folder)) {
          logger.warn(
            { sourceGroup, folder: data.folder },
            'Invalid register_group request - unsafe folder name',
          );
          break;
        }
        deps.registerGroup(data.jid, {
          name: data.name,
          folder: data.folder,
          trigger: data.trigger,
          added_at: new Date().toISOString(),
          containerConfig: data.containerConfig,
          requiresTrigger: data.requiresTrigger,
        });
      } else {
        logger.warn(
          { data },
          'Invalid register_group request - missing required fields',
        );
      }
      break;

    case 'talpa_exec': {
      if (!isMain) {
        logger.warn({ sourceGroup }, 'Unauthorized talpa_exec attempt blocked');
        if (data.requestId) {
          writeIpcResponse(sourceGroup, data.requestId as string, {
            status: 'error',
            error: 'Only the main group can execute talpa commands',
          });
        }
        break;
      }

      const requestId = data.requestId as string | undefined;
      const command = data.command as string | undefined;
      const hostname = data.hostname as string | undefined;
      const service = data.service as string | undefined;

      if (!requestId || !command) {
        logger.warn({ data }, 'Invalid talpa_exec request - missing requestId or command');
        break;
      }

      if (!TALPA_COMMANDS.includes(command as typeof TALPA_COMMANDS[number])) {
        writeIpcResponse(sourceGroup, requestId, {
          status: 'error',
          error: `Invalid talpa command: ${command}. Allowed: ${TALPA_COMMANDS.join(', ')}`,
        });
        break;
      }

      // Build args based on command
      const talpaArgs: string[] = [command];

      if (command === 'dig') {
        if (!hostname || !service) {
          writeIpcResponse(sourceGroup, requestId, {
            status: 'error',
            error: 'dig requires hostname and service arguments',
          });
          break;
        }
        if (!HOSTNAME_RE.test(hostname)) {
          writeIpcResponse(sourceGroup, requestId, {
            status: 'error',
            error: `Invalid hostname: ${hostname}`,
          });
          break;
        }
        if (!SERVICE_RE.test(service)) {
          writeIpcResponse(sourceGroup, requestId, {
            status: 'error',
            error: `Invalid service URL: ${service}. Must be http(s)://localhost or 127.0.0.1`,
          });
          break;
        }
        talpaArgs.push(hostname, service);
      } else if (command === 'plug') {
        if (!hostname) {
          writeIpcResponse(sourceGroup, requestId, {
            status: 'error',
            error: 'plug requires hostname argument',
          });
          break;
        }
        if (!HOSTNAME_RE.test(hostname)) {
          writeIpcResponse(sourceGroup, requestId, {
            status: 'error',
            error: `Invalid hostname: ${hostname}`,
          });
          break;
        }
        talpaArgs.push(hostname);
      }
      // 'list' takes no extra args

      try {
        const { stdout: output, stderr: errOutput } = await execFile(TALPA_BIN, talpaArgs, {
          timeout: 30_000,
        });
        const combined = (output + (errOutput ? `\n${errOutput}` : '')).trim();
        logger.info({ command, hostname, sourceGroup }, 'talpa_exec completed');
        writeIpcResponse(sourceGroup, requestId, {
          status: 'success',
          output: combined,
        });

        // Refresh tunnel cache after any mutation or list
        try {
          const listResult = command === 'list'
            ? combined
            : (await execFile(TALPA_BIN, ['list'], { timeout: 10_000 })).stdout;
          updateTunnelCache(parseTalpaListOutput(listResult));
        } catch {
          // Non-critical — cache stays stale until next successful list
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error({ command, hostname, err }, 'talpa_exec failed');
        writeIpcResponse(sourceGroup, requestId, {
          status: 'error',
          error: message,
        });
      }
      break;
    }

    default:
      logger.warn({ type: data.type }, 'Unknown IPC task type');
      // Write an error response if the task included a requestId,
      // so the agent inside the container doesn't hang forever waiting.
      if (data.requestId) {
        writeIpcResponse(sourceGroup, data.requestId, {
          status: 'error',
          error: `Unknown IPC task type: "${data.type}". Supported types: schedule_task, pause_task, resume_task, cancel_task, refresh_groups, register_group, talpa_exec`,
        });
      }
  }
}
