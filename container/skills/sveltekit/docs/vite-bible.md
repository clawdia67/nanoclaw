# VITE BUILD TOOL BIBLE

> Comprehensive knowledge document for AI agents implementing Vite-powered projects

**📊 Document Stats:**
- **Framework Version:** Vite 7.x (latest major version)
- **Vite 6 Environment API:** Complete coverage
- **Node.js Required:** 20.19+ / 22.12+
- **Browser Support (Dev):** Baseline Newly Available (2025-05-01)
- **Browser Support (Prod):** Chrome >=107, Edge >=107, Firefox >=104, Safari >=16
- **Coverage:** ~95% of official Vite documentation
- **Document Size:** 6,741 lines | ~41,570 tokens
- **Last Updated:** 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts & Philosophy](#core-concepts--philosophy)
3. [Why Vite?](#why-vite)
4. [Getting Started](#getting-started)
5. [Features](#features)
6. [Configuration Reference](#configuration-reference)
7. [CLI Commands](#cli-commands)
8. [Static Asset Handling](#static-asset-handling)
9. [CSS & Styling](#css--styling)
10. [TypeScript](#typescript)
11. [Environment Variables](#environment-variables)
12. [Dependency Pre-Bundling](#dependency-pre-bundling)
13. [Build & Production](#build--production)
14. [Plugin System](#plugin-system)
15. [JavaScript API](#javascript-api)
16. [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
17. [Hot Module Replacement (HMR)](#hot-module-replacement-hmr)
18. [Backend Integration](#backend-integration)
19. [Performance Optimization](#performance-optimization)
20. [Deployment](#deployment)
21. [Rolldown Integration](#rolldown-integration)
22. [Environment API (Vite 6+)](#environment-api-vite-6)
23. [Breaking Changes and Future Deprecations](#breaking-changes-and-future-deprecations)
24. [Migration Guide](#migration-guide)
25. [Troubleshooting](#troubleshooting)
26. [Best Practices](#best-practices)
27. [Common Patterns](#common-patterns)
28. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Introduction

**Vite** (French for "quick", pronounced `/vit/`) is a next-generation frontend build tool that provides:

### What is Vite?

1. **Dev Server** - A development server with rich feature enhancements over native ES modules, featuring extremely fast Hot Module Replacement (HMR)
2. **Build Command** - A build command that bundles your code with Rollup (or Rolldown), pre-configured to output highly optimized static assets for production

### Key Characteristics

- **Lightning Fast** - 10-100x faster cold starts than traditional bundlers
- **Instant HMR** - Consistently fast regardless of app size
- **Native ESM** - Leverages native ES modules in the browser
- **Rich Features** - TypeScript, JSX, CSS preprocessors out of the box
- **Universal Plugin Interface** - Rollup-superset plugin interface shared between dev and build
- **Optimized Build** - Pre-configured Rollup build with multi-page and library mode support

---

## Core Concepts & Philosophy

### Philosophy

Vite follows three core principles:

#### 1. Lean Extendable Core

- Supports the most common patterns for building web apps out-of-the-box
- Features that can be implemented as external plugins won't be added to the Vite core
- Maintains a small API surface for long-term maintainability

#### 2. Pushing the Modern Web

- **ESM-First**: Source code must be written in ES modules format
- **No Legacy Support**: Non-ESM dependencies need to be pre-bundled to ESM
- **Modern Syntax**: Web workers must use `new Worker` syntax
- **Browser-Only**: Node.js modules cannot be used in the browser

#### 3. Pragmatic Performance

- Uses **native tools** (esbuild, SWC, Rolldown) for intensive tasks to achieve best performance
- Keeps the rest of the code in JavaScript for flexibility and maintainability
- Evolves with ecosystem by adopting new libraries while maintaining stable API

### Architecture

**Development Mode:**
```
Source Files → Vite Dev Server → Native ESM → Browser
                    ↓
              Pre-bundled Dependencies (esbuild)
```

**Production Build:**
```
Source Files → Rollup/Rolldown → Optimized Bundle → Static Files
```

---

## Why Vite?

### Problems with Traditional Bundlers

#### 1. Slow Server Start

**Problem:**
- Traditional bundlers (Webpack, Parcel) must crawl and build entire application before serving
- Large applications take minutes to spin up dev server

**Vite's Solution:**
- Divides modules into two categories:
  - **Dependencies** - Pre-bundled with esbuild (10-100x faster than JavaScript bundlers)
  - **Source Code** - Served over native ESM, transformed on-demand
- Only processes code that's actually needed for current page

**Performance Comparison:**
```
Traditional Bundler: 30-60 seconds
Vite: 200-500 milliseconds
```

#### 2. Slow Updates

**Problem:**
- Traditional HMR rebuilds entire module graph
- Update speed degrades linearly with app size

**Vite's Solution:**
- HMR over native ESM
- Only invalidates the chain between edited module and closest HMR boundary
- Leverages HTTP headers for speed:
  - **Dependencies**: `Cache-Control: max-age=31536000,immutable`
  - **Source Code**: `304 Not Modified`

**Update Speed:**
```
Traditional Bundler: 1-10 seconds
Vite: 10-50 milliseconds
```

#### 3. Why Bundle for Production?

Despite native ESM support in browsers, shipping unbundled ESM is inefficient:

- **Network Round Trips** - Nested imports cause excessive requests
- **No Tree Shaking** - Dead code cannot be eliminated
- **No Code Splitting** - All code loaded upfront

**Vite's Approach:**
- Pre-configured Rollup build with:
  - Tree-shaking
  - Lazy-loading
  - Common chunk splitting
  - CSS code splitting

---

## Getting Started

### Installation

**With Package Manager:**
```bash
# npm
npm create vite@latest my-app

# yarn
yarn create vite my-app

# pnpm
pnpm create vite my-app

# bun
bun create vite my-app
```

**Manual Setup:**
```bash
npm install -D vite
```

**package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Project Structure

```
my-app/
├── index.html           # Entry point (front and center!)
├── package.json
├── vite.config.js       # Optional config file
├── public/              # Static assets (copied as-is)
│   └── favicon.ico
└── src/
    ├── main.js          # App entry
    ├── App.vue
    └── components/
```

### index.html as Entry Point

Unlike traditional bundlers, Vite treats `index.html` as source code:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- Module script - entry point -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**Key Features:**
- URLs are automatically rebased
- `<script type="module" src>` handled specially
- `<link href>` resolved relative to HTML file
- Multi-page apps supported via multiple `.html` files

---

## Features

### 1. NPM Dependency Resolving and Pre-Bundling

**Bare Module Imports:**
```js
import { createApp } from 'vue' // Bare import - resolved from node_modules
```

**Pre-Bundling Benefits:**
1. **CommonJS/UMD Compatibility** - Converts to ESM
2. **Performance** - Combines many internal modules into single module
3. **Caching** - Strongly cached via HTTP headers

**Pre-Bundling Process:**
```
Scan Entry Points → Detect Dependencies → Pre-bundle with esbuild → Cache in node_modules/.vite
```

**Cache Invalidation:**
- Changes to `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- Changes to patches in `package.json`
- Changes to Vite config files
- Changes to `NODE_ENV` value

**Force Re-Bundling:**
```bash
vite --force
```

### 2. Hot Module Replacement (HMR)

**Native ESM-Based HMR:**
- Instant updates without full page reload
- Preserves application state
- Precision updates - only affected modules reload

**HMR API:**
```js
if (import.meta.hot) {
  // Accept updates to this module
  import.meta.hot.accept((newModule) => {
    // Handle the update
    updateApp(newModule)
  })

  // Accept updates from a dependency
  import.meta.hot.accept('./dep.js', (newDep) => {
    // Handle dependency update
  })

  // Cleanup before update
  import.meta.hot.dispose((data) => {
    // Store state
    data.state = getCurrentState()
  })

  // Custom events
  import.meta.hot.on('my-event', (data) => {
    console.log('Received:', data)
  })

  // Invalidate module (force full reload)
  import.meta.hot.invalidate()
}
```

**Framework Integration:**
- **Vue SFC** - Official `@vitejs/plugin-vue` provides HMR out of the box
- **React** - `@vitejs/plugin-react` with React Fast Refresh
- **Preact** - `@preact/preset-vite` with Prefresh
- **Svelte** - `vite-plugin-svelte`
- **Solid** - `vite-plugin-solid`

### 3. TypeScript Support

**Out-of-the-Box Support:**
```js
import MyComponent from './MyComponent.vue'
import type { ComponentProps } from './types'
import tsWorker from './worker?worker'
```

**Transpile Only:**
- Vite only performs transpilation, **not type checking**
- Uses esbuild (20-30x faster than `tsc`)
- Type errors won't stop dev server or build

**Type Checking:**
```bash
# In development
tsc --noEmit --watch

# In build
tsc --noEmit && vite build
```

**tsconfig.json Requirements:**
```json
{
  "compilerOptions": {
    // REQUIRED
    "isolatedModules": true,

    // RECOMMENDED
    "useDefineForClassFields": true,

    // For client code
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "target": "ES2020",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "skipLibCheck": true,

    // For strictness
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Client Types:**
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Add more env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 4. HTML Processing

**URL Resolution:**
```html
<!-- All URLs are automatically resolved -->
<link rel="stylesheet" href="./src/style.css" />
<img src="./src/image.png" />
<script type="module" src="./src/main.js"></script>
```

**Supported Elements:**
```html
<audio src="...">
<embed src="...">
<img src="...">
<image src="...">
<input src="...">
<link href="...">
<object data="...">
<script src="...">
<source src="..." srcset="...">
<track src="...">
<use href="..." xlink:href="...">
<video src="..." poster="...">
<meta content="...">
```

**Multi-Page Apps:**
```
├── index.html
├── about.html
└── contact.html
```

```bash
vite build  # Automatically detects all .html files
```

### 5. JSON Import

**Direct Import:**
```js
import data from './data.json'
console.log(data.name)
```

**Named Imports (Tree-Shaking):**
```js
import { name, version } from './package.json'
```

### 6. Glob Import

**Lazy Loading (Default):**
```js
const modules = import.meta.glob('./dir/*.js')
// Produces:
// {
//   './dir/foo.js': () => import('./dir/foo.js'),
//   './dir/bar.js': () => import('./dir/bar.js')
// }

// Use:
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

**Eager Loading:**
```js
const modules = import.meta.glob('./dir/*.js', { eager: true })
// Produces:
// import * as __glob__0_0 from './dir/foo.js'
// import * as __glob__0_1 from './dir/bar.js'
// {
//   './dir/foo.js': __glob__0_0,
//   './dir/bar.js': __glob__0_1
// }
```

**Named Imports:**
```js
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true
})
// Imports only 'setup' export from each module
```

**Custom Queries:**
```js
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true }
})
// Produces: import('./dir/foo.js?foo=bar&bar=true')
```

**Negative Patterns:**
```js
const modules = import.meta.glob([
  './dir/*.js',
  '!**/bar.js'  // Exclude bar.js
])
```

**Base Path:**
```js
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  as: 'url',
  base: './dir'
})
// Keys become relative to base: { 'foo.js': '/dir/foo.js' }
```

### 7. WebAssembly

**Import with Init:**
```js
import wasmInit from './example.wasm?init'

wasmInit().then((instance) => {
  instance.exports.test()
})
```

**Inline:**
```js
import wasmModule from './example.wasm'
// Inlined as base64 string if smaller than assetsInlineLimit
```

### 8. Web Workers

**Constructor Syntax (Recommended):**
```js
const worker = new Worker(
  new URL('./worker.js', import.meta.url),
  { type: 'module' }
)

worker.postMessage({ msg: 'Hello' })
```

**Query Suffix:**
```js
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

**Worker Options:**
- `?worker` - Web Worker
- `?sharedworker` - Shared Worker
- `?worker&inline` - Inline as base64
- `?worker&url` - Import as URL

**Worker with Dependencies:**
```js
// worker.js
import { helper } from './utils'

self.addEventListener('message', (e) => {
  const result = helper(e.data)
  self.postMessage(result)
})
```

---

## Configuration Reference

### Config File

**Supported Formats:**
```js
// vite.config.js (ESM)
export default {
  // config options
}

// vite.config.ts (TypeScript)
import { defineConfig } from 'vite'
export default defineConfig({
  // config options
})

// vite.config.mjs, vite.config.cjs also supported
```

**Conditional Config:**
```js
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // dev specific config
    }
  } else {
    return {
      // build specific config
    }
  }
})
```

**Async Config:**
```js
export default defineConfig(async ({ command, mode }) => {
  const data = await fetchData()
  return {
    // config using data
  }
})
```

**Environment Variables in Config:**
```js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // Use env variables
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    }
  }
})
```

### Shared Options

#### root
- **Type:** `string`
- **Default:** `process.cwd()`
- **Description:** Project root directory

```js
export default defineConfig({
  root: './src'
})
```

#### base
- **Type:** `string`
- **Default:** `/`
- **Description:** Public base path

```js
// Absolute URL
base: 'https://cdn.example.com/'

// Root-relative path
base: '/my-app/'

// Relative path (auto-determined)
base: './'
```

#### mode
- **Type:** `string`
- **Default:** `'development'` for serve, `'production'` for build

#### define
- **Type:** `Record<string, any>`
- **Description:** Define global constant replacements

```js
define: {
  __APP_VERSION__: JSON.stringify('1.0.0'),
  __DEV__: true,
  'import.meta.env.CUSTOM': JSON.stringify('custom value')
}
```

#### plugins
- **Type:** `(Plugin | Plugin[] | Promise<Plugin | Plugin[]>)[]`

```js
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

plugins: [vue(), react()]
```

#### publicDir
- **Type:** `string | false`
- **Default:** `"public"`
- **Description:** Directory for static assets (copied as-is to outDir)

#### cacheDir
- **Type:** `string`
- **Default:** `"node_modules/.vite"`
- **Description:** Directory to cache files

#### resolve.alias
- **Type:** `Record<string, string> | Array<{ find: string | RegExp, replacement: string }>`

```js
resolve: {
  alias: {
    '@': '/src',
    '~': '/src',
    'components': '/src/components'
  }
}

// Or with regex
resolve: {
  alias: [
    { find: /^~/, replacement: '/src' }
  ]
}
```

#### resolve.dedupe
- **Type:** `string[]`
- **Description:** Force dedupe listed dependencies

```js
resolve: {
  dedupe: ['vue']  // Use single copy of vue
}
```

#### resolve.conditions
- **Type:** `string[]`
- **Default:** `['module', 'browser', 'development|production']`
- **Description:** Additional allowed conditions for exports field

#### resolve.mainFields
- **Type:** `string[]`
- **Default:** `['browser', 'module', 'jsnext:main', 'jsnext']`
- **Description:** package.json fields to try for entry point

#### resolve.extensions
- **Type:** `string[]`
- **Default:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`
- **Description:** File extensions to try

#### resolve.preserveSymlinks
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Preserve symlinks instead of resolving to real path

#### css.modules
- **Type:** `CSSModulesOptions`

```js
css: {
  modules: {
    scopeBehaviour: 'local',
    globalModulePaths: [/\.global\.css$/],
    generateScopedName: '[name]__[local]___[hash:base64:5]',
    hashPrefix: '',
    localsConvention: 'camelCaseOnly'
  }
}
```

#### css.postcss
- **Type:** `string | PostCSSConfig`

```js
css: {
  postcss: './postcss.config.js'
}

// Inline
css: {
  postcss: {
    plugins: [
      require('autoprefixer'),
      require('postcss-nested')
    ]
  }
}
```

#### css.preprocessorOptions
- **Type:** `Record<string, object>`

```js
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `$injectedColor: orange;`,
      api: 'modern-compiler'  // or 'modern'
    },
    less: {
      math: 'parens-division'
    },
    stylus: {
      define: {
        $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1)
      }
    }
  }
}
```

#### css.devSourcemap
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable sourcemaps during dev

#### css.transformer
- **Type:** `'postcss' | 'lightningcss'`
- **Default:** `'postcss'`

```js
css: {
  transformer: 'lightningcss'
}
```

#### css.lightningcss
- **Type:** `LightningCSSOptions`

```js
css: {
  transformer: 'lightningcss',
  lightningcss: {
    targets: {
      chrome: 107,
      safari: 16
    },
    cssModules: {
      pattern: '[name]__[local]--[hash]'
    }
  }
}
```

#### json.namedExports
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Support named imports from JSON

#### json.stringify
- **Type:** `boolean | 'auto'`
- **Default:** `'auto'`
- **Description:** Import large JSON as string

#### esbuild
- **Type:** `ESBuildOptions | false`

```js
esbuild: {
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
  jsxInject: `import React from 'react'`,
  loader: 'tsx',
  include: /\.[jt]sx?$/,
  exclude: /node_modules/
}
```

#### assetsInclude
- **Type:** `string | RegExp | (string | RegExp)[]`

```js
assetsInclude: ['**/*.gltf', '**/*.glb']
```

#### logLevel
- **Type:** `'info' | 'warn' | 'error' | 'silent'`
- **Default:** `'info'`

#### clearScreen
- **Type:** `boolean`
- **Default:** `true`

#### envDir
- **Type:** `string`
- **Default:** `root`
- **Description:** Directory to load .env files

#### envPrefix
- **Type:** `string | string[]`
- **Default:** `'VITE_'`

```js
envPrefix: ['VITE_', 'APP_']
```

#### appType
- **Type:** `'spa' | 'mpa' | 'custom'`
- **Default:** `'spa'`

### Server Options

#### server.host
- **Type:** `string | boolean`
- **Default:** `'localhost'`

```js
server: {
  host: true  // Listen on all addresses (0.0.0.0)
}
```

#### server.allowedHosts
- **Type:** `string[] | true`
- **Default:** `[]`
- **Description:** Security feature to limit allowed hostnames

```js
server: {
  allowedHosts: ['example.com', 'api.example.com']
}
```

#### server.port
- **Type:** `number`
- **Default:** `5173`

#### server.strictPort
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Exit if port is already in use

#### server.https
- **Type:** `https.ServerOptions`

```js
import fs from 'fs'

server: {
  https: {
    key: fs.readFileSync('path/to/key.pem'),
    cert: fs.readFileSync('path/to/cert.pem')
  }
}
```

#### server.open
- **Type:** `boolean | string`
- **Description:** Auto-open browser on server start

```js
server: {
  open: '/docs/index.html'
}
```

#### server.proxy
- **Type:** `Record<string, string | ProxyOptions>`

```js
server: {
  proxy: {
    // String shorthand
    '/api': 'http://localhost:4000',

    // With options
    '/api': {
      target: 'http://jsonplaceholder.typicode.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    },

    // Proxy websockets
    '/socket.io': {
      target: 'ws://localhost:4000',
      ws: true
    },

    // Regex
    '^/fallback/.*': {
      target: 'http://jsonplaceholder.typicode.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/fallback/, '')
    }
  }
}
```

#### server.cors
- **Type:** `boolean | CorsOptions`
- **Default:** Allows localhost

```js
server: {
  cors: {
    origin: ['http://localhost:3000', 'https://example.com'],
    credentials: true
  }
}
```

#### server.headers
- **Type:** `OutgoingHttpHeaders`

```js
server: {
  headers: {
    'X-Custom-Header': 'value'
  }
}
```

#### server.hmr
- **Type:** `boolean | HMROptions`

```js
server: {
  hmr: {
    protocol: 'ws',
    host: 'localhost',
    port: 5173,
    clientPort: 443,
    overlay: true
  }
}
```

#### server.watch
- **Type:** `object` (chokidar options)

```js
server: {
  watch: {
    ignored: ['!**/node_modules/your-package-name/**']
  }
}
```

#### server.middlewareMode
- **Type:** `boolean | 'ssr' | 'html'`
- **Default:** `false`

```js
server: {
  middlewareMode: true  // For custom server integration
}
```

#### server.fs.strict
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Restrict serving files outside workspace root

#### server.fs.allow
- **Type:** `string[]`

```js
server: {
  fs: {
    allow: ['..', '/path/to/custom/dir']
  }
}
```

#### server.fs.deny
- **Type:** `string[]`
- **Default:** `['.env', '.env.*', '*.{crt,pem}']`

#### server.origin
- **Type:** `string`
- **Description:** Define origin for generated asset URLs

#### server.warmup
- **Type:** `{ clientFiles?: string[], ssrFiles?: string[] }`

```js
server: {
  warmup: {
    clientFiles: ['./src/components/heavy.vue'],
    ssrFiles: ['./src/server/utils.js']
  }
}
```

### Build Options

#### build.target
- **Type:** `string | string[]`
- **Default:** `'baseline-widely-available'`

```js
// Single target
build: {
  target: 'es2020'
}

// Multiple targets
build: {
  target: ['chrome90', 'firefox88', 'safari15']
}

// Baseline targets
build: {
  target: 'baseline-widely-available'  // Chrome 107+, Edge 107+, Firefox 104+, Safari 16+
}
```

#### build.modulePreload
- **Type:** `boolean | { polyfill?: boolean, resolveDependencies?: Function }`
- **Default:** `{ polyfill: true }`

```js
build: {
  modulePreload: {
    polyfill: true,
    resolveDependencies: (filename, deps, { hostId, hostType }) => {
      return deps.filter(dep => condition)
    }
  }
}
```

#### build.outDir
- **Type:** `string`
- **Default:** `'dist'`

#### build.assetsDir
- **Type:** `string`
- **Default:** `'assets'`

#### build.assetsInlineLimit
- **Type:** `number | ((filePath: string, content: Buffer) => boolean)`
- **Default:** `4096` (4 KiB)

```js
build: {
  assetsInlineLimit: 8192  // 8 KiB
}

// Function form
build: {
  assetsInlineLimit: (filePath, content) => {
    return filePath.endsWith('.svg') && content.length < 1024
  }
}
```

#### build.cssCodeSplit
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Enable CSS code splitting

#### build.cssTarget
- **Type:** `string | string[]`
- **Default:** Same as `build.target`

#### build.cssMinify
- **Type:** `boolean | 'esbuild' | 'lightningcss'`
- **Default:** Same as `build.minify`

#### build.sourcemap
- **Type:** `boolean | 'inline' | 'hidden'`
- **Default:** `false`

```js
build: {
  sourcemap: true  // External .map files
  // or 'inline' - Inline as data URI
  // or 'hidden' - Generate but don't reference in files
}
```

#### build.rollupOptions
- **Type:** `RollupOptions`

```js
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      nested: resolve(__dirname, 'nested/index.html')
    },
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router']
      },
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash].[ext]'
    },
    external: ['vue'],
    plugins: []
  }
}
```

#### build.commonjsOptions
- **Type:** `RollupCommonJSOptions`

```js
build: {
  commonjsOptions: {
    include: [/node_modules/],
    exclude: [],
    transformMixedEsModules: true,
    strictRequires: false
  }
}
```

#### build.dynamicImportVarsOptions
- **Type:** `{ include?: string[], exclude?: string[], warnOnError?: boolean }`

```js
build: {
  dynamicImportVarsOptions: {
    include: ['src/**/*.js'],
    exclude: ['node_modules/**']
  }
}
```

#### build.lib
- **Type:** `LibraryOptions`

```js
import { resolve } from 'path'

build: {
  lib: {
    entry: resolve(__dirname, 'lib/main.js'),
    name: 'MyLib',
    formats: ['es', 'cjs', 'umd', 'iife'],
    fileName: (format) => `my-lib.${format}.js`,
    cssFileName: 'style'
  },
  rollupOptions: {
    external: ['vue', 'react'],
    output: {
      globals: {
        vue: 'Vue',
        react: 'React'
      }
    }
  }
}
```

#### build.license
- **Type:** `boolean | { fileName?: string }`
- **Default:** `false`

```js
build: {
  license: {
    fileName: 'LICENSES.txt'
  }
}
```

#### build.manifest
- **Type:** `boolean | string`
- **Default:** `false`

```js
build: {
  manifest: true  // Creates .vite/manifest.json
}
```

#### build.ssrManifest
- **Type:** `boolean | string`
- **Default:** `false`

```js
build: {
  ssrManifest: true  // Creates .vite/ssr-manifest.json
}
```

#### build.ssr
- **Type:** `boolean | string`
- **Default:** `false`

```js
build: {
  ssr: 'src/entry-server.js'
}
```

#### build.ssrEmitAssets
- **Type:** `boolean`
- **Default:** `false`

#### build.minify
- **Type:** `boolean | 'terser' | 'esbuild'`
- **Default:** `'esbuild'` for client, `false` for SSR

#### build.terserOptions
- **Type:** `TerserOptions`

```js
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true
    }
  }
}
```

#### build.write
- **Type:** `boolean`
- **Default:** `true`

#### build.emptyOutDir
- **Type:** `boolean`
- **Default:** `true` if outDir is inside root

#### build.copyPublicDir
- **Type:** `boolean`
- **Default:** `true`

#### build.reportCompressedSize
- **Type:** `boolean`
- **Default:** `true`

#### build.chunkSizeWarningLimit
- **Type:** `number`
- **Default:** `500` (KiB)

#### build.watch
- **Type:** `WatcherOptions | null`

```js
build: {
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
}
```

### Preview Options

#### preview.host
- **Type:** `string | boolean`
- **Default:** `server.host`

#### preview.port
- **Type:** `number`
- **Default:** `4173`

#### preview.strictPort
- **Type:** `boolean`
- **Default:** `server.strictPort`

#### preview.https
- **Type:** `https.ServerOptions`

#### preview.open
- **Type:** `boolean | string`

#### preview.proxy
- **Type:** `Record<string, string | ProxyOptions>`

#### preview.cors
- **Type:** `boolean | CorsOptions`

#### preview.headers
- **Type:** `OutgoingHttpHeaders`

### Dependency Optimization Options

#### optimizeDeps.entries
- **Type:** `string | string[]`

```js
optimizeDeps: {
  entries: ['./src/**/*.vue', './src/**/*.tsx']
}
```

#### optimizeDeps.include
- **Type:** `string[]`

```js
optimizeDeps: {
  include: ['lodash-es', 'vue', 'pinia']
}
```

#### optimizeDeps.exclude
- **Type:** `string[]`

```js
optimizeDeps: {
  exclude: ['@my-company/private-package']
}
```

#### optimizeDeps.esbuildOptions
- **Type:** `EsbuildBuildOptions`

```js
optimizeDeps: {
  esbuildOptions: {
    define: {
      global: 'globalThis'
    },
    plugins: [
      // Custom esbuild plugin
    ]
  }
}
```

#### optimizeDeps.force
- **Type:** `boolean`
- **Description:** Force re-optimize dependencies

#### optimizeDeps.disabled
- **Type:** `boolean | 'build' | 'dev'`
- **Default:** `'build'`

#### optimizeDeps.needsInterop
- **Type:** `string[]`

```js
optimizeDeps: {
  needsInterop: ['problematic-dep']
}
```

### SSR Options

#### ssr.external
- **Type:** `string[]`

```js
ssr: {
  external: ['some-package']
}
```

#### ssr.noExternal
- **Type:** `string | RegExp | (string | RegExp)[] | true`

```js
ssr: {
  noExternal: ['vue', 'vuex']
}
```

#### ssr.target
- **Type:** `'node' | 'webworker'`
- **Default:** `'node'`

#### ssr.resolve.conditions
- **Type:** `string[]`

```js
ssr: {
  resolve: {
    conditions: ['node', 'production']
  }
}
```

#### ssr.resolve.externalConditions
- **Type:** `string[]`

```js
ssr: {
  resolve: {
    externalConditions: ['node']
  }
}
```

### Worker Options

#### worker.format
- **Type:** `'es' | 'iife'`
- **Default:** `'iife'`

#### worker.plugins
- **Type:** `() => (Plugin | Plugin[])[]`

```js
worker: {
  plugins: () => [
    vue()
  ]
}
```

#### worker.rollupOptions
- **Type:** `RollupOptions`

```js
worker: {
  rollupOptions: {
    output: {
      format: 'es'
    }
  }
}
```

---

## CLI Commands

### `vite`
Start dev server (alias: `vite dev`, `vite serve`)

**Usage:**
```bash
vite [root]
```

**Options:**
- `--host [host]` - Specify hostname (default: localhost)
- `--port <port>` - Specify port (default: 5173)
- `--open [path]` - Open browser on startup
- `--cors` - Enable CORS
- `--strictPort` - Exit if port is already in use
- `--force` - Force optimizer to re-bundle dependencies
- `-c, --config <file>` - Use specified config file
- `--base <path>` - Public base path (default: /)
- `-l, --logLevel <level>` - info | warn | error | silent
- `--clearScreen` - Allow/disable clear screen when logging
- `--configLoader <loader>` - bundle | runner | native
- `--profile` - Start built-in Node.js inspector
- `-m, --mode <mode>` - Set env mode

**Examples:**
```bash
vite
vite --port 3000
vite --host 0.0.0.0
vite --open
vite --force
vite --mode staging
```

### `vite build`
Build for production

**Usage:**
```bash
vite build [root]
```

**Options:**
- `--target <target>` - Transpile target (default: "modules")
- `--outDir <dir>` - Output directory (default: dist)
- `--assetsDir <dir>` - Assets directory under outDir (default: "assets")
- `--assetsInlineLimit <number>` - Static asset base64 inline threshold in bytes (default: 4096)
- `--ssr [entry]` - Build specified entry for server-side rendering
- `--sourcemap [output]` - Output source maps for build (default: false)
- `--minify [minifier]` - Enable/disable minification, or specify minifier to use (default: "esbuild")
- `--manifest [name]` - Emit build manifest json
- `--ssrManifest [name]` - Emit SSR manifest json
- `-w, --watch` - Rebuilds when modules have changed on disk

**Examples:**
```bash
vite build
vite build --outDir public
vite build --sourcemap
vite build --minify terser
vite build --ssr src/entry-server.js
vite build --watch
```

### `vite preview`
Locally preview production build

**Usage:**
```bash
vite preview [root]
```

**Options:**
- `--host [host]` - Specify hostname
- `--port <port>` - Specify port (default: 4173)
- `--strictPort` - Exit if specified port is already in use
- `--open [path]` - Open browser on startup
- `--outDir <dir>` - Output directory (default: dist)

**Examples:**
```bash
vite preview
vite preview --port 8080
vite preview --open
```

### `vite optimize`
Pre-bundle dependencies

**Usage:**
```bash
vite optimize [root]
```

**Options:**
- `--force` - Force optimizer to re-bundle dependencies

---

## Static Asset Handling

### Importing Assets

**Import Returns URL:**
```js
import imgUrl from './img.png'
// imgUrl will be '/img.2d8efhg.png' in production

<img src={imgUrl} alt="image" />
```

**TypeScript:**
```ts
/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string
  export default content
}
```

### Special Queries

#### `?url` - Explicit URL Import
```js
import assetUrl from './asset.js?url'
// Force import as URL even for JavaScript
```

#### `?raw` - Import as String
```js
import shaderCode from './shader.glsl?raw'
console.log(shaderCode) // Shader source code as string
```

#### `?inline` - Force Inline
```js
import inlineSvg from './icon.svg?inline'
// Inlined as base64 regardless of size
```

#### `?worker` / `?sharedworker` - Web Workers
```js
import Worker from './worker?worker'
const worker = new Worker()
```

### Public Directory

**Structure:**
```
public/
├── favicon.ico
├── robots.txt
└── images/
    └── logo.png
```

**Usage:**
```html
<!-- Always referenced with absolute path -->
<img src="/images/logo.png" />
```

**Important:**
- Assets in `public` are served at root path `/`
- Not transformed or bundled
- Must be referenced with absolute path
- Copied as-is to dist root

**When to Use:**
- Referenced by absolute URLs (robots.txt, manifest.json)
- Must keep exact filename
- Thousands of images (dynamic reference)
- Some library requires specific file structure

**When NOT to Use:**
- Referenced from source code → Use `src/assets/`
- Need transformation → Use `src/assets/`
- Need versioning/hashing → Use `src/assets/`

### `new URL(url, import.meta.url)`

**Dynamic Asset URLs:**
```js
function getImageUrl(name) {
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

**TypeScript:**
```ts
const imageUrl = new URL('./image.png', import.meta.url).href
```

**During Production:**
- Vite performs static analysis
- Resolves URLs to versioned paths

**Limitations:**
- `import.meta.url` must be exact string
- Cannot use variables in `new URL()` path

---

## CSS & Styling

### Basic CSS Import

**Direct Import:**
```js
import './style.css'
```

**Side Effects:**
- Creates `<style>` tag in page
- Supports HMR
- CSS is extracted to separate file in production

### CSS Modules

**File Naming:**
- `*.module.css`
- `*.module.scss`
- `*.module.less`
- `*.module.styl`

**Usage:**
```js
import styles from './component.module.css'

<div className={styles.container}>
  <h1 className={styles.title}>Hello</h1>
</div>
```

**Configuration:**
```js
css: {
  modules: {
    scopeBehaviour: 'local', // or 'global'
    globalModulePaths: [/\.global\.css$/],

    // Custom class name pattern
    generateScopedName: '[name]__[local]___[hash:base64:5]',

    // Or function
    generateScopedName: (name, filename, css) => {
      return `${name}_${hash(filename)}`
    },

    // Hash prefix for generated classes
    hashPrefix: '',

    // Class naming style
    localsConvention: 'camelCase'
    // 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly'
  }
}
```

**TypeScript:**
```ts
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}
```

### CSS Pre-processors

**Supported:**
- `.scss` and `.sass` (Sass/SCSS)
- `.less` (Less)
- `.styl` and `.stylus` (Stylus)

**Installation:**
```bash
# Sass
npm install -D sass-embedded  # Recommended
# or
npm install -D sass

# Less
npm install -D less

# Stylus
npm install -D stylus
```

**Usage:**
```js
import './styles.scss'
import './styles.less'
import './styles.styl'
```

**Configuration:**
```js
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `$injectedColor: orange;`,
      api: 'modern-compiler',  // or 'modern', 'legacy'

      // Vite-specific options
      includePaths: ['./src/styles']
    },

    less: {
      math: 'parens-division',
      globalVars: {
        primaryColor: '#1890ff'
      }
    },

    stylus: {
      define: {
        $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1)
      },
      imports: ['./src/styles/variables.styl']
    }
  }
}
```

**Import Resolution:**
```scss
/* Vite aliases work */
@import '@/styles/variables';

/* Node modules */
@import 'normalize.css/normalize.css';

/* Relative paths */
@import './mixins';
```

### PostCSS

**Config File:**
```js
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    'postcss-nested': {},
    cssnano: {
      preset: 'default'
    }
  }
}
```

**Inline Config:**
```js
css: {
  postcss: {
    plugins: [
      require('autoprefixer'),
      require('postcss-nested')
    ]
  }
}
```

**CSS Modules with PostCSS:**
- PostCSS runs before CSS Modules
- Use `postcss-modules` plugin if needed

### Lightning CSS

**Enable:**
```js
css: {
  transformer: 'lightningcss'
}
```

**Configuration:**
```js
css: {
  transformer: 'lightningcss',
  lightningcss: {
    targets: {
      chrome: 107,
      edge: 107,
      firefox: 104,
      safari: 16
    },
    drafts: {
      nesting: true,
      customMedia: true
    },
    nonStandard: {
      deepSelectorCombinator: true
    },
    cssModules: {
      pattern: '[name]__[local]--[hash]'
    }
  }
}
```

**Features:**
- CSS parsing and transformation
- CSS minification (faster than esbuild)
- Modern CSS features (nesting, custom media)
- CSS Modules support

**Replaces:**
- PostCSS (for transformation)
- autoprefixer
- postcss-preset-env

### `@import` Inlining and Rebasing

**Automatic Inlining:**
```css
/* Inlines and rebases URLs */
@import './nested.css';
```

**Alias Support:**
```css
@import '@/styles/base.css';
```

**Disable Rebasing:**
```css
/* Use data URI or absolute URL */
@import url('https://fonts.googleapis.com/css2?family=Roboto');
```

---

## TypeScript

### Configuration

**Compiler Target:**
- Vite uses esbuild for transpilation
- `tsconfig.json` `target` field is **ignored**
- Use `build.target` or `esbuild.target` in vite.config.js

**Required Options:**
```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "useDefineForClassFields": true
  }
}
```

**Recommended Options:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  }
}
```

### Type Checking

**Development:**
```bash
# Run alongside dev server
tsc --noEmit --watch
```

**Build:**
```json
{
  "scripts": {
    "build": "tsc --noEmit && vite build"
  }
}
```

**IDE Integration:**
- VS Code: Built-in TypeScript support
- WebStorm: Built-in TypeScript support
- Vim/Neovim: Use coc.nvim or ALE

### Client Types

**vite/client:**
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly hot: {
    accept: (cb: (mod: any) => void) => void
    dispose: (cb: (data: any) => void) => void
    // ...more HMR API
  }
}
```

### TypeScript for Config

**vite.config.ts:**
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // All config is typed
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
})
```

**Type Helpers:**
```ts
import type { UserConfig } from 'vite'

const config: UserConfig = {
  // ...
}

export default config
```

### Transpile-Only Warning

**What Vite Does:**
- Transpiles `.ts` to `.js`
- Removes type annotations
- **Does NOT check types**

**Type Errors Won't:**
- Stop dev server
- Prevent builds
- Show up without separate type checking

**Solutions:**
1. Run `tsc --noEmit` separately
2. Use editor with TypeScript integration
3. Add to build script: `tsc && vite build`

---

## Environment Variables

### .env Files

**File Priority:**
```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

**Example:**
```
# .env
VITE_APP_TITLE=My App
DB_PASSWORD=secret123
```

```
# .env.production
VITE_API_URL=https://api.production.com
```

**Loading Priority:**
```
.env.production.local > .env.production > .env.local > .env
```

### Env Variables in Code

**Client-Side:**
```js
// Only VITE_ prefixed variables exposed
console.log(import.meta.env.VITE_APP_TITLE)
console.log(import.meta.env.VITE_API_URL)

// Built-in variables
console.log(import.meta.env.MODE)        // 'development' or 'production'
console.log(import.meta.env.BASE_URL)    // Public base path
console.log(import.meta.env.PROD)        // boolean
console.log(import.meta.env.DEV)         // boolean
console.log(import.meta.env.SSR)         // boolean
```

**Server-Side (Config):**
```js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load all env variables (not just VITE_)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version)
    }
  }
})
```

### TypeScript IntelliSense

**env.d.ts:**
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_SOME_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Custom Prefix

```js
export default defineConfig({
  envPrefix: 'APP_'  // Expose APP_* variables instead of VITE_*
})

// Or multiple prefixes
export default defineConfig({
  envPrefix: ['VITE_', 'APP_', 'CUSTOM_']
})
```

### Modes

**Built-in Modes:**
- `development` - vite
- `production` - vite build

**Custom Modes:**
```bash
# Load .env.staging
vite build --mode staging

# Custom development mode
vite --mode development-local
```

**Check Mode in Code:**
```js
if (import.meta.env.MODE === 'staging') {
  // staging-specific code
}
```

### Security

**DO NOT:**
```
# ❌ WRONG - Exposed to client
VITE_DB_PASSWORD=secret
VITE_API_KEY=sensitive
```

**DO:**
```
# ✅ CORRECT - Not exposed (no VITE_ prefix)
DB_PASSWORD=secret
API_KEY=sensitive

# ✅ OK - Public information
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

---

## Dependency Pre-Bundling

### What is Pre-Bundling?

Vite pre-bundles dependencies on first run to:

1. **Convert CommonJS/UMD to ESM**
   ```js
   // lodash is CommonJS
   import { debounce } from 'lodash-es'  // Converted to ESM
   ```

2. **Improve Performance**
   ```js
   // Instead of 100+ module requests
   import { Button, Input, Form } from 'antd'

   // Vite creates single pre-bundled module
   ```

### How It Works

**1. Discovery Phase:**
```
Scan entry files → Find bare imports → Identify dependencies
```

**2. Pre-Bundle Phase:**
```
Run esbuild → Convert to ESM → Cache in node_modules/.vite
```

**3. Serve Phase:**
```
Serve pre-bundled modules with strong cache headers
```

### Cache Behavior

**File System Cache:**
- Location: `node_modules/.vite`
- Invalidated by:
  - `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` changes
  - Patches folder in `package.json`
  - `vite.config.js` changes
  - `NODE_ENV` value changes

**Browser Cache:**
- Headers: `Cache-Control: max-age=31536000,immutable`
- Refresh: Disable cache in DevTools or use `vite --force`

**Force Re-Bundle:**
```bash
# Option 1: CLI flag
vite --force

# Option 2: Delete cache
rm -rf node_modules/.vite

# Option 3: Config
export default defineConfig({
  optimizeDeps: {
    force: true
  }
})
```

### Manual Configuration

**Include Dependencies:**
```js
optimizeDeps: {
  include: [
    'lodash-es',           // Specify package
    'vue > @vue/shared',   // Nested dependency
    '@my/nested/package',  // Monorepo package
    'some-package/deep/import'  // Deep import
  ]
}
```

**Exclude Dependencies:**
```js
optimizeDeps: {
  exclude: [
    'your-package-name',
    '@my/local-package'
  ]
}
```

**Why Include?**
- Linked packages (via `npm link`, `yarn link`)
- Files imported via plugin transformation
- Dynamic imports with variables
- Pre-bundle large ESM libraries for fewer requests

**Why Exclude?**
- Small, pure ESM libraries
- Local linked packages during development
- Libraries with side effects

### Custom Entries

```js
optimizeDeps: {
  entries: [
    './src/main.js',
    './src/admin/main.js',
    './src/**/*.vue'
  ]
}
```

### esbuild Options

```js
optimizeDeps: {
  esbuildOptions: {
    define: {
      global: 'globalThis'
    },

    plugins: [
      // Custom esbuild plugin
      {
        name: 'my-plugin',
        setup(build) {
          // ...
        }
      }
    ],

    target: 'es2020',

    supported: {
      bigint: true
    }
  }
}
```

### Monorepos & Linked Dependencies

**Problem:**
Linked packages treated as source code, not pre-bundled

**Solution 1: Include in Pre-Bundle**
```js
optimizeDeps: {
  include: ['linked-package']
}
```

**Solution 2: Build Watch Mode**
```json
{
  "scripts": {
    "dev": "concurrently \"tsc -w\" \"vite\""
  }
}
```

### Automatic Discovery

Vite automatically scans:
- `.html` files
- Vue/Svelte component files
- JavaScript/TypeScript files

**Manual Discovery:**
```js
optimizeDeps: {
  entries: './src/special-entry.js'
}
```

---

## Build & Production

### Production Build

**Basic Build:**
```bash
npm run build
# or
vite build
```

**Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-a1b2c3d4.js
│   ├── vendor-e5f6g7h8.js
│   └── index-i9j0k1l2.css
└── favicon.ico
```

### Build Optimizations

**1. Code Splitting**
```js
// Automatic code splitting
const AdminPage = () => import('./pages/Admin.vue')

// Manual chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['vue', 'vue-router', 'pinia'],
        'ui-lib': ['element-plus']
      }
    }
  }
}
```

**2. CSS Code Splitting**
```js
build: {
  cssCodeSplit: true  // Default
}
```

**Behavior:**
- Async chunks get separate CSS files
- CSS loaded on-demand with chunk

**Single CSS File:**
```js
build: {
  cssCodeSplit: false
}
```

**3. Preload Directives**
```html
<!-- Automatically generated for entry chunks -->
<link rel="modulepreload" href="/assets/index-a1b2c3d4.js" />
```

**Custom Resolution:**
```js
build: {
  modulePreload: {
    resolveDependencies: (filename, deps, { hostId, hostType }) => {
      // Filter or modify dependencies
      return deps.filter(dep => !dep.includes('polyfill'))
    }
  }
}
```

**4. Async Chunk Loading**

Vite automatically optimizes:
```js
// Before optimization
const foo = await import('./foo.js')

// After optimization (preloads dependencies)
const [foo, bar, baz] = await Promise.all([
  import('./foo.js'),
  import('./bar.js'),  // foo's dependency
  import('./baz.js')   // foo's dependency
])
```

### Library Mode

**Configuration:**
```js
// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',

      // Output formats
      formats: ['es', 'cjs', 'umd', 'iife'],

      // Output file names
      fileName: (format) => `my-lib.${format}.js`,

      // CSS output name
      cssFileName: 'style'
    },

    rollupOptions: {
      // Externalize dependencies
      external: ['vue', 'react'],

      output: {
        // Global names for UMD build
        globals: {
          vue: 'Vue',
          react: 'React'
        }
      }
    }
  }
})
```

**package.json:**
```json
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./style.css": "./dist/style.css"
  }
}
```

**Multiple Entries:**
```js
build: {
  lib: {
    entry: {
      'main': resolve(__dirname, 'lib/main.js'),
      'utils': resolve(__dirname, 'lib/utils.js')
    }
  }
}
```

### Advanced Chunking

**Manual Chunks:**
```js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router'],
        utils: ['lodash-es', 'axios']
      }
    }
  }
}
```

**Function Form:**
```js
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          return 'vendor'
        }
        if (id.includes('src/components')) {
          return 'components'
        }
      }
    }
  }
}
```

**Chunk File Names:**
```js
build: {
  rollupOptions: {
    output: {
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash].[ext]'
    }
  }
}
```

### Multi-Page App

**Directory Structure:**
```
├── index.html
├── about.html
├── contact.html
└── vite.config.js
```

**Configuration:**
```js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
})
```

**Nested Structure:**
```
├── packages/
│   ├── pkg1/
│   │   └── index.html
│   └── pkg2/
│       └── index.html
```

```js
build: {
  rollupOptions: {
    input: {
      pkg1: resolve(__dirname, 'packages/pkg1/index.html'),
      pkg2: resolve(__dirname, 'packages/pkg2/index.html')
    }
  }
}
```

### Backend Integration

**Generate Manifest:**
```js
build: {
  manifest: true  // Creates .vite/manifest.json
}
```

**manifest.json:**
```json
{
  "src/main.js": {
    "file": "assets/main-a1b2c3d4.js",
    "src": "src/main.js",
    "isEntry": true,
    "imports": ["_vendor-e5f6g7h8.js"],
    "css": ["assets/main-i9j0k1l2.css"]
  },
  "_vendor-e5f6g7h8.js": {
    "file": "assets/vendor-e5f6g7h8.js"
  }
}
```

**Server-Side Usage (PHP Example):**
```php
<?php
$manifest = json_decode(file_get_contents('dist/.vite/manifest.json'), true);
$entry = $manifest['src/main.js'];
?>

<link rel="stylesheet" href="/<?= $entry['css'][0] ?>">
<script type="module" src="/<?= $entry['file'] ?>"></script>
```

### Watch Mode

```bash
vite build --watch
```

```js
build: {
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
}
```

---

## Plugin System

### Plugin Anatomy

```js
export default function myPlugin(options = {}) {
  return {
    name: 'my-plugin',

    // Vite-specific hooks
    config(config, { command, mode }) {
      // Modify config before it's resolved
    },

    configResolved(resolvedConfig) {
      // Store resolved config
    },

    configureServer(server) {
      // Configure dev server
      server.middlewares.use((req, res, next) => {
        // Custom middleware
      })
    },

    configurePreviewServer(server) {
      // Configure preview server
    },

    transformIndexHtml(html, ctx) {
      // Transform index.html
      return html.replace('<!-- inject -->', '<script>...</script>')
    },

    handleHotUpdate({ server, file, timestamp, modules }) {
      // Custom HMR handling
      if (file.endsWith('.custom')) {
        server.ws.send({ type: 'custom', event: 'update' })
        return []
      }
    },

    // Universal Rollup hooks
    options(options) {
      // Modify Rollup options
    },

    buildStart(options) {
      // Called at start of build
    },

    resolveId(source, importer, options) {
      // Custom module resolution
      if (source === 'virtual-module') {
        return source
      }
    },

    load(id) {
      // Custom module loading
      if (id === 'virtual-module') {
        return 'export default "This is virtual"'
      }
    },

    transform(code, id) {
      // Transform module code
      if (id.endsWith('.custom')) {
        return {
          code: transformedCode,
          map: sourceMap
        }
      }
    },

    buildEnd(error) {
      // Called at end of build
    },

    closeBundle() {
      // Called after bundle is written
    }
  }
}
```

### Plugin Ordering

**Execution Order:**
1. Alias resolution
2. User plugins with `enforce: 'pre'`
3. Vite core plugins
4. User plugins without enforce value
5. Vite build plugins
6. User plugins with `enforce: 'post'`
7. Vite post build plugins

**Example:**
```js
export default function myPlugin() {
  return {
    name: 'my-plugin',
    enforce: 'pre',  // or 'post'
    // ...
  }
}
```

### Conditional Application

**Apply to Specific Command:**
```js
export default function myPlugin() {
  return {
    name: 'my-plugin',
    apply: 'build'  // or 'serve'
  }
}
```

**Function Form:**
```js
export default function myPlugin() {
  return {
    name: 'my-plugin',
    apply(config, { command }) {
      return command === 'build' && config.build.ssr
    }
  }
}
```

### Hook Filters (Rolldown/Rollup 4.38+)

**Optimize Performance:**
```js
export default function myPlugin() {
  return {
    name: 'my-plugin',
    transform: {
      filter: {
        id: /\.js$/,        // Only .js files
        code: /import/      // Only files with 'import'
      },
      handler(code, id) {
        // Transform code
        return { code }
      }
    }
  }
}
```

### Official Plugins

**Vue:**
```bash
npm install -D @vitejs/plugin-vue
npm install -D @vitejs/plugin-vue-jsx
```

```js
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ]
})
```

**React:**
```bash
npm install -D @vitejs/plugin-react
# or
npm install -D @vitejs/plugin-react-swc
```

```js
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```

**Legacy Browser Support:**
```bash
npm install -D @vitejs/plugin-legacy
```

```js
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

### Common Plugin Patterns

**Virtual Modules:**
```js
export default function virtualPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'virtual-module',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    }
  }
}
```

**Usage:**
```js
import { msg } from 'virtual:my-module'
console.log(msg)
```

**Custom File Types:**
```js
export default function customFilePlugin() {
  return {
    name: 'custom-file',
    transform(code, id) {
      if (id.endsWith('.custom')) {
        const transformed = processCustomFile(code)
        return {
          code: `export default ${JSON.stringify(transformed)}`,
          map: null
        }
      }
    }
  }
}
```

**Inject Code:**
```js
export default function injectPlugin() {
  return {
    name: 'inject-code',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `
          <script>
            window.__INJECTED__ = true
          </script>
        </head>
        `
      )
    }
  }
}
```

### Plugin Development Tips

**TypeScript:**
```ts
import type { Plugin } from 'vite'

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    // ...
  }
}
```

**Options:**
```ts
interface MyPluginOptions {
  include?: string | string[]
  exclude?: string | string[]
}

