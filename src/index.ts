import fs from 'fs';
import path from 'path';

import {
  ASSISTANT_NAME,
  DATA_DIR,
  DEFAULT_MODEL,
  GROUPS_DIR,
  IDLE_TIMEOUT,
  MAIN_GROUP_FOLDER,
  POLL_INTERVAL,
  TRIGGER_PATTERN,
} from './config.js';
import { WhatsAppChannel } from './channels/whatsapp.js';
import {
  ContainerOutput,
  runContainerAgent,
  writeGroupsSnapshot,
  writeTasksSnapshot,
} from './container-runner.js';
import { writeInfrastructureSnapshot } from './infrastructure.js';
import { cleanupOrphans, ensureContainerRuntimeRunning } from './container-runtime.js';
import {
  deleteSession,
  getAllChats,
  getAllRegisteredGroups,
  getAllSessions,
  getAllTasks,
  getMessagesSince,
  getNewMessages,
  getRouterState,
  initDatabase,
  setRegisteredGroup,
  setRouterState,
  setSession,
  storeChatMetadata,
  storeMessage,
} from './db.js';
import { GroupQueue } from './group-queue.js';
import { resolveGroupFolderPath } from './group-folder.js';
import { startIpcWatcher } from './ipc.js';
import { findChannel, formatMessages, formatOutbound } from './router.js';
import { startSchedulerLoop } from './task-scheduler.js';
import { Channel, NewMessage, RegisteredGroup } from './types.js';
import { logger } from './logger.js';
import { startHeartbeat } from './heartbeat.js';

// Re-export for backwards compatibility during refactor
export { escapeXml, formatMessages } from './router.js';

// --- Session rotation helpers ---

const SESSION_CONTEXT_FILE = 'session-context.md';
const CONTEXT_TAIL_BYTES = 200 * 1024; // Read last 200KB of JSONL for context extraction
const MAX_CONTEXT_MESSAGES = 30; // Keep last N message pairs

/**
 * Extract recent conversation context from a JSONL session file and save it
 * to the group directory so a fresh session can recover context.
 */
function extractAndSaveContext(sessionFile: string, groupFolder: string): void {
  try {
    const fd = fs.openSync(sessionFile, 'r');
    const stat = fs.fstatSync(fd);
    const readSize = Math.min(stat.size, CONTEXT_TAIL_BYTES);
    const buffer = Buffer.alloc(readSize);
    fs.readSync(fd, buffer, 0, readSize, stat.size - readSize);
    fs.closeSync(fd);

    const tail = buffer.toString('utf-8');
    // Skip the first (potentially partial) line
    const lines = tail.split('\n').slice(1);

    const messages: Array<{ role: string; text: string }> = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'user' && entry.message?.content) {
          const text = typeof entry.message.content === 'string'
            ? entry.message.content
            : entry.message.content
                .filter((c: { type?: string }) => c.type === 'text' || !c.type)
                .map((c: { text?: string }) => c.text || '')
                .join('');
          if (text.trim()) messages.push({ role: 'user', text: text.slice(0, 500) });
        } else if (entry.type === 'assistant' && entry.message?.content) {
          const textParts = entry.message.content
            .filter((c: { type: string }) => c.type === 'text')
            .map((c: { text: string }) => c.text);
          const text = textParts.join('');
          if (text.trim()) messages.push({ role: 'assistant', text: text.slice(0, 500) });
        }
      } catch {
        // Skip unparseable lines
      }
    }

    // Keep the most recent messages
    const recent = messages.slice(-MAX_CONTEXT_MESSAGES);
    if (recent.length === 0) return;

    const contextLines = ['# Recent Conversation Context', ''];
    for (const msg of recent) {
      const label = msg.role === 'user' ? 'User' : 'Assistant';
      contextLines.push(`**${label}**: ${msg.text}`, '');
    }

    const contextPath = path.join(GROUPS_DIR, groupFolder, SESSION_CONTEXT_FILE);
    fs.writeFileSync(contextPath, contextLines.join('\n'));
    logger.info(
      { groupFolder, messages: recent.length },
      'Saved session context for recovery',
    );
  } catch (err) {
    logger.error({ err, groupFolder }, 'Failed to extract session context');
  }
}

/**
 * Load recovery context for a fresh session. Checks for:
 * 1. session-context.md (extracted from rotated session)
 * 2. Recent conversation archives
 * Returns the context string or null.
 */
