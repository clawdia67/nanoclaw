/**
 * Infrastructure snapshot — scans nginx configs and writes a registry
 * of allocated ports and tunnels so container agents can avoid conflicts.
 */
import fs from 'fs';
import path from 'path';

import { resolveGroupIpcPath } from './group-folder.js';
import { logger } from './logger.js';

export interface PortAllocation {
  port: number;
  project: string;       // derived from config filename
  proxyTarget?: string;  // e.g. "http://127.0.0.1:3001"
}

export interface TunnelRoute {
  hostname: string;
  service: string;
}

export interface InfrastructureSnapshot {
  nginx: PortAllocation[];
  tunnels: TunnelRoute[];
  updatedAt: string;
}

// Cache tunnel list so we don't shell out on every container spawn
let cachedTunnels: TunnelRoute[] = [];
let tunnelCacheTime = 0;
const TUNNEL_CACHE_TTL = 60_000; // 1 minute

/**
 * Scan nginx sites-enabled for port allocations.
 */
function scanNginxPorts(): PortAllocation[] {
  const homeDir = process.env.HOME!;
  const sitesDir = path.join(homeDir, '.config/nginx/sites-enabled');
  if (!fs.existsSync(sitesDir)) return [];

  const allocations: PortAllocation[] = [];

  try {
    for (const file of fs.readdirSync(sitesDir)) {
      if (!file.endsWith('.conf')) continue;
      const content = fs.readFileSync(path.join(sitesDir, file), 'utf-8');
      const project = file.replace('.conf', '');

      // Extract listen port
      const listenMatch = content.match(/listen\s+(\d+)/);
      if (!listenMatch) continue;

      const port = parseInt(listenMatch[1], 10);

      // Extract proxy_pass target if present
      const proxyMatch = content.match(/proxy_pass\s+(https?:\/\/[^;]+)/);

      allocations.push({
        port,
        project,
        proxyTarget: proxyMatch?.[1]?.trim(),
      });
    }
  } catch (err) {
    logger.warn({ err }, 'Error scanning nginx configs');
  }

  return allocations;
}

/**
 * Update the cached tunnel list. Called from IPC when talpa_exec completes.
 */
export function updateTunnelCache(tunnels: TunnelRoute[]): void {
  cachedTunnels = tunnels;
  tunnelCacheTime = Date.now();
}

/**
 * Parse talpa list output into TunnelRoute[].
 */
export function parseTalpaListOutput(output: string): TunnelRoute[] {
  const routes: TunnelRoute[] = [];
  // Match lines like: "  chat.oio.party                           → http://localhost:3000"
  const lineRe = /^\s+(\S+)\s+→\s+(\S+)/gm;
  let match;
  while ((match = lineRe.exec(output)) !== null) {
    const hostname = match[1];
    const service = match[2];
    // Skip catch-all
    if (hostname === '*') continue;
    routes.push({ hostname, service });
  }
  return routes;
}

/**
 * Write infrastructure snapshot to a group's IPC directory.
 */
export function writeInfrastructureSnapshot(groupFolder: string): void {
  const groupIpcDir = resolveGroupIpcPath(groupFolder);
  fs.mkdirSync(groupIpcDir, { recursive: true });

  const snapshot: InfrastructureSnapshot = {
    nginx: scanNginxPorts(),
    tunnels: cachedTunnels,
    updatedAt: new Date().toISOString(),
  };

  const filePath = path.join(groupIpcDir, 'infrastructure.json');
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(snapshot, null, 2));
  fs.renameSync(tempPath, filePath);
}