export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  return {
    name: 'my-plugin',
    // Use options
  }
}
```

**Logging:**
```js
export default function myPlugin() {
  let config

  return {
    name: 'my-plugin',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    transform(code, id) {
      config.logger.info(`Transforming ${id}`)
    }
  }
}
```

---

## JavaScript API

### createServer()

**Create Dev Server:**
```js
import { createServer } from 'vite'

const server = await createServer({
  // Any valid config option, plus:
  configFile: false,
  root: __dirname,
  server: {
    port: 3000
  }
})

await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })
```

**ViteDevServer Properties:**
```ts
interface ViteDevServer {
  config: ResolvedConfig
  middlewares: Connect.Server
  httpServer: http.Server | null
  watcher: FSWatcher
  ws: WebSocketServer
  pluginContainer: PluginContainer
  moduleGraph: ModuleGraph

  // Methods
  transformRequest(url: string, options?: TransformOptions): Promise<TransformResult | null>
  transformIndexHtml(url: string, html: string, originalUrl?: string): Promise<string>
  ssrLoadModule(url: string, options?: { fixStacktrace?: boolean }): Promise<Record<string, any>>
  ssrFixStacktrace(e: Error): void
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  restart(forceOptimize?: boolean): Promise<void>
  close(): Promise<void>
}
```

### build()

**Production Build:**
```js
import { build } from 'vite'