function loadRecoveryContext(groupFolder: string): string | null {
  // Check for extracted session context
  const contextPath = path.join(GROUPS_DIR, groupFolder, SESSION_CONTEXT_FILE);
  if (fs.existsSync(contextPath)) {
    try {
      const context = fs.readFileSync(contextPath, 'utf-8');
      // Delete after loading — it's a one-time recovery
      fs.unlinkSync(contextPath);
      if (context.trim()) return context;
    } catch {
      // Ignore read errors
    }
  }

  // Fallback: check for recent conversation archives
  const convDir = path.join(GROUPS_DIR, groupFolder, 'conversations');
  if (fs.existsSync(convDir)) {
    try {
      const files = fs.readdirSync(convDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse();
      if (files.length > 0) {
        const latest = fs.readFileSync(path.join(convDir, files[0]), 'utf-8');
        // Truncate to last ~4000 chars to avoid overwhelming the prompt
        const truncated = latest.length > 4000
          ? '...\n' + latest.slice(-4000)
          : latest;
        return `# Recent Conversation Archive (${files[0]})\n\n${truncated}`;
      }
    } catch {
      // Ignore
    }
  }

  return null;
}

let lastTimestamp = '';
let lastMessageReceivedAt: string | null = null;
let sessions: Record<string, string> = {};
let registeredGroups: Record<string, RegisteredGroup> = {};
let lastAgentTimestamp: Record<string, string> = {};
let messageLoopRunning = false;

// Model prefix shortcuts for switching Claude models from chat
const MODEL_PREFIXES: Record<string, string> = {
  'hh': 'claude-haiku-4-5',
  'oo': 'claude-opus-4-6',
  'ss': 'claude-sonnet-4-6',
};

/**
 * Parse model prefix from prompt. Returns { model, prompt } where model
 * is undefined if no prefix was found.
 *
 * Supported prefixes: hh (haiku), oo (opus), ss (sonnet)
 * Example: "oo make a website" → { model: "claude-opus-4-...", prompt: "make a website" }
 */
function parseModelPrefix(prompt: string): { model?: string; prompt: string } {
  const match = prompt.match(/^(hh|oo|ss)\s+/i);
  if (match) {
    const prefix = match[1].toLowerCase();
    const model = MODEL_PREFIXES[prefix];
    return { model, prompt: prompt.slice(match[0].length) };
  }
  return { prompt };
}

let whatsapp: WhatsAppChannel;
const channels: Channel[] = [];
const queue = new GroupQueue();

function loadState(): void {
  lastTimestamp = getRouterState('last_timestamp') || '';
  const agentTs = getRouterState('last_agent_timestamp');
  try {
    lastAgentTimestamp = agentTs ? JSON.parse(agentTs) : {};
  } catch {
    logger.warn('Corrupted last_agent_timestamp in DB, resetting');
    lastAgentTimestamp = {};
  }
  sessions = getAllSessions();
  registeredGroups = getAllRegisteredGroups();
  logger.info(
    { groupCount: Object.keys(registeredGroups).length },
    'State loaded',
  );
}

function saveState(): void {
  setRouterState('last_timestamp', lastTimestamp);
  setRouterState(
    'last_agent_timestamp',
    JSON.stringify(lastAgentTimestamp),
  );
}

function registerGroup(jid: string, group: RegisteredGroup): void {
  let groupDir: string;
  try {
    groupDir = resolveGroupFolderPath(group.folder);
  } catch (err) {
    logger.warn(
      { jid, folder: group.folder, err },
      'Rejecting group registration with invalid folder',
    );
    return;
  }

  registeredGroups[jid] = group;
  setRegisteredGroup(jid, group);

  // Create group folder
  fs.mkdirSync(path.join(groupDir, 'logs'), { recursive: true });

  logger.info(
    { jid, name: group.name, folder: group.folder },
    'Group registered',
  );
}

/**
 * Get available groups list for the agent.
 * Returns groups ordered by most recent activity.
 */
export function getAvailableGroups(): import('./container-runner.js').AvailableGroup[] {
  const chats = getAllChats();
  const registeredJids = new Set(Object.keys(registeredGroups));

  return chats
    .filter((c) => c.jid !== '__group_sync__' && c.is_group)
    .map((c) => ({
      jid: c.jid,
      name: c.name,
      lastActivity: c.last_message_time,
      isRegistered: registeredJids.has(c.jid),
    }));
}

/** @internal - exported for testing */
export function _setRegisteredGroups(groups: Record<string, RegisteredGroup>): void {
  registeredGroups = groups;
}

/**
 * Process all pending messages for a group.
 * Called by the GroupQueue when it's this group's turn.
 */
async function processGroupMessages(chatJid: string): Promise<boolean> {
  const group = registeredGroups[chatJid];
  if (!group) return true;

  const channel = findChannel(channels, chatJid);
  if (!channel) {
    logger.warn({ chatJid }, 'No channel owns JID, skipping messages');
    return true;
  }

  const isMainGroup = group.folder === MAIN_GROUP_FOLDER;

  const sinceTimestamp = lastAgentTimestamp[chatJid] || '';
  const missedMessages = getMessagesSince(chatJid, sinceTimestamp, ASSISTANT_NAME);

  if (missedMessages.length === 0) return true;

  // Handle "clear" command — resets session context
  const lastMsgContent = missedMessages[missedMessages.length - 1].content.trim();
  if (lastMsgContent.toLowerCase() === 'clear') {
    logger.info({ group: group.name }, 'Clear command received, resetting session');
    // Clear session from memory and DB
    delete sessions[group.folder];
    deleteSession(group.folder);
    // Close any active container
    queue.closeStdin(chatJid);
    // Advance cursor so we don't reprocess
    lastAgentTimestamp[chatJid] = missedMessages[missedMessages.length - 1].timestamp;
    saveState();
    // Send confirmation
    await channel.sendMessage(chatJid, '🧹 Context cleared. Starting fresh.');
    return true;
  }

  // For non-main groups, check if trigger is required and present
  if (!isMainGroup && group.requiresTrigger !== false) {
    const hasTrigger = missedMessages.some((m) =>
      TRIGGER_PATTERN.test(m.content.trim()),
    );
    if (!hasTrigger) return true;
  }

  // Check last message for model prefix (e.g., "oo make a website" → opus)
  const lastMsg = missedMessages[missedMessages.length - 1];
  const { model, prompt: strippedContent } = parseModelPrefix(lastMsg.content);
  if (model) {
    lastMsg.content = strippedContent;
    logger.info({ group: group.name, model }, 'Model override from prefix');
  }

  const prompt = formatMessages(missedMessages);

  // Advance cursor so the piping path in startMessageLoop won't re-fetch
  // these messages. Save the old cursor so we can roll back on error.
  const previousCursor = lastAgentTimestamp[chatJid] || '';
  lastAgentTimestamp[chatJid] =
    missedMessages[missedMessages.length - 1].timestamp;
  saveState();

  logger.info(
    { group: group.name, messageCount: missedMessages.length },
    'Processing messages',
  );

  // Track idle timer for closing stdin when agent is idle
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      logger.debug({ group: group.name }, 'Idle timeout, closing container stdin');
      queue.closeStdin(chatJid);
    }, IDLE_TIMEOUT);
  };

  await channel.setTyping?.(chatJid, true);
  let hadError = false;
  let outputSentToUser = false;
  let nullResultCount = 0;
  let sessionClearedDuringStream = false;
  const hadSessionOnEntry = !!sessions[group.folder];

  const output = await runAgent(group, prompt, chatJid, model, async (result) => {
    // Streaming output callback — called for each agent result
    if (result.result) {
      const raw = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
      // Strip <internal>...</internal> blocks — agent uses these for internal reasoning
      const text = raw.replace(/<internal>[\s\S]*?<\/internal>/g, '').trim();
      logger.info({ group: group.name }, `Agent output: ${raw.slice(0, 200)}`);
      if (text) {
        await channel.sendMessage(chatJid, text);
        outputSentToUser = true;
      }
      // Only reset idle timer on actual results, not session-update markers (result: null)
      resetIdleTimer();
    } else if (result.status === 'success' && !outputSentToUser) {
      // Null result with no prior output — possible stale session.
      // In streaming mode, runAgent won't return until the container exits
      // (could be 30+ min), so we must detect and recover here.
      nullResultCount++;
      if (nullResultCount >= 2 && hadSessionOnEntry && !sessionClearedDuringStream) {
        logger.warn({ group: group.name, sessionId: sessions[group.folder], nullResults: nullResultCount },
          'Streaming: repeated null results, clearing stale session and killing container');
        sessionClearedDuringStream = true;
        delete sessions[group.folder];
        deleteSession(group.folder);
        // Kill the container so runAgent returns, then retry with fresh session
        queue.closeStdin(chatJid);
      }
    }

    if (result.status === 'success') {
      queue.notifyIdle(chatJid);
    }

    if (result.status === 'error') {
      hadError = true;
    }
  });

  await channel.setTyping?.(chatJid, false);
  if (idleTimer) clearTimeout(idleTimer);

  if (output === 'error' || hadError) {
    // If we already sent output to the user, don't roll back the cursor —
    // the user got their response and re-processing would send duplicates.
    if (outputSentToUser) {
      logger.warn({ group: group.name }, 'Agent error after output was sent, skipping cursor rollback to prevent duplicates');
      return true;
    }
    // Roll back cursor so retries can re-process these messages
    lastAgentTimestamp[chatJid] = previousCursor;
    saveState();
    logger.warn({ group: group.name }, 'Agent error, rolled back message cursor for retry');
    return false;
  }

  // Auto-recovery: agent completed successfully but never sent any text.
  // Covers both non-streaming (runAgent returned) and streaming (session
  // was already cleared inside the callback above).
  if (!outputSentToUser && !sessionClearedDuringStream && hadSessionOnEntry && sessions[group.folder]) {
    logger.warn({ group: group.name, sessionId: sessions[group.folder] }, 'Agent produced no output, clearing stale session for auto-retry');
    delete sessions[group.folder];
    deleteSession(group.folder);
  }
  if (!outputSentToUser && (sessionClearedDuringStream || hadSessionOnEntry)) {
    lastAgentTimestamp[chatJid] = previousCursor;
    saveState();
    return false;
  }

  return true;
}

