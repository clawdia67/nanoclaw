---
name: vibe
description: Create, serve, and manage web applications — scaffolds SvelteKit + Tailwind projects, configures nginx, optionally creates GitHub repos and Cloudflare tunnels.
metadata:
  openclaw:
    requires:
      bins:
        - node
        - npm
        - git
---

# Vibe — Web App Factory

Orchestrates web app creation from prompt to live site. Scaffolds SvelteKit + Tailwind projects, serves them via nginx, optionally creates GitHub repos and Cloudflare tunnels.

## When to Use This Skill

- User asks to "make a webapp", "build a site", "create an app", "vibe code something"
- Any request to scaffold, build, and serve a web project
- Managing existing vibe projects (list, stop, tunnel, etc.)

## Project Home

All projects live in `/workspace/group/vibe/`. Registry at `/workspace/group/vibe/.registry.json`.

## How Deployment Works

The container has two writable host mounts:

| Container path | Host path | Purpose |
|---------------|-----------|---------|
| `/mnt/nginx-sites/` | `~/.config/nginx/sites-enabled/` | Drop `.conf` files here to serve |
| `/mnt/launchagents/` | `~/Library/LaunchAgents/` | Drop `.plist` files here to register services |

A launchd watcher on the host **automatically reloads nginx** when a new `.conf` appears in `sites-enabled/`. A second watcher **automatically loads** new `com.vibe.*` plists. No manual nginx reload or `launchctl load` needed — just write the files.

The env var `$NANOCLAW_GROUP_HOST_PATH` contains the **host filesystem path** of the group folder (e.g. `/Users/bill/nanoclaw/groups/main`). Use this when writing launchd plists, since those run on the host and need host paths.

## Workflow

### Step 1: Gather Intent

Parse what the user said. If any of these are unclear, **ask before building**:

| Question | Default |
|----------|---------|
| Project name? | Derive from description (kebab-case) |
| Static or dynamic (SSR)? | **Static** (adapter-static) |
| GitHub repo? | No |
| Tunnel? (public URL) | No |
| Description/features? | Must be provided |

If the user gives a clear prompt like "make me a portfolio site called folio", don't ask unnecessary questions — just confirm the plan briefly and go.

### Step 2: Scaffold

```bash
mkdir -p /workspace/group/vibe
cd /workspace/group/vibe
npx sv create <project-name> --template minimal --types ts
cd <project-name>
```

During `sv create`, if it's interactive, select:
- SvelteKit minimal
- TypeScript
- Tailwind CSS (if offered)

If Tailwind wasn't added by sv, add manually:

```bash
npm install -D tailwindcss @tailwindcss/vite
```

**vite.config.ts:**
```ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()]
});
```

**src/app.css:**
```css
@import 'tailwindcss';
```

**src/routes/+layout.svelte:**
```svelte
<script>
  import '../app.css';
  let { children } = $props();
</script>

{@render children()}
```

For **static sites**, configure adapter:

```bash
npm install -D @sveltejs/adapter-static
```

**svelte.config.js:**
```js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '200.html'
    })
  }
};
```

**src/routes/+layout.ts** (for static):
```ts
export const prerender = true;
export const ssr = false;
```

For **dynamic (SSR) sites**:

```bash
npm install -D @sveltejs/adapter-node
```

**svelte.config.js:**
```js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({ out: 'build' })
  }
};
```

### Step 3: Build the App