await build({
  root: __dirname,
  base: '/app/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      // ...
    }
  }
})
```

**Multiple Builds:**
```js
await build({ /* config */ })
await build({
  build: {
    ssr: 'src/entry-server.js'
  }
})
```

**Watch Mode:**
```js
const watcher = await build({
  build: {
    watch: {}
  }
})

// watcher is RollupWatcher
watcher.on('event', (event) => {
  if (event.code === 'END') {
    console.log('Build complete')
  }
})

// Stop watching
watcher.close()
```

### preview()

**Preview Server:**
```js
import { preview } from 'vite'

const previewServer = await preview({
  preview: {
    port: 8080,
    open: true
  }
})

previewServer.printUrls()
```

### resolveConfig()

**Resolve Vite Config:**
```js
import { resolveConfig } from 'vite'

const config = await resolveConfig(
  { /* inline config */ },
  'build',  // command: 'build' | 'serve'
  'production',  // mode
  'production'   // NODE_ENV
)

console.log(config.root)
```

### mergeConfig()

**Merge Configs:**
```js
import { mergeConfig } from 'vite'

const baseConfig = {
  plugins: [vue()],
  server: { port: 3000 }
}

const overrides = {
  server: { port: 4000 }
}

const merged = mergeConfig(baseConfig, overrides)
// { plugins: [vue()], server: { port: 4000 } }
```

### Other Utilities

**Load Environment:**
```js
import { loadEnv } from 'vite'

