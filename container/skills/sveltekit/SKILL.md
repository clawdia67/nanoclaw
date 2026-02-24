# SvelteKit + Tailwind Skill

Build modern web applications with SvelteKit (Svelte 5), Tailwind CSS, Vite, and Zod.

## Reference Docs

Comprehensive bibles are stored in `docs/` relative to this skill:

- `docs/svelte5-bible.md` — Svelte 5 runes, components, template syntax, animations, testing (~24K tokens)
- `docs/sveltekit-bible.md` — SvelteKit routing, load functions, form actions, hooks, SSR, deployment (~20K tokens)
- `docs/tailwind-bible.md` — Tailwind CSS utilities, responsive design, dark mode, patterns (~17K tokens)
- `docs/vite-bible.md` — Vite config, plugins, build, SSR, environment API (~41K tokens)
- `docs/zod-bible.md` — Zod validation, schemas, error handling, JSON Schema (~15K tokens)

**Loading strategy:** Only read the specific bible(s) needed for the current task. Don't load all 5 at once — that's ~117K tokens. Be surgical.

## When to Load What

| Task | Read |
|------|------|
| Component logic, reactivity, runes | `svelte5-bible.md` |
| Routing, data loading, forms, SSR | `sveltekit-bible.md` |
| Styling, layout, responsive design | `tailwind-bible.md` |
| Build config, plugins, dev server | `vite-bible.md` |
| Form validation, API schemas | `zod-bible.md` |
| New project setup | This file (quick start below) |

## Quick Start — New SvelteKit + Tailwind Project

```bash
# Create project
npx sv create my-app
cd my-app

# During sv create, select:
# - SvelteKit minimal or skeleton
# - TypeScript
# - Add Tailwind CSS (sv will configure it)

# If adding Tailwind manually:
npm install -D tailwindcss @tailwindcss/vite

# Install deps
npm install
```

### Manual Tailwind Setup (if sv didn't add it)

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

### Adding Zod

```bash
npm install zod
```

## Key Patterns

### Svelte 5 Runes (NOT Svelte 4)

Always use Svelte 5 syntax:

```svelte
<script lang="ts">
  // State
  let count = $state(0);
  
  // Derived
  let doubled = $derived(count * 2);
  
  // Props
  let { name, age = 18 }: { name: string; age?: number } = $props();
  
  // Effects (use sparingly — prefer $derived)
  $effect(() => {
    document.title = `Count: ${count}`;
  });
</script>

<button onclick={() => count++}>
  {count} (doubled: {doubled})
</button>
```

**Never use:** `export let`, `$:`, `on:click`, `<slot />`, `createEventDispatcher`

### SvelteKit Load + Form Pattern

```ts
// +page.server.ts
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const schema = z.object({
  email: z.email(),
  name: z.string().min(1)
});

export async function load() {
  return { items: await db.getItems() };
}

export const actions = {
  default: async ({ request }) => {
    const formData = Object.fromEntries(await request.formData());
    const result = schema.safeParse(formData);
    
    if (!result.success) {
      return fail(400, { errors: z.flattenError(result.error).fieldErrors });
    }
    
    await db.create(result.data);
    return { success: true };
  }
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
</script>

<form method="POST" use:enhance>
  <input name="email" type="email" class="border rounded px-3 py-2 w-full" />
  {#if form?.errors?.email}
    <p class="text-red-500 text-sm">{form.errors.email[0]}</p>
  {/if}
  
  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Submit
  </button>
</form>
```

### Tailwind in Svelte Components

```svelte
<script lang="ts">
  let { variant = 'primary' }: { variant?: 'primary' | 'secondary' } = $props();
  
  const classes = $derived(
    variant === 'primary'
      ? 'bg-blue-500 hover:bg-blue-700 text-white'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  );
</script>

<button class="font-bold py-2 px-4 rounded transition-colors {classes}">
  {@render children?.()}
</button>
```

## Critical Rules

1. **Svelte 5 only** — runes (`$state`, `$derived`, `$effect`, `$props`), snippets (`{#snippet}`, `{@render}`), callback props (not events)
2. **No `$:` reactive statements** — use `$derived` or `$derived.by()`
3. **No `export let`** — use `let { prop } = $props()`
4. **No `on:click`** — use `onclick`
5. **No `<slot />`** — use `{@render children?.()}`
6. **No `createEventDispatcher`** — use callback props
7. **Tailwind utility-first** — avoid `@apply` except for truly repeated patterns
8. **Mobile-first responsive** — unprefixed = all sizes, `md:` = medium+
9. **Don't generate Tailwind classes dynamically** — PurgeCSS can't detect `text-${color}-500`
10. **Use `$derived` over `$effect`** — effects are for side effects only, not derived state

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   ├── server/         # Server-only code (db, auth)
│   └── utils/          # Shared utilities
├── routes/
│   ├── +layout.svelte  # Root layout (import app.css here)
│   ├── +page.svelte    # Home page
│   └── [slug]/
│       ├── +page.svelte
│       └── +page.server.ts
├── app.css             # Tailwind entry
├── app.html            # HTML template
└── hooks.server.ts     # Server hooks (auth, etc.)
```

## Common Component Patterns

### Dark Mode Toggle
```svelte
<script lang="ts">
  let dark = $state(false);
  
  $effect(() => {
    document.documentElement.classList.toggle('dark', dark);
  });
</script>

<button onclick={() => dark = !dark} class="p-2">
  {dark ? '☀️' : '🌙'}
</button>
```

### Responsive Nav
```svelte
<script lang="ts">
  let open = $state(false);
</script>

<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
    <a href="/" class="font-bold text-xl">Logo</a>
    
    <button class="md:hidden" onclick={() => open = !open}>☰</button>
    
    <div class="hidden md:flex space-x-4">
      <a href="/about" class="text-gray-700 hover:text-blue-500">About</a>
      <a href="/contact" class="text-gray-700 hover:text-blue-500">Contact</a>
    </div>
  </div>
  
  {#if open}
    <div class="md:hidden px-4 pb-4 space-y-2">
      <a href="/about" class="block text-gray-700">About</a>
      <a href="/contact" class="block text-gray-700">Contact</a>
    </div>
  {/if}
</nav>
```

## Deployment

SvelteKit supports multiple adapters:

```bash
# Auto-detect platform
npm install -D @sveltejs/adapter-auto

# Node.js server
npm install -D @sveltejs/adapter-node

# Static site
npm install -D @sveltejs/adapter-static

# Vercel/Netlify/Cloudflare — use adapter-auto or specific adapter
```

Configure in `svelte.config.js`:
```js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter()
  }
};
```
