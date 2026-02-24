# SVELTEKIT BIBLE

**Comprehensive Knowledge Document for SvelteKit Development**

> **Document Stats:** ~20,000 tokens | 10,190 words | 3,905 lines | 78,539 characters

This document synthesizes all official SvelteKit documentation into a practical reference guide for building robust SvelteKit applications. Use this as the authoritative source for SvelteKit patterns, conventions, and best practices.

---

## Table of Contents

1. [Project Structure & File Conventions](#1-project-structure--file-conventions)
2. [Routing](#2-routing)
3. [Load Functions](#3-load-functions)
4. [Form Actions](#4-form-actions)
5. [Page Options](#5-page-options)
6. [State Management](#6-state-management)
7. [Remote Functions](#7-remote-functions)
8. [Hooks](#8-hooks)
9. [Error Handling](#9-error-handling)
10. [Navigation & Links](#10-navigation--links)
11. [API Routes (+server.js)](#11-api-routes-serverjs)
12. [Service Workers](#12-service-workers)
13. [Advanced Patterns](#13-advanced-patterns)
14. [Adapters & Deployment](#14-adapters--deployment)
15. [Environment Variables](#15-environment-variables)
16. [CLI Commands](#16-cli-commands)
17. [SEO](#17-seo)
18. [Performance Optimization](#18-performance-optimization)
19. [Observability & Instrumentation](#19-observability--instrumentation)
20. [Configuration Reference](#20-configuration-reference)
21. [Important Conventions](#21-important-conventions)
22. [Type Safety](#22-type-safety)
23. [Web Standards](#23-web-standards)
24. [Common Pitfalls](#24-common-pitfalls)
25. [Best Practices](#25-best-practices)
26. [Migration Guide (v1 to v2)](#26-migration-guide-v1-to-v2)

---

## 1. Project Structure & File Conventions

### Directory Structure

```
my-project/
├── src/
│   ├── lib/                          # Shared components and utilities
│   │   ├── server/                   # Server-only code (not bundled to client)
│   │   │   └── [server modules]
│   │   └── [shared modules]
│   ├── params/                       # Route parameter matchers
│   │   └── [param matchers]
│   ├── routes/                       # Your app routes (filesystem-based)
│   │   └── [route files]
│   ├── app.html                      # Page template
│   ├── error.html                    # Static fallback error page
│   ├── hooks.client.js               # Client-side hooks
│   ├── hooks.server.js               # Server-side hooks
│   ├── hooks.js                      # Universal hooks (client & server)
│   ├── service-worker.js             # Service worker
│   └── instrumentation.server.js     # Observability setup
├── static/                           # Static assets (served as-is)
├── tests/                            # Tests (Playwright, Vitest)
├── package.json
├── svelte.config.js                  # SvelteKit configuration
├── tsconfig.json                     # TypeScript config
└── vite.config.js                    # Vite configuration
```

### File Naming Conventions

**Route Files (all start with `+`):**

- `+page.svelte` - Page component (visible to users)
- `+page.js` - Universal load function (runs server + client)
- `+page.server.js` - Server-only load function + actions
- `+layout.svelte` - Layout component
- `+layout.js` - Layout universal load
- `+layout.server.js` - Layout server load
- `+server.js` - API endpoint (GET, POST, etc.)
- `+error.svelte` - Error page boundary

**Special Files:**

- `.server.js` - Server-only modules
- `.remote.js` - Remote functions (experimental)
- `[param]` - Dynamic route parameter
- `[...rest]` - Rest/catch-all parameter
- `[[optional]]` - Optional parameter
- `(group)` - Layout group (doesn't affect URL)

### Important Rules

1. **All files can run on the server**
2. **All files run on client EXCEPT `+server` files**
3. **`+layout` and `+error` files apply to subdirectories**
4. **Only `+page.svelte` creates accessible routes**

---

## 2. Routing

### Basic Routing

**Route Hierarchy:**

```
src/routes/                      → /
src/routes/about/                → /about
src/routes/blog/[slug]/          → /blog/:slug
```

**Route Priority (most to least specific):**

1. `foo-abc/+page.svelte`
2. `foo-[c]/+page.svelte`
3. `[[optional]]/+page.svelte`
4. `[param]/+page.svelte`
5. `[...rest]/+page.svelte`

### Dynamic Routes

```js
/// file: src/routes/blog/[slug]/+page.js
export function load({ params }) {
	return {
		slug: params.slug // From URL /blog/hello-world
	};
}
```

### Rest Parameters

```js
/// file: src/routes/[org]/[repo]/tree/[branch]/[...file]/+page.js
/// Matches: /sveltejs/kit/tree/main/docs/routing.md

export function load({ params }) {
	return {
		org: params.org, // 'sveltejs'
		repo: params.repo, // 'kit'
		branch: params.branch, // 'main'
		file: params.file // 'docs/routing.md'
	};
}
```

### Optional Parameters

```js
/// file: src/routes/[[lang]]/home/+page.svelte
/// Matches: /home AND /en/home
```

### Parameter Matchers

```js
/// file: src/params/fruit.js
export function match(param) {
	return param === 'apple' || param === 'orange';
}
```

```
// Use with: src/routes/fruits/[page=fruit]/+page.svelte
// Only matches if param is 'apple' or 'orange'
```

### Advanced Routing

**Layout Groups** - Group routes without affecting URL:

```
src/routes/
  (app)/              # Group name doesn't appear in URL
    dashboard/        → /dashboard
    +layout.svelte    # Shared layout for group
  (marketing)/
    about/            → /about
    +layout.svelte
```

**Breaking Out of Layouts** - Reset layout hierarchy:

```svelte
<!-- +page@.svelte - Reset to root layout -->
<!-- +page@(app).svelte - Reset to (app) layout -->
<!-- +page@item.svelte - Reset to item layout -->
```

### 404 Handling

```
src/routes/
  marx-brothers/
    [...path]/+page.js    # Catches all unmatched routes
    +error.svelte         # Custom error page
```

```js
/// file: [...path]/+page.js
import { error } from '@sveltejs/kit';

export function load() {
	error(404, 'Not Found');
}
```

---

## 3. Load Functions

### Universal Load (`+page.js` / `+layout.js`)

Runs on **both server and client**.

```js
/// file: +page.js
/** @type {import('./$types').PageLoad} */
export function load({ params, url, route, fetch, setHeaders, parent, depends, untrack }) {
	return {
		post: {
			title: `Title for ${params.slug}`,
			content: 'Content here'
		}
	};
}
```

**Available to universal load:**

- `params` - Route parameters
- `url` - URL object
- `route` - Current route info
- `fetch` - Enhanced fetch
- `setHeaders` - Set response headers (SSR only)
- `parent` - Parent layout data
- `depends` - Manual dependency tracking
- `untrack` - Exclude from dependency tracking
- `data` - Data from server load (if both exist)

### Server Load (`+page.server.js` / `+layout.server.js`)

Runs **only on server**.

```js
/// file: +page.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, cookies, locals, platform, request }) {
	const post = await db.getPost(params.slug);

	if (!post) {
		error(404, 'Not found');
	}

	return { post };
}
```

**Additional server load properties:**

- `cookies` - Cookie API
- `locals` - Server-side data from hooks
- `platform` - Deployment platform info
- `request` - Request object
- `clientAddress` - Client IP

**Data must be serializable** with [devalue](https://github.com/rich-harris/devalue):

- JSON types
- `Date`, `Map`, `Set`, `RegExp`
- `BigInt`
- Cyclic references
- Promises (streamed to client)

### When to Use Which

**Universal Load (`+page.js`):**

- Fetching from public APIs
- Client-side only data manipulation
- Need to return non-serializable data (component constructors)
- No sensitive data/credentials

**Server Load (`+page.server.js`):**

- Database queries
- Private API keys/environment variables
- Sensitive operations
- Need `cookies`, `locals`, `request`

### Load Function Patterns

**Streaming with Promises:**

```js
/// file: +page.server.js
export async function load({ params }) {
	return {
		// Awaited - blocks render
		post: await loadPost(params.slug),
		// Not awaited - streams in after
		comments: loadComments(params.slug)
	};
}
```

**Using Parent Data:**

```js
/// file: +page.js
export async function load({ parent }) {
	const { user } = await parent();
	return {
		recommendations: fetchRecommendations(user.id)
	};
}
```

**Avoiding Waterfalls:**

```js
/// file: +page.js
export async function load({ params, parent }) {
	// ❌ BAD - waterfall
	const parentData = await parent();
	const data = await getData(params);

	// ✓ GOOD - parallel
	const data = await getData(params);
	const parentData = await parent();

	return { ...data, ...parentData };
}
```

### Load Rerunning

Load functions rerun when:

- Referenced `params` property changes
- Referenced `url` property changes (except `url.hash`)
- Called `url.searchParams.get()` and that param changed
- `await parent()` was called and parent reran
- Dependency was invalidated with `invalidate(url)`
- `invalidateAll()` was called
- `depends()` was used and that dependency was invalidated

**Manual Invalidation:**

```svelte
<script>
	import { invalidate, invalidateAll } from '$app/navigation';

	function refresh() {
		invalidate('app:data'); // Invalidate specific
		invalidate((url) => url.href.includes('/api/'));
		invalidateAll(); // Invalidate everything
	}
</script>
```

**Track Dependencies:**

```js
export async function load({ fetch, depends }) {
	depends('app:posts'); // Custom identifier
	const res = await fetch('/api/posts');
	return { posts: await res.json() };
}
```

**Untrack Dependencies:**

```js
export async function load({ url, untrack }) {
	// Don't rerun when pathname changes
	if (untrack(() => url.pathname) === '/') {
		return { message: 'Welcome!' };
	}
}
```

### Using fetch in Load

```js
export async function load({ fetch, params }) {
	// Enhanced fetch:
	// - Inherits cookies/auth headers on server
	// - Can make relative requests on server
	// - Direct handler call for internal endpoints
	// - Response inlined into HTML (no duplicate request)
	const res = await fetch(`/api/items/${params.id}`);
	return { item: await res.json() };
}
```

### Cookies in Server Load

```js
export async function load({ cookies }) {
	const sessionid = cookies.get('sessionid');

	return {
		user: await db.getUser(sessionid)
	};
}
```

### Setting Headers

```js
export async function load({ fetch, setHeaders }) {
	const res = await fetch('https://api.example.com/data');

	// Cache page for same duration as API
	setHeaders({
		age: res.headers.get('age'),
		'cache-control': res.headers.get('cache-control')
	});

	return res.json();
}
```

**Important:**

- Can only set header once
- Cannot use `set-cookie` (use `cookies.set()`)
- Only works during SSR

---

## 4. Form Actions

### Default Action

```js
/// file: +page.server.js
export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		const user = await db.getUser(email);
		cookies.set('sessionid', await db.createSession(user), { path: '/' });

		return { success: true };
	}
};
```

```svelte
<!--- file: +page.svelte --->
<form method="POST">
	<input name="email" type="email" />
	<input name="password" type="password" />
	<button>Log in</button>
</form>
```

### Named Actions

```js
/// file: +page.server.js
export const actions = {
	login: async (event) => {
		// Login logic
	},
	register: async (event) => {
		// Register logic
	}
};
```

```svelte
<form method="POST" action="?/login">
	<button>Log in</button>
</form>

<form method="POST" action="?/register">
	<button>Register</button>
</form>

<!-- Or use formaction -->
<form method="POST" action="?/login">
	<button>Log in</button>
	<button formaction="?/register">Register</button>
</form>
```

### Validation Errors

```js
import { fail } from '@sveltejs/kit';

export const actions = {
	login: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email');

		if (!email) {
			return fail(400, { email, missing: true });
		}

		const user = await db.getUser(email);
		if (!user) {
			return fail(400, { email, incorrect: true });
		}

		return { success: true };
	}
};
```

```svelte
<script>
	let { form } = $props();
</script>

<form method="POST">
	{#if form?.missing}
		<p class="error">Email required</p>
	{/if}
	{#if form?.incorrect}
		<p class="error">Invalid credentials</p>
	{/if}

	<input name="email" type="email" value={form?.email ?? ''} />
	<button>Log in</button>
</form>
```

### Progressive Enhancement

```svelte
<script>
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<!-- Basic enhancement (no full-page reload) -->
<form method="POST" use:enhance>
	<!-- form fields -->
</form>
```

**Default `use:enhance` behavior:**

- Updates `form` prop and `page.form` on success/failure
- Resets the `<form>` element
- Invalidates all data on success
- Calls `goto` on redirect
- Renders nearest `+error` on error
- Resets focus appropriately

### Custom Enhancement

```svelte
<script>
  import { enhance } from '$app/forms';
</script>

<form
  method="POST"
  use:enhance={({ formElement, formData, action, cancel, submitter }) => {
    // Before submission
    console.log('Submitting to:', action);

    return async ({ result, update }) => {
      // After submission
      if (result.type === 'success') {
        showToast('Success!');
      }
      // Call default behavior
      await update();
    };
  }}
>
```

### Manual Form Handling

```svelte
<script>
	import { invalidateAll } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';

	async function handleSubmit(event) {
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data,
			headers: {
				'x-sveltekit-action': 'true' // Required if +server.js exists
			}
		});

		const result = deserialize(await response.text());

		if (result.type === 'success') {
			await invalidateAll();
		}

		applyAction(result);
	}
</script>

<form method="POST" onsubmit={handleSubmit}>
	<!-- form fields -->
</form>
```

### Redirects from Actions

```js
import { redirect } from '@sveltejs/kit';

export const actions = {
	login: async ({ cookies, url }) => {
		// ... login logic ...

		if (url.searchParams.has('redirectTo')) {
			redirect(303, url.searchParams.get('redirectTo'));
		}

		return { success: true };
	}
};
```

---

## 5. Page Options

Export these from `+page.js`, `+page.server.js`, `+layout.js`, or `+layout.server.js`:

### prerender

```js
export const prerender = true; // Prerender at build time
export const prerender = false; // Never prerender
export const prerender = 'auto'; // Prerender but include in manifest
```

**Requirements for prerendering:**

- All users get same content
- No personalized data
- No form actions
- No accessing `url.searchParams` during render

**Prerendering server routes:**

```js
/// file: +server.js
export const prerender = true;

export function GET() {
	return new Response('This will be prerendered');
}
```

### ssr

```js
export const ssr = false; // Client-only rendering (SPA mode)
```

**When `ssr = false`:**

- Empty shell sent to client
- Worse SEO
- Slower initial render
- Better for apps with auth gates

### csr

```js
export const csr = false; // No client-side JavaScript
```

**When `csr = false`:**

- No JavaScript shipped
- No `<script>` tags in components
- No progressive enhancement
- No client-side navigation
- All links cause full page reload

### trailingSlash

```js
export const trailingSlash = 'never'; // Default
export const trailingSlash = 'always'; // /about → /about/
export const trailingSlash = 'ignore'; // Don't normalize
```

**Affects prerendering:**

- `'always'`: Creates `/about/index.html`
- `'never'`: Creates `/about.html`

### entries (for prerendering)

```js
/// file: +page.server.js
export function entries() {
	return [{ slug: 'hello-world' }, { slug: 'another-post' }];
}

export const prerender = true;
```

### config (adapter-specific)

```js
/// file: +page.js
export const config = {
	runtime: 'edge',
	regions: ['us1', 'us2']
};
```

---

## 6. State Management

### Server State Rules

**NEVER do this on server:**

```js
// ❌ BAD - shared across all users
let user;

export function load() {
	return { user };
}

export const actions = {
	default: async ({ request }) => {
		user = await request.formData(); // DANGEROUS!
	}
};
```

**✓ Good patterns:**

```js
// Use cookies + database
export async function load({ cookies }) {
	const sessionid = cookies.get('sessionid');
	return {
		user: await db.getUser(sessionid)
	};
}
```

### No Side Effects in Load

```js
// ❌ BAD
import { user } from '$lib/user';

export async function load({ fetch }) {
	const res = await fetch('/api/user');
	user.set(await res.json()); // Side effect!
}

// ✓ GOOD
export async function load({ fetch }) {
	const res = await fetch('/api/user');
	return {
		user: await res.json()
	};
}
```

### Using Context for State

```svelte
<!--- file: +layout.svelte --->
<script>
	import { setContext } from 'svelte';
	let { data } = $props();

	// Pass function to maintain reactivity
	setContext('user', () => data.user);
</script>
```

```svelte
<!--- file: +page.svelte --->
<script>
	import { getContext } from 'svelte';

	const user = getContext('user');
</script>

<p>Welcome {user().name}</p>
```

### Component State Preservation

```svelte
<script>
	let { data } = $props();

	// ❌ NOT reactive across navigation
	const wordCount = data.content.split(' ').length;

	// ✓ Reactive
	let wordCount = $derived(data.content.split(' ').length);
</script>
```

**Forcing component remount:**

```svelte
<script>
	import { page } from '$app/state';
</script>

{#key page.url.pathname}
	<Component {data} />
{/key}
```

### URL State

For state that should survive reload:

```js
// Store in URL search params
// ?sort=price&order=ascending

export async function load({ url }) {
	const sort = url.searchParams.get('sort') ?? 'name';
	const order = url.searchParams.get('order') ?? 'ascending';

	return {
		items: await db.getItems({ sort, order })
	};
}
```

### Snapshots (Ephemeral State)

```svelte
<script>
	let comment = $state('');

	export const snapshot = {
		capture: () => comment,
		restore: (value) => (comment = value)
	};
</script>

<form method="POST">
	<textarea bind:value={comment} />
	<button>Post</button>
</form>
```

**Snapshot data:**

- Must be JSON-serializable
- Stored in sessionStorage
- Restored on back/forward navigation

---

## 7. Remote Functions

**Available since SvelteKit 2.27** - Experimental feature requiring opt-in.

Remote functions provide type-safe communication between client and server. They always run on the server but can be called from anywhere in your app.

### Enabling Remote Functions

```js
/// file: svelte.config.js
const config = {
	kit: {
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true  // Optional: for await in components
		}
	}
};
```

### query - Reading Data

```js
/// file: src/routes/blog/data.remote.js
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getPosts = query(async () => {
	const posts = await db.sql`
		SELECT title, slug
		FROM post
		ORDER BY published_at DESC
	`;
	return posts;
});
```

**Using in components:**

```svelte
<script>
	import { getPosts } from './data.remote';
</script>

<ul>
	{#each await getPosts() as { title, slug }}
		<li><a href="/blog/{slug}">{title}</a></li>
	{/each}
</ul>
```

**Alternative syntax (without await):**

```svelte
<script>
	const query = getPosts();
</script>

{#if query.error}
	<p>oops!</p>
{:else if query.loading}
	<p>loading...</p>
{:else}
	<ul>
		{#each query.current as { title, slug }}
			<li><a href="/blog/{slug}">{title}</a></li>
		{/each}
	</ul>
{/if}
```

### Query Arguments with Validation

```js
import * as v from 'valibot';
import { query } from '$app/server';
import { error } from '@sveltejs/kit';

export const getPost = query(v.string(), async (slug) => {
	const [post] = await db.sql`
		SELECT * FROM post WHERE slug = ${slug}
	`;
	if (!post) error(404, 'Not found');
	return post;
});
```

### Refreshing Queries

```svelte
<button onclick={() => getPosts().refresh()}>
	Check for new posts
</button>
```

**Note:** Queries are cached while on the page, so `getPosts() === getPosts()`.

### query.batch - Solving N+1 Problem

```js
export const getWeather = query.batch(v.string(), async (cities) => {
	// cities is array of all arguments from simultaneous calls
	const weather = await db.sql`
		SELECT * FROM weather
		WHERE city = ANY(${cities})
	`;
	const lookup = new Map(weather.map(w => [w.city, w]));

	// Return resolver function
	return (city) => lookup.get(city);
});
```

### form - Writing Data

```js
/// file: src/routes/blog/data.remote.js
import { form } from '$app/server';
import * as v from 'valibot';

export const createPost = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ title, content }) => {
		const user = await auth.getUser();
		if (!user) error(401, 'Unauthorized');

		const slug = title.toLowerCase().replace(/ /g, '-');
		await db.sql`
			INSERT INTO post (slug, title, content)
			VALUES (${slug}, ${title}, ${content})
		`;

		redirect(303, `/blog/${slug}`);
	}
);
```

**Using in components:**

```svelte
<script>
	import { createPost } from '../data.remote';
</script>

<form {...createPost}>
	<label>
		<h2>Title</h2>
		<input name="title" />
	</label>

	<label>
		<h2>Write your post</h2>
		<textarea name="content"></textarea>
	</label>

	<button>Publish!</button>
</form>
```

### Form Validation

```svelte
<form {...createPost}>
	<label>
		<h2>Title</h2>
		{#if createPost.issues.title}
			{#each createPost.issues.title as issue}
				<p class="issue">{issue.message}</p>
			{/each}
		{/if}
		<input name="title" aria-invalid={!!createPost.issues.title} />
	</label>
	<button>Publish!</button>
</form>
```

**Programmatic validation:**

```svelte
<form {...createPost} oninput={() => createPost.validate()}>
	<!-- validates on every keystroke -->
</form>
```

### Preflight Schema (Client-side Validation)

```svelte
<script>
	import * as v from 'valibot';
	import { createPost } from '../data.remote';

	const schema = v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content: v.pipe(v.string(), v.nonEmpty())
	});
</script>

<form {...createPost.preflight(schema)}>
	<!-- Won't submit if validation fails -->
</form>
```

### Live Form Input

```svelte
<form {...createPost}>
	<!-- form fields -->
</form>

<div class="preview">
	<h2>{createPost.input.title}</h2>
	<div>{@html render(createPost.input.content)}</div>
</div>
```

### Sensitive Data Protection

```svelte
<input name="_password" type="password" />
<!-- Leading underscore prevents data from being sent back to user -->
```

### Single-Flight Mutations

**Server-driven:**

```js
export const createPost = form(
	v.object({...}),
	async (data) => {
		// ... form logic ...

		// Refresh specific queries
		await getPosts().refresh();

		// Or set data directly
		await getPost(post.id).set(result);

		redirect(303, `/blog/${slug}`);
	}
);
```

**Client-driven with enhance:**

```svelte
<form
	{...createPost.enhance(async ({ form, data, submit }) => {
		try {
			await submit().updates(getPosts());
			form.reset();
			showToast('Success!');
		} catch (error) {
			showToast('Error!');
		}
	})}
>
```

**Optimistic updates:**

```js
await submit().updates(
	getPosts().withOverride((posts) => [newPost, ...posts])
);
```

### command - Mutations Without Forms

```js
/// file: likes.remote.js
import { command } from '$app/server';
import * as v from 'valibot';

export const addLike = command(v.string(), async (id) => {
	await db.sql`
		UPDATE item
		SET likes = likes + 1
		WHERE id = ${id}
	`;

	// Refresh related query
	getLikes(id).refresh();
});
```

**Usage:**

```svelte
<button
	onclick={async () => {
		try {
			await addLike(item.id).updates(getLikes(item.id));
		} catch (error) {
			showToast('Error!');
		}
	}}
>
	add like
</button>
```

**Note:** Commands cannot be called during render.

### prerender - Build-Time Data

```js
import { prerender } from '$app/server';

export const getPosts = prerender(async () => {
	const posts = await db.sql`
		SELECT title, slug FROM post
		ORDER BY published_at DESC
	`;
	return posts;
});
```

**With arguments:**

```js
export const getPost = prerender(
	v.string(),
	async (slug) => { /* ... */ },
	{
		inputs: () => ['first-post', 'second-post', 'third-post'],
		dynamic: true  // Allow runtime calls with non-prerendered args
	}
);
```

**Benefits:**
- Data prerendered at build time
- Cached using Cache API (survives page reloads)
- Cleared on new deployment
- Can use on otherwise dynamic pages

### Using getRequestEvent

```js
import { getRequestEvent, query } from '$app/server';

export const getProfile = query(async () => {
	const { cookies } = getRequestEvent();
	const user = await findUser(cookies.get('session_id'));

	return {
		name: user.name,
		avatar: user.avatar
	};
});
```

**Note:** Inside remote functions, some `RequestEvent` properties differ:
- No `params` or `route.id`
- Cannot set headers (except cookies in `form`/`command`)
- `url.pathname` is always `/`

### Handling Validation Errors

```js
/// file: src/hooks.server.js
export function handleValidationError({ event, issues }) {
	return {
		message: 'Nice try, hacker!'
	};
}
```

### Important Notes

- Remote files must be in `src` directory
- File extensions: `.remote.js` or `.remote.ts`
- Both arguments and return values serialized with devalue
- Validation uses Standard Schema (Zod, Valibot, etc.)
- `redirect()` works in `query`, `form`, `prerender` (NOT in `command`)

---

## 8. Hooks

### Server Hooks (`src/hooks.server.js`)

#### handle

```js
export async function handle({ event, resolve }) {
	// Runs for every request

	// Add user to locals
	event.locals.user = await getUser(event.cookies.get('sessionid'));

	// Custom route handling
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	// Modify response
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('old', 'new'),
		filterSerializedResponseHeaders: (name) => name.startsWith('x-'),
		preload: ({ type }) => type === 'js'
	});

	response.headers.set('x-custom-header', 'value');

	return response;
}
```

**Multiple handles with sequence:**

```js
import { sequence } from '@sveltejs/kit/hooks';

async function handleAuth({ event, resolve }) {
	// Auth logic
	return resolve(event);
}

async function handleLogging({ event, resolve }) {
	// Logging logic
	return resolve(event);
}

export const handle = sequence(handleAuth, handleLogging);
```

#### handleFetch

```js
export async function handleFetch({ request, fetch, event }) {
	// Modify server-side fetch calls

	if (request.url.startsWith('https://api.external.com/')) {
		// Use internal URL
		request = new Request(
			request.url.replace('https://api.external.com/', 'http://localhost:9999/'),
			request
		);
	}

	// Add cookie for sibling subdomain
	if (request.url.startsWith('https://api.my-domain.com/')) {
		request.headers.set('cookie', event.request.headers.get('cookie'));
	}

	return fetch(request);
}
```

#### handleValidationError

```js
export function handleValidationError({ event, issues }) {
	// Called when remote function validation fails
	return {
		message: 'Invalid request'
	};
}
```

### Shared Hooks (`hooks.server.js` and `hooks.client.js`)

#### handleError

```js
/// file: hooks.server.js
import * as Sentry from '@sentry/sveltekit';

export async function handleError({ error, event, status, message }) {
	const errorId = crypto.randomUUID();

	Sentry.captureException(error, {
		extra: { event, errorId, status }
	});

	return {
		message: 'Whoops!',
		errorId
	};
}
```

**Type-safe error shape:**

```ts
/// file: src/app.d.ts
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId: string;
		}
	}
}
```

#### init

```js
/// file: hooks.server.js
import * as db from '$lib/server/database';

export async function init() {
	// Runs once when server starts
	await db.connect();
}
```

### Universal Hooks (`src/hooks.js`)

#### reroute

```js
const translated = {
	'/en/about': '/en/about',
	'/de/ueber-uns': '/de/about',
	'/fr/a-propos': '/fr/about'
};

export function reroute({ url }) {
	if (url.pathname in translated) {
		return translated[url.pathname];
	}
}
```

**Async reroute (2.18+):**

```js
export async function reroute({ url, fetch }) {
	const api = new URL('/api/reroute', url);
	const result = await fetch(api).then((r) => r.json());
	return result.pathname;
}
```

#### transport

```js
import { Vector } from '$lib/math';

export const transport = {
	Vector: {
		encode: (value) => value instanceof Vector && [value.x, value.y],
		decode: ([x, y]) => new Vector(x, y)
	}
};
```

---

## 8. Error Handling

### Expected Errors

```js
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const post = await db.getPost(params.slug);

	if (!post) {
		error(404, 'Not found'); // Throws, no need to return
	}

	return { post };
}
```

**With additional properties:**

```js
error(404, {
	message: 'Not found',
	code: 'POST_NOT_FOUND'
});
```

### Error Boundaries

```svelte
<!--- file: +error.svelte --->
<script>
	import { page } from '$app/state';
</script>

<h1>{page.status}: {page.error.message}</h1>
```

**Error boundary hierarchy:**

```
src/routes/
  +error.svelte          # Root error boundary
  blog/
    +error.svelte        # Blog error boundary
    [slug]/
      +error.svelte      # Post error boundary
      +page.svelte
```

### Unexpected Errors

Handled by `handleError` hook:

```js
/// file: hooks.server.js
export async function handleError({ error, event }) {
	console.error('Unexpected error:', error);

	return {
		message: 'Something went wrong',
		errorId: crypto.randomUUID()
	};
}
```

### Fallback Error Page

```html
<!--- file: src/error.html --->
<!DOCTYPE html>
<html>
	<head>
		<title>%sveltekit.error.message%</title>
	</head>
	<body>
		<h1>Error</h1>
		<p>Status: %sveltekit.status%</p>
		<p>%sveltekit.error.message%</p>
	</body>
</html>
```

---

## 10. Navigation & Links

### Link Options (data-sveltekit-\*)

```html
<!-- Preload data on hover -->
<a href="/about" data-sveltekit-preload-data="hover">About</a>

<!-- Preload data on tap/click -->
<a href="/about" data-sveltekit-preload-data="tap">About</a>

<!-- Preload code eagerly -->
<a href="/about" data-sveltekit-preload-code="eager">About</a>

<!-- Preload code when in viewport -->
<a href="/about" data-sveltekit-preload-code="viewport">About</a>

<!-- Full page reload instead of client-side navigation -->
<a href="/path" data-sveltekit-reload>Path</a>

<!-- Replace history instead of push -->
<a href="/path" data-sveltekit-replacestate>Path</a>

<!-- Keep focus after navigation -->
<form data-sveltekit-keepfocus>
	<input type="text" name="query" />
</form>

<!-- Don't scroll to top after navigation -->
<a href="/path" data-sveltekit-noscroll>Path</a>

<!-- Disable options -->
<div data-sveltekit-preload-data="false">
	<!-- Links here won't preload -->
</div>
```

**Important:** Data preloading respects user's data preferences:
- If `navigator.connection.saveData === true`, preloading is disabled
- Honors reduced data usage settings

### Programmatic Preloading

```js
import { preloadData } from '$app/navigation';

// Preload route data
await preloadData('/about');

// Preload with specific URL
await preloadData(new URL('/blog', window.location));
```

**Use cases:**
- Preload before navigation
- Preload on custom events
- Preload based on user behavior

### Programmatic Navigation

```svelte
<script>
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';

	async function navigate() {
		await goto('/dashboard', {
			replaceState: false,
			noScroll: false,
			keepFocus: false,
			invalidateAll: false,
			state: { modal: true }
		});
	}

	function refresh() {
		invalidate('app:data');
		invalidateAll();
	}
</script>
```

### Navigation Lifecycle

```svelte
<script>
	import { beforeNavigate, afterNavigate, onNavigate } from '$app/navigation';

	beforeNavigate(({ from, to, cancel, type }) => {
		// Before navigation starts
		if (hasUnsavedChanges) {
			if (!confirm('Leave page?')) {
				cancel();
			}
		}
	});

	afterNavigate(({ from, to, type }) => {
		// After navigation completes
		console.log('Navigated to:', to.url);
	});

	onNavigate((navigation) => {
		// Runs during navigation
		// Useful for view transitions
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>
```

### Shallow Routing (History-driven UI)

```svelte
<script>
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';

	function showModal() {
		pushState('', { showModal: true });
	}
</script>

{#if page.state.showModal}
	<Modal close={() => history.back()} />
{/if}

<button onclick={showModal}>Open Modal</button>
```

**Type-safe page state:**

```ts
/// file: src/app.d.ts
declare global {
	namespace App {
		interface PageState {
			showModal?: boolean;
			selected?: any;
		}
	}
}
```

---

## 10. API Routes (+server.js)

### Basic Endpoint

```js
/// file: +server.js
import { json, error } from '@sveltejs/kit';

export function GET({ url }) {
	const min = Number(url.searchParams.get('min') ?? '0');
	const max = Number(url.searchParams.get('max') ?? '1');

	if (isNaN(min) || isNaN(max)) {
		error(400, 'Invalid parameters');
	}

	const random = min + Math.random() * (max - min);
	return new Response(String(random));
}

export async function POST({ request }) {
	const data = await request.json();
	const result = await processData(data);
	return json(result);
}
```

### All HTTP Methods

```js
export function GET({ request }) {
	/* ... */
}
export function POST({ request }) {
	/* ... */
}
export function PUT({ request }) {
	/* ... */
}
export function PATCH({ request }) {
	/* ... */
}
export function DELETE({ request }) {
	/* ... */
}
export function OPTIONS({ request }) {
	/* ... */
}
export function HEAD({ request }) {
	/* ... */
}

// Catch-all for other methods
export function fallback({ request }) {
	return new Response(`Caught ${request.method}`);
}
```

### Streaming Responses

```js
export function GET() {
	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue('Hello ');
			setTimeout(() => {
				controller.enqueue('world!');
				controller.close();
			}, 1000);
		}
	});

	return new Response(stream);
}
```

### FormData Handling

```js
export async function POST({ request }) {
	const data = await request.formData();
	const file = data.get('file');
	const name = data.get('name');

	// Process file and name
	return json({ success: true });
}
```

### Content Negotiation

`+server.js` and `+page.svelte` can coexist:

- `PUT`/`PATCH`/`DELETE`/`OPTIONS` always go to `+server.js`
- `GET`/`POST`/`HEAD` with `accept: text/html` go to page
- `GET`/`POST`/`HEAD` with other accepts go to `+server.js`

---

## 12. Service Workers

Service workers act as proxy servers for network requests, enabling offline support and performance optimization through precaching.

### Setup

Create `src/service-worker.js` (or `src/service-worker/index.js`). It will be automatically bundled and registered.

**Disable automatic registration:**

```js
/// file: svelte.config.js
export default {
	kit: {
		serviceWorker: {
			register: false
		}
	}
};
```

**Manual registration:**

```js
import { dev } from '$app/environment';

if ('serviceWorker' in navigator) {
	addEventListener('load', function () {
		navigator.serviceWorker.register('./path/to/service-worker.js', {
			type: dev ? 'module' : 'classic'
		});
	});
}
```

### Inside the Service Worker

**$service-worker module provides:**

- `build` - Array of app files
- `files` - Array of files from `static` directory
- `version` - App version string for cache naming
- `base` - Base path from configuration

**Complete caching example:**

```js
/// file: src/service-worker.js
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

const self = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self));

// Create unique cache name
const CACHE = `cache-${version}`;

const ASSETS = [
	...build,  // The app itself
	...files   // Everything in static
];

self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// Serve build/files from cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);
			if (response) return response;
		}

		// Try network first, fallback to cache
		try {
			const response = await fetch(event.request);

			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);
			if (response) return response;

			throw err;
		}
	}

	event.respondWith(respond());
});
```

### Development Notes

- Service worker bundled for production only
- Development requires browsers with [module service worker support](https://web.dev/es-modules-in-sw)
- `build` and `prerendered` arrays are empty in development
- Must use `type: dev ? 'module' : 'classic'` for manual registration

### Caching Strategies

**Cache-first (for static assets):**
```js
if (ASSETS.includes(url.pathname)) {
	const cached = await cache.match(url.pathname);
	if (cached) return cached;
}
```

**Network-first with cache fallback (for dynamic content):**
```js
try {
	const response = await fetch(event.request);
	cache.put(event.request, response.clone());
	return response;
} catch {
	return await cache.match(event.request);
}
```

### Important Warnings

- Be careful when caching - stale data can be worse than no data
- Browsers empty caches if they get too full
- Don't cache large assets like videos without consideration
- Service worker updates when any file changes

### Alternative Solutions

- [Vite PWA plugin](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html) for Workbox users
- [Workbox](https://web.dev/learn/pwa/workbox) library for complex PWA requirements

---

## 13. Advanced Patterns

### Using getRequestEvent

```js
/// file: $lib/server/auth.js
import { redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';

export function requireLogin() {
	const { locals, url } = getRequestEvent();

	if (!locals.user) {
		redirect(307, `/login?redirectTo=${url.pathname}`);
	}

	return locals.user;
}
```

```js
/// file: +page.server.js
import { requireLogin } from '$lib/server/auth';

export function load() {
	const user = requireLogin();
	return { message: `Hello ${user.name}` };
}
```

### Parallel Loading

```js
// SvelteKit runs all loads concurrently
// Layout load and page load run in parallel
// Multiple server loads are batched into single request
```

### Auth Patterns

**In hooks (recommended for multiple routes):**

```js
/// file: hooks.server.js
export async function handle({ event, resolve }) {
	event.locals.user = await getUser(event.cookies.get('session'));

	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user?.isAdmin) {
			return new Response('Unauthorized', { status: 401 });
		}
	}

	return resolve(event);
}
```

**In page load (for specific route):**

```js
/// file: +page.server.js
export async function load({ locals }) {
	if (!locals.user) {
		error(401, 'Not logged in');
	}

	if (!locals.user.isAdmin) {
		error(403, 'Not an admin');
	}

	return { user: locals.user };
}
```

### Performance Optimization

**Code splitting with dynamic imports:**

```js
async function loadHeavyLibrary() {
	const { method } = await import('heavy-library');
	return method();
}
```

**Selective prerendering:**

```js
export const prerender = 'auto'; // Prerender but keep in manifest
```

**Link preloading:**

```html
<body data-sveltekit-preload-data="hover"></body>
```

**Streaming slow data:**

```js
export async function load() {
	return {
		fast: await fastQuery(),
		slow: slowQuery() // Streams in
	};
}
```

---

## 12. Adapters & Deployment

### Adapter Configuration

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-auto';

export default {
	kit: {
		adapter: adapter()
	}
};
```

### Common Adapters

**adapter-auto** - Auto-detects platform:

```js
import adapter from '@sveltejs/adapter-auto';
```

**adapter-node** - Node.js server:

```js
import adapter from '@sveltejs/adapter-node';

export default {
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true,  // gzip/brotli precompression
			envPrefix: ''       // Custom environment variable prefix
		})
	}
};
```

**Environment Variables:**

- `PORT` - Port to listen on (default: 3000)
- `HOST` - Host to bind to (default: 0.0.0.0)
- `SOCKET_PATH` - Unix socket path (overrides PORT/HOST)
- `ORIGIN` - Full origin URL (e.g., https://example.com)
- `PROTOCOL_HEADER` - Header containing protocol (e.g., x-forwarded-proto)
- `HOST_HEADER` - Header containing host (e.g., x-forwarded-host)
- `PORT_HEADER` - Header containing port (e.g., x-forwarded-port)
- `ADDRESS_HEADER` - Header containing client IP (e.g., True-Client-IP)
- `XFF_DEPTH` - Number of trusted proxies for X-Forwarded-For
- `BODY_SIZE_LIMIT` - Max request body size (default: 512KB, e.g., "50mb" or Infinity)
- `SHUTDOWN_TIMEOUT` - Graceful shutdown timeout in seconds (default: 30)
- `IDLE_TIMEOUT` - Socket activation idle timeout in seconds

**Production setup:**

```bash
npm install dotenv
node -r dotenv/config build

# Or Node 20.6+:
node --env-file=.env build
```

**adapter-static** - Static site:

```js
import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '200.html', // For SPAs (or 404.html, index.html)
			precompress: false,    // Generate .gz and .br files
			strict: true           // Fail build if any pages aren't prerendered
		})
	}
};
```

**Options:**
- `pages` - Directory for prerendered pages
- `assets` - Directory for static assets (usually same as pages)
- `fallback` - SPA fallback page (200.html, 404.html, index.html)
- `precompress` - Create gzip/brotli compressed files
- `strict` - Enforce all pages prerendered or fallback set

**Zero-config platforms:** Vercel (omit options for automatic config)

**SPA mode:**
```js
/// file: src/routes/+layout.js
export const ssr = false;  // Disable SSR
export const prerender = true;  // Prerender what you can
```

**adapter-vercel**, **adapter-netlify**, **adapter-cloudflare**:

```js
import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter({
			edge: false, // Use edge functions
			split: false // Code splitting
		})
	}
};
```

### Building

```bash
npm run build        # Create production build
npm run preview      # Preview production build
```

---

## 15. Environment Variables

SvelteKit provides four modules for environment variables, each with different characteristics:

### Static vs Dynamic

**Static** (`$env/static/*`):
- Replaced at build time
- Better performance (values inlined)
- Cannot change at runtime
- Use for values known at build time

**Dynamic** (`$env/dynamic/*`):
- Read at runtime
- Can change without rebuild
- Slightly slower (runtime lookup)
- Use for values that may change between deployments

### Public vs Private

**Public** (`$env/*/public`):
- Available in browser and server
- Must be prefixed (default: `PUBLIC_`)
- Visible to users (inspect source code)
- Use for non-sensitive config

**Private** (`$env/*/private`):
- **Server-only**
- Any variable without public prefix
- Never sent to client
- Use for API keys, secrets, database URLs

### The Four Modules

#### $env/static/private

```js
/// file: src/routes/+page.server.js
import { API_KEY } from '$env/static/private';

export async function load({ fetch }) {
	const res = await fetch('https://api.example.com', {
		headers: { Authorization: `Bearer ${API_KEY}` }
	});
	return { data: await res.json() };
}
```

**Characteristics:**
- Build-time replacement
- Server-only
- Best performance
- Use for secrets that don't change between builds

#### $env/static/public

```js
/// file: src/routes/+page.svelte
import { PUBLIC_API_URL } from '$env/static/public';

fetch(`${PUBLIC_API_URL}/posts`);
```

**Characteristics:**
- Build-time replacement
- Available everywhere
- Visible in client code
- Use for public config URLs

#### $env/dynamic/private

```js
/// file: src/routes/+page.server.js
import { env } from '$env/dynamic/private';

// Runtime value
const dbUrl = env.DATABASE_URL;
```

**Characteristics:**
- Runtime lookup
- Server-only
- Can change without rebuild
- **Cannot be used during prerendering** (will error in SvelteKit 2)

#### $env/dynamic/public

```js
/// file: src/lib/utils.js
import { env } from '$env/dynamic/public';

// Available in browser and server
const apiUrl = env.PUBLIC_API_URL;
```

**Characteristics:**
- Runtime lookup
- Available everywhere
- Fetched from `/_app/env.js` in browser
- Use for values that change between deployments

### Loading Environment Variables

**Development:**

```bash
# .env file (auto-loaded by Vite)
DATABASE_URL=postgresql://localhost/mydb
PUBLIC_API_URL=https://api.example.com
```

**Production (adapter-node):**

```bash
# Option 1: Using dotenv
npm install dotenv
node -r dotenv/config build

# Option 2: Node 20.6+ built-in
node --env-file=.env build

# Option 3: System environment
export DATABASE_URL=postgresql://prod/mydb
node build
```

### Naming Conventions

```bash
# Private (server-only)
DATABASE_URL=...
API_SECRET=...
STRIPE_KEY=...

# Public (visible to browser)
PUBLIC_API_URL=...
PUBLIC_ANALYTICS_ID=...
PUBLIC_FEATURE_FLAG=...
```

### Best Practices

```js
// ✓ GOOD: Use static for build-time values
import { PUBLIC_API_URL } from '$env/static/public';

// ✓ GOOD: Use dynamic for runtime values
import { env } from '$env/dynamic/private';
const secret = env.JWT_SECRET;

// ❌ BAD: Don't use dynamic during prerendering
export const prerender = true;
export async function load() {
	const { env } = await import('$env/dynamic/private'); // ERROR!
}

// ❌ BAD: Don't expose secrets publicly
import { API_KEY } from '$env/static/public'; // Visible in browser!
```

### Prefixes

Configure public prefix in `svelte.config.js`:

```js
export default {
	kit: {
		env: {
			publicPrefix: 'PUB_'  // Default is 'PUBLIC_'
		}
	}
};
```

### Type Safety

```ts
/// file: src/app.d.ts
declare global {
	namespace App {
		interface Platform {
			env: {
				DATABASE_URL: string;
				API_KEY: string;
			}
		}
	}
}
```

---

## 16. CLI Commands

SvelteKit uses Vite's CLI with some additional commands:

### Development

```bash
vite dev
# or
npm run dev
```

**Options:**
- `--port 3000` - Specify port
- `--host` - Expose to network
- `--open` - Auto-open browser

### Build

```bash
vite build
# or
npm run build
```

**Process:**
1. Creates production build
2. Runs prerendering
3. Adapter creates output

**Check if building:**

```js
import { building } from '$app/environment';

if (building) {
	// Code only runs during build
}
```

### Preview

```bash
vite preview
# or
npm run preview
```

**Purpose:**
- Test production build locally
- Verify adapter output
- **Required for accurate performance testing**

### Type Generation

```bash
svelte-kit sync
```

**What it does:**
- Creates `tsconfig.json`
- Generates `./$types` files
- Updates type definitions

**When to run:**
- Automatically runs as `prepare` script
- After adding new routes
- When types seem out of sync

### Package Scripts

```json
{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"lint": "prettier --check . && eslint .",
		"format": "prettier --write ."
	}
}
```

---

## 17. SEO

### Out of the Box

#### Server-Side Rendering

SSR is enabled by default and critical for SEO:

```js
// ✓ Default - good for SEO
export const ssr = true;

// ❌ Avoid unless necessary
export const ssr = false;
```

#### Performance Matters

Core Web Vitals impact search ranking:
- Use [PageSpeed Insights](https://pagespeed.web.dev/)
- Leverage SvelteKit's code-splitting
- Optimize images with `@sveltejs/enhanced-img`
- See [Performance section](#18-performance-optimization)

#### URL Normalization

SvelteKit auto-redirects trailing slashes:

```js
/// file: +page.js
export const trailingSlash = 'never';  // /about (default)
export const trailingSlash = 'always'; // /about/
export const trailingSlash = 'ignore'; // No redirect
```

**Importance:** Duplicate URLs harm SEO.

### Manual Setup

#### Title and Meta Tags

```svelte
<!--- file: src/routes/+layout.svelte --->
<script>
	import { page } from '$app/state';

	// Get SEO data from page data
	let { data, children } = $props();
</script>

<svelte:head>
	<title>{data.title || 'My Site'}</title>
	<meta name="description" content={data.description || 'Default description'} />

	<!-- Open Graph -->
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:image" content={data.image} />
	<meta property="og:url" content={page.url} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.title} />
	<meta name="twitter:description" content={data.description} />
</svelte:head>

{@render children()}
```

```js
/// file: src/routes/blog/[slug]/+page.server.js
export async function load({ params }) {
	const post = await getPost(params.slug);

	return {
		post,
		title: post.title,
		description: post.excerpt,
		image: post.coverImage
	};
}
```

#### Sitemaps

```js
/// file: src/routes/sitemap.xml/+server.js
export async function GET() {
	const posts = await getAllPosts();

	const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
	xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
	xmlns:xhtml="https://www.w3.org/1999/xhtml"
	xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
	xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
	<url>
		<loc>https://example.com</loc>
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>
	${posts.map(post => `
	<url>
		<loc>https://example.com/blog/${post.slug}</loc>
		<lastmod>${post.updatedAt}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>0.8</priority>
	</url>
	`).join('')}
</urlset>`.trim();

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
```

#### AMP Support

```js
/// file: svelte.config.js
export default {
	kit: {
		// Inline all styles (required for AMP)
		inlineStyleThreshold: Infinity
	}
};
```

```js
/// file: src/routes/+layout.server.js
export const csr = false; // Disable client-side JS
```

```html
<!-- file: src/app.html -->
<html amp>
	<!-- ... -->
</html>
```

```js
/// file: src/hooks.server.js
import * as amp from '@sveltejs/amp';

export async function handle({ event, resolve }) {
	let buffer = '';
	return await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			buffer += html;
			if (done) return amp.transform(buffer);
		}
	});
}
```

### SEO Checklist

- ✓ Use SSR for all public pages
- ✓ Unique `<title>` and `<meta description>` per page
- ✓ Implement sitemaps
- ✓ Optimize Core Web Vitals
- ✓ Use semantic HTML
- ✓ Add structured data (JSON-LD)
- ✓ Implement proper heading hierarchy (h1 → h6)
- ✓ Add alt text to images
- ✓ Configure trailing slash handling
- ✓ Test with PageSpeed Insights
- ✓ Verify in Google Search Console

---

## 18. Performance Optimization

### Built-in Optimizations

SvelteKit provides these automatically:

- **Code-splitting** - Only load code for current page
- **Asset preloading** - Prevent file request waterfalls
- **File hashing** - Enable permanent caching
- **Request coalescing** - Batch server loads into single request
- **Parallel loading** - Universal loads fetch simultaneously
- **Data inlining** - SSR fetch responses embedded in HTML
- **Conservative invalidation** - Rerun loads only when needed
- **Prerendering** - Static pages served instantly
- **Link preloading** - Anticipate navigation needs

### Diagnosing Performance

**Tools:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- Browser DevTools (Network, Performance tabs)

**Important:** Always test in `preview` mode, not `dev`:

```bash
npm run build
npm run preview
```

### Image Optimization

```bash
npm i -D @sveltejs/enhanced-img
```

```js
/// file: svelte.config.js
import { enhancedImages } from '@sveltejs/enhanced-img';

export default {
	kit: { /* ... */ },
	plugins: [enhancedImages()]
};
```

```svelte
<script>
	import { Image } from '@sveltejs/enhanced-img';
	import myImage from '$lib/assets/image.jpg';
</script>

<Image src={myImage} alt="Description" />
```

**Benefits:**
- Automatic format conversion (WebP, AVIF)
- Responsive srcset generation
- Lazy loading
- Size optimization

### Video Optimization

```html
<!-- Compress with Handbrake, use web formats -->
<video preload="none">
	<source src="video.webm" type="video/webm" />
	<source src="video.mp4" type="video/mp4" />
</video>
```

**Tips:**
- Use `preload="none"` below the fold
- Strip audio from muted videos
- Convert to WebM/MP4
- Consider lazy-loading

### Font Optimization

**Preload critical fonts:**

```js
/// file: src/hooks.server.js
export async function handle({ event, resolve }) {
	return await resolve(event, {
		preload: ({ type, path }) => {
			if (type === 'font' && path.includes('critical')) {
				return true;
			}
		}
	});
}
```

**Subset fonts:**
- Use [Google Fonts](https://fonts.google.com/) with `&text=` parameter
- Or subset locally with tools like `glyphhanger`

### Code Size Reduction

**Use latest Svelte:**

```bash
npm install svelte@latest
```

**Analyze bundle:**

```bash
npm i -D rollup-plugin-visualizer
```

```js
/// file: vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
	plugins: [
		visualizer({ open: true })
	]
};
```

**Lazy load when appropriate:**

```svelte
<script>
	let HeavyComponent;

	async function loadComponent() {
		HeavyComponent = (await import('$lib/HeavyComponent.svelte')).default;
	}
</script>

<button onclick={loadComponent}>Load</button>

{#if HeavyComponent}
	<HeavyComponent />
{/if}
```

**Use Partytown for third-party scripts:**

```bash
npm i @builder.io/partytown
```

```svelte
<script>
	import { partytownSnippet } from '@builder.io/partytown/integration';
</script>

<svelte:head>
	{@html partytownSnippet()}
	<script type="text/partytown" src="https://analytics.example.com/script.js"></script>
</svelte:head>
```

### Navigation Performance

**Preload aggressively:**

```html
<body data-sveltekit-preload-data="hover">
	%sveltekit.body%
</body>
```

**Stream slow data:**

```js
export async function load() {
	return {
		fast: await fastQuery(),
		slow: slowQuery() // Streams after initial render
	};
}
```

### Preventing Waterfalls

**❌ Bad - Sequential requests:**

```js
// Universal load - runs in browser
export async function load({ fetch, parent }) {
	const parentData = await parent(); // Request 1
	const data = await fetch(`/api/data`); // Request 2 (waits for 1)
	return { data };
}
```

**✓ Good - Parallel requests:**

```js
// Server load - runs on server (closer to database)
export async function load({ fetch }) {
	const [user, posts] = await Promise.all([
		fetch('/api/user'),
		fetch('/api/posts')
	]);

	return { user, posts };
}
```

**Use database joins:**

```js
// ❌ N+1 problem
const users = await db.query('SELECT * FROM users');
for (const user of users) {
	user.posts = await db.query('SELECT * FROM posts WHERE user_id = ?', user.id);
}

// ✓ Single query
const users = await db.query(`
	SELECT users.*, posts.*
	FROM users
	LEFT JOIN posts ON posts.user_id = users.id
`);
```

### Hosting Considerations

- **Edge deployment** - Serve from nearest server
- **HTTP/2** - Parallel file loading
- **CDN** - Cache static assets
- **Co-location** - Frontend + backend in same datacenter

---

## 19. Observability & Instrumentation

**Available since SvelteKit 2.31** - Experimental feature for OpenTelemetry tracing.

### Enabling Observability

```js
/// file: svelte.config.js
export default {
	kit: {
		experimental: {
			tracing: {
				server: true
			},
			instrumentation: {
				server: true
			}
		}
	}
};
```

### What Gets Traced

- `handle` hooks and `sequence` functions
- Server `load` functions
- Universal `load` functions (when run on server)
- Form actions
- Remote functions

### Setup (Jaeger Example)

**Install dependencies:**

```bash
npm i @opentelemetry/sdk-node \
      @opentelemetry/auto-instrumentations-node \
      @opentelemetry/exporter-trace-otlp-proto \
      import-in-the-middle
```

**Create instrumentation file:**

```js
/// file: src/instrumentation.server.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { createAddHookMessageChannel } from 'import-in-the-middle';
import { register } from 'node:module';

const { registerOptions } = createAddHookMessageChannel();
register('import-in-the-middle/hook.mjs', import.meta.url, registerOptions);

const sdk = new NodeSDK({
	serviceName: 'my-sveltekit-app',
	traceExporter: new OTLPTraceExporter(),
	instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
```

### Augmenting Built-in Tracing

**Access spans via event:**

```js
/// file: $lib/authenticate.js
import { getRequestEvent } from '$app/server';

async function authenticate() {
	const user = await getAuthenticatedUser();
	const event = getRequestEvent();

	// Annotate root span
	event.tracing.root.setAttribute('userId', user.id);

	// Annotate current span
	event.tracing.current.setAttribute('userRole', user.role);
}
```

**Properties:**
- `event.tracing.root` - Root `handle` span
- `event.tracing.current` - Current context span (handle, load, action, or remote function)

### Viewing Traces

1. Start Jaeger locally:
```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

2. View at [localhost:16686](http://localhost:16686)

### Performance Considerations

**Warning:** Tracing has overhead. Consider:
- Enable only in development/preview
- Sample traces in production (not every request)
- Use conditional logic:

```js
const shouldTrace = process.env.NODE_ENV !== 'production' || Math.random() < 0.01;

if (shouldTrace) {
	// Setup tracing
}
```

### @opentelemetry/api

SvelteKit uses `@opentelemetry/api` as an optional peer dependency. If you see errors about missing `@opentelemetry/api`, you may need to install it:

```bash
npm i @opentelemetry/api
```

---

## 20. Configuration Reference

### Complete svelte.config.js Options

```js
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Svelte compiler options
	compilerOptions: {
		preserveComments: false,
		preserveWhitespace: false,
		experimental: {
			async: false  // Enable await in components
		}
	},

	// SvelteKit options
	kit: {
		// Adapter
		adapter: adapter(),

		// Path aliases
		alias: {
			$components: 'src/lib/components',
			$utils: 'src/lib/utils'
		},

		// App directory name
		appDir: '_app',

		// Content Security Policy
		csp: {
			mode: 'auto',  // or 'hash' or 'nonce'
			directives: {
				'script-src': ['self']
			}
		},

		// For embedding in iframes
		embedded: false,

		// Environment variables
		env: {
			dir: process.cwd(),
			publicPrefix: 'PUBLIC_'
		},

		// File locations
		files: {
			assets: 'static',
			hooks: {
				client: 'src/hooks.client',
				server: 'src/hooks.server',
				universal: 'src/hooks'
			},
			lib: 'src/lib',
			params: 'src/params',
			routes: 'src/routes',
			serviceWorker: 'src/service-worker',
			appTemplate: 'src/app.html',
			errorTemplate: 'src/error.html'
		},

		// Inline styles threshold (for AMP)
		inlineStyleThreshold: 0,

		// Module extensions
		moduleExtensions: ['.js', '.ts'],

		// Output directory
		outDir: '.svelte-kit',

		// Output configuration
		output: {
			preloadStrategy: 'modulepreload' // or 'preload-js' or 'preload-mjs'
		},

		// Paths
		paths: {
			assets: '',
			base: '',
			relative: true
		},

		// Prerendering
		prerender: {
			concurrency: 1,
			crawl: true,
			enabled: true,
			entries: ['*'],
			handleHttpError: 'warn', // or 'fail' or 'ignore' or custom function
			handleMissingId: 'warn',
			origin: 'http://sveltekit-prerender'
		},

		// Service worker
		serviceWorker: {
			register: true,
			files: (filepath) => !/\.DS_Store/.test(filepath)
		},

		// TypeScript
		typescript: {
			config: (config) => config
		},

		// Version
		version: {
			name: Date.now().toString(),
			pollInterval: 0
		},

		// Experimental features
		experimental: {
			remoteFunctions: false,
			tracing: {
				server: false
			},
			instrumentation: {
				server: false
			}
		}
	}
};

export default config;
```

### Key Configuration Options

#### adapter

```js
import adapter from '@sveltejs/adapter-auto';

kit: {
	adapter: adapter()
}
```

#### alias

```js
kit: {
	alias: {
		'$components': 'src/lib/components',
		'$ui': 'src/lib/ui',
		'@models': 'src/lib/server/models'
	}
}
```

#### csp

```js
kit: {
	csp: {
		mode: 'hash',  // Generate hashes for inline scripts/styles
		directives: {
			'script-src': ['self', 'https://cdn.example.com'],
			'style-src': ['self', 'unsafe-inline']
		}
	}
}
```

#### inlineStyleThreshold

```js
kit: {
	inlineStyleThreshold: Infinity  // Inline all styles (required for AMP)
}
```

#### paths.base

```js
kit: {
	paths: {
		base: '/my-app'  // App served from /my-app instead of /
	}
}
```

#### paths.relative

```js
kit: {
	paths: {
		relative: true  // Use relative paths (default in v2)
	}
}
```

#### prerender.entries

```js
kit: {
	prerender: {
		entries: ['*', '/custom-page', '/sitemap.xml']
	}
}
```

#### version.pollInterval

```js
kit: {
	version: {
		pollInterval: 60000  // Check for new version every 60s
	}
}
```

---

## 21. Important Conventions

### DO's

✓ Use `<a>` elements for navigation (not `<Link>`)
✓ Use `data` prop name in components (not `body`)
✓ Use `result` variable name (not `response`)
✓ Use logger in server code (not console.log)
✓ Return from load functions (not side effects)
✓ Use cookies + database for user state
✓ Use `error()` and `redirect()` (they throw automatically)
✓ Use camelCase for variables
✓ Use `err` in catch blocks

### DON'T's

✗ Don't throw `error()` or `redirect()` (they throw automatically in 2.0+)
✗ Don't use shared state on server
✗ Don't use `console.log` in server code
✗ Don't use `$:` reactive statements (Svelte 4 syntax)
✗ Don't use `export let` (Svelte 4 syntax)
✗ Don't access `url.hash` in load (not available on server)
✗ Don't use `url.searchParams` during prerendering

### Svelte 5 Runes

```svelte
<script>
	// State
	let count = $state(0);

	// Derived
	let doubled = $derived(count * 2);

	// Effects
	$effect(() => {
		console.log('Count:', count);
	});

	// Props
	let { name, age = 18 } = $props();

	// Bindable props (two-way binding)
	let { value = $bindable('') } = $props();
</script>
```

---

## 14. Type Safety

### Generated Types

```svelte
<!--- file: +page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data, form } = $props();
</script>
```

```js
/// file: +page.js
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	// ...
}
```

```js
/// file: +page.server.js
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	// ...
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	// ...
};
```

### App Interfaces

```ts
/// file: src/app.d.ts
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}

		interface Locals {
			user?: {
				name: string;
				isAdmin: boolean;
			};
		}

		interface PageData {
			// Merged return types from all load functions
		}

		interface PageState {
			showModal?: boolean;
		}

		interface Platform {
			// Platform-specific (Cloudflare, etc.)
		}
	}
}

export {};
```

---

## 15. Web Standards

SvelteKit uses standard web APIs:

**Fetch APIs:**

- `fetch()` - Enhanced in load functions
- `Request` - Available as `event.request`
- `Response` - Return from endpoints
- `Headers` - `request.headers`, `response.headers`
- `FormData` - From `request.formData()`

**URL APIs:**

- `URL` - `event.url` in load/hooks
- `URLSearchParams` - `url.searchParams`

**Stream APIs:**

- `ReadableStream`
- `WritableStream`
- `TransformStream`

**Web Crypto:**

- `crypto.randomUUID()`
- `crypto.getRandomValues()`

---

## 16. Common Pitfalls

### 1. Shared State on Server

```js
// ❌ DANGEROUS
let user; // Shared across all requests!

// ✓ SAFE
export async function load({ cookies }) {
	return { user: await getUser(cookies) };
}
```

### 2. Side Effects in Load

```js
// ❌ BAD
export async function load() {
	store.set(data); // Side effect
}

// ✓ GOOD
export async function load() {
	return { data }; // Return data
}
```

### 3. Not Using $derived

```svelte
<script>
	let { data } = $props();

	// ❌ Won't update on navigation
	const count = data.items.length;

	// ✓ Reactive
	let count = $derived(data.items.length);
</script>
```

### 4. Forgetting await parent()

```js
// ❌ Waterfall
const parentData = await parent();
const data = await getData();

// ✓ Parallel
const data = await getData();
const parentData = await parent();
```

### 5. Wrong Load Type

```js
// If you need cookies, use .server.js
// If you need non-serializable data, use .js
```

### 6. Preloading Everything

```html
<!-- ❌ Too aggressive -->
<a data-sveltekit-preload-code="eager">
	<!-- ✓ More conservative -->
	<body data-sveltekit-preload-data="hover"></body
></a>
```

### 7. Missing Error Boundaries

```
src/routes/
  +error.svelte  ← Always have this!
  blog/
    +error.svelte  ← Consider this too
```

---

## 17. Best Practices

### Performance

- Use streaming for slow data
- Preload critical routes
- Optimize images with `@sveltejs/enhanced-img`
- Use edge functions where appropriate
- Minimize third-party scripts
- Use HTTP/2

### Security

- Use server load for sensitive operations
- Validate all user input (Zod, Valibot)
- Use CSRF protection (built into form actions)
- Set secure cookie options
- Use CSP headers

### SEO

- Use SSR by default (`ssr = true`)
- Implement proper meta tags
- Use semantic HTML
- Provide alt text
- Use proper heading hierarchy

### Accessibility

- Use semantic HTML
- Provide ARIA labels where needed
- Test with keyboard navigation
- Use `data-sveltekit-keepfocus` sparingly
- Test with screen readers

### Code Organization

- Use `$lib` for shared code
- Keep `$lib/server` for server-only code
- Colocate components with routes when route-specific
- Extract reusable load functions
- Use consistent naming conventions

---

## Quick Reference: When to Use What

| Need                    | Use                                      |
| ----------------------- | ---------------------------------------- |
| Server-only code        | `+page.server.js` or `$lib/server/`      |
| Universal code          | `+page.js`                               |
| Database queries        | `+page.server.js`                        |
| Public API calls        | `+page.js` (or `.server.js` for caching) |
| User authentication     | `hooks.server.js` + `locals`             |
| Form submission         | Form actions in `+page.server.js`        |
| API endpoint            | `+server.js`                             |
| Shared layout           | `+layout.svelte`                         |
| Error handling          | `+error.svelte`                          |
| Route groups            | `(group)` folders                        |
| Dynamic routes          | `[param]` folders                        |
| Client-side navigation  | `<a>` tags (automatic)                   |
| Programmatic navigation | `goto()` from `$app/navigation`          |
| Page state              | `page` from `$app/state`                 |
| Reactivity              | `$state`, `$derived`, `$effect`          |
| Props                   | `let { prop } = $props()`                |

---

## 26. Migration Guide (v1 to v2)

### Overview

Upgrade to the latest 1.x version first to see deprecation warnings. Then upgrade to Svelte 4 before moving to SvelteKit 2.

```bash
npx sv migrate sveltekit-2  # Auto-migrates many changes
```

### Breaking Changes

#### 1. error() and redirect() No Longer Thrown

**Before (v1):**
```js
import { error, redirect } from '@sveltejs/kit';

throw error(500, 'something went wrong');
throw redirect(303, '/login');
```

**After (v2):**
```js
import { error, redirect } from '@sveltejs/kit';

error(500, 'something went wrong');  // Just call, don't throw
redirect(303, '/login');
```

**Distinguishing from unexpected errors:**

```js
import { isHttpError, isRedirect } from '@sveltejs/kit';

try {
	// Some code
} catch (e) {
	if (isHttpError(e)) {
		// Expected error
	} else if (isRedirect(e)) {
		// Redirect
	} else {
		// Unexpected error
	}
}
```

#### 2. path Required for Cookies

**Before (v1):**
```js
export function load({ cookies }) {
	cookies.set(name, value);
}
```

**After (v2):**
```js
export function load({ cookies }) {
	cookies.set(name, value, { path: '/' });  // path required
	cookies.delete(name, { path: '/' });
	cookies.serialize(name, value, { path: '/' });
}
```

**Common paths:**
- `{ path: '/' }` - Entire domain (most common)
- `{ path: '' }` - Current path
- `{ path: '.' }` - Current directory
- `{ path: '/admin' }` - Specific path

#### 3. Top-level Promises No Longer Awaited

**Before (v1):**
```js
export function load({ fetch }) {
	// Top-level promises auto-awaited
	const a = fetch(url1).then(r => r.json());
	const b = fetch(url2).then(r => r.json());
	return { a, b };
}
```

**After (v2):**
```js
// Single promise
export async function load({ fetch }) {
	const response = await fetch(url).then(r => r.json());
	return { response };
}

// Multiple promises
export async function load({ fetch }) {
	const [a, b] = await Promise.all([
		fetch(url1).then(r => r.json()),
		fetch(url2).then(r => r.json())
	]);
	return { a, b };
}
```

#### 4. goto() Changes

**No longer accepts external URLs:**

```js
// ❌ Before
goto('https://example.com');

// ✓ After
window.location.href = 'https://example.com';
```

**state parameter changed:**

```js
goto('/path', {
	state: { modal: true }  // Sets $page.state (must match App.PageState)
});
```

#### 5. Paths Are Relative by Default

In v2, `paths.relative` defaults to `true`.

**Impact:**
- `base` and `assets` from `$app/paths` are now relative by default
- `%sveltekit.assets%` in `app.html` is relative
- Set `paths.relative: false` for absolute paths

```js
/// file: svelte.config.js
export default {
	kit: {
		paths: {
			relative: false  // Use absolute paths
		}
	}
};
```

#### 6. Server Fetch Tracking Removed

`dangerZone.trackServerFetches` is removed (security risk).

**If you were using it:**
```js
// ❌ Before
export default {
	kit: {
		dangerZone: {
			trackServerFetches: true
		}
	}
};

// ✓ After - explicitly track with depends()
export async function load({ fetch, depends }) {
	depends('app:user-data');
	const res = await fetch('/api/user');
	return await res.json();
}
```

#### 7. preloadCode Arguments Must Be Prefixed with base

```js
import { preloadCode } from '$app/navigation';
import { base } from '$app/paths';

// ❌ Before
preloadCode('/about', '/contact');

// ✓ After
preloadCode(`${base}/about`);  // Single argument, with base prefix
```

#### 8. resolvePath Replaced with resolveRoute

```js
// ❌ Before
import { resolvePath } from '@sveltejs/kit';
import { base } from '$app/paths';

const path = base + resolvePath('/blog/[slug]', { slug });

// ✓ After
import { resolveRoute } from '$app/paths';

const path = resolveRoute('/blog/[slug]', { slug });
```

#### 9. Improved Error Handling

`handleError` now receives `status` and `message`:

```js
/// file: src/hooks.server.js
export async function handleError({ error, event, status, message }) {
	// status: 500 for unhandled errors, 404 for missing routes
	// message: Safe message (not error.message which may contain secrets)

	return {
		message: 'Something went wrong',
		code: error?.code
	};
}
```

#### 10. Dynamic Environment Variables During Prerendering

**No longer works:**

```js
export const prerender = true;

export async function load() {
	const { env } = await import('$env/dynamic/private');  // ❌ ERROR
	return { value: env.SOME_VALUE };
}
```

**Solution - use static:**

```js
export const prerender = true;

export async function load() {
	const { SOME_VALUE } = await import('$env/static/private');
	return { value: SOME_VALUE };
}
```

#### 11. use:enhance Callback Changes

```js
// ❌ Before
use:enhance={({ form, data }) => {
	// ...
}}

// ✓ After
use:enhance={({ formElement, formData }) => {
	// ...
}}
```

#### 12. File Input Forms Must Use multipart/form-data

```html
<!-- ❌ Before (worked but shouldn't have) -->
<form use:enhance>
	<input type="file" name="avatar" />
</form>

<!-- ✓ After (required) -->
<form use:enhance enctype="multipart/form-data">
	<input type="file" name="avatar" />
</form>
```

#### 13. tsconfig.json Stricter

**Must not use `paths` or `baseUrl`:**

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"$lib": ["src/lib"]
		}
	}
}
```

**Use `alias` in svelte.config.js instead:**

```js
export default {
	kit: {
		alias: {
			$lib: 'src/lib'
		}
	}
};
```

#### 14. vitePreprocess Import Changed

```js
// ❌ Before
import { vitePreprocess } from '@sveltejs/kit/vite';

// ✓ After
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
```

### Dependency Requirements

**Update package.json:**

```json
{
	"devDependencies": {
		"@sveltejs/adapter-auto": "^3.0.0",
		"@sveltejs/kit": "^2.0.0",
		"@sveltejs/vite-plugin-svelte": "^3.0.0",
		"svelte": "^4.0.0",
		"vite": "^5.0.0",
		"typescript": "^5.0.0"
	}
}
```

**Specific adapters:**
- `@sveltejs/adapter-cloudflare@3`
- `@sveltejs/adapter-cloudflare-workers@2`
- `@sveltejs/adapter-netlify@3`
- `@sveltejs/adapter-node@2`
- `@sveltejs/adapter-static@3`
- `@sveltejs/adapter-vercel@4`

### TypeScript Changes

**Generated tsconfig.json now uses:**

```json
{
	"compilerOptions": {
		"moduleResolution": "bundler",
		"verbatimModuleSyntax": true
	}
}
```

**Remove deprecated flags:**
```json
{
	"compilerOptions": {
		"importsNotUsedAsValues": "...",  // Remove
		"preserveValueImports": true      // Remove
	}
}
```

### SvelteKit 2.12+ Changes

#### $app/stores Deprecated

**Migrating from stores to state:**

```svelte
<!-- ❌ Before -->
<script>
	import { page } from '$app/stores';
</script>

{$page.data}

<!-- ✓ After -->
<script>
	import { page } from '$app/state';
</script>

{page.data}
```

**Use migration tool:**

```bash
npx sv migrate app-state  # Auto-migrates .svelte components
```

**Benefits of $app/state:**
- Fine-grained reactivity (`page.state` changes don't invalidate `page.data`)
- Use anywhere (not just components)
- More flexible than stores

### Migration Checklist

- ✓ Update to latest SvelteKit 1.x
- ✓ Update to Svelte 4
- ✓ Run `npx sv migrate sveltekit-2`
- ✓ Remove `throw` from `error()` and `redirect()` calls
- ✓ Add `path` to all `cookies.set()`, `.delete()`, `.serialize()`
- ✓ Add `await` to top-level promises in load functions
- ✓ Replace `goto()` for external URLs with `window.location.href`
- ✓ Update `preloadCode()` calls to include `base` and use single argument
- ✓ Replace `resolvePath()` with `resolveRoute()`
- ✓ Update `handleError` to use new parameters
- ✓ Replace dynamic env imports in prerendered pages with static
- ✓ Update `use:enhance` callbacks (`form` → `formElement`, `data` → `formData`)
- ✓ Add `enctype="multipart/form-data"` to file upload forms
- ✓ Move `paths`/`baseUrl` from tsconfig.json to `alias` in svelte.config.js
- ✓ Change `vitePreprocess` import
- ✓ Update all adapter versions
- ✓ Update Node.js to 18.13+
- ✓ Update TypeScript to 5.0+
- ✓ Update Vite to 5.0+
- ✓ Remove deprecated tsconfig flags
- ✓ Migrate from `$app/stores` to `$app/state`

---

**This document is comprehensive. Use it as your authoritative source for all SvelteKit development.**