const env = loadEnv(
  'production',        // mode
  process.cwd(),       // envDir
  'VITE_'              // prefix
)

console.log(env.VITE_API_URL)
```

**Search Workspace Root:**
```js
import { searchForWorkspaceRoot } from 'vite'

const root = searchForWorkspaceRoot(process.cwd())
```

**Normalize Path:**
```js
import { normalizePath } from 'vite'

// Convert Windows paths to POSIX
const normalized = normalizePath('C:\\Users\\file.js')
// '/C:/Users/file.js'
```

**Transform with esbuild:**
```js
import { transformWithEsbuild } from 'vite'

const result = await transformWithEsbuild(
  code,
  filename,
  {
    loader: 'tsx',
    target: 'es2020'
  }
)

console.log(result.code)
```

**Load Config File:**
```js
import { loadConfigFromFile } from 'vite'

const config = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  'vite.config.js',
  process.cwd()
)

console.log(config.config)
console.log(config.path)
```

---

## Server-Side Rendering (SSR)

### Source Structure

```
- index.html
- server.js              # Main application server
- src/
  - main.js              # Exports env-agnostic app code
  - entry-client.js      # Mounts app to DOM
  - entry-server.js      # Renders app using framework's SSR API
```

### Entry Files

**src/entry-client.js:**
```js
import { createApp } from './main.js'

const { app, router } = createApp()

router.isReady().then(() => {
  app.mount('#app')
})
```

**src/entry-server.js:**
```js
import { createApp } from './main.js'
import { renderToString } from 'vue/server-renderer'

export async function render(url, manifest) {
  const { app, router } = createApp()

  await router.push(url)
  await router.isReady()

  const ctx = {}
  const html = await renderToString(app, ctx)

  return { html }
}
```

### Development Server

**server.js (Dev):**
```js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      )

      // 2. Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template)

      // 3. Load server entry
      const { render } = await vite.ssrLoadModule('/src/entry-server.js')

      // 4. Render app HTML
      const { html: appHtml } = await render(url)

      // 5. Inject HTML
      const html = template.replace('<!--app-html-->', appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.message)
    }
  })

  app.listen(5173)
}

