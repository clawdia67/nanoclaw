# NanoClaw

Personal Claude assistant. See [README.md](README.md) for philosophy and setup. See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for architecture decisions.

## Quick Context

Single Node.js process that connects to WhatsApp, routes messages to Claude Agent SDK running in containers (Linux VMs). Each group has isolated filesystem and memory.

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Orchestrator: state, message loop, agent invocation, model switching, session recovery |
| `src/channels/whatsapp.ts` | WhatsApp connection, auth, send/receive, voice transcription |
| `src/ipc.ts` | IPC watcher, task processing, infrastructure snapshots |
| `src/router.ts` | Message formatting and outbound routing |
| `src/config.ts` | Trigger pattern, paths, intervals, model defaults |
| `src/container-runner.ts` | Spawns agent containers with mounts and skill sync |
| `src/task-scheduler.ts` | Runs scheduled tasks |
| `src/heartbeat.ts` | Health monitor: channels, container runtime, message flow (5min interval) |
| `src/infrastructure.ts` | Nginx port scanning, tunnel cache for agent awareness |
| `src/transcription.ts` | Voice message transcription via OpenAI Whisper |
| `src/memory-extractor.ts` | Structured memory extraction from conversations |
| `src/db.ts` | SQLite operations |
| `groups/{name}/CLAUDE.md` | Per-group memory (isolated) |
| `container/skills/` | Agent skills synced into containers on spawn |

## Container Skills

Skills available to agents inside containers:

| Skill | Purpose |
|-------|---------|
| `agent-browser` | Browser automation via Stagehand |
| `bookie` | Independent probabilistic event assessment |
| `firecrawl` | Web scraping, search, crawl, AI extraction |
| `gemini-image` | Image generation via Google Gemini |
| `memory` | Long-term memory extraction and management |
| `nginx` | Web server config, reverse proxy, SSL |
| `pinger` | Push notifications via ntfy.sh |
| `stagehand` | Browser automation with persistent profiles |
| `sveltekit` | SvelteKit + Tailwind web framework reference |
| `talpa` | Cloudflare Tunnel route management (MCP tools) |
| `tavily` | REST API: search, extract, crawl, research |
| `vibe` | Web app factory: scaffold, deploy, serve via nginx |

## Claude Code Skills

| Skill | When to Use |
|-------|-------------|
| `/setup` | First-time installation, authentication, service configuration |
| `/customize` | Adding channels, integrations, changing behavior |
| `/debug` | Container issues, logs, troubleshooting |
| `/update` | Pull upstream NanoClaw changes, merge with customizations, run migrations |

## Model Switching

Prefix messages with shortcuts to switch models mid-chat:

| Prefix | Model |
|--------|-------|
| `hh` | claude-haiku-4-5 |
| `ss` | claude-sonnet-4-6 (default) |
| `oo` | claude-opus-4-6 |

## Session Management

Sessions are stored as JSONL files in `data/sessions/{group}/.claude/projects/-workspace-group/`. Each group gets one active session that persists across container restarts.

**Session rotation**: When a session file exceeds 5MB, NanoClaw automatically:
1. Extracts recent conversation context (last 30 message pairs) from the JSONL
2. Saves it to `groups/{folder}/session-context.md`
3. Clears the bloated session
4. On next message, injects the recovered context into the fresh session prompt

This prevents the SDK from spending minutes replaying/compacting massive transcripts while preserving conversational continuity. The agent's memory files (`groups/{folder}/memory/`) and conversation archives (`groups/{folder}/conversations/`) provide additional long-term context.

**Manual reset**: Send `clear` to reset the session and start fresh.

## Auto-Recovery

- **Stale sessions**: If the agent completes successfully but produces no text output, the session is automatically cleared and the message retried with a fresh session (prevents corrupted session loops).
- **Heartbeat monitor**: Runs every 5 minutes, checks channel connectivity, container runtime, and message flow. Writes status to `data/heartbeat.json`. Flags stale message flow after 15 minutes of silence.
- **IPC error feedback**: Unknown IPC task types return explicit error responses to the container agent, preventing hangs from unsupported operations.

## Infrastructure Awareness

Agents can read `infrastructure.json` in their IPC directory to see:
- **Nginx port allocations** scanned from `~/.config/nginx/sites-enabled/*.conf`
- **Tunnel routes** cached from talpa/Cloudflare

This prevents port conflicts when deploying new services.

## Development

Run commands directly—don't tell the user to run them.

```bash
npm run dev          # Run with hot reload
npm run build        # Compile TypeScript
./container/build.sh # Rebuild agent container
```

Service management:
```bash
# macOS (launchd)
launchctl load ~/Library/LaunchAgents/com.nanoclaw.plist
launchctl unload ~/Library/LaunchAgents/com.nanoclaw.plist
launchctl kickstart -k gui/$(id -u)/com.nanoclaw  # restart

# Linux (systemd)
systemctl --user start nanoclaw
systemctl --user stop nanoclaw
systemctl --user restart nanoclaw
```

Logs:
```bash
tail -f logs/nanoclaw.log        # main log
tail -f logs/nanoclaw.error.log  # errors only
cat data/heartbeat.json          # health status
```

## Container Build Cache

The container buildkit caches the build context aggressively. `--no-cache` alone does NOT invalidate COPY steps — the builder's volume retains stale files. To force a truly clean rebuild, prune the builder then re-run `./container/build.sh`.
