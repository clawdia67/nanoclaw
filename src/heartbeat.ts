/**
 * Heartbeat monitor for NanoClaw.
 * Periodically checks system health and writes status to disk.
 * Auto-recovers from common failures (stale connections, dead runtime).
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { DATA_DIR } from './config.js';
import { CONTAINER_RUNTIME_BIN } from './container-runtime.js';
import { logger } from './logger.js';
import { Channel } from './types.js';

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const STALE_MESSAGE_THRESHOLD_MS = 15 * 60 * 1000; // 15 min without messages = suspicious
const HEARTBEAT_FILE = path.join(DATA_DIR, 'heartbeat.json');

export interface HeartbeatStatus {
  timestamp: string;
  uptimeMs: number;
  channels: {
    name: string;
    connected: boolean;
  }[];
  containerRuntime: {
    available: boolean;
    error?: string;
  };
  messageFlow: {
    lastReceivedAt: string | null;
    stale: boolean;
  };
  healthy: boolean;
}

interface HeartbeatOpts {
  channels: () => Channel[];
  getLastMessageTime: () => string | null;
  onUnhealthy?: (status: HeartbeatStatus) => void;
}

const startTime = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;

function checkContainerRuntime(): { available: boolean; error?: string } {
  try {
    execSync(`${CONTAINER_RUNTIME_BIN} info`, { stdio: 'pipe', timeout: 10000 });
    return { available: true };
  } catch (err) {
    return {
      available: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function runHeartbeat(opts: HeartbeatOpts): HeartbeatStatus {
  const now = new Date();
  const channelList = opts.channels();
  const lastMsg = opts.getLastMessageTime();
  const runtime = checkContainerRuntime();

  const stale = lastMsg
    ? now.getTime() - new Date(lastMsg).getTime() > STALE_MESSAGE_THRESHOLD_MS
    : false;

  const channelStatuses = channelList.map((ch) => ({
    name: ch.name,
    connected: ch.isConnected(),
  }));

  const allChannelsUp = channelStatuses.every((c) => c.connected);
  const healthy = allChannelsUp && runtime.available && !stale;

  const status: HeartbeatStatus = {
    timestamp: now.toISOString(),
    uptimeMs: Date.now() - startTime,
    channels: channelStatuses,
    containerRuntime: runtime,
    messageFlow: {
      lastReceivedAt: lastMsg,
      stale,
    },
    healthy,
  };

  // Write status file
  try {
    fs.mkdirSync(path.dirname(HEARTBEAT_FILE), { recursive: true });
    fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(status, null, 2));
  } catch (err) {
    logger.warn({ err }, 'Failed to write heartbeat file');
  }

  // Log based on health
  if (!healthy) {
    const problems: string[] = [];
    for (const ch of channelStatuses) {
      if (!ch.connected) problems.push(`${ch.name} disconnected`);
    }
    if (!runtime.available) problems.push('container runtime down');
    if (stale) problems.push(`no messages for ${Math.round((now.getTime() - new Date(lastMsg!).getTime()) / 60000)}min`);

    logger.warn({ problems }, 'Heartbeat: unhealthy');
    opts.onUnhealthy?.(status);
  } else {
    logger.debug('Heartbeat: healthy');
  }

  return status;
}

export function startHeartbeat(opts: HeartbeatOpts): void {
  if (timer) return;

  // Run first check after a brief startup grace period
  setTimeout(() => {
    runHeartbeat(opts);
    timer = setInterval(() => runHeartbeat(opts), HEARTBEAT_INTERVAL_MS);
  }, 30_000);

  logger.info(
    { intervalMs: HEARTBEAT_INTERVAL_MS, staleThresholdMs: STALE_MESSAGE_THRESHOLD_MS },
    'Heartbeat monitor started',
  );
}

export function stopHeartbeat(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