createServer()
```

### Production Server

**Build Scripts:**
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

**server.js (Production):**
```js
import fs from 'fs'
import path from 'path'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Serve static files
  app.use(express.static('dist/client'))

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      // 1. Read index.html
      const template = fs.readFileSync(
        path.resolve(__dirname, 'dist/client/index.html'),
        'utf-8'
      )

      // 2. Load server entry
      const { render } = await import('./dist/server/entry-server.js')

      // 3. Render app
      const { html: appHtml } = await render(url)

      // 4. Inject HTML
      const html = template.replace('<!--app-html-->', appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      console.error(e)
      res.status(500).end(e.message)
    }
  })

  app.listen(5173)
}

createServer()
```

### SSR Configuration

**SSR Target:**
```js
ssr: {
  target: 'node',  // or 'webworker'

  // External dependencies
  external: ['some-node-module'],

  // Include dependencies in SSR bundle
  noExternal: ['vue', 'vuex'],

  // Conditions
  resolve: {
    conditions: ['node', 'production'],
    externalConditions: ['node']
  }
}
```

### SSR Manifest

**Generate Manifest:**
```js
build: {
  ssrManifest: true
}
```

**Use in Rendering:**
```js
import { render } from './dist/server/entry-server.js'
import manifest from './dist/client/.vite/ssr-manifest.json'

const { html, preloadLinks } = await render(url, manifest)

const finalHtml = template
  .replace('<!--preload-links-->', preloadLinks)
  .replace('<!--app-html-->', html)
```

### Handling CSS

**Development:**
- CSS injected via `<style>` tags
- No special handling needed

**Production:**
```js
// Collect CSS modules during render
const { html, css } = await render(url)

const finalHtml = template
  .replace('<!--app-html-->', html)
  .replace('</head>', `<style>${css}</style></head>`)
```

---

## Hot Module Replacement (HMR)

### HMR API

**Accept Self Updates:**
```js
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // newModule is updated version of this module
    console.log('Updated:', newModule)
  })
}
```

**Accept Dependency Updates:**
```js
import { foo } from './foo.js'

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // Update foo
    foo = newFoo.foo
  })
}
```

**Accept Multiple Dependencies:**
```js
import.meta.hot.accept(
  ['./foo.js', './bar.js'],
  ([newFoo, newBar]) => {
    // Update both
  }
)
```

**Dispose Handler:**
```js
if (import.meta.hot) {
  let cleanup = setupSomething()

  import.meta.hot.dispose((data) => {
    // Cleanup before update
    cleanup()

    // Store data for next version
    data.someState = getCurrentState()
  })

  // Access previous state
  if (import.meta.hot.data.someState) {
    restoreState(import.meta.hot.data.someState)
  }
}
```

**Invalidate Module:**
```js
import.meta.hot.invalidate()
// Forces full page reload
```

**Custom Events:**
```js
// Client
if (import.meta.hot) {
  import.meta.hot.on('my-event', (data) => {
    console.log('Received:', data)
  })
}

// Plugin
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'my-event',
    data: { msg: 'Hello' }
  })
}
```

**Send Custom Event:**
```js
import.meta.hot.send('my-event-from-client', { some: 'data' })
```

### HMR for Custom File Types

**Plugin:**
```js
export default function customHMR() {
  return {
    name: 'custom-hmr',

    handleHotUpdate({ file, server }) {
      if (file.endsWith('.custom')) {
        // Notify clients
        server.ws.send({
          type: 'custom',
          event: 'custom-update',
          data: { file }
        })

        // Return empty to prevent default HMR
        return []
      }
    }
  }
}
```

**Client:**
```js
if (import.meta.hot) {
  import.meta.hot.on('custom-update', ({ file }) => {
    console.log('Custom file updated:', file)
    // Handle update
  })
}
```

### HMR Best Practices

**1. Preserve State:**
```js
let count = import.meta.hot?.data.count ?? 0

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    data.count = count
  })
}
```

**2. Cleanup Side Effects:**
```js
const eventHandler = () => {}
window.addEventListener('resize', eventHandler)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('resize', eventHandler)
  })
}
```

**3. Conditionally Accept:**
```js
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (canUpdate(newModule)) {
      update(newModule)
    } else {
      import.meta.hot.invalidate()
    }
  })
}
```

---

## Backend Integration

### Development Mode

**HTML Setup:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>App</title>

    <!-- DEV MODE -->
    <?php if (getenv('NODE_ENV') === 'development'): ?>
      <script type="module" src="http://localhost:5173/@vite/client"></script>
      <script type="module" src="http://localhost:5173/src/main.js"></script>
    <?php endif; ?>

    <!-- PRODUCTION MODE -->
    <?php if (getenv('NODE_ENV') === 'production'): ?>
      <!-- Load from manifest -->
      ...
    <?php endif; ?>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

**CORS Configuration:**
```js
// vite.config.js
export default defineConfig({
  server: {
    cors: true,
    origin: 'http://localhost:8000'
  }
})
```

### Production Mode

**Generate Manifest:**
```js
// vite.config.js
export default defineConfig({
  build: {
    manifest: true
  }
})
```

**manifest.json:**
```json
{
  "src/main.js": {
    "file": "assets/main-4ds332.js",
    "src": "src/main.js",
    "isEntry": true,
    "css": ["assets/main-5da443.css"]
  }
}
```

**Backend Helper (PHP):**
```php
<?php
class ViteManifest {
  private $manifest;

  public function __construct($manifestPath) {
    $this->manifest = json_decode(
      file_get_contents($manifestPath),
      true
    );
  }

  public function getEntry($entry) {
    return $this->manifest[$entry] ?? null;
  }

  public function renderTags($entry) {
    $data = $this->getEntry($entry);
    if (!$data) return '';

    $tags = '';

    // CSS
    if (isset($data['css'])) {
      foreach ($data['css'] as $css) {
        $tags .= sprintf(
          '<link rel="stylesheet" href="/%s">',
          $css
        );
      }
    }

    // JS
    $tags .= sprintf(
      '<script type="module" src="/%s"></script>',
      $data['file']
    );

    return $tags;
  }
}

$manifest = new ViteManifest('dist/.vite/manifest.json');
?>

<!DOCTYPE html>
<html>
  <head>
    <?= $manifest->renderTags('src/main.js') ?>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

**Backend Helper (Ruby on Rails):**
```ruby
# app/helpers/vite_helper.rb
module ViteHelper
  def vite_manifest
    @vite_manifest ||= JSON.parse(
      File.read(Rails.root.join('public', '.vite', 'manifest.json'))
    )
  end

  def vite_asset_path(name)
    manifest_entry = vite_manifest[name]
    return '' unless manifest_entry

    "/#{manifest_entry['file']}"
  end

  def vite_javascript_tag(name)
    javascript_include_tag vite_asset_path(name), type: 'module'
  end

  def vite_stylesheet_tag(name)
    manifest_entry = vite_manifest[name]
    return '' unless manifest_entry

    tags = ''
    (manifest_entry['css'] || []).each do |css_file|
      tags += stylesheet_link_tag("/#{css_file}")
    end
    tags.html_safe
  end
end
```

**Usage in Views:**
```erb
<%= vite_stylesheet_tag 'src/main.js' %>
<%= vite_javascript_tag 'src/main.js' %>
```

---

## Performance Optimization

### Development Performance

#### 1. Review Browser Setup
```
❌ DON'T: Use browser cache during development
✅ DO: Disable cache in DevTools Network tab
✅ DO: Use dev-only browser profile
✅ DO: Disable unnecessary browser extensions
✅ DO: Use incognito mode for testing
```

#### 2. Audit Vite Plugins

**Check Plugin Performance:**
```js
// vite.config.js
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    Inspect()  // Visit /__inspect/ to see plugin transform times
  ]
})
```

**Optimize Slow Plugins:**
```
❌ Avoid large dependencies in plugins
❌ Avoid long operations in buildStart, config, configResolved
✅ Make resolveId, load, transform as fast as possible
✅ Use hook filters when available
```

#### 3. Reduce Resolve Operations

**Be Explicit:**
```js
// ❌ Slow - tries multiple extensions
import Component from './Component'

// ✅ Fast - direct hit
import Component from './Component.vue'
```

**Narrow Extensions:**
```js
resolve: {
  extensions: ['.js', '.vue', '.json']  // Only what you need
}
```

#### 4. Avoid Barrel Files

**Barrel File (Slow):**
```js
// utils/index.js
export * from './math'
export * from './string'
export * from './array'
export * from './object'

// App.vue
import { add } from './utils'  // Must process all exports
```

**Direct Import (Fast):**
```js
// App.vue
import { add } from './utils/math'  // Only processes math.js
```

#### 5. Warm Up Files

**Pre-transform Frequently Used:**
```js
server: {
  warmup: {
    clientFiles: [
      './src/components/HeavyComponent.vue',
      './src/utils/complexLib.js'
    ],
    ssrFiles: [
      './src/server/utils.js'
    ]
  }
}
```

#### 6. Use Native Tooling

**CSS:**
```
❌ Sass/Less when not needed
✅ Native CSS or PostCSS
✅ Lightning CSS (transformer: 'lightningcss')
```

**SVG:**
```
❌ Transform SVGs to components (heavy)
✅ Import as URL or raw string
```

**React:**
```
❌ @vitejs/plugin-react (Babel)
✅ @vitejs/plugin-react-swc (SWC - faster)
```

### Build Performance

#### 1. Use Rolldown

**Enable Rolldown:**
```bash
npm install -D vite@npm:rolldown-vite
```

```json
{
  "devDependencies": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

**Benefits:**
- Faster builds (Rust-powered)
- Unified bundler (replaces esbuild + Rollup)
- Better chunking strategies

#### 2. Minimize Bundle Size

**Analyze Bundle:**
```bash
npm install -D rollup-plugin-visualizer
```

```js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

**Tree Shaking:**
```js
// ❌ Imports entire library
import _ from 'lodash'

// ✅ Imports only what's needed
import debounce from 'lodash-es/debounce'
```

**Code Splitting:**
```js
// Automatic code splitting
const AdminPanel = () => import('./AdminPanel.vue')

// Manual chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router'],
        ui: ['element-plus']
      }
    }
  }
}
```

#### 3. Disable Unnecessary Features

**Source Maps:**
```js
build: {
  sourcemap: false  // Disable in production if not needed
}
```

**Compressed Size Reporting:**
```js
build: {
  reportCompressedSize: false  // Faster builds
}
```

---

## Deployment

### Static Site Deployment

#### Building

```bash
npm run build
```

**Output:**
```
dist/
├── index.html
├── assets/
│   ├── index.a1b2c3d4.js
│   └── index.e5f6g7h8.css
└── favicon.ico
```

#### GitHub Pages

**Configuration:**
```js
// vite.config.js
export default defineConfig({
  base: '/repo-name/'  // Important for GitHub Pages
})
```

**GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Netlify

**Configuration:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy:**
```bash
# Via CLI
npm install -g netlify-cli
ntl init
ntl deploy --prod

# Or via Git
# Just push to GitHub and connect in Netlify UI
```

#### Vercel

**Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Deploy:**
```bash
# Via CLI
npm install -g vercel
vercel

# Or via Git
# Push to GitHub and import in Vercel
```

#### Cloudflare Pages

**Deploy:**
```bash
# Via Wrangler
npm install -g wrangler
wrangler pages deploy dist

# Or via Git
# Connect repository in Cloudflare Pages dashboard
```

**Configuration:**
```
Build command: npm run build
Build output directory: dist
```

#### Other Platforms

**Firebase:**
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

**Surge:**
```bash
npm install -g surge
surge dist
```

**Azure Static Web Apps:**
```yaml
# .github/workflows/azure-static-web-apps.yml
# Use GitHub Actions integration
```

**Render:**
- Static Site
- Build command: `npm run build`
- Publish directory: `dist`

### SSR Deployment

**Node.js:**
```bash
# Build client and server
npm run build

# Start production server
NODE_ENV=production node server.js
```