async function runAgent(
  group: RegisteredGroup,
  prompt: string,
  chatJid: string,
  model?: string,
  onOutput?: (output: ContainerOutput) => Promise<void>,
): Promise<'success' | 'error'> {
  const isMain = group.folder === MAIN_GROUP_FOLDER;
  let sessionId: string | undefined = sessions[group.folder];

  // Guard against bloated sessions: if the JSONL file exceeds the threshold,
  // extract recent context, then clear the session so the container starts
  // fresh without spending minutes replaying/compacting a massive transcript.
  const MAX_SESSION_SIZE = 5 * 1024 * 1024; // 5MB
  if (sessionId) {
    const sessionProjectDir = path.join(
      DATA_DIR, 'sessions', group.folder, '.claude', 'projects',
      '-workspace-group',
    );
    const sessionFile = path.join(sessionProjectDir, `${sessionId}.jsonl`);
    try {
      const stat = fs.statSync(sessionFile);
      if (stat.size > MAX_SESSION_SIZE) {
        logger.warn(
          { group: group.name, sessionId, sizeMB: Math.round(stat.size / 1024 / 1024) },
          'Session too large, rotating with context extraction',
        );
        // Extract recent context before deleting
        extractAndSaveContext(sessionFile, group.folder);
        // Clean up session files
        fs.unlinkSync(sessionFile);
        const sessionDir = path.join(sessionProjectDir, sessionId);
        if (fs.existsSync(sessionDir)) {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        }
        delete sessions[group.folder];
        deleteSession(group.folder);
        sessionId = undefined;
      }
    } catch {
      // File doesn't exist or can't stat — proceed normally
    }
  }

  // On fresh session start, inject recovered context so the agent can
  // pick up where it left off without losing track of active work.
  if (!sessionId) {
    const recoveryContext = loadRecoveryContext(group.folder);
    if (recoveryContext) {
      prompt = `[SESSION ROTATED — Your previous session was cleared due to size. Here is context from your recent conversation to help you continue seamlessly. Read your memory files for additional context.]\n\n${recoveryContext}\n\n---\n\n${prompt}`;
      logger.info({ group: group.name }, 'Injected recovery context into fresh session');
    }
  }

  // Update tasks snapshot for container to read (filtered by group)
  const tasks = getAllTasks();
  writeTasksSnapshot(
    group.folder,
    isMain,
    tasks.map((t) => ({
      id: t.id,
      groupFolder: t.group_folder,
      prompt: t.prompt,
      schedule_type: t.schedule_type,
      schedule_value: t.schedule_value,
      status: t.status,
      next_run: t.next_run,
    })),
  );

  // Update infrastructure snapshot (nginx ports, tunnels) for all groups
  writeInfrastructureSnapshot(group.folder);

  // Update available groups snapshot (main group only can see all groups)
  const availableGroups = getAvailableGroups();
  writeGroupsSnapshot(
    group.folder,
    isMain,
    availableGroups,
    new Set(Object.keys(registeredGroups)),
  );

  // Wrap onOutput to track session ID from streamed results
  const wrappedOnOutput = onOutput
    ? async (output: ContainerOutput) => {
        if (output.newSessionId) {
          sessions[group.folder] = output.newSessionId;
          setSession(group.folder, output.newSessionId);
        }
        await onOutput(output);
      }
    : undefined;

  try {
    const output = await runContainerAgent(
      group,
      {
        prompt,
        sessionId,
        groupFolder: group.folder,
        chatJid,
        isMain,
        assistantName: ASSISTANT_NAME,
        model: model || DEFAULT_MODEL,
      },
      (proc, containerName) => queue.registerProcess(chatJid, proc, containerName, group.folder),
      wrappedOnOutput,
    );

    if (output.newSessionId) {
      sessions[group.folder] = output.newSessionId;
      setSession(group.folder, output.newSessionId);
    }

    if (output.status === 'error') {
      logger.error(
        { group: group.name, error: output.error },
        'Container agent error',
      );
      return 'error';
    }

    return 'success';
  } catch (err) {
    logger.error({ group: group.name, err }, 'Agent error');
    return 'error';
  }
}