Implement the features/pages the user described using:
- **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$effect`)
- **Tailwind CSS** for all styling
- **SvelteKit patterns** (load functions, form actions, etc.)

Reference the sveltekit skill docs if needed — only load the specific bible required.

**Svelte 5 rules (never violate):**
- `$state()` not `let x = value`
- `$derived()` not `$:`
- `let { prop } = $props()` not `export let`
- `onclick` not `on:click`
- `{@render children?.()}` not `<slot />`
- Callback props not `createEventDispatcher`

Then build:

```bash
cd /workspace/group/vibe/<project-name>
npm run build
```

### Step 4: Configure nginx

Allocate the next available port from the registry.

#### Static Site

Write `/mnt/nginx-sites/<project-name>.conf`:

```nginx
server {
    listen <port>;
    server_name localhost;
    root $NANOCLAW_GROUP_HOST_PATH/vibe/<project-name>/build;

    location / {
        try_files $uri $uri/ /200.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**nginx reloads automatically** — no further action needed.

#### Dynamic (SSR) Site

The node server runs on an internal port (e.g., 3001+). nginx proxies to it.

Write `/mnt/nginx-sites/<project-name>.conf`:

```nginx
server {
    listen <port>;
    server_name localhost;

    location / {
        proxy_pass http://127.0.0.1:<node-port>;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Also write `/mnt/launchagents/com.vibe.<project-name>.plist`:

```bash
# Create logs dir first
mkdir -p /workspace/group/vibe/<project-name>/logs
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.vibe.<project-name></string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/env</string>
        <string>node</string>
        <string>$NANOCLAW_GROUP_HOST_PATH/vibe/<project-name>/build/index.js</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PORT</key>
        <string><node-port></string>
        <key>HOST</key>
        <string>127.0.0.1</string>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
    <key>WorkingDirectory</key>
    <string>$NANOCLAW_GROUP_HOST_PATH/vibe/<project-name></string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$NANOCLAW_GROUP_HOST_PATH/vibe/<project-name>/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$NANOCLAW_GROUP_HOST_PATH/vibe/<project-name>/logs/stderr.log</string>
</dict>
</plist>
```

**The launchd agent loads automatically** — no further action needed.

### Step 5: Optional — GitHub Repo

If the user wants a repo:

```bash
cd /workspace/group/vibe/<project-name>
git init
printf "node_modules\n.svelte-kit\nbuild\n.env\n" > .gitignore
git add -A
git commit -m "initial commit"
gh repo create <project-name> --private --source . --push
```

Use `--public` if they asked for public. Default to private.

### Step 6: Optional — Tunnel

If the user wants a public URL, use the MCP tool:

```
talpa_dig(hostname: "<project-name>.oio.party", service: "http://localhost:<port>")
```

### Step 7: Update Registry

After everything is set up, update `/workspace/group/vibe/.registry.json`:

```json
{
  "projects": {
    "<project-name>": {
      "type": "static|dynamic",
      "port": 8081,
      "nodePort": 3001,
      "repo": "github.com/user/project-name",
      "tunnel": "project-name.oio.party",
      "created": "2026-02-24",
      "status": "running"
    }
  },
  "nextPort": 8082,
  "nextNodePort": 3002
}
```

### Step 8: Report Back

Tell the user:
- Local URL: `http://localhost:<port>`
- Public URL (if tunneled): `https://<name>.oio.party`
- GitHub URL (if created): `https://github.com/user/<name>`
- How to rebuild: just ask — the agent will rebuild from `/workspace/group/vibe/<name>`

## Port Allocation

**IMPORTANT: Before picking any port, read `/workspace/ipc/infrastructure.json`** to see all ports already in use across the system:

```json
{
  "nginx": [
    { "port": 8081, "project": "clawdia-web", "proxyTarget": "http://127.0.0.1:3001" },
    { "port": 8082, "project": "ai-page-builder", "proxyTarget": "http://127.0.0.1:3002" }
  ],
  "tunnels": [
    { "hostname": "clawdia.oio.party", "service": "http://localhost:8081" }
  ]
}
```

Pick ports that are NOT listed in `infrastructure.json`. Both the nginx listen port AND the node proxy target port must be free.

- **nginx ports** start at `8081` (8080 is the default nginx server)
- **node ports** (for dynamic/SSR apps) start at `3001`
- Also update `/workspace/group/vibe/.registry.json` after allocation

## Management Commands

### List Projects
Read `/workspace/group/vibe/.registry.json` and display a table.

### Stop a Project
- Static: remove `/mnt/nginx-sites/<name>.conf` — nginx reloads automatically
- Dynamic: also remove `/mnt/launchagents/com.vibe.<name>.plist`, then tell the user to run:
  ```bash
  launchctl unload ~/Library/LaunchAgents/com.vibe.<name>.plist
  ```
  (unloading a running service can't be triggered from the container)

### Remove Tunnel
```
talpa_plug(hostname: "<name>.oio.party")
```

### Rebuild
```bash
cd /workspace/group/vibe/<name>
npm run build
# Static: nginx serves the new build immediately (no restart needed)
# Dynamic: tell the user to run: launchctl kickstart -k gui/$(id -u)/com.vibe.<name>
```

### Dev Mode
```bash
cd /workspace/group/vibe/<name>
npm run dev -- --port <port>
```

## Reference Skills

When building components or implementing features, load the specific bible from the sveltekit skill:

- **Component logic:** read `skills/sveltekit/docs/svelte5-bible.md`
- **Routing/forms/SSR:** read `skills/sveltekit/docs/sveltekit-bible.md`
- **Styling:** read `skills/sveltekit/docs/tailwind-bible.md`
- **Build config:** read `skills/sveltekit/docs/vite-bible.md`
- **Validation:** read `skills/sveltekit/docs/zod-bible.md`
- **GitHub ops:** read `skills/gh/SKILL.md`
- **Tunnels:** read `skills/talpa/SKILL.md`
- **nginx config:** read `skills/nginx/SKILL.md`

Only load what you need for the current step.