**Docker:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
```

**PM2:**
```json
{
  "apps": [{
    "name": "my-app",
    "script": "server.js",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

```bash
pm2 start ecosystem.config.json
```

---

## Rolldown Integration

### What is Rolldown?

Rolldown is a Rust-powered JavaScript bundler designed as a drop-in replacement for Rollup, offering significant performance improvements while maintaining compatibility.

**Key Features:**
- **Speed**: Significantly faster than Rollup (Rust implementation)
- **Compatibility**: Supports existing Rollup plugins
- **Advanced**: Better chunking, built-in HMR, Module Federation support
- **Unified**: Single bundler for dev and build (replaces esbuild + Rollup)

### Using Rolldown

**Installation:**
```bash
npm install -D vite@npm:rolldown-vite@latest
```

**package.json:**
```json
{
  "devDependencies": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

**For Meta-Frameworks (Nuxt, Astro, SvelteKit, etc.):**
```json
{
  "overrides": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

### Major Changes

**1. Build Bundler**
```
Was: Rollup
Now: Rolldown
```

**2. Dependency Optimizer**
```
Was: esbuild
Now: Rolldown
```

**3. CommonJS Plugin**
```
Was: @rollup/plugin-commonjs
Now: Built-in Rolldown CommonJS support
```

**4. Syntax Lowering**
```
Was: esbuild
Now: Oxc (faster TypeScript/JSX transform)
```

**5. CSS Minification**
```
Was: esbuild
Now: Lightning CSS (default)
```

**6. JS Minification**
```
Was: esbuild
Now: Oxc minifier (default)
```

### API Differences

#### manualChunks → advancedChunks

**Rollup (Old):**
```js
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (/\/react(?:-dom)?/.test(id)) {
            return 'vendor'
          }
        }
      }
    }
  }
}
```

**Rolldown (New):**
```js
build: {
  rollupOptions: {
    output: {
      advancedChunks: {
        groups: [
          {
            name: 'vendor',
            test: /\/react(?:-dom)?/
          }
        ]
      }
    }
  }
}
```

**Benefits:**
- More powerful chunking strategies
- Better performance
- Cleaner API

### Compatibility

**Supported:**
- Most Rollup plugins
- Vite plugins
- Standard build configurations

**May Need Updates:**
- Custom Rollup plugins using advanced features
- Direct Rollup API usage

### Performance Gains

**Typical Improvements:**
- **Dev Server Start**: 2-3x faster
- **Build Time**: 3-5x faster
- **HMR**: Near-instant updates

---

## Migration Guide

### Vite 6 → Vite 7

#### Node.js Support

**Removed:**
- Node.js 18

**Required:**
- Node.js 20.19+
- Node.js 22.12+

**Action:**
```bash
# Check version
node --version

# Update if needed
nvm install 20
nvm use 20
```

#### Browser Target

**Changed:**
```js
// Old default (Vite 6)
build: {
  target: 'esnext'  // Or specific browsers
}

// New default (Vite 7)
build: {
  target: 'baseline-widely-available'
}
```

**New Baseline:**
- Chrome: 107+ (was 87)
- Edge: 107+ (was 88)
- Firefox: 104+ (was 78)
- Safari: 16+ (was 14)

**Action:**
```js
// If you need old browser support
export default defineConfig({
  build: {
    target: ['chrome87', 'edge88', 'firefox78', 'safari14']
  }
})
```

#### Removed Features

**1. Sass Legacy API**
```js
// ❌ No longer supported
css: {
  preprocessorOptions: {
    scss: {
      api: 'legacy'
    }
  }
}

// ✅ Use modern API
css: {
  preprocessorOptions: {
    scss: {
      api: 'modern-compiler'  // or 'modern'
    }
  }
}
```

**2. splitVendorChunkPlugin**
```js
// ❌ Removed
import { splitVendorChunkPlugin } from 'vite'

plugins: [splitVendorChunkPlugin()]

// ✅ Use manual chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router']
      }
    }
  }
}
```

**3. transformIndexHtml Hook-Level enforce**
```js
// ❌ No longer supported
transformIndexHtml: {
  enforce: 'pre',
  transform(html) {
    return html
  }
}

// ✅ Use plugin-level enforce
export default function myPlugin() {
  return {
    name: 'my-plugin',
    enforce: 'pre',
    transformIndexHtml(html) {
      return html
    }
  }
}
```

#### Deprecated Type Properties

**Removed:**
- `PreRenderedChunk.code`
- `PreRenderedChunk.map`
- `RenderedChunk.code`
- `RenderedChunk.map`

**Action:**
These were type-only properties, no runtime impact.

---

## Troubleshooting

### CLI Issues

#### Cannot Find Module with `&` in Path

**Error:**
```
Error: Cannot find module 'C:\path\with&ampersand'
```

**Solution:**
- Switch from npm to pnpm/yarn/bun, or
- Remove `&` from project path

### Config Issues

#### ESM-Only Package Error

**Error:**
```
require() of ES Module not supported
```

**Solution 1: Use ESM Config**
```js
// vite.config.js → vite.config.mjs
export default defineConfig({
  // ...
})
```

**Solution 2: Use package.json type**
```json
{
  "type": "module"
}
```

**Solution 3: Node.js Flag (Experimental)**
```bash
NODE_OPTIONS='--experimental-require-module' vite
```

### Dev Server Issues

#### Requests Stall on macOS

**Cause:**
File descriptor limit too low

**Solution:**
```bash
# Check current limit
ulimit -Sn

# Increase limit
ulimit -Sn 10000

# Make permanent in ~/.zshrc or ~/.bashrc
echo "ulimit -Sn 10000" >> ~/.zshrc
```

#### Network Requests Stop Loading

**Cause:**
Untrusted SSL certificate

**Solution:**
```bash
# Use mkcert to create trusted certificate
npm install -g mkcert
mkcert -install
mkcert localhost
```

```js
// vite.config.js
import fs from 'fs'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem')
    }
  }
})
```

#### 431 Request Header Fields Too Large

**Cause:**
Large cookies or headers

**Solution:**
```bash
NODE_OPTIONS='--max-http-header-size=16384' vite
```

### HMR Issues

#### Full Reload Instead of HMR

**Cause:**
Circular dependency

**Solution:**
```js
// Break circular dependency
// File A imports B, File B imports A

// Bad
// a.js
import { b } from './b.js'

// b.js
import { a } from './a.js'

// Good - extract shared code
// shared.js
export const shared = {}

// a.js
import { shared } from './shared.js'

// b.js
import { shared } from './shared.js'
```

#### File Changes Not Detected

**Cause:**
Case sensitivity issues

**Solution:**
```js
server: {
  watch: {
    usePolling: true  // Use polling instead of native watchers
  }
}
```

### Build Issues

#### CORS Error with file:// Protocol

**Error:**
```
Access to script at 'file:///path/to/index.js' from origin 'null' has been blocked by CORS
```

**Solution:**
Use `vite preview` to serve with HTTP:
```bash
vite preview
```

#### Failed to Fetch Dynamically Imported Module

**Causes:**
1. Version skew (deployed new version while user has old page open)
2. Network issues
3. Browser extensions blocking requests

**Solutions:**
```js
// 1. Version hash in filename
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name].[hash].js'
    }
  }
}

// 2. Handle errors gracefully
const module = await import('./module.js').catch(err => {
  console.error('Failed to load module:', err)
  window.location.reload()
})
```

#### Optimized Dependencies Outdated

**Problem:**
Pre-bundled dependencies not updating

**Solution:**
```bash
# Force re-optimization
vite --force

# Or use npm overrides
```

```json
{
  "overrides": {
    "problematic-package": "^2.0.0"
  }
}
```

### Module Issues

#### Module Externalized for Browser

**Error:**
```
Module "fs" has been externalized for browser compatibility
```

**Cause:**
Trying to use Node.js modules in browser code

**Solution:**
```js
// Option 1: Remove Node.js code from client
// Option 2: Use browser-compatible alternatives
import { readFile } from 'node:fs'  // ❌ Won't work in browser

// Use fetch or other browser APIs
const data = await fetch('/api/file').then(r => r.text())  // ✅
```

#### Failed to Resolve Import

**Error:**
```
Failed to resolve import "./Component" from "src/App.vue"
```

**Solutions:**
```js
// 1. Add file extension
import Component from './Component.vue'  // ✅ Instead of './Component'

// 2. Configure extensions
resolve: {
  extensions: ['.js', '.vue', '.json']
}

// 3. Check case sensitivity
import Component from './component.vue'  // ❌ Wrong case
import Component from './Component.vue'  // ✅ Correct case
```

### Performance Issues

#### Slow Dev Server

**Check:**
1. Browser cache disabled? ✅
2. Using incognito mode? ✅
3. Large node_modules? → Use pnpm
4. Heavy Vite plugins? → Use vite-plugin-inspect
5. Many barrel files? → Use direct imports

#### Slow Build

**Solutions:**
```js
// 1. Disable source maps
build: {
  sourcemap: false
}

// 2. Disable compressed size reporting
build: {
  reportCompressedSize: false
}

// 3. Use Rolldown
{
  "devDependencies": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

---

## Environment API (Vite 6+)

### Release Status

The Environment API is in **Release Candidate** phase. APIs are stable between major releases to allow ecosystem experimentation, but some specific APIs are still experimental.

**Resources:**
- [Feedback Discussion](https://github.com/vitejs/vite/discussions/16358)
- [Environment API PR](https://github.com/vitejs/vite/pull/16471)

### Core Concepts

#### Formalizing Environments

Vite 6 formalizes the concept of **Environments**. Until Vite 5, there were two implicit environments (`client` and optionally `ssr`). The new Environment API allows users and framework authors to create as many environments as needed to map how their apps work in production.

**Key improvements:**
- Support for multiple custom environments (e.g., `client`, `server`, `edge`, `rsc`)
- Closer alignment between dev and production
- Support for different JS runtimes (Node, workerd, Deno, etc.)
- Independent module graphs per environment
- Environment-specific configuration

#### Closing the Gap Between Build and Dev

For simple SPAs/MPAs, no new APIs are needed - the config and behavior from Vite 5 works seamlessly. For SSR apps, you typically have two environments:

- **`client`**: Runs the app in the browser
- **`ssr`**: Runs the app in Node (or other server runtimes) for server-side rendering

Modern apps may run in more than two environments (e.g., browser + node server + edge server). Vite 6 allows configuring all environments during both build and dev.

---

### Environments Configuration

#### Basic Configuration (SPA/MPA)

For simple apps, configuration remains unchanged from Vite 5:

```js
export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
})
```

Internally, these options configure the `client` environment.

#### Multi-Environment Configuration

For apps with multiple environments:

```js
export default {
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
}
```

**Inheritance:**
- Environments inherit top-level config options (e.g., `build.sourcemap: false`)
- Some options (like `optimizeDeps`) only apply to `client` environment by default
- The `client` environment can be configured via top-level options or `environments.client`

#### Environment Options Interface

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

#### User Config Interface

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // other options
}
```

**Default environments:**
- **Dev:** `client` and `ssr` are always present
- **Build:** `client` is always present; `ssr` only if configured

#### Custom Environment Instances

Low-level APIs allow runtime providers to create environments with proper defaults:

```js
import { customEnvironment } from 'vite-environment-provider'

export default {
  build: {
    outDir: '/dist/client',
  },
  environments: {
    ssr: customEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
  },
}
```

---

### DevEnvironment Class

#### Class Definition

During dev, each environment is an instance of `DevEnvironment`:

```ts
class DevEnvironment {
  /**
   * Unique identifier for the environment in a Vite server.
   * By default Vite exposes 'client' and 'ssr' environments.
   */
  name: string

  /**
   * Communication channel to send and receive messages from the
   * associated module runner in the target runtime.
   */
  hot: NormalizedHotChannel

  /**
   * Graph of module nodes, with the imported relationship between
   * processed modules and the cached result of the processed code.
   */
  moduleGraph: EnvironmentModuleGraph

  /**
   * Resolved plugins for this environment, including the ones
   * created using the per-environment `create` hook
   */
  plugins: Plugin[]

  /**
   * Allows to resolve, load, and transform code through the
   * environment plugins pipeline
   */
  pluginContainer: EnvironmentPluginContainer

  /**
   * Resolved config options for this environment. Options at the server
   * global scope are taken as defaults for all environments, and can
   * be overridden (resolve conditions, external, optimizedDeps)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * Resolve the URL to an id, load it, and process the code using the
   * plugins pipeline. The module graph is also updated.
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * Register a request to be processed with low priority. This is useful
   * to avoid waterfalls. The Vite server has information about the
   * imported modules by other requests, so it can warmup the module graph
   * so the modules are already processed when they are requested.
   */
  async warmupRequest(url: string): Promise<void>
}
```

#### DevEnvironmentContext

```ts
interface DevEnvironmentContext {
  hot: boolean
  transport?: HotChannel | WebSocketServer
  options?: EnvironmentOptions
  remoteRunner?: {
    inlineSourceMap?: boolean
  }
  depsOptimizer?: DepsOptimizer
}
```

#### TransformResult

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

#### Accessing Environments

During dev:

```js
// create the server, or get it from the configureServer hook
const server = await createServer(/* options */)

const clientEnvironment = server.environments.client
clientEnvironment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

---

### Module Graphs Per Environment

#### Separate Module Graphs

Each environment has an **isolated module graph**. All module graphs have the same signature, enabling generic algorithms to crawl or query the graph without depending on the environment.

**Key differences from Vite 5:**
- Vite v5: Mixed Client and SSR module graph with `clientImportedModules`, `ssrImportedModules`, `transformResult`, and `ssrTransformResult`
- Vite v6: Separate graph per environment with cleaner separation

#### EnvironmentModuleNode

```ts
class EnvironmentModuleNode {
  environment: string

  url: string
  id: string | null = null
  file: string | null = null

  type: 'js' | 'css'

  importers = new Set<EnvironmentModuleNode>()
  importedModules = new Set<EnvironmentModuleNode>()
  importedBindings: Map<string, Set<string>> | null = null

  info?: ModuleInfo
  meta?: Record<string, any>
  transformResult: TransformResult | null = null

  acceptedHmrDeps = new Set<EnvironmentModuleNode>()
  acceptedHmrExports: Set<string> | null = null
  isSelfAccepting?: boolean
  lastHMRTimestamp = 0
  lastInvalidationTimestamp = 0
}
```

#### EnvironmentModuleGraph

```ts
export class EnvironmentModuleGraph {
  environment: string

  urlToModuleMap = new Map<string, EnvironmentModuleNode>()
  idToModuleMap = new Map<string, EnvironmentModuleNode>()
  etagToModuleMap = new Map<string, EnvironmentModuleNode>()
  fileToModulesMap = new Map<string, Set<EnvironmentModuleNode>>()

  constructor(
    environment: string,
    resolveId: (url: string) => Promise<PartialResolvedId | null>,
  )

  async getModuleByUrl(
    rawUrl: string,
  ): Promise<EnvironmentModuleNode | undefined>

  getModuleById(id: string): EnvironmentModuleNode | undefined

  getModulesByFile(file: string): Set<EnvironmentModuleNode> | undefined

  onFileChange(file: string): void

  onFileDelete(file: string): void

  invalidateModule(
    mod: EnvironmentModuleNode,
    seen: Set<EnvironmentModuleNode> = new Set(),
    timestamp: number = monotonicDateNow(),
    isHmr: boolean = false,
  ): void

  invalidateAll(): void

  async ensureEntryFromUrl(
    rawUrl: string,
    setIsSelfAccepting = true,
  ): Promise<EnvironmentModuleNode>

  createFileOnlyEntry(file: string): EnvironmentModuleNode

  async resolveUrl(url: string): Promise<ResolvedUrl>

  updateModuleTransformResult(
    mod: EnvironmentModuleNode,
    result: TransformResult | null,
  ): void

  getModuleByEtag(etag: string): EnvironmentModuleNode | undefined
}
```

---

### Environment-Aware Plugins

#### Accessing the Current Environment in Hooks

Plugin hooks now expose `this.environment` in their context:

```ts
transform(code, id) {
  console.log(this.environment.config.resolve.conditions)
}
```

**Migration from `ssr` boolean:**
- Old: `server.moduleGraph.getModuleByUrl(url, { ssr })`
- New: `environment.moduleGraph.getModuleByUrl(url)`

#### Registering New Environments

Plugins can add new environments in the `config` hook:

```ts
config(config: UserConfig) {
  return {
    environments: {
      rsc: {
        resolve: {
          conditions: ['react-server', ...defaultServerConditions],
        },
      },
    },
  }
}
```

#### Configuring Environments

Use the `configEnvironment` hook to configure each environment:

```ts
configEnvironment(name: string, options: EnvironmentOptions) {
  if (name === 'rsc') {
    return {
      resolve: {
        conditions: ['workerd'],
      },
    }
  }
}
```

#### The `hotUpdate` Hook

**Type:**
```ts
(this: { environment: DevEnvironment }, options: HotUpdateOptions) =>
  Array<EnvironmentModuleNode> | void | Promise<Array<EnvironmentModuleNode> | void>
```

**Kind:** `async`, `sequential`

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

**Usage examples:**

Filter and narrow down affected modules:
```js
hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

Perform a full reload:
```js
hotUpdate({ modules, timestamp }) {
  if (this.environment.name !== 'client')
    return

  const invalidatedModules = new Set()
  for (const mod of modules) {
    this.environment.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  this.environment.hot.send({ type: 'full-reload' })
  return []
}
```

Custom HMR handling:
```js
hotUpdate() {
  if (this.environment.name !== 'client')
    return

  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```

#### Per-Environment State in Plugins

Keep state keyed by environment using `Map<Environment, State>`:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    },
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

**Note:** Without the `perEnvironmentStartEndDuringDev: true` flag, `buildStart` and `buildEnd` are only called for the client environment during dev.

#### Per-Environment Plugins

Use `applyToEnvironment` to control which environments a plugin applies to:

```js
const UnoCssPlugin = () => {
  return {
    buildStart() {
      // init per-environment state
    },
    configureServer() {
      // use global hooks normally
    },
    applyToEnvironment(environment) {
      // return true if this plugin should be active in this environment,
      // or return a new plugin to replace it.
    },
    resolveId(id, importer) {
      // only called for environments this plugin applies to
    },
  }
}
```

Making non-shareable plugins per-environment:

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

Or using the `perEnvironmentPlugin` helper:

```js
import { perEnvironmentPlugin } from 'vite'
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

#### Application-Plugin Communication

`environment.hot` allows plugins to communicate with application code:

**Plugin side:**
```js
configureServer(server) {
  server.environments.ssr.hot.on('my:greetings', (data, client) => {
    // do something with data
    client.send('my:reply', `Hello from server! You said: ${data}`)
  })

  // broadcast to all application instances
  server.environments.ssr.hot.send('my:foo', 'Hello from server!')
}
```

**Application side:**
```js
if (import.meta.hot) {
  import.meta.hot.on('special-update', (data) => {
    // perform custom update
  })
}
```

**Managing multiple instances:**
- `vite:client:connect` event: New connection established
- `vite:client:disconnect` event: Connection closed
- Each handler receives `NormalizedHotChannelClient` as second argument

#### Shared Plugins During Build

**Default behavior in Vite 6:**
- **Dev:** Plugins are shared
- **Build:** Separate plugin instances per environment (backward compatible)

**Opt-in to sharing:**
Set `builder.sharedConfigBuild` to `true` for complete alignment between dev and build.

Individual plugins can opt-in using `sharedDuringBuild`:

```js
function myPlugin() {
  const sharedState = /* ... */
  return {
    name: 'shared-plugin',
    transform(code, id) { /* ... */ },
    sharedDuringBuild: true,
  }
}
```

---

### ModuleRunner Class and API

#### Overview

A **Module Runner** is instantiated in the target runtime to execute code. It's different from `server.ssrLoadModule` because the runner implementation is decoupled from the server.

**Import from:** `vite/module-runner`

#### ModuleRunner Class

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}

  /**
   * URL to execute.
   * Accepts file path, server path, or id relative to the root.
   */
  public async import<T = any>(url: string): Promise<T>

  /**
   * Clear all caches including HMR listeners.
   */
  public clearCache(): void

  /**
   * Clear all caches, remove all HMR listeners, reset sourcemap support.
   * This method doesn't stop the HMR connection.
   */
  public async close(): Promise<void>

  /**
   * Returns `true` if the runner has been closed by calling `close()`.
   */
  public isClosed(): boolean
}
```

**Warning:** The `runner` is evaluated lazily on first access. Vite enables source map support when the runner is created.

#### ModuleRunnerOptions

```ts
interface ModuleRunnerOptions {
  /**
   * A set of methods to communicate with the server.
   */
  transport: ModuleRunnerTransport

  /**
   * Configure how source maps are resolved.
   * Prefers `node` if `process.setSourceMapsEnabled` is available.
   * Otherwise uses `prepareStackTrace` by default.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions

  /**
   * Disable HMR or configure HMR options.
   * @default true
   */
  hmr?: boolean | ModuleRunnerHmr

  /**
   * Custom module cache. If not provided, creates a separate module
   * cache for each module runner instance.
   */
  evaluatedModules?: EvaluatedModules
}
```

#### ModuleEvaluator

```ts
export interface ModuleEvaluator {
  /**
   * Number of prefixed lines in the transformed code.
   */
  startOffset?: number

  /**
   * Evaluate code that was transformed by Vite.
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>

  /**
   * Evaluate externalized module.
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite exports `ESModulesEvaluator` that uses `new AsyncFunction` to evaluate code. It has an offset of 2 lines for inline source maps.

#### ModuleRunnerTransport

```ts
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

**Example: Worker Thread Transport**

```js
// worker.js
import { parentPort } from 'node:worker_threads'
import {
  ESModulesEvaluator,
  ModuleRunner,
  createNodeImportMeta,
} from 'vite/module-runner'

const transport = {
  connect({ onMessage, onDisconnection }) {
    parentPort.on('message', onMessage)
    parentPort.on('close', onDisconnection)
  },
  send(data) {
    parentPort.postMessage(data)
  },
}

const runner = new ModuleRunner(
  {
    transport,
    createImportMeta: createNodeImportMeta,
  },
  new ESModulesEvaluator(),
)
```

**Example: HTTP Transport**

```ts
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

export const runner = new ModuleRunner(
  {
    transport: {
      async invoke(data) {
        const response = await fetch(`http://my-vite-server/invoke`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return response.json()
      },
    },
    hmr: false, // HMR requires transport.connect
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