async function startMessageLoop(): Promise<void> {
  if (messageLoopRunning) {
    logger.debug('Message loop already running, skipping duplicate start');
    return;
  }
  messageLoopRunning = true;

  logger.info(`NanoClaw running (trigger: @${ASSISTANT_NAME})`);

  while (true) {
    try {
      const jids = Object.keys(registeredGroups);
      const { messages, newTimestamp } = getNewMessages(jids, lastTimestamp, ASSISTANT_NAME);

      if (messages.length > 0) {
        lastMessageReceivedAt = new Date().toISOString();
        logger.info({ count: messages.length }, 'New messages');

        // Advance the "seen" cursor for all messages immediately
        lastTimestamp = newTimestamp;
        saveState();

        // Deduplicate by group
        const messagesByGroup = new Map<string, NewMessage[]>();
        for (const msg of messages) {
          const existing = messagesByGroup.get(msg.chat_jid);
          if (existing) {
            existing.push(msg);
          } else {
            messagesByGroup.set(msg.chat_jid, [msg]);
          }
        }

        for (const [chatJid, groupMessages] of messagesByGroup) {
          const group = registeredGroups[chatJid];
          if (!group) continue;

          const channel = findChannel(channels, chatJid);
          if (!channel) {
            logger.warn({ chatJid }, 'No channel owns JID, skipping messages');
            continue;
          }

          const isMainGroup = group.folder === MAIN_GROUP_FOLDER;
          const needsTrigger = !isMainGroup && group.requiresTrigger !== false;

          // For non-main groups, only act on trigger messages.
          // Non-trigger messages accumulate in DB and get pulled as
          // context when a trigger eventually arrives.
          if (needsTrigger) {
            const hasTrigger = groupMessages.some((m) =>
              TRIGGER_PATTERN.test(m.content.trim()),
            );
            if (!hasTrigger) continue;
          }

          // Pull all messages since lastAgentTimestamp so non-trigger
          // context that accumulated between triggers is included.
          const allPending = getMessagesSince(
            chatJid,
            lastAgentTimestamp[chatJid] || '',
            ASSISTANT_NAME,
          );
          const messagesToSend =
            allPending.length > 0 ? allPending : groupMessages;

          // Check if the last message has a model prefix — if so, we need to
          // restart the container with the new model (context is preserved via sessionId)
          const lastMsg = messagesToSend[messagesToSend.length - 1];
          const { model: requestedModel } = parseModelPrefix(lastMsg.content);
          if (requestedModel && queue.isActive(chatJid)) {
            // There's an active container but user wants a different model
            logger.info({ chatJid, model: requestedModel }, 'Model switch requested, restarting container');
            queue.closeStdin(chatJid);
            // Don't pipe — let processGroupMessages handle it with the new model
            queue.enqueueMessageCheck(chatJid);
            continue;
          }

          const formatted = formatMessages(messagesToSend);

          if (queue.sendMessage(chatJid, formatted)) {
            logger.debug(
              { chatJid, count: messagesToSend.length },
              'Piped messages to active container',
            );
            lastAgentTimestamp[chatJid] =
              messagesToSend[messagesToSend.length - 1].timestamp;
            saveState();
            // Show typing indicator while the container processes the piped message
            channel.setTyping?.(chatJid, true)?.catch((err) =>
              logger.warn({ chatJid, err }, 'Failed to set typing indicator'),
            );
          } else {
            // No active container — enqueue for a new one
            queue.enqueueMessageCheck(chatJid);
          }
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error in message loop');
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

/**
 * Startup recovery: check for unprocessed messages in registered groups.
 * Handles crash between advancing lastTimestamp and processing messages.
 */
function recoverPendingMessages(): void {
  for (const [chatJid, group] of Object.entries(registeredGroups)) {
    const sinceTimestamp = lastAgentTimestamp[chatJid] || '';
    const pending = getMessagesSince(chatJid, sinceTimestamp, ASSISTANT_NAME);
    if (pending.length > 0) {
      logger.info(
        { group: group.name, pendingCount: pending.length },
        'Recovery: found unprocessed messages',
      );
      queue.enqueueMessageCheck(chatJid);
    }
  }
}

function ensureContainerSystemRunning(): void {
  ensureContainerRuntimeRunning();
  cleanupOrphans();
}

async function main(): Promise<void> {
  ensureContainerSystemRunning();
  initDatabase();
  logger.info('Database initialized');
  loadState();

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    await queue.shutdown(10000);
    for (const ch of channels) await ch.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Channel callbacks (shared by all channels)
  const channelOpts = {
    onMessage: (_chatJid: string, msg: NewMessage) => storeMessage(msg),
    onChatMetadata: (chatJid: string, timestamp: string, name?: string, channel?: string, isGroup?: boolean) =>
      storeChatMetadata(chatJid, timestamp, name, channel, isGroup),
    registeredGroups: () => registeredGroups,
  };

  // Create and connect channels
  whatsapp = new WhatsAppChannel(channelOpts);
  channels.push(whatsapp);
  await whatsapp.connect();

  // Start subsystems (independently of connection handler)
  startSchedulerLoop({
    registeredGroups: () => registeredGroups,
    getSessions: () => sessions,
    queue,
    onProcess: (groupJid, proc, containerName, groupFolder) => queue.registerProcess(groupJid, proc, containerName, groupFolder),
    sendMessage: async (jid, rawText) => {
      const channel = findChannel(channels, jid);
      if (!channel) {
        logger.warn({ jid }, 'No channel owns JID, cannot send message');
        return;
      }
      const text = formatOutbound(rawText);
      if (text) await channel.sendMessage(jid, text);
    },
  });
  startIpcWatcher({
    sendMessage: (jid, text) => {
      const channel = findChannel(channels, jid);
      if (!channel) throw new Error(`No channel for JID: ${jid}`);
      return channel.sendMessage(jid, text);
    },
    registeredGroups: () => registeredGroups,
    registerGroup,
    syncGroupMetadata: (force) => whatsapp?.syncGroupMetadata(force) ?? Promise.resolve(),
    getAvailableGroups,
    writeGroupsSnapshot: (gf, im, ag, rj) => writeGroupsSnapshot(gf, im, ag, rj),
  });
  queue.setProcessMessagesFn(processGroupMessages);
  recoverPendingMessages();
  startHeartbeat({
    channels: () => channels,
    getLastMessageTime: () => lastMessageReceivedAt,
  });
  startMessageLoop().catch((err) => {
    logger.fatal({ err }, 'Message loop crashed unexpectedly');
    process.exit(1);
  });
}

// Guard: only run when executed directly, not when imported by tests
const isDirectRun =
  process.argv[1] &&
  new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;

if (isDirectRun) {
  main().catch((err) => {
    logger.error({ err }, 'Failed to start NanoClaw');
    process.exit(1);
  });
}