**Server-side handler:**

```ts
const customEnvironment = new DevEnvironment(name, config, context)

server.onRequest(async (request: Request) => {
  const url = new URL(request.url)
  if (url.pathname === '/invoke') {
    const payload = await request.json()
    const result = customEnvironment.hot.handleInvoke(payload)
    return new Response(JSON.stringify(result))
  }
  return Response.error()
})
```

#### Example Usage

```js
import {
  ModuleRunner,
  ESModulesEvaluator,
  createNodeImportMeta,
} from 'vite/module-runner'
import { transport } from './rpc-implementation.js'

const moduleRunner = new ModuleRunner(
  {
    transport,
    createImportMeta: createNodeImportMeta,
  },
  new ESModulesEvaluator(),
)

await moduleRunner.import('/src/entry-point.js')
```

---

### Framework Integration

#### DevEnvironment Communication Levels

Three communication levels are provided for runtime-agnostic code:

##### 1. RunnableDevEnvironment

Can communicate arbitrary values. The implicit `ssr` environment uses this by default.

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  public async import(url: string): Promise<Record<string, any>>
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

**Example SSR middleware:**

```js
import { createServer } from 'vite'

const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {},
  },
})

const serverEnvironment = viteServer.environments.server

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. Read index.html
  let template = fs.readFileSync('index.html', 'utf-8')

  // 2. Apply Vite HTML transforms
  template = await viteServer.transformIndexHtml(url, template)

  // 3. Load the server entry
  const { render } = await serverEnvironment.runner.import(
    '/src/entry-server.js',
  )

  // 4. Render the app HTML
  const appHtml = await render(url)

  // 5. Inject the app-rendered HTML
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. Send the rendered HTML
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

**HMR optimization:**

```js
// src/entry-server.js
export function render(...) { /* ... */ }

if (import.meta.hot) {
  import.meta.hot.accept()
}
```

##### 2. FetchableDevEnvironment

Communicates via the Fetch API interface (recommended for most runtimes):

```ts
import {
  createServer,
  createFetchableDevEnvironment,
  isFetchableDevEnvironment,
} from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    custom: {
      dev: {
        createEnvironment(name, config) {
          return createFetchableDevEnvironment(name, config, {
            handleRequest(request: Request): Promise<Response> | Response {
              // handle Request and return a Response
            },
          })
        },
      },
    },
  },
})

if (isFetchableDevEnvironment(server.environments.custom)) {
  const response = await server.environments.custom.dispatchFetch(
    new Request('/request-to-handle'),
  )
}
```

**Warning:** Request must be instance of global `Request` class and response must be instance of global `Response` class, or Vite will throw a `TypeError`.

##### 3. Raw DevEnvironment

For environments not implementing the above interfaces, set up communication manually using:

**Virtual modules:**
```ts
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    {
      name: 'virtual-module',
      resolveId(source) {
        return source === 'virtual:entrypoint' ? '\0' + source : undefined
      },
      async load(id) {
        if (id === '\0virtual:entrypoint') {
          return `export function createHandler() { /* ... */ }`
        }
      }
    },
  ],
})

const ssrEnvironment = server.environment.ssr
if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
}
```

**HMR communication:**
```ts
// Server side
const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// Client side (virtual:entrypoint)
import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res, uniqueId }))
})
```

#### Environments During Build

**CLI:**
- `vite build`: Builds client only (backward compatible)
- `vite build --ssr`: Builds SSR only (backward compatible)
- `vite build --app`: Builds all environments

**Configuration:**

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      await Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

**Plugin hook:**
Plugins can define a `buildApp` hook:
- Order `'pre'` and `null`: Executed before configured `builder.buildApp`
- Order `'post'`: Executed after configured `builder.buildApp`
- Use `environment.isBuilt` to check if environment has been built

---

### Environment Factories (Runtime Providers)

#### Creating Environment Factories

Environment factories provide proper defaults for specific runtimes:

```ts
function createWorkerdEnvironment(
  userConfig: EnvironmentOptions,
): EnvironmentOptions {
  return mergeConfig(
    {
      resolve: {
        conditions: [/* ... */],
      },
      dev: {
        createEnvironment(name, config) {
          return createWorkerdDevEnvironment(name, config, {
            hot: true,
            transport: customHotChannel(),
          })
        },
      },
      build: {
        createEnvironment(name, config) {
          return createWorkerdBuildEnvironment(name, config)
        },
      },
    },
    userConfig,
  )
}
```

**Usage:**

```js
import { createWorkerdEnvironment } from 'vite-environment-workerd'

export default {
  environments: {
    ssr: createWorkerdEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
    rsc: createWorkerdEnvironment({
      build: {
        outDir: '/dist/rsc',
      },
    }),
  },
}
```

#### Creating a Custom DevEnvironment

```ts
import { DevEnvironment, HotChannel } from 'vite'

function createWorkerdDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context: DevEnvironmentContext
) {
  const connection = /* ... */
  const transport: HotChannel = {
    on: (listener) => { connection.on('message', listener) },
    send: (data) => connection.send(data),
  }

  const workerdDevEnvironment = new DevEnvironment(name, config, {
    options: {
      resolve: { conditions: ['custom'] },
      ...context.options,
    },
    hot: true,
    transport,
  })
  return workerdDevEnvironment
}
```

---

## Breaking Changes and Future Deprecations

### Status Categories

**Planned:** Breaking changes planned for next major version
- `this.environment` in Hooks
- HMR `hotUpdate` Plugin Hook
- SSR Using `ModuleRunner` API

**Considering:** Experimental APIs gathering feedback
- Move to Per-environment APIs
- Shared Plugins During Build

**Past:** No past changes yet in Vite 6

### 1. `this.environment` in Hooks

**Status:** Future Deprecation (introduced in v6.0)

**Migration from `options.ssr`:**

```ts
// Before
export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [!code --]
      const isSSR = this.environment.config.consumer === 'server' // [!code ++]
    },
  }
}
```

**Enable warnings:**
```ts
export default {
  future: {
    removePluginHookSsrArgument: 'warn',
  },
}
```

**Benefits:**
- Access to environment name, config, module graph, transform pipeline
- No dependency on the entire dev server
- Support for multiple environments beyond client/ssr

**Long-term implementation:**
Use fine-grained environment options instead of relying on environment name:

```ts
resolveId(id, importer) {
  const conditions = this.environment.config.resolve.conditions
  // Use conditions for logic instead of checking environment name
}
```

### 2. HMR `hotUpdate` Plugin Hook

**Status:** Future Deprecation (introduced in v6.0)

**Migration from `handleHotUpdate`:**

```js
// Before: handleHotUpdate
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// After: hotUpdate
hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

**Full reload example:**

```js
// Before
handleHotUpdate({ server, modules, timestamp }) {
  const invalidatedModules = new Set()
  for (const mod of modules) {
    server.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  server.ws.send({ type: 'full-reload' })
  return []
}

// After
hotUpdate({ modules, timestamp }) {
  const invalidatedModules = new Set()
  for (const mod of modules) {
    this.environment.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  this.environment.hot.send({ type: 'full-reload' })
  return []
}
```

**Custom events:**

```js
// Before
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// After
hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```

**Enable warnings:**
```ts
export default {
  future: {
    removePluginHookHandleHotUpdate: 'warn',
  },
}
```

**Key changes:**
- Called for each environment separately (not once for all)
- Receives `EnvironmentModuleNode` instead of mixed `ModuleNode`
- Includes `type: 'create' | 'update' | 'delete'` for additional watch events
- Access via `this.environment` instead of `server`

### 3. Move to Per-environment APIs

**Status:** Future Deprecation (introduced in v6.0)

**APIs moved to DevEnvironment:**

| Old API | New API |
|---------|---------|
| `server.moduleGraph` | `environment.moduleGraph` |
| `server.reloadModule(module)` | `environment.reloadModule(module)` |
| `server.pluginContainer` | `environment.pluginContainer` |
| `server.transformRequest(url, ssr)` | `environment.transformRequest(url)` |
| `server.warmupRequest(url, ssr)` | `environment.warmupRequest(url)` |
| `server.hot` | `server.client.environment.hot` |

**Enable warnings:**
```ts
export default {
  future: {
    removeServerModuleGraph: 'warn',
    removeServerReloadModule: 'warn',
    removeServerPluginContainer: 'warn',
    removeServerHot: 'warn',
    removeServerTransformRequest: 'warn',
    removeServerWarmupRequest: 'warn',
  },
}
```

**Motivation:**
- In Vite v5: Single `ssr` boolean to identify environment
- In Vite v6: Multiple custom environments require environment-scoped APIs
- Benefits: APIs can be called without a Vite dev server instance

### 4. SSR Using `ModuleRunner` API

**Status:** Future Deprecation (introduced in v6.0)

**Migration:**

```js
// Before
const module = await server.ssrLoadModule(url)

// After
const module = await server.environments.ssr.runner.import(url)
```

**Enable warnings:**
```ts
export default {
  future: {
    removeSsrLoadModule: 'warn',
  },
}
```

**Benefits:**
- `server.ssrLoadModule` only works with `ssr` environment
- `ModuleRunner` supports custom environments
- Runner can execute in separate thread/process
- Better alignment with Environment API

**Stack traces:**
`server.ssrFixStacktrace` and `server.ssrRewriteStacktrace` are not needed with Module Runner APIs. Stack traces are automatically updated unless `sourcemapInterceptor` is set to `false`.

### 5. Shared Plugins During Build

**Status:** Future Default Change (introduced in v6.0)

**Migration for shared state:**

```js
// Before: Shared across all environments
function CountTransformedModulesPlugin() {
  let transformedModules
  return {
    name: 'count-transformed-modules',
    buildStart() {
      transformedModules = 0
    },
    transform(id) {
      transformedModules++
    },
    buildEnd() {
      console.log(transformedModules)
    },
  }
}

// After: Per-environment tracking
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    },
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

**Using `perEnvironmentState` helper:**

```js
import { perEnvironmentState } from 'vite'

function PerEnvironmentCountTransformedModulesPlugin() {
  const state = perEnvironmentState<{ count: number }>(() => ({ count: 0 }))
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state(this).count = 0
    },
    transform(id) {
      state(this).count++
    },
    buildEnd() {
      console.log(this.environment.name, state(this).count)
    }
  }
}
```

**Enable shared config build:**
```ts
export default {
  builder: {
    sharedConfigBuild: true,
  },
}
```

**Current behavior:**
- **Dev:** Plugins shared
- **Build:** Separate plugin instances per environment (default for backward compatibility)

**Future behavior:**
- Both dev and build: Plugins shared with per-environment filtering

---

## Backward Compatibility

### Current Vite Server API

The current Vite server API is **not deprecated** and is backward compatible with Vite 5.

**Mixed module graph:**
- `server.moduleGraph` returns a mixed view of client and ssr module graphs
- Backward compatible mixed module nodes returned from all methods
- Same scheme used for module nodes passed to `handleHotUpdate`

### Migration Timeline

Vite team **does not recommend** switching to Environment API yet. The goal is for a good portion of the user base to adopt Vite 6 first, so plugins don't need to maintain two versions.

**Adoption strategy:**
1. Vite 6.0: Environment API introduced, old APIs still supported
2. Future minor versions: Gather ecosystem feedback
3. Future major: Deprecate old APIs with clear migration path

### Opt-in Warnings

Enable future warnings to identify usage:

```ts
export default {
  future: {
    // Plugin hooks
    removePluginHookSsrArgument: 'warn',
    removePluginHookHandleHotUpdate: 'warn',

    // Server APIs
    removeServerModuleGraph: 'warn',
    removeServerReloadModule: 'warn',
    removeServerPluginContainer: 'warn',
    removeServerHot: 'warn',
    removeServerTransformRequest: 'warn',
    removeServerWarmupRequest: 'warn',

    // SSR
    removeSsrLoadModule: 'warn',
  },
}
```

---

## Environment API Reference Summary

### Top-Level Exports

**From `vite`:**
```ts
import {
  createServer,
  createFetchableDevEnvironment,
  isFetchableDevEnvironment,
  isRunnableDevEnvironment,
  perEnvironmentPlugin,
  perEnvironmentState,
  DevEnvironment,
  RunnableDevEnvironment,
  FetchableDevEnvironment,
} from 'vite'
```

**From `vite/module-runner`:**
```ts
import {
  ModuleRunner,
  ESModulesEvaluator,
  createNodeImportMeta,
} from 'vite/module-runner'
```

### Configuration Options

**Environment-Level:**
```ts
{
  define: Record<string, any>
  resolve: {
    conditions: string[]
    noExternal: boolean | string[]
    external: string[]
  }
  optimizeDeps: {
    include: string[]
    exclude: string[]
  }
  consumer: 'client' | 'server'
  dev: {
    createEnvironment: (name, config) => DevEnvironment
    warmup: string[]
  }
  build: {
    outDir: string
    createEnvironment: (name, config) => BuildEnvironment
  }
}
```

**Server-Level:**
```ts
{
  environments: Record<string, EnvironmentOptions>
  builder: {
    buildApp: (builder) => Promise<void>
    sharedConfigBuild: boolean
  }
  future: {
    removePluginHookSsrArgument: 'warn'
    removePluginHookHandleHotUpdate: 'warn'
    removeServerModuleGraph: 'warn'
    // ... other future flags
  }
}
```

**Plugin Options:**
```ts
{
  name: string
  applyToEnvironment?: (environment: DevEnvironment) => boolean | Plugin
  sharedDuringBuild?: boolean
  perEnvironmentStartEndDuringDev?: boolean

  // Hooks
  config?: (config) => UserConfig | void
  configEnvironment?: (name, options) => EnvironmentOptions | void
  hotUpdate?: (options: HotUpdateOptions) => Array<EnvironmentModuleNode> | void

  // Access environment in transform hooks
  resolveId(id, importer) {
    this.environment // DevEnvironment instance
  }
}
```

---

## Best Practices

### Project Structure

**Recommended:**
```
project/
├── public/              # Static assets (copied as-is)
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/          # Assets to transform (images, styles)
│   ├── components/      # Reusable components
│   ├── views/           # Route/page components
│   ├── router/          # Routing config
│   ├── store/           # State management
│   ├── utils/           # Utilities
│   ├── styles/          # Global styles
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
└── package.json
```

### Import Practices

**DO:**
```js
// Explicit file extensions
import Component from './Component.vue'
import utils from './utils.js'

// Named imports for tree-shaking
import { debounce } from 'lodash-es'

// Direct imports (avoid barrel files)
import { Button } from './components/Button'
```

**DON'T:**
```js
// Missing extensions (slower)
import Component from './Component'

// Default import (no tree-shaking)
import _ from 'lodash'

// Barrel file (processes all exports)
import { Button } from './components'
```

### Environment Variables

**DO:**
```
# .env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My App

# Non-prefixed (server-only, secret)
DATABASE_URL=postgresql://...
API_KEY=secret
```

**DON'T:**
```
# ❌ Exposing secrets
VITE_DATABASE_URL=postgresql://...
VITE_API_KEY=secret
```

### Asset Handling

**DO:**
```js
// Transform and optimize
import logo from './assets/logo.png'
<img src={logo} />

// Explicit query for special handling
import logoUrl from './assets/logo.svg?url'
import logoRaw from './assets/logo.svg?raw'
```

**DON'T:**
```html
<!-- ❌ No optimization -->
<img src="/src/assets/logo.png" />
```

### CSS Organization

**DO:**
```js
// Component-scoped styles
import styles from './Component.module.css'

// Global styles in main entry
import './styles/global.css'

// CSS code splitting (default)
build: {
  cssCodeSplit: true
}
```

### Plugin Usage

**DO:**
```js
// Only use necessary plugins
plugins: [
  vue(),
  // Only add if needed
]

// Use enforce for ordering
export default function myPlugin() {
  return {
    name: 'my-plugin',
    enforce: 'pre'  // Run before others
  }
}
```

### Build Configuration

**DO:**
```js
build: {
  // Appropriate target
  target: 'baseline-widely-available',

  // Sensible chunk size
  chunkSizeWarningLimit: 500,

  // Manual chunks for better caching
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router'],
        utils: ['lodash-es', 'axios']
      }
    }
  }
}
```

---

## Common Patterns

### Vue 3 SPA

**vite.config.js:**
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

**src/main.js:**
```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### React SPA

**vite.config.js:**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'  // or @vitejs/plugin-react

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

**src/main.jsx:**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### Library Build

**vite.config.js:**
```js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      formats: ['es', 'umd'],
      fileName: (format) => `my-lib.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'react'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React'
        }
      }
    }
  }
})
```

### Monorepo Setup

**Root vite.config.js:**
```js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: ['..']  // Allow serving files from parent
    }
  },

  resolve: {
    alias: {
      '@company/shared': resolve(__dirname, '../packages/shared/src')
    }
  },

  optimizeDeps: {
    include: ['@company/shared']  // Pre-bundle local packages
  }
})
```

### Custom Dev Server

**server.js:**
```js
import express from 'express'
import { createServer as createViteServer } from 'vite'

const app = express()

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom'
})

app.use(vite.middlewares)

app.get('/api/*', (req, res) => {
  // Custom API routes
})

app.listen(3000)
```

### Environment-Specific Config

**vite.config.js:**
```js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version)
    },

    build: {
      sourcemap: command === 'serve',
      minify: mode === 'production'
    },

    server: {
      port: env.PORT || 5173
    }
  }
})
```

---

## Anti-Patterns to Avoid

### 1. Using Relative public/ References

**❌ Wrong:**
```js
// In source code
import logo from '../public/logo.png'
```

**✅ Correct:**
```js
// Use src/assets for images in source code
import logo from '@/assets/logo.png'

// Or use public/ with absolute path in HTML
<img src="/logo.png" />
```

### 2. Importing Node.js Modules in Client Code

**❌ Wrong:**
```js
import fs from 'fs'
import path from 'path'

const data = fs.readFileSync('./data.json')
```

**✅ Correct:**
```js
// Use browser APIs
const data = await fetch('/data.json').then(r => r.json())

// Or use in server-side code only (SSR)
```

### 3. Not Using Environment Variables Properly

**❌ Wrong:**
```
# .env
VITE_SECRET_KEY=my-secret-key
```

```js
// Now exposed to client!
const secret = import.meta.env.VITE_SECRET_KEY
```

**✅ Correct:**
```
# .env (server-only)
SECRET_KEY=my-secret-key

# Public variables
VITE_API_URL=https://api.example.com
```

### 4. Large Dependencies in optimizeDeps.include

**❌ Wrong:**
```js
optimizeDeps: {
  include: ['massive-library']  // Pre-bundles everything
}
```

**✅ Correct:**
```js
// Only include what's actually imported
// Let Vite auto-discover most dependencies
optimizeDeps: {
  include: ['specific-deep-import/that-needs-help']
}
```

### 5. Not Handling Dynamic Import Errors

**❌ Wrong:**
```js
const module = await import('./module.js')
```

**✅ Correct:**
```js
const module = await import('./module.js').catch(err => {
  console.error('Failed to load module:', err)
  // Handle error (show error page, retry, etc.)
  return null
})
```

### 6. Barrel Files for Tree-Shaking

**❌ Wrong:**
```js
// components/index.js
export * from './Button'
export * from './Input'
export * from './Form'
// ...100 more components

// App.js
import { Button } from './components'  // Must process all exports
```

**✅ Correct:**
```js
// App.js
import { Button } from './components/Button'  // Direct import
```

### 7. Not Configuring base for Deployment

**❌ Wrong:**
```js
// Deploy to GitHub Pages without base config
export default defineConfig({})
```

**Result:**
```
// Assets not found
https://user.github.io/assets/index.js  ❌
```

**✅ Correct:**
```js
export default defineConfig({
  base: '/repo-name/'
})
```

**Result:**
```
// Assets found
https://user.github.io/repo-name/assets/index.js  ✅
```

### 8. Overusing import.meta.glob

**❌ Wrong:**
```js
// Loads ALL files in directory
const modules = import.meta.glob('./modules/**/*.js', { eager: true })
```

**✅ Correct:**
```js
// Load specific files or use lazy loading
const modules = import.meta.glob('./modules/feature-*.js')

// Only load when needed
for (const path in modules) {
  modules[path]().then(mod => {
    // Use module
  })
}
```

---

## Summary

Vite is a next-generation build tool that provides:

**Core Strengths:**
- ⚡ Lightning-fast dev server with native ESM
- 🔥 Instant HMR that stays fast regardless of app size
- 🛠️ Rich features out-of-the-box (TypeScript, JSX, CSS preprocessors)
- 📦 Optimized production builds with Rollup/Rolldown
- 🔌 Powerful plugin system (Rollup-compatible)
- 🌐 Framework-agnostic (Vue, React, Svelte, etc.)

**Best For:**
- Modern web applications
- Single-Page Applications (SPA)
- Server-Side Rendered apps (SSR)
- Static sites
- Component libraries
- Monorepos

**Key Concepts:**
1. **Native ESM in Development** - Leverage browser's native module system
2. **Pre-Bundling Dependencies** - esbuild-powered dependency optimization
3. **On-Demand Compilation** - Only transform files as requested
4. **Optimized Production Builds** - Rollup/Rolldown with smart defaults
5. **Universal Plugin Interface** - Shared between dev and build

**Version 7 Highlights:**
- Node.js 20.19+ / 22.12+ required
- Modern browser baseline (Chrome 107+, Firefox 104+, Safari 16+)
- Rolldown integration for faster builds
- Lightning CSS support
- Enhanced performance optimizations

---

**This bible covers Vite 7.x with comprehensive coverage of all features, configurations, APIs, and best practices from the official Vite documentation.**
