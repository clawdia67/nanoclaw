# TAILWIND CSS BIBLE

> Comprehensive knowledge document for AI agents implementing Tailwind CSS

**Version**: Tailwind CSS v3.4+
**Purpose**: Complete reference for Tailwind CSS utilities, configuration, and best practices
**Audience**: Developers, AI agents, and teams building with Tailwind CSS
**Token Count**: ~17,000 tokens (~8.3% of Claude's 200K context limit)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Philosophy](#core-philosophy)
3. [Configuration & Setup](#configuration--setup)
4. [Core Concepts](#core-concepts)
5. [Responsive Design](#responsive-design)
6. [State Variants](#state-variants)
7. [Dark Mode](#dark-mode)
8. [Layout Utilities](#layout-utilities)
9. [Flexbox](#flexbox)
10. [Grid](#grid)
11. [Spacing](#spacing)
12. [Sizing](#sizing)
13. [Typography](#typography)
14. [Backgrounds](#backgrounds)
15. [Borders](#borders)
16. [Effects](#effects)
17. [Filters](#filters)
18. [Tables](#tables)
19. [Transitions & Animations](#transitions--animations)
20. [Transforms](#transforms)
21. [Interactivity](#interactivity)
22. [SVG](#svg)
23. [Accessibility](#accessibility)
24. [Functions & Directives](#functions--directives)
25. [Customization](#customization)
26. [Best Practices](#best-practices)
27. [Common Patterns](#common-patterns)
28. [Quick Reference](#quick-reference)

---

## Introduction

### What is Tailwind CSS?

Tailwind CSS is a **utility-first CSS framework** that provides low-level utility classes to build custom designs without writing CSS. Instead of predefined components, Tailwind gives you building blocks to construct any design directly in your markup.

**Key Characteristics:**
- Utility-first approach
- Mobile-first responsive design
- Highly customizable via configuration
- Automatic purging of unused CSS
- No opinionated component styles
- Design system built into the framework

### Why Utility-First?

**Benefits:**
- No wasted energy inventing class names
- CSS stops growing (everything is reusable)
- Making changes feels safer (local changes, not global)
- Consistent design system by default
- Rapid prototyping and development

**Common Misconception:**
"Isn't this just inline styles?" NO. Tailwind provides:
- Design constraints (design system)
- Responsive design (media queries)
- State variants (hover, focus, etc.)
- Consistent spacing, colors, typography

---

## Core Philosophy

### Utility-First Workflow

Instead of writing CSS:

```html
<!-- Traditional Approach -->
<div class="chat-notification">
  <div class="chat-notification-logo-wrapper">
    <img class="chat-notification-logo" src="/img/logo.svg">
  </div>
  <div class="chat-notification-content">
    <h4 class="chat-notification-title">ChitChat</h4>
    <p class="chat-notification-message">You have a new message!</p>
  </div>
</div>

<style>
  .chat-notification { display: flex; max-width: 24rem; margin: 0 auto; padding: 1.5rem; border-radius: 0.5rem; background-color: #fff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
  .chat-notification-logo-wrapper { flex-shrink: 0; }
  .chat-notification-logo { height: 3rem; width: 3rem; }
  /* ... */
</style>
```

Use utility classes:

```html
<!-- Tailwind Approach -->
<div class="max-w-sm mx-auto p-6 flex items-center bg-white rounded-lg shadow-lg space-x-4">
  <div class="shrink-0">
    <img class="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo">
  </div>
  <div>
    <div class="text-xl font-medium text-black">ChitChat</div>
    <p class="text-slate-500">You have a new message!</p>
  </div>
</div>
```

### Component Extraction

When you find repeated patterns, extract components (not CSS classes):

```jsx
// VacationCard.jsx
function VacationCard({ img, imgAlt, title, pricing, url }) {
  return (
    <div class="max-w-sm mx-auto p-6 bg-white rounded-lg shadow-lg">
      <img class="rounded" src={img} alt={imgAlt} />
      <div class="mt-4">
        <h3 class="text-lg font-bold text-slate-900">{title}</h3>
        <p class="mt-2 text-slate-600">{pricing}</p>
      </div>
    </div>
  )
}
```

---

## Configuration & Setup

### Creating Configuration File

```bash
npx tailwindcss init
```

Creates `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Full Configuration

```bash
npx tailwindcss init --full
```

### TypeScript Configuration

```bash
npx tailwindcss init --ts
```

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

### Essential Configuration Options

```js
module.exports = {
  // Content paths for class detection
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue,svelte}',
    './pages/**/*.{html,js,jsx,ts,tsx}',
    './components/**/*.{html,js,jsx,ts,tsx}',
  ],

  // Dark mode strategy
  darkMode: 'selector', // or 'media'

  // Theme customization
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    colors: {
      // Custom colors
    },
    spacing: {
      // Custom spacing
    },
    extend: {
      // Extend default theme
    }
  },

  // Plugins
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],

  // Prefix for all classes
  prefix: '', // e.g., 'tw-'

  // Important strategy
  important: false, // or '#app' or true

  // Separator for variants
  separator: ':', // default

  // Core plugins to disable
  corePlugins: {
    // float: false,
  },
}
```

### Content Configuration

The `content` array tells Tailwind where to look for class names:

```js
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
}
```

**Important:** Tailwind scans these files and only includes CSS for classes that are used.

### CSS File Setup

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Layer Order:**
1. `base` - Reset styles, default HTML element styles
2. `components` - Component-level styles
3. `utilities` - Utility classes

---

## Core Concepts

### Design Tokens

Tailwind provides a comprehensive design system through its default theme:

**Spacing Scale:** `0`, `px`, `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, `3.5`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `14`, `16`, `20`, `24`, `28`, `32`, `36`, `40`, `44`, `48`, `52`, `56`, `60`, `64`, `72`, `80`, `96`

**Color Palette:** `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

**Color Shades:** `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`

### Arbitrary Values

Use square brackets for one-off custom values:

```html
<!-- Custom spacing -->
<div class="top-[117px] lg:top-[344px]">

<!-- Custom colors -->
<div class="bg-[#bada55] text-[22px]">

<!-- Custom properties -->
<div class="[mask-type:luminance]">

<!-- CSS variables -->
<div class="bg-[--my-color]">

<!-- With theme function -->
<div class="grid grid-cols-[fit-content(theme(spacing.32))]">
```

**Handling Whitespace:** Use underscore (`_`) for spaces:

```html
<div class="grid grid-cols-[1fr_500px_2fr]">
```

**Type Hints:** Resolve ambiguity with CSS data types:

```html
<!-- Font size -->
<div class="text-[length:var(--my-var)]">

<!-- Color -->
<div class="text-[color:var(--my-var)]">
```

### Arbitrary Variants

Create custom selectors on the fly:

```html
<ul>
  <li class="lg:[&:nth-child(3)]:hover:underline">Item</li>
</ul>
```

Generates:

```css
@media (min-width: 1024px) {
  .lg\:\[\&\:nth-child\(3\)\]\:hover\:underline:hover:nth-child(3) {
    text-decoration-line: underline;
  }
}
```

---

## Responsive Design

### Mobile-First Breakpoints

Tailwind uses a mobile-first breakpoint system:

| Breakpoint | Min Width | CSS |
|------------|-----------|-----|
| `sm` | 640px | `@media (min-width: 640px) { ... }` |
| `md` | 768px | `@media (min-width: 768px) { ... }` |
| `lg` | 1024px | `@media (min-width: 1024px) { ... }` |
| `xl` | 1280px | `@media (min-width: 1280px) { ... }` |
| `2xl` | 1536px | `@media (min-width: 1536px) { ... }` |

### Usage

```html
<!-- Width of 16 by default, 32 on medium screens, 48 on large screens -->
<img class="w-16 md:w-32 lg:w-48" src="...">
```

**Mobile-First Principle:**
- Unprefixed utilities apply to ALL screen sizes
- Prefixed utilities apply at that breakpoint AND ABOVE

```html
<!-- WRONG: Don't use sm: for mobile -->
<div class="sm:text-center"></div>

<!-- RIGHT: Use unprefixed for mobile, override at larger sizes -->
<div class="text-center sm:text-left"></div>
```

### Targeting Breakpoint Ranges

Stack responsive modifier with `max-*`:

```html
<!-- Only between md and lg -->
<div class="md:max-lg:flex">
  <!-- ... -->
</div>
```

**Max-width modifiers:**

| Modifier | Media Query |
|----------|-------------|
| `max-sm` | `@media not all and (min-width: 640px) { ... }` |
| `max-md` | `@media not all and (min-width: 768px) { ... }` |
| `max-lg` | `@media not all and (min-width: 1024px) { ... }` |
| `max-xl` | `@media not all and (min-width: 1280px) { ... }` |
| `max-2xl` | `@media not all and (min-width: 1536px) { ... }` |

### Custom Breakpoints

```js
module.exports = {
  theme: {
    screens: {
      'tablet': '640px',
      'laptop': '1024px',
      'desktop': '1280px',
    },
  }
}
```

### Arbitrary Breakpoints

```html
<div class="min-[320px]:text-center max-[600px]:bg-sky-300">
  <!-- ... -->
</div>
```

---

## State Variants

### Hover, Focus, and Other States

Tailwind includes variants for common pseudo-classes:

```html
<!-- Hover -->
<button class="bg-blue-500 hover:bg-blue-700">
  Hover me
</button>

<!-- Focus -->
<input class="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">

<!-- Active -->
<button class="bg-blue-500 active:bg-blue-800">
  Click me
</button>

<!-- Disabled -->
<button class="bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
  Submit
</button>

<!-- Group hover -->
<div class="group">
  <img class="group-hover:opacity-75" src="...">
  <h3 class="group-hover:text-blue-600">Title</h3>
</div>

<!-- Peer state -->
<input type="checkbox" class="peer" />
<div class="peer-checked:bg-blue-500">
  This changes when checkbox is checked
</div>

<!-- First, last, odd, even -->
<li class="first:rounded-t-lg last:rounded-b-lg odd:bg-gray-100">

<!-- Required, invalid, disabled -->
<input class="required:border-red-500 invalid:border-red-500 disabled:opacity-50">
```

### Complete List of State Variants

**Interactive:**
- `hover:` - Mouse hover
- `focus:` - Keyboard focus
- `focus-within:` - Child has focus
- `focus-visible:` - Keyboard focus visible
- `active:` - Element is being clicked
- `visited:` - Link has been visited

**Form States:**
- `checked:` - Checkbox/radio is checked
- `indeterminate:` - Checkbox is indeterminate
- `default:` - Form element is default
- `required:` - Form element is required
- `valid:` - Form element is valid
- `invalid:` - Form element is invalid
- `in-range:` - Input value in range
- `out-of-range:` - Input value out of range
- `placeholder-shown:` - Placeholder is shown
- `autofill:` - Input has been autofilled
- `read-only:` - Element is read-only
- `disabled:` - Element is disabled

**Structural:**
- `first:` - First child
- `last:` - Last child
- `only:` - Only child
- `odd:` - Odd child
- `even:` - Even child
- `first-of-type:` - First of type
- `last-of-type:` - Last of type
- `only-of-type:` - Only of type
- `empty:` - No children

**Group/Peer:**
- `group-hover:` - Parent is hovered
- `group-focus:` - Parent is focused
- `peer-checked:` - Sibling is checked
- `peer-invalid:` - Sibling is invalid

**Content:**
- `before:` - `::before` pseudo-element
- `after:` - `::after` pseudo-element
- `placeholder:` - Placeholder text
- `file:` - File input button
- `marker:` - List marker
- `selection:` - Text selection
- `first-line:` - First line of text
- `first-letter:` - First letter of text

### Stacking Variants

Variants can be stacked in any order:

```html
<button class="dark:md:hover:bg-blue-500">
  <!-- Dark mode, medium screens and up, on hover -->
</button>
```

**Recommended order:**
1. Responsive variants (`sm:`, `md:`, `lg:`)
2. State variants (`hover:`, `focus:`)
3. Dark mode (`dark:`)

```html
<button class="md:hover:dark:bg-blue-500">
  <!-- Best practice order -->
</button>
```

---

## Dark Mode

### Strategies

**Media Strategy (default):**

Uses `prefers-color-scheme` media query:

```js
module.exports = {
  darkMode: 'media',
}
```

```html
<div class="bg-white dark:bg-slate-800">
  <!-- Automatically dark when OS is in dark mode -->
</div>
```

**Selector Strategy (manual toggle):**

```js
module.exports = {
  darkMode: 'selector',
}
```

```html
<!-- Dark mode NOT enabled -->
<html>
<body>
  <div class="bg-white dark:bg-black">
    <!-- Will be white -->
  </div>
</body>
</html>

<!-- Dark mode enabled -->
<html class="dark">
<body>
  <div class="bg-white dark:bg-black">
    <!-- Will be black -->
  </div>
</body>
</html>
```

### Custom Selector

```js
module.exports = {
  darkMode: ['selector', '[data-mode="dark"]'],
}
```

### Multiple Selectors

```js
module.exports = {
  darkMode: ['variant', [
    '@media (prefers-color-scheme: dark) { &:not(.light *) }',
    '&:is(.dark *)',
  ]],
}
```

### Implementation Example

```js
// Add to <head> to avoid flash of incorrect theme
document.documentElement.classList.toggle(
  'dark',
  localStorage.theme === 'dark' ||
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
)

// Set light mode
localStorage.theme = 'light'

// Set dark mode
localStorage.theme = 'dark'

// Respect OS preference
localStorage.removeItem('theme')
```

### Dark Mode Usage

```html
<div class="bg-white dark:bg-slate-800">
  <h1 class="text-slate-900 dark:text-white">
    Dark Mode Title
  </h1>
  <p class="text-slate-600 dark:text-slate-400">
    This text adapts to dark mode
  </p>
</div>
```

---

## Layout Utilities

### Display

```html
<!-- Block & Inline -->
<div class="block">Block</div>
<div class="inline-block">Inline Block</div>
<div class="inline">Inline</div>

<!-- Flexbox -->
<div class="flex">Flex Container</div>
<div class="inline-flex">Inline Flex</div>

<!-- Grid -->
<div class="grid">Grid Container</div>
<div class="inline-grid">Inline Grid</div>

<!-- Table -->
<div class="table">Table</div>
<div class="table-row">Table Row</div>
<div class="table-cell">Table Cell</div>

<!-- Flow -->
<div class="flow-root">Flow Root</div>

<!-- Hidden -->
<div class="hidden">Hidden</div>
```

### Position

```html
<!-- Position Types -->
<div class="static">Static (default)</div>
<div class="relative">Relative</div>
<div class="absolute">Absolute</div>
<div class="fixed">Fixed</div>
<div class="sticky">Sticky</div>

<!-- Positioning -->
<div class="absolute top-0 right-0">Top Right</div>
<div class="absolute bottom-4 left-4">Bottom Left with offset</div>
<div class="absolute inset-0">Cover parent</div>
<div class="absolute inset-x-0 top-0">Horizontal stretch</div>
<div class="absolute inset-y-0 right-0">Vertical stretch</div>
```

**Inset values:** `0`, `px`, `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, `3.5`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `14`, `16`, `20`, `24`, `28`, `32`, `36`, `40`, `44`, `48`, `52`, `56`, `60`, `64`, `72`, `80`, `96`, `auto`, `1/2`, `1/3`, `2/3`, `1/4`, `2/4`, `3/4`, `full`

### Float & Clear

```html
<!-- Float -->
<div class="float-left">Float Left</div>
<div class="float-right">Float Right</div>
<div class="float-none">No Float</div>

<!-- Clear -->
<div class="clear-left">Clear Left</div>
<div class="clear-right">Clear Right</div>
<div class="clear-both">Clear Both</div>
<div class="clear-none">No Clear</div>
```

### Overflow

```html
<!-- All sides -->
<div class="overflow-auto">Auto</div>
<div class="overflow-hidden">Hidden</div>
<div class="overflow-visible">Visible</div>
<div class="overflow-scroll">Scroll</div>

<!-- X-axis -->
<div class="overflow-x-auto">Horizontal scroll</div>
<div class="overflow-x-hidden">Hide horizontal overflow</div>

<!-- Y-axis -->
<div class="overflow-y-auto">Vertical scroll</div>
<div class="overflow-y-hidden">Hide vertical overflow</div>

<!-- Overscroll behavior -->
<div class="overscroll-auto">Auto</div>
<div class="overscroll-contain">Contain</div>
<div class="overscroll-none">None</div>
```

### Z-Index

```html
<div class="z-0">z-index: 0</div>
<div class="z-10">z-index: 10</div>
<div class="z-20">z-index: 20</div>
<div class="z-30">z-index: 30</div>
<div class="z-40">z-index: 40</div>
<div class="z-50">z-index: 50</div>
<div class="z-auto">z-index: auto</div>
```

### Visibility

```html
<div class="visible">Visible</div>
<div class="invisible">Invisible (takes up space)</div>
<div class="collapse">Collapse (table elements)</div>
```

### Isolation

Control whether an element creates a new stacking context:

```html
<div class="isolate">Creates new stacking context</div>
<div class="isolation-auto">Default behavior</div>
```

**Use cases:**
- Isolating z-index stacking contexts
- Containing blend mode effects
- Preventing mix-blend-mode from affecting parent

**Example with blend modes:**
```html
<div class="isolate">
  <div class="mix-blend-multiply">
    This blend mode won't affect elements outside the parent
  </div>
</div>
```

### Columns

Create multi-column layouts (newspaper-style):

```html
<!-- Column count -->
<div class="columns-1">Single column</div>
<div class="columns-2">Two columns</div>
<div class="columns-3">Three columns</div>
<div class="columns-4">Four columns</div>
<div class="columns-auto">Auto columns</div>

<!-- Column width (responsive) -->
<div class="columns-3xs">columns: 16rem (256px)</div>
<div class="columns-2xs">columns: 18rem (288px)</div>
<div class="columns-xs">columns: 20rem (320px)</div>
<div class="columns-sm">columns: 24rem (384px)</div>
<div class="columns-md">columns: 28rem (448px)</div>
<div class="columns-lg">columns: 32rem (512px)</div>
<div class="columns-xl">columns: 36rem (576px)</div>

<!-- Arbitrary values -->
<div class="columns-[10rem]">Custom column width</div>
```

**Note:** This is CSS multi-column layout, different from `grid-cols-*` (Grid) or `flex` (Flexbox).

### Container

```html
<!-- Responsive container -->
<div class="container mx-auto px-4">
  <!-- Content -->
</div>
```

**Default breakpoints:**
- `sm`: `max-width: 640px`
- `md`: `max-width: 768px`
- `lg`: `max-width: 1024px`
- `xl`: `max-width: 1280px`
- `2xl`: `max-width: 1536px`

**Customize container:**

```js
module.exports = {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  }
}
```

---

## Flexbox

### Flex Container

```html
<!-- Direction -->
<div class="flex flex-row">Horizontal (default)</div>
<div class="flex flex-row-reverse">Horizontal reversed</div>
<div class="flex flex-col">Vertical</div>
<div class="flex flex-col-reverse">Vertical reversed</div>

<!-- Wrapping -->
<div class="flex flex-wrap">Wrap</div>
<div class="flex flex-wrap-reverse">Wrap reversed</div>
<div class="flex flex-nowrap">No wrap</div>

<!-- Justify Content (main axis) -->
<div class="flex justify-start">Start</div>
<div class="flex justify-end">End</div>
<div class="flex justify-center">Center</div>
<div class="flex justify-between">Space Between</div>
<div class="flex justify-around">Space Around</div>
<div class="flex justify-evenly">Space Evenly</div>

<!-- Align Items (cross axis) -->
<div class="flex items-start">Start</div>
<div class="flex items-end">End</div>
<div class="flex items-center">Center</div>
<div class="flex items-baseline">Baseline</div>
<div class="flex items-stretch">Stretch (default)</div>

<!-- Align Content (multiple rows) -->
<div class="flex content-start">Start</div>
<div class="flex content-end">End</div>
<div class="flex content-center">Center</div>
<div class="flex content-between">Space Between</div>
<div class="flex content-around">Space Around</div>
<div class="flex content-evenly">Space Evenly</div>

<!-- Place Content (shorthand) -->
<div class="flex place-content-center">Center center</div>
<div class="flex place-content-between">Between</div>
```

### Flex Items

```html
<!-- Flex -->
<div class="flex-1">flex: 1 1 0%</div>
<div class="flex-auto">flex: 1 1 auto</div>
<div class="flex-initial">flex: 0 1 auto</div>
<div class="flex-none">flex: none</div>

<!-- Grow -->
<div class="grow">flex-grow: 1</div>
<div class="grow-0">flex-grow: 0</div>

<!-- Shrink -->
<div class="shrink">flex-shrink: 1</div>
<div class="shrink-0">flex-shrink: 0</div>

<!-- Order -->
<div class="order-first">order: -9999</div>
<div class="order-last">order: 9999</div>
<div class="order-none">order: 0</div>
<div class="order-1">order: 1</div>
<div class="order-12">order: 12</div>

<!-- Align Self -->
<div class="self-auto">auto</div>
<div class="self-start">flex-start</div>
<div class="self-end">flex-end</div>
<div class="self-center">center</div>
<div class="self-stretch">stretch</div>
<div class="self-baseline">baseline</div>

<!-- Flex Basis -->
<div class="basis-0">flex-basis: 0px</div>
<div class="basis-full">flex-basis: 100%</div>
<div class="basis-1/2">flex-basis: 50%</div>
<div class="basis-1/3">flex-basis: 33.333333%</div>
```

### Gap

```html
<!-- All sides -->
<div class="flex gap-4">gap: 1rem</div>

<!-- X-axis only -->
<div class="flex gap-x-4">column-gap: 1rem</div>

<!-- Y-axis only -->
<div class="flex gap-y-4">row-gap: 1rem</div>
```

**Gap values:** `0`, `px`, `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, `3.5`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `14`, `16`, `20`, `24`, `28`, `32`, `36`, `40`, `44`, `48`, `52`, `56`, `60`, `64`, `72`, `80`, `96`

---

## Grid

### Grid Container

```html
<!-- Grid Template Columns -->
<div class="grid grid-cols-1">1 column</div>
<div class="grid grid-cols-2">2 columns</div>
<div class="grid grid-cols-3">3 columns</div>
<div class="grid grid-cols-12">12 columns</div>
<div class="grid grid-cols-none">none</div>

<!-- Grid Template Rows -->
<div class="grid grid-rows-1">1 row</div>
<div class="grid grid-rows-6">6 rows</div>

<!-- Gap -->
<div class="grid gap-4">gap: 1rem</div>
<div class="grid gap-x-4 gap-y-8">Different x/y gap</div>

<!-- Grid Auto Flow -->
<div class="grid grid-flow-row">Row (default)</div>
<div class="grid grid-flow-col">Column</div>
<div class="grid grid-flow-dense">Dense</div>
<div class="grid grid-flow-row-dense">Row dense</div>
<div class="grid grid-flow-col-dense">Column dense</div>

<!-- Grid Auto Columns -->
<div class="grid auto-cols-auto">auto</div>
<div class="grid auto-cols-min">min-content</div>
<div class="grid auto-cols-max">max-content</div>
<div class="grid auto-cols-fr">1fr</div>

<!-- Grid Auto Rows -->
<div class="grid auto-rows-auto">auto</div>
<div class="grid auto-rows-min">min-content</div>
<div class="grid auto-rows-max">max-content</div>
<div class="grid auto-rows-fr">1fr</div>
```

### Grid Items

```html
<!-- Column Span -->
<div class="col-span-1">Span 1 column</div>
<div class="col-span-6">Span 6 columns</div>
<div class="col-span-full">Span all columns</div>

<!-- Column Start/End -->
<div class="col-start-1">Start at column 1</div>
<div class="col-start-2 col-end-4">Columns 2-4</div>
<div class="col-end-auto">Auto end</div>

<!-- Row Span -->
<div class="row-span-1">Span 1 row</div>
<div class="row-span-3">Span 3 rows</div>
<div class="row-span-full">Span all rows</div>

<!-- Row Start/End -->
<div class="row-start-1">Start at row 1</div>
<div class="row-start-2 row-end-4">Rows 2-4</div>

<!-- Justify & Align Self -->
<div class="justify-self-auto">Auto</div>
<div class="justify-self-start">Start</div>
<div class="justify-self-center">Center</div>
<div class="justify-self-end">End</div>
<div class="justify-self-stretch">Stretch</div>

<div class="self-auto">Auto</div>
<div class="self-start">Start</div>
<div class="self-center">Center</div>
<div class="self-end">End</div>
<div class="self-stretch">Stretch</div>

<!-- Place Self (shorthand) -->
<div class="place-self-auto">auto</div>
<div class="place-self-center">center</div>
<div class="place-self-end">end</div>
```

### Grid Alignment

```html
<!-- Justify Items -->
<div class="grid justify-items-start">All items start</div>
<div class="grid justify-items-center">All items center</div>
<div class="grid justify-items-end">All items end</div>
<div class="grid justify-items-stretch">All items stretch</div>

<!-- Align Items -->
<div class="grid items-start">All items start</div>
<div class="grid items-center">All items center</div>
<div class="grid items-end">All items end</div>
<div class="grid items-stretch">All items stretch</div>

<!-- Place Items (shorthand) -->
<div class="grid place-items-center">Center all items</div>
<div class="grid place-items-end">End all items</div>
```

---

## Spacing

### Padding

```html
<!-- All sides -->
<div class="p-4">padding: 1rem</div>
<div class="p-0">padding: 0</div>
<div class="p-px">padding: 1px</div>

<!-- Horizontal -->
<div class="px-4">padding-left: 1rem; padding-right: 1rem</div>

<!-- Vertical -->
<div class="py-4">padding-top: 1rem; padding-bottom: 1rem</div>

<!-- Individual sides -->
<div class="pt-4">padding-top: 1rem</div>
<div class="pr-4">padding-right: 1rem</div>
<div class="pb-4">padding-bottom: 1rem</div>
<div class="pl-4">padding-left: 1rem</div>

<!-- Start/End (logical) -->
<div class="ps-4">padding-inline-start: 1rem</div>
<div class="pe-4">padding-inline-end: 1rem</div>
```

### Margin

```html
<!-- All sides -->
<div class="m-4">margin: 1rem</div>
<div class="m-auto">margin: auto</div>

<!-- Horizontal -->
<div class="mx-4">margin-left: 1rem; margin-right: 1rem</div>
<div class="mx-auto">Center horizontally</div>

<!-- Vertical -->
<div class="my-4">margin-top: 1rem; margin-bottom: 1rem</div>

<!-- Individual sides -->
<div class="mt-4">margin-top: 1rem</div>
<div class="mr-4">margin-right: 1rem</div>
<div class="mb-4">margin-bottom: 1rem</div>
<div class="ml-4">margin-left: 1rem</div>

<!-- Negative margins -->
<div class="-m-4">margin: -1rem</div>
<div class="-mt-8">margin-top: -2rem</div>
<div class="-mx-4">Negative horizontal margin</div>

<!-- Start/End (logical) -->
<div class="ms-4">margin-inline-start: 1rem</div>
<div class="me-4">margin-inline-end: 1rem</div>
```

### Space Between

```html
<!-- Horizontal spacing between children -->
<div class="flex space-x-4">
  <div>Child 1</div>
  <div>Child 2</div>
  <div>Child 3</div>
</div>

<!-- Vertical spacing between children -->
<div class="space-y-4">
  <div>Child 1</div>
  <div>Child 2</div>
  <div>Child 3</div>
</div>

<!-- Reverse (for flex-row-reverse or flex-col-reverse) -->
<div class="flex flex-row-reverse space-x-reverse space-x-4">
  <div>Child 1</div>
  <div>Child 2</div>
</div>
```

**Spacing Scale:**
- `0` → `0px`
- `px` → `1px`
- `0.5` → `0.125rem` (2px)
- `1` → `0.25rem` (4px)
- `1.5` → `0.375rem` (6px)
- `2` → `0.5rem` (8px)
- `2.5` → `0.625rem` (10px)
- `3` → `0.75rem` (12px)
- `3.5` → `0.875rem` (14px)
- `4` → `1rem` (16px)
- `5` → `1.25rem` (20px)
- `6` → `1.5rem` (24px)
- `7` → `1.75rem` (28px)
- `8` → `2rem` (32px)
- `9` → `2.25rem` (36px)
- `10` → `2.5rem` (40px)
- `11` → `2.75rem` (44px)
- `12` → `3rem` (48px)
- `14` → `3.5rem` (56px)
- `16` → `4rem` (64px)
- `20` → `5rem` (80px)
- `24` → `6rem` (96px)
- `28` → `7rem` (112px)
- `32` → `8rem` (128px)
- `36` → `9rem` (144px)
- `40` → `10rem` (160px)
- `44` → `11rem` (176px)
- `48` → `12rem` (192px)
- `52` → `13rem` (208px)
- `56` → `14rem` (224px)
- `60` → `15rem` (240px)
- `64` → `16rem` (256px)
- `72` → `18rem` (288px)
- `80` → `20rem` (320px)
- `96` → `24rem` (384px)

---

## Sizing

### Width

```html
<!-- Fixed widths -->
<div class="w-0">width: 0px</div>
<div class="w-px">width: 1px</div>
<div class="w-0.5">width: 0.125rem</div>
<div class="w-96">width: 24rem</div>

<!-- Fractional widths -->
<div class="w-1/2">width: 50%</div>
<div class="w-1/3">width: 33.333333%</div>
<div class="w-2/3">width: 66.666667%</div>
<div class="w-1/4">width: 25%</div>
<div class="w-3/4">width: 75%</div>
<div class="w-1/5">width: 20%</div>
<div class="w-1/12">width: 8.333333%</div>

<!-- Full & screen -->
<div class="w-full">width: 100%</div>
<div class="w-screen">width: 100vw</div>

<!-- Min/max -->
<div class="w-min">width: min-content</div>
<div class="w-max">width: max-content</div>
<div class="w-fit">width: fit-content</div>

<!-- Auto -->
<div class="w-auto">width: auto</div>
```

### Height

```html
<!-- Fixed heights -->
<div class="h-0">height: 0px</div>
<div class="h-px">height: 1px</div>
<div class="h-96">height: 24rem</div>

<!-- Fractional heights -->
<div class="h-1/2">height: 50%</div>
<div class="h-full">height: 100%</div>

<!-- Screen -->
<div class="h-screen">height: 100vh</div>
<div class="h-svh">height: 100svh (small viewport)</div>
<div class="h-lvh">height: 100lvh (large viewport)</div>
<div class="h-dvh">height: 100dvh (dynamic viewport)</div>

<!-- Min/max -->
<div class="h-min">height: min-content</div>
<div class="h-max">height: max-content</div>
<div class="h-fit">height: fit-content</div>
```

### Min/Max Width

```html
<!-- Min Width -->
<div class="min-w-0">min-width: 0px</div>
<div class="min-w-full">min-width: 100%</div>
<div class="min-w-min">min-width: min-content</div>
<div class="min-w-max">min-width: max-content</div>
<div class="min-w-fit">min-width: fit-content</div>

<!-- Max Width -->
<div class="max-w-none">max-width: none</div>
<div class="max-w-xs">max-width: 20rem</div>
<div class="max-w-sm">max-width: 24rem</div>
<div class="max-w-md">max-width: 28rem</div>
<div class="max-w-lg">max-width: 32rem</div>
<div class="max-w-xl">max-width: 36rem</div>
<div class="max-w-2xl">max-width: 42rem</div>
<div class="max-w-3xl">max-width: 48rem</div>
<div class="max-w-4xl">max-width: 56rem</div>
<div class="max-w-5xl">max-width: 64rem</div>
<div class="max-w-6xl">max-width: 72rem</div>
<div class="max-w-7xl">max-width: 80rem</div>
<div class="max-w-full">max-width: 100%</div>
<div class="max-w-screen-sm">max-width: 640px</div>
<div class="max-w-screen-md">max-width: 768px</div>
<div class="max-w-screen-lg">max-width: 1024px</div>
<div class="max-w-screen-xl">max-width: 1280px</div>
<div class="max-w-screen-2xl">max-width: 1536px</div>
```

### Min/Max Height

```html
<!-- Min Height -->
<div class="min-h-0">min-height: 0px</div>
<div class="min-h-full">min-height: 100%</div>
<div class="min-h-screen">min-height: 100vh</div>
<div class="min-h-min">min-height: min-content</div>
<div class="min-h-max">min-height: max-content</div>
<div class="min-h-fit">min-height: fit-content</div>

<!-- Max Height -->
<div class="max-h-0">max-height: 0px</div>
<div class="max-h-96">max-height: 24rem</div>
<div class="max-h-full">max-height: 100%</div>
<div class="max-h-screen">max-height: 100vh</div>
<div class="max-h-min">max-height: min-content</div>
<div class="max-h-max">max-height: max-content</div>
<div class="max-h-fit">max-height: fit-content</div>
```

### Size (Width & Height)

```html
<!-- Sets both width and height -->
<div class="size-10">width: 2.5rem; height: 2.5rem</div>
<div class="size-full">width: 100%; height: 100%</div>
<div class="size-1/2">width: 50%; height: 50%</div>
```

### Aspect Ratio

Control the aspect ratio of an element:

```html
<!-- Common ratios -->
<iframe class="aspect-auto">aspect-ratio: auto</iframe>
<iframe class="aspect-square">aspect-ratio: 1 / 1</iframe>
<iframe class="aspect-video">aspect-ratio: 16 / 9</iframe>

<!-- Arbitrary ratios -->
<iframe class="aspect-[4/3]">aspect-ratio: 4 / 3</iframe>
<iframe class="aspect-[21/9]">aspect-ratio: 21 / 9 (ultrawide)</iframe>
<iframe class="aspect-[9/16]">aspect-ratio: 9 / 16 (portrait video)</iframe>
<iframe class="aspect-[1.618]">aspect-ratio: 1.618 (golden ratio)</iframe>
```

**Common use cases:**
```html
<!-- Responsive video embed -->
<iframe class="w-full aspect-video" src="https://youtube.com/..."></iframe>

<!-- Square profile image -->
<img class="w-32 aspect-square object-cover" src="..." />

<!-- Custom aspect ratio card -->
<div class="aspect-[3/2] bg-cover bg-center" style="background-image: url(...)">
  <!-- Card content -->
</div>
```

**Browser support:** Native `aspect-ratio` CSS property. For older browsers (Safari < 15), use the [@tailwindcss/aspect-ratio](https://github.com/tailwindlabs/tailwindcss-aspect-ratio) plugin.

---

## Typography

### Font Family

```html
<div class="font-sans">sans-serif font</div>
<div class="font-serif">serif font</div>
<div class="font-mono">monospace font</div>
```

**Default font stacks:**
- `sans`: `ui-sans-serif, system-ui, sans-serif`
- `serif`: `ui-serif, Georgia, Cambria, serif`
- `mono`: `ui-monospace, Menlo, Monaco, monospace`

### Font Size

```html
<div class="text-xs">font-size: 0.75rem; line-height: 1rem</div>
<div class="text-sm">font-size: 0.875rem; line-height: 1.25rem</div>
<div class="text-base">font-size: 1rem; line-height: 1.5rem</div>
<div class="text-lg">font-size: 1.125rem; line-height: 1.75rem</div>
<div class="text-xl">font-size: 1.25rem; line-height: 1.75rem</div>
<div class="text-2xl">font-size: 1.5rem; line-height: 2rem</div>
<div class="text-3xl">font-size: 1.875rem; line-height: 2.25rem</div>
<div class="text-4xl">font-size: 2.25rem; line-height: 2.5rem</div>
<div class="text-5xl">font-size: 3rem; line-height: 1</div>
<div class="text-6xl">font-size: 3.75rem; line-height: 1</div>
<div class="text-7xl">font-size: 4.5rem; line-height: 1</div>
<div class="text-8xl">font-size: 6rem; line-height: 1</div>
<div class="text-9xl">font-size: 8rem; line-height: 1</div>
```

### Font Weight

```html
<div class="font-thin">font-weight: 100</div>
<div class="font-extralight">font-weight: 200</div>
<div class="font-light">font-weight: 300</div>
<div class="font-normal">font-weight: 400</div>
<div class="font-medium">font-weight: 500</div>
<div class="font-semibold">font-weight: 600</div>
<div class="font-bold">font-weight: 700</div>
<div class="font-extrabold">font-weight: 800</div>
<div class="font-black">font-weight: 900</div>
```

### Font Style

```html
<div class="italic">font-style: italic</div>
<div class="not-italic">font-style: normal</div>
```

### Line Height

```html
<div class="leading-none">line-height: 1</div>
<div class="leading-tight">line-height: 1.25</div>
<div class="leading-snug">line-height: 1.375</div>
<div class="leading-normal">line-height: 1.5</div>
<div class="leading-relaxed">line-height: 1.625</div>
<div class="leading-loose">line-height: 2</div>
<div class="leading-3">line-height: .75rem</div>
<div class="leading-10">line-height: 2.5rem</div>
```

### Letter Spacing

```html
<div class="tracking-tighter">letter-spacing: -0.05em</div>
<div class="tracking-tight">letter-spacing: -0.025em</div>
<div class="tracking-normal">letter-spacing: 0em</div>
<div class="tracking-wide">letter-spacing: 0.025em</div>
<div class="tracking-wider">letter-spacing: 0.05em</div>
<div class="tracking-widest">letter-spacing: 0.1em</div>
```

### Text Alignment

```html
<div class="text-left">text-align: left</div>
<div class="text-center">text-align: center</div>
<div class="text-right">text-align: right</div>
<div class="text-justify">text-align: justify</div>
<div class="text-start">text-align: start</div>
<div class="text-end">text-align: end</div>
```

### Text Color

```html
<!-- Slate -->
<div class="text-slate-50">Lightest slate</div>
<div class="text-slate-500">Medium slate</div>
<div class="text-slate-900">Darkest slate</div>

<!-- With opacity -->
<div class="text-slate-500/50">50% opacity</div>
<div class="text-slate-500/75">75% opacity</div>
<div class="text-slate-500/100">100% opacity</div>

<!-- Arbitrary colors -->
<div class="text-[#50d71e]">Custom hex color</div>
<div class="text-[rgb(var(--my-color))]">CSS variable</div>
```

**Color palette:** `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

**Shades:** `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`

### Caret Color

Control the color of the text input cursor:

```html
<input class="caret-blue-500" type="text" />
<input class="caret-pink-500" type="text" />
<input class="caret-red-500" type="text" />

<!-- With opacity -->
<input class="caret-blue-500/50" type="text" />

<!-- Arbitrary color -->
<input class="caret-[#50d71e]" type="text" />
```

**Common pattern:**
```html
<input class="caret-blue-500 focus:caret-blue-700" type="text" />
```

### Accent Color

Control the accent color of form controls (checkboxes, radio buttons):

```html
<!-- Checkboxes -->
<input type="checkbox" class="accent-blue-500" />
<input type="checkbox" class="accent-pink-500" />
<input type="checkbox" class="accent-green-500" />

<!-- Radio buttons -->
<input type="radio" class="accent-purple-500" />

<!-- Range slider -->
<input type="range" class="accent-indigo-500" />

<!-- With opacity (limited browser support) -->
<input type="checkbox" class="accent-blue-500/50" />

<!-- Arbitrary color -->
<input type="checkbox" class="accent-[#50d71e]" />
```

**Browser note:** Accent color is supported in modern browsers. Opacity modifier only works in Firefox.

### Text Decoration

```html
<!-- Decoration line -->
<div class="underline">text-decoration-line: underline</div>
<div class="overline">text-decoration-line: overline</div>
<div class="line-through">text-decoration-line: line-through</div>
<div class="no-underline">text-decoration-line: none</div>

<!-- Decoration color -->
<div class="underline decoration-blue-500">Blue underline</div>

<!-- Decoration style -->
<div class="underline decoration-solid">Solid underline</div>
<div class="underline decoration-double">Double underline</div>
<div class="underline decoration-dotted">Dotted underline</div>
<div class="underline decoration-dashed">Dashed underline</div>
<div class="underline decoration-wavy">Wavy underline</div>

<!-- Decoration thickness -->
<div class="underline decoration-auto">Auto thickness</div>
<div class="underline decoration-from-font">From font</div>
<div class="underline decoration-0">0px</div>
<div class="underline decoration-1">1px</div>
<div class="underline decoration-2">2px</div>
<div class="underline decoration-4">4px</div>
<div class="underline decoration-8">8px</div>

<!-- Underline offset -->
<div class="underline underline-offset-0">offset: 0px</div>
<div class="underline underline-offset-2">offset: 2px</div>
<div class="underline underline-offset-4">offset: 4px</div>
<div class="underline underline-offset-8">offset: 8px</div>
```

### Text Transform

```html
<div class="uppercase">text-transform: uppercase</div>
<div class="lowercase">text-transform: lowercase</div>
<div class="capitalize">text-transform: capitalize</div>
<div class="normal-case">text-transform: none</div>
```

### Text Overflow

```html
<div class="truncate">
  Truncate with ellipsis
</div>

<div class="text-ellipsis overflow-hidden">
  Text ellipsis
</div>

<div class="text-clip overflow-hidden">
  Text clip
</div>
```

### Text Wrapping

```html
<div class="text-wrap">text-wrap: wrap</div>
<div class="text-nowrap">text-wrap: nowrap</div>
<div class="text-balance">text-wrap: balance</div>
<div class="text-pretty">text-wrap: pretty</div>
```

### Text Indent

```html
<div class="indent-0">text-indent: 0px</div>
<div class="indent-4">text-indent: 1rem</div>
<div class="indent-8">text-indent: 2rem</div>
```

### Vertical Alignment

```html
<span class="align-baseline">vertical-align: baseline</span>
<span class="align-top">vertical-align: top</span>
<span class="align-middle">vertical-align: middle</span>
<span class="align-bottom">vertical-align: bottom</span>
<span class="align-text-top">vertical-align: text-top</span>
<span class="align-text-bottom">vertical-align: text-bottom</span>
<span class="align-sub">vertical-align: sub</span>
<span class="align-super">vertical-align: super</span>
```

### Whitespace

```html
<div class="whitespace-normal">white-space: normal</div>
<div class="whitespace-nowrap">white-space: nowrap</div>
<div class="whitespace-pre">white-space: pre</div>
<div class="whitespace-pre-line">white-space: pre-line</div>
<div class="whitespace-pre-wrap">white-space: pre-wrap</div>
<div class="whitespace-break-spaces">white-space: break-spaces</div>
```

### Word Break

```html
<div class="break-normal">word-break: normal; overflow-wrap: normal</div>
<div class="break-words">overflow-wrap: break-word</div>
<div class="break-all">word-break: break-all</div>
<div class="break-keep">word-break: keep-all</div>
```

### Hyphens

```html
<div class="hyphens-none">hyphens: none</div>
<div class="hyphens-manual">hyphens: manual</div>
<div class="hyphens-auto">hyphens: auto</div>
```

### Content

```html
<!-- Pseudo-element content -->
<div class="before:content-['Hello']">
  World
</div>

<div class="after:content-['*'] after:ml-0.5 after:text-red-500">
  Required field
</div>

<div class="before:content-[url('/img/icon.svg')]">
  With icon
</div>
```

### List Style Type

```html
<ul class="list-none">No markers</ul>
<ul class="list-disc">Disc markers (•)</ul>
<ul class="list-decimal">Numbered list (1, 2, 3)</ul>
```

**Additional types:**
- `list-none` - no markers
- `list-disc` - filled circle bullets
- `list-decimal` - decimal numbers (1, 2, 3)

**Arbitrary values:**
```html
<ul class="list-[upper-roman]">Upper Roman (I, II, III)</ul>
<ul class="list-[square]">Square bullets</ul>
```

### List Style Position

```html
<ul class="list-inside">Markers inside content flow</ul>
<ul class="list-outside">Markers outside content (default)</ul>
```

### List Style Image

```html
<ul class="list-image-none">No custom marker</ul>
<ul class="list-image-[url('/img/checkmark.svg')]">Custom image marker</ul>
```

### Line Clamp

Truncate text to a specific number of lines:

```html
<!-- Clamp to specific lines -->
<p class="line-clamp-1">Single line with ellipsis...</p>
<p class="line-clamp-2">Two lines maximum...</p>
<p class="line-clamp-3">Three lines maximum...</p>
<p class="line-clamp-4">Four lines...</p>
<p class="line-clamp-5">Five lines...</p>
<p class="line-clamp-6">Six lines...</p>

<!-- Remove clamping -->
<p class="line-clamp-3 lg:line-clamp-none">Responsive unclamping</p>
```

**How it works:**
```css
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
```

**Arbitrary values:**
```html
<p class="line-clamp-[10]">Clamp to 10 lines</p>
```

---

## Backgrounds

### Background Color

```html
<!-- Solid colors -->
<div class="bg-slate-50">Lightest slate</div>
<div class="bg-slate-500">Medium slate</div>
<div class="bg-slate-900">Darkest slate</div>

<!-- With opacity -->
<div class="bg-slate-500/50">50% opacity</div>
<div class="bg-slate-500/75">75% opacity</div>

<!-- Transparent -->
<div class="bg-transparent">background-color: transparent</div>

<!-- Current color -->
<div class="bg-current">Uses current text color</div>

<!-- Arbitrary colors -->
<div class="bg-[#50d71e]">Custom hex</div>
```

### Background Image

```html
<!-- Gradients -->
<div class="bg-gradient-to-r">Linear gradient to right</div>
<div class="bg-gradient-to-tr">Linear gradient to top right</div>
<div class="bg-gradient-to-b">Linear gradient to bottom</div>

<!-- All directions -->
<div class="bg-gradient-to-t">to top</div>
<div class="bg-gradient-to-tr">to top right</div>
<div class="bg-gradient-to-r">to right</div>
<div class="bg-gradient-to-br">to bottom right</div>
<div class="bg-gradient-to-b">to bottom</div>
<div class="bg-gradient-to-bl">to bottom left</div>
<div class="bg-gradient-to-l">to left</div>
<div class="bg-gradient-to-tl">to top left</div>

<!-- No gradient -->
<div class="bg-none">background-image: none</div>

<!-- Arbitrary image -->
<div class="bg-[url('/img/hero.jpg')]">Custom image</div>
```

### Gradient Color Stops

```html
<!-- Basic gradient -->
<div class="bg-gradient-to-r from-cyan-500 to-blue-500">
  Cyan to blue gradient
</div>

<!-- Three-color gradient -->
<div class="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">
  Cyan, blue, purple gradient
</div>

<!-- With opacity -->
<div class="bg-gradient-to-r from-cyan-500/50 to-blue-500/50">
  Semi-transparent gradient
</div>

<!-- Color stop positions -->
<div class="bg-gradient-to-r from-cyan-500 from-10% via-blue-500 via-30% to-purple-500 to-90%">
  Custom stop positions
</div>
```

### Background Size

```html
<div class="bg-auto">background-size: auto</div>
<div class="bg-cover">background-size: cover</div>
<div class="bg-contain">background-size: contain</div>
```

### Background Position

```html
<div class="bg-bottom">background-position: bottom</div>
<div class="bg-center">background-position: center</div>
<div class="bg-left">background-position: left</div>
<div class="bg-left-bottom">background-position: left bottom</div>
<div class="bg-left-top">background-position: left top</div>
<div class="bg-right">background-position: right</div>
<div class="bg-right-bottom">background-position: right bottom</div>
<div class="bg-right-top">background-position: right top</div>
<div class="bg-top">background-position: top</div>
```

### Background Repeat

```html
<div class="bg-repeat">background-repeat: repeat</div>
<div class="bg-no-repeat">background-repeat: no-repeat</div>
<div class="bg-repeat-x">background-repeat: repeat-x</div>
<div class="bg-repeat-y">background-repeat: repeat-y</div>
<div class="bg-repeat-round">background-repeat: round</div>
<div class="bg-repeat-space">background-repeat: space</div>
```

### Background Attachment

```html
<div class="bg-fixed">background-attachment: fixed</div>
<div class="bg-local">background-attachment: local</div>
<div class="bg-scroll">background-attachment: scroll</div>
```

### Background Clip

```html
<div class="bg-clip-border">background-clip: border-box</div>
<div class="bg-clip-padding">background-clip: padding-box</div>
<div class="bg-clip-content">background-clip: content-box</div>
<div class="bg-clip-text">background-clip: text</div>
```

### Background Origin

```html
<div class="bg-origin-border">background-origin: border-box</div>
<div class="bg-origin-padding">background-origin: padding-box</div>
<div class="bg-origin-content">background-origin: content-box</div>
```

---

## Borders

### Border Width

```html
<!-- All sides -->
<div class="border">border-width: 1px</div>
<div class="border-0">border-width: 0px</div>
<div class="border-2">border-width: 2px</div>
<div class="border-4">border-width: 4px</div>
<div class="border-8">border-width: 8px</div>

<!-- Individual sides -->
<div class="border-t">border-top-width: 1px</div>
<div class="border-r">border-right-width: 1px</div>
<div class="border-b">border-bottom-width: 1px</div>
<div class="border-l">border-left-width: 1px</div>

<!-- Horizontal & Vertical -->
<div class="border-x">border-left/right-width: 1px</div>
<div class="border-y">border-top/bottom-width: 1px</div>

<!-- Start & End (logical) -->
<div class="border-s">border-inline-start-width: 1px</div>
<div class="border-e">border-inline-end-width: 1px</div>
```

### Border Color

```html
<div class="border border-slate-500">Slate border</div>
<div class="border border-transparent">Transparent border</div>
<div class="border border-current">Current color border</div>

<!-- With opacity -->
<div class="border border-slate-500/50">50% opacity</div>

<!-- Individual sides -->
<div class="border-t-slate-500">Top border color</div>
<div class="border-r-slate-500">Right border color</div>
<div class="border-b-slate-500">Bottom border color</div>
<div class="border-l-slate-500">Left border color</div>
```

### Border Style

```html
<div class="border-solid">border-style: solid</div>
<div class="border-dashed">border-style: dashed</div>
<div class="border-dotted">border-style: dotted</div>
<div class="border-double">border-style: double</div>
<div class="border-hidden">border-style: hidden</div>
<div class="border-none">border-style: none</div>
```

### Border Radius

```html
<!-- All corners -->
<div class="rounded-none">border-radius: 0px</div>
<div class="rounded-sm">border-radius: 0.125rem</div>
<div class="rounded">border-radius: 0.25rem</div>
<div class="rounded-md">border-radius: 0.375rem</div>
<div class="rounded-lg">border-radius: 0.5rem</div>
<div class="rounded-xl">border-radius: 0.75rem</div>
<div class="rounded-2xl">border-radius: 1rem</div>
<div class="rounded-3xl">border-radius: 1.5rem</div>
<div class="rounded-full">border-radius: 9999px</div>

<!-- Individual corners -->
<div class="rounded-t-lg">Top corners</div>
<div class="rounded-r-lg">Right corners</div>
<div class="rounded-b-lg">Bottom corners</div>
<div class="rounded-l-lg">Left corners</div>

<!-- Single corners -->
<div class="rounded-tl-lg">Top left</div>
<div class="rounded-tr-lg">Top right</div>
<div class="rounded-br-lg">Bottom right</div>
<div class="rounded-bl-lg">Bottom left</div>

<!-- Logical corners -->
<div class="rounded-ss-lg">Start-start</div>
<div class="rounded-se-lg">Start-end</div>
<div class="rounded-ee-lg">End-end</div>
<div class="rounded-es-lg">End-start</div>
```

### Divide Width

```html
<!-- Divide children horizontally -->
<div class="divide-x">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Divide children vertically -->
<div class="divide-y">
  <div>Row 1</div>
  <div>Row 2</div>
  <div>Row 3</div>
</div>

<!-- Divide widths -->
<div class="divide-y-0">0px</div>
<div class="divide-y-2">2px</div>
<div class="divide-y-4">4px</div>
<div class="divide-y-8">8px</div>

<!-- Divide reverse -->
<div class="flex flex-col-reverse divide-y divide-y-reverse">
  <div>Row 1</div>
  <div>Row 2</div>
</div>
```

### Divide Color & Style

```html
<div class="divide-y divide-slate-200">
  <div>Row 1</div>
  <div>Row 2</div>
</div>

<div class="divide-y divide-dashed">
  <div>Row 1</div>
  <div>Row 2</div>
</div>
```

### Box Decoration Break

Control how element decoration (background, border, etc.) is rendered when broken across lines or pages:

```html
<span class="box-decoration-slice">
  Background/border treats each line as separate
</span>

<span class="box-decoration-clone">
  Background/border cloned to each line fragment
</span>
```

**Use case - Inline code blocks:**
```html
<code class="box-decoration-clone bg-gray-100 px-2 py-1 rounded">
  This inline code wraps to multiple lines
  and maintains rounded corners on each line
</code>
```

**Values:**
- `box-decoration-slice` - Decoration applied as if element is one piece, then sliced (default)
- `box-decoration-clone` - Each fragment treated as independent element with its own decoration

### Outline

```html
<!-- Outline width -->
<div class="outline-0">outline-width: 0px</div>
<div class="outline-1">outline-width: 1px</div>
<div class="outline-2">outline-width: 2px</div>
<div class="outline-4">outline-width: 4px</div>
<div class="outline-8">outline-width: 8px</div>

<!-- Outline color -->
<div class="outline outline-blue-500">Blue outline</div>
<div class="outline outline-blue-500/50">50% opacity</div>

<!-- Outline style -->
<div class="outline outline-solid">Solid outline</div>
<div class="outline outline-dashed">Dashed outline</div>
<div class="outline outline-dotted">Dotted outline</div>
<div class="outline outline-double">Double outline</div>

<!-- Outline offset -->
<div class="outline outline-offset-0">offset: 0px</div>
<div class="outline outline-offset-2">offset: 2px</div>
<div class="outline outline-offset-4">offset: 4px</div>
```

### Ring

```html
<!-- Ring width -->
<div class="ring">ring-width: 3px</div>
<div class="ring-0">ring-width: 0px</div>
<div class="ring-1">ring-width: 1px</div>
<div class="ring-2">ring-width: 2px</div>
<div class="ring-4">ring-width: 4px</div>
<div class="ring-8">ring-width: 8px</div>

<!-- Ring color -->
<div class="ring ring-blue-500">Blue ring</div>
<div class="ring ring-blue-500/50">50% opacity</div>

<!-- Ring offset -->
<div class="ring ring-offset-2">2px offset</div>
<div class="ring ring-offset-4 ring-offset-white">4px white offset</div>

<!-- Inset ring -->
<div class="ring-inset">Inset ring</div>

<!-- Focus ring (common pattern) -->
<button class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Click me
</button>
```

---

## Effects

### Box Shadow

```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Default shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-2xl">2XL shadow</div>
<div class="shadow-inner">Inner shadow</div>
<div class="shadow-none">No shadow</div>
```

### Box Shadow Color

```html
<div class="shadow-lg shadow-blue-500">Blue shadow</div>
<div class="shadow-lg shadow-blue-500/50">50% opacity</div>
```

### Drop Shadow

```html
<div class="drop-shadow-sm">Small drop shadow</div>
<div class="drop-shadow">Default drop shadow</div>
<div class="drop-shadow-md">Medium drop shadow</div>
<div class="drop-shadow-lg">Large drop shadow</div>
<div class="drop-shadow-xl">XL drop shadow</div>
<div class="drop-shadow-2xl">2XL drop shadow</div>
<div class="drop-shadow-none">No drop shadow</div>
```

### Opacity

```html
<div class="opacity-0">opacity: 0</div>
<div class="opacity-5">opacity: 0.05</div>
<div class="opacity-10">opacity: 0.1</div>
<div class="opacity-20">opacity: 0.2</div>
<div class="opacity-25">opacity: 0.25</div>
<div class="opacity-30">opacity: 0.3</div>
<div class="opacity-40">opacity: 0.4</div>
<div class="opacity-50">opacity: 0.5</div>
<div class="opacity-60">opacity: 0.6</div>
<div class="opacity-70">opacity: 0.7</div>
<div class="opacity-75">opacity: 0.75</div>
<div class="opacity-80">opacity: 0.8</div>
<div class="opacity-90">opacity: 0.9</div>
<div class="opacity-95">opacity: 0.95</div>
<div class="opacity-100">opacity: 1</div>
```

### Mix Blend Mode

```html
<div class="mix-blend-normal">mix-blend-mode: normal</div>
<div class="mix-blend-multiply">mix-blend-mode: multiply</div>
<div class="mix-blend-screen">mix-blend-mode: screen</div>
<div class="mix-blend-overlay">mix-blend-mode: overlay</div>
<div class="mix-blend-darken">mix-blend-mode: darken</div>
<div class="mix-blend-lighten">mix-blend-mode: lighten</div>
<div class="mix-blend-color-dodge">mix-blend-mode: color-dodge</div>
<div class="mix-blend-color-burn">mix-blend-mode: color-burn</div>
<div class="mix-blend-hard-light">mix-blend-mode: hard-light</div>
<div class="mix-blend-soft-light">mix-blend-mode: soft-light</div>
<div class="mix-blend-difference">mix-blend-mode: difference</div>
<div class="mix-blend-exclusion">mix-blend-mode: exclusion</div>
<div class="mix-blend-hue">mix-blend-mode: hue</div>
<div class="mix-blend-saturation">mix-blend-mode: saturation</div>
<div class="mix-blend-color">mix-blend-mode: color</div>
<div class="mix-blend-luminosity">mix-blend-mode: luminosity</div>
```

### Background Blend Mode

```html
<div class="bg-blend-normal">background-blend-mode: normal</div>
<div class="bg-blend-multiply">background-blend-mode: multiply</div>
<div class="bg-blend-screen">background-blend-mode: screen</div>
<div class="bg-blend-overlay">background-blend-mode: overlay</div>
<!-- ... same options as mix-blend-mode -->
```

---

## Filters

### Blur

```html
<div class="blur-none">filter: blur(0)</div>
<div class="blur-sm">filter: blur(4px)</div>
<div class="blur">filter: blur(8px)</div>
<div class="blur-md">filter: blur(12px)</div>
<div class="blur-lg">filter: blur(16px)</div>
<div class="blur-xl">filter: blur(24px)</div>
<div class="blur-2xl">filter: blur(40px)</div>
<div class="blur-3xl">filter: blur(64px)</div>
```

### Brightness

```html
<div class="brightness-0">filter: brightness(0)</div>
<div class="brightness-50">filter: brightness(.5)</div>
<div class="brightness-75">filter: brightness(.75)</div>
<div class="brightness-90">filter: brightness(.9)</div>
<div class="brightness-95">filter: brightness(.95)</div>
<div class="brightness-100">filter: brightness(1)</div>
<div class="brightness-105">filter: brightness(1.05)</div>
<div class="brightness-110">filter: brightness(1.1)</div>
<div class="brightness-125">filter: brightness(1.25)</div>
<div class="brightness-150">filter: brightness(1.5)</div>
<div class="brightness-200">filter: brightness(2)</div>
```

### Contrast

```html
<div class="contrast-0">filter: contrast(0)</div>
<div class="contrast-50">filter: contrast(.5)</div>
<div class="contrast-75">filter: contrast(.75)</div>
<div class="contrast-100">filter: contrast(1)</div>
<div class="contrast-125">filter: contrast(1.25)</div>
<div class="contrast-150">filter: contrast(1.5)</div>
<div class="contrast-200">filter: contrast(2)</div>
```

### Grayscale

```html
<div class="grayscale-0">filter: grayscale(0)</div>
<div class="grayscale">filter: grayscale(100%)</div>
```

### Hue Rotate

```html
<div class="hue-rotate-0">filter: hue-rotate(0deg)</div>
<div class="hue-rotate-15">filter: hue-rotate(15deg)</div>
<div class="hue-rotate-30">filter: hue-rotate(30deg)</div>
<div class="hue-rotate-60">filter: hue-rotate(60deg)</div>
<div class="hue-rotate-90">filter: hue-rotate(90deg)</div>
<div class="hue-rotate-180">filter: hue-rotate(180deg)</div>
```

### Invert

```html
<div class="invert-0">filter: invert(0)</div>
<div class="invert">filter: invert(100%)</div>
```

### Saturate

```html
<div class="saturate-0">filter: saturate(0)</div>
<div class="saturate-50">filter: saturate(.5)</div>
<div class="saturate-100">filter: saturate(1)</div>
<div class="saturate-150">filter: saturate(1.5)</div>
<div class="saturate-200">filter: saturate(2)</div>
```

### Sepia

```html
<div class="sepia-0">filter: sepia(0)</div>
<div class="sepia">filter: sepia(100%)</div>
```

### Backdrop Filter

All filter utilities have `backdrop-*` equivalents:

```html
<div class="backdrop-blur-sm">backdrop-filter: blur(4px)</div>
<div class="backdrop-brightness-50">backdrop-filter: brightness(.5)</div>
<div class="backdrop-contrast-125">backdrop-filter: contrast(1.25)</div>
<div class="backdrop-grayscale">backdrop-filter: grayscale(100%)</div>
<div class="backdrop-hue-rotate-90">backdrop-filter: hue-rotate(90deg)</div>
<div class="backdrop-invert">backdrop-filter: invert(100%)</div>
<div class="backdrop-opacity-50">backdrop-filter: opacity(.5)</div>
<div class="backdrop-saturate-150">backdrop-filter: saturate(1.5)</div>
<div class="backdrop-sepia">backdrop-filter: sepia(100%)</div>
```

---

## Tables

### Border Collapse

```html
<table class="border-collapse">border-collapse: collapse</table>
<table class="border-separate">border-collapse: separate</table>
```

### Border Spacing

```html
<table class="border-separate border-spacing-0">0px spacing</table>
<table class="border-separate border-spacing-2">0.5rem spacing</table>
<table class="border-separate border-spacing-x-2">Horizontal spacing</table>
<table class="border-separate border-spacing-y-2">Vertical spacing</table>
```

### Table Layout

```html
<table class="table-auto">table-layout: auto</table>
<table class="table-fixed">table-layout: fixed</table>
```

### Caption Side

```html
<table>
  <caption class="caption-top">Top caption</caption>
  <!-- ... -->
</table>

<table>
  <caption class="caption-bottom">Bottom caption</caption>
  <!-- ... -->
</table>
```

---

## Transitions & Animations

### Transition Property

```html
<!-- All properties -->
<div class="transition">Transition all properties</div>
<div class="transition-all">transition-property: all</div>

<!-- Specific properties -->
<div class="transition-colors">Transition colors</div>
<div class="transition-opacity">Transition opacity</div>
<div class="transition-shadow">Transition shadow</div>
<div class="transition-transform">Transition transform</div>

<!-- None -->
<div class="transition-none">No transitions</div>
```

### Transition Duration

```html
<div class="duration-75">transition-duration: 75ms</div>
<div class="duration-100">transition-duration: 100ms</div>
<div class="duration-150">transition-duration: 150ms</div>
<div class="duration-200">transition-duration: 200ms</div>
<div class="duration-300">transition-duration: 300ms</div>
<div class="duration-500">transition-duration: 500ms</div>
<div class="duration-700">transition-duration: 700ms</div>
<div class="duration-1000">transition-duration: 1000ms</div>
```

### Transition Timing Function

```html
<div class="ease-linear">transition-timing-function: linear</div>
<div class="ease-in">transition-timing-function: cubic-bezier(0.4, 0, 1, 1)</div>
<div class="ease-out">transition-timing-function: cubic-bezier(0, 0, 0.2, 1)</div>
<div class="ease-in-out">transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)</div>
```

### Transition Delay

```html
<div class="delay-75">transition-delay: 75ms</div>
<div class="delay-100">transition-delay: 100ms</div>
<div class="delay-150">transition-delay: 150ms</div>
<div class="delay-200">transition-delay: 200ms</div>
<div class="delay-300">transition-delay: 300ms</div>
<div class="delay-500">transition-delay: 500ms</div>
<div class="delay-700">transition-delay: 700ms</div>
<div class="delay-1000">transition-delay: 1000ms</div>
```

### Animation

```html
<!-- Spin -->
<div class="animate-spin">Spinning animation</div>

<!-- Ping -->
<div class="animate-ping">Ping animation</div>

<!-- Pulse -->
<div class="animate-pulse">Pulse animation</div>

<!-- Bounce -->
<div class="animate-bounce">Bounce animation</div>

<!-- None -->
<div class="animate-none">No animation</div>
```

### Common Transition Patterns

```html
<!-- Hover color change -->
<button class="bg-blue-500 hover:bg-blue-700 transition-colors duration-200">
  Hover me
</button>

<!-- Hover scale -->
<button class="transform hover:scale-105 transition-transform duration-200">
  Grow on hover
</button>

<!-- Hover with shadow -->
<div class="shadow hover:shadow-lg transition-shadow duration-300">
  Card
</div>

<!-- Multiple transitions -->
<button class="bg-blue-500 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 ease-in-out">
  Multi-effect hover
</button>
```

---

## Transforms

### Scale

```html
<div class="scale-0">transform: scale(0)</div>
<div class="scale-50">transform: scale(.5)</div>
<div class="scale-75">transform: scale(.75)</div>
<div class="scale-90">transform: scale(.9)</div>
<div class="scale-95">transform: scale(.95)</div>
<div class="scale-100">transform: scale(1)</div>
<div class="scale-105">transform: scale(1.05)</div>
<div class="scale-110">transform: scale(1.1)</div>
<div class="scale-125">transform: scale(1.25)</div>
<div class="scale-150">transform: scale(1.5)</div>

<!-- X-axis only -->
<div class="scale-x-50">transform: scaleX(.5)</div>

<!-- Y-axis only -->
<div class="scale-y-50">transform: scaleY(.5)</div>
```

### Rotate

```html
<div class="rotate-0">transform: rotate(0deg)</div>
<div class="rotate-1">transform: rotate(1deg)</div>
<div class="rotate-3">transform: rotate(3deg)</div>
<div class="rotate-6">transform: rotate(6deg)</div>
<div class="rotate-12">transform: rotate(12deg)</div>
<div class="rotate-45">transform: rotate(45deg)</div>
<div class="rotate-90">transform: rotate(90deg)</div>
<div class="rotate-180">transform: rotate(180deg)</div>

<!-- Negative rotation -->
<div class="-rotate-45">transform: rotate(-45deg)</div>
```

### Translate

```html
<!-- X-axis -->
<div class="translate-x-0">transform: translateX(0px)</div>
<div class="translate-x-4">transform: translateX(1rem)</div>
<div class="translate-x-1/2">transform: translateX(50%)</div>
<div class="translate-x-full">transform: translateX(100%)</div>

<!-- Y-axis -->
<div class="translate-y-0">transform: translateY(0px)</div>
<div class="translate-y-4">transform: translateY(1rem)</div>
<div class="translate-y-1/2">transform: translateY(50%)</div>
<div class="translate-y-full">transform: translateY(100%)</div>

<!-- Negative -->
<div class="-translate-x-1/2">transform: translateX(-50%)</div>
<div class="-translate-y-1/2">transform: translateY(-50%)</div>

<!-- Center with translate -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  Perfectly centered
</div>
```

### Skew

```html
<!-- X-axis -->
<div class="skew-x-0">transform: skewX(0deg)</div>
<div class="skew-x-3">transform: skewX(3deg)</div>
<div class="skew-x-6">transform: skewX(6deg)</div>
<div class="skew-x-12">transform: skewX(12deg)</div>

<!-- Y-axis -->
<div class="skew-y-3">transform: skewY(3deg)</div>

<!-- Negative -->
<div class="-skew-x-12">transform: skewX(-12deg)</div>
```

### Transform Origin

```html
<div class="origin-center">transform-origin: center</div>
<div class="origin-top">transform-origin: top</div>
<div class="origin-top-right">transform-origin: top right</div>
<div class="origin-right">transform-origin: right</div>
<div class="origin-bottom-right">transform-origin: bottom right</div>
<div class="origin-bottom">transform-origin: bottom</div>
<div class="origin-bottom-left">transform-origin: bottom left</div>
<div class="origin-left">transform-origin: left</div>
<div class="origin-top-left">transform-origin: top left</div>
```

---

## Interactivity

### Cursor

```html
<div class="cursor-auto">cursor: auto</div>
<div class="cursor-default">cursor: default</div>
<div class="cursor-pointer">cursor: pointer</div>
<div class="cursor-wait">cursor: wait</div>
<div class="cursor-text">cursor: text</div>
<div class="cursor-move">cursor: move</div>
<div class="cursor-help">cursor: help</div>
<div class="cursor-not-allowed">cursor: not-allowed</div>
<div class="cursor-none">cursor: none</div>
<div class="cursor-context-menu">cursor: context-menu</div>
<div class="cursor-progress">cursor: progress</div>
<div class="cursor-cell">cursor: cell</div>
<div class="cursor-crosshair">cursor: crosshair</div>
<div class="cursor-vertical-text">cursor: vertical-text</div>
<div class="cursor-alias">cursor: alias</div>
<div class="cursor-copy">cursor: copy</div>
<div class="cursor-no-drop">cursor: no-drop</div>
<div class="cursor-grab">cursor: grab</div>
<div class="cursor-grabbing">cursor: grabbing</div>
```

### Pointer Events

```html
<div class="pointer-events-none">pointer-events: none</div>
<div class="pointer-events-auto">pointer-events: auto</div>
```

### Appearance

Remove default browser styling from form elements:

```html
<!-- Remove default select styling -->
<select class="appearance-none">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Remove default checkbox/radio styling -->
<input type="checkbox" class="appearance-none" />
<input type="radio" class="appearance-none" />

<!-- Restore default appearance (useful for accessibility) -->
<select class="appearance-none forced-colors:appearance-auto">
  <!-- Fallback to native styling in forced-colors mode -->
</select>
```

**Common use case - Custom select:**
```html
<div class="relative">
  <select class="appearance-none bg-white border rounded px-4 py-2 pr-8">
    <option>Choose option</option>
  </select>
  <svg class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
    <!-- Custom dropdown arrow -->
  </svg>
</div>
```

**Values:**
- `appearance-none` - Remove browser styling
- `appearance-auto` - Use browser default styling

### Resize

```html
<div class="resize-none">resize: none</div>
<div class="resize">resize: both</div>
<div class="resize-x">resize: horizontal</div>
<div class="resize-y">resize: vertical</div>
```

### User Select

```html
<div class="select-none">user-select: none</div>
<div class="select-text">user-select: text</div>
<div class="select-all">user-select: all</div>
<div class="select-auto">user-select: auto</div>
```

### Scroll Behavior

```html
<div class="scroll-auto">scroll-behavior: auto</div>
<div class="scroll-smooth">scroll-behavior: smooth</div>
```

### Scroll Snap

```html
<!-- Scroll Snap Type -->
<div class="snap-none">scroll-snap-type: none</div>
<div class="snap-x">scroll-snap-type: x var(--tw-scroll-snap-strictness)</div>
<div class="snap-y">scroll-snap-type: y var(--tw-scroll-snap-strictness)</div>
<div class="snap-both">scroll-snap-type: both var(--tw-scroll-snap-strictness)</div>
<div class="snap-mandatory">--tw-scroll-snap-strictness: mandatory</div>
<div class="snap-proximity">--tw-scroll-snap-strictness: proximity</div>

<!-- Scroll Snap Align -->
<div class="snap-start">scroll-snap-align: start</div>
<div class="snap-end">scroll-snap-align: end</div>
<div class="snap-center">scroll-snap-align: center</div>
<div class="snap-align-none">scroll-snap-align: none</div>

<!-- Scroll Snap Stop -->
<div class="snap-normal">scroll-snap-stop: normal</div>
<div class="snap-always">scroll-snap-stop: always</div>
```

### Scroll Margin & Padding

```html
<!-- Scroll Margin -->
<div class="scroll-m-4">scroll-margin: 1rem</div>
<div class="scroll-mx-4">scroll-margin-left/right: 1rem</div>
<div class="scroll-my-4">scroll-margin-top/bottom: 1rem</div>
<div class="scroll-mt-4">scroll-margin-top: 1rem</div>

<!-- Scroll Padding -->
<div class="scroll-p-4">scroll-padding: 1rem</div>
<div class="scroll-px-4">scroll-padding-left/right: 1rem</div>
<div class="scroll-py-4">scroll-padding-top/bottom: 1rem</div>
<div class="scroll-pt-4">scroll-padding-top: 1rem</div>
```

### Touch Action

```html
<div class="touch-auto">touch-action: auto</div>
<div class="touch-none">touch-action: none</div>
<div class="touch-pan-x">touch-action: pan-x</div>
<div class="touch-pan-left">touch-action: pan-left</div>
<div class="touch-pan-right">touch-action: pan-right</div>
<div class="touch-pan-y">touch-action: pan-y</div>
<div class="touch-pan-up">touch-action: pan-up</div>
<div class="touch-pan-down">touch-action: pan-down</div>
<div class="touch-pinch-zoom">touch-action: pinch-zoom</div>
<div class="touch-manipulation">touch-action: manipulation</div>
```

### Will Change

```html
<div class="will-change-auto">will-change: auto</div>
<div class="will-change-scroll">will-change: scroll-position</div>
<div class="will-change-contents">will-change: contents</div>
<div class="will-change-transform">will-change: transform</div>
```

---

## SVG

### Fill

```html
<svg class="fill-current">Uses current text color</svg>
<svg class="fill-blue-500">Blue fill</svg>
<svg class="fill-transparent">Transparent fill</svg>
<svg class="fill-none">No fill</svg>
```

### Stroke

```html
<svg class="stroke-current">Uses current text color</svg>
<svg class="stroke-blue-500">Blue stroke</svg>
<svg class="stroke-transparent">Transparent stroke</svg>
<svg class="stroke-none">No stroke</svg>
```

### Stroke Width

```html
<svg class="stroke-0">stroke-width: 0</svg>
<svg class="stroke-1">stroke-width: 1</svg>
<svg class="stroke-2">stroke-width: 2</svg>
```

---

## Accessibility

### Screen Readers

```html
<!-- Hide visually but keep for screen readers -->
<div class="sr-only">
  Screen reader only text
</div>

<!-- Make visible again -->
<div class="sr-only focus:not-sr-only">
  Visible when focused
</div>
```

### Forced Color Adjust

```html
<div class="forced-color-adjust-auto">forced-color-adjust: auto</div>
<div class="forced-color-adjust-none">forced-color-adjust: none</div>
```

---

## Functions & Directives

### Directives

#### @tailwind

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@tailwind variants;
```

**Purpose:**
- `base` - Reset styles, default HTML element styles
- `components` - Component classes registered by plugins
- `utilities` - Utility classes
- `variants` - Variant styles (hover, focus, responsive)

#### @layer

```css
@layer base {
  h1 {
    @apply text-2xl;
  }
}

@layer components {
  .btn {
    @apply py-2 px-4 bg-blue-500 text-white rounded;
  }
}

@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
}
```

**Benefits:**
- Automatic positioning at correct `@tailwind` directive
- Tree-shaking (unused styles removed)
- Modifier support (hover:, md:, etc.)

#### @apply

```css
.btn-primary {
  @apply py-2 px-4 bg-blue-500 text-white font-bold rounded hover:bg-blue-700;
}
```

**Important Notes:**
- `!important` is removed by default
- Add `!important` explicitly if needed:
  ```css
  .btn {
    @apply py-2 px-4 rounded !important;
  }
  ```
- In Sass, use interpolation:
  ```scss
  .btn {
    @apply py-2 px-4 rounded #{!important};
  }
  ```

#### @config

```css
@config "./tailwind.site.config.js";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Use Case:** Multiple CSS entry points with different configs

### Functions

#### theme()

```css
.content-area {
  height: calc(100vh - theme(spacing.12));
}

.btn-blue {
  background-color: theme(colors.blue.500);
}

/* With opacity */
.btn-blue-transparent {
  background-color: theme(colors.blue.500 / 75%);
}

/* Accessing nested values */
.custom {
  padding: theme(spacing[2.5]);
}
```

#### screen()

```css
@media screen(sm) {
  /* ... */
}

/* Generates: */
@media (min-width: 640px) {
  /* ... */
}
```

---

## Customization

### Extending Theme

```js
module.exports = {
  theme: {
    extend: {
      // Add to existing values
      colors: {
        'brand-blue': '#1fb6ff',
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
      },
    }
  }
}
```

### Overriding Theme

```js
module.exports = {
  theme: {
    // Replace existing values
    colors: {
      'blue': '#1fb6ff',
      'pink': '#ff49db',
      // ... only these colors available
    },
    spacing: {
      '1': '8px',
      '2': '12px',
      // ... custom scale
    }
  }
}
```

### Using Default Theme

```js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    }
  }
}
```

### Referencing Theme Values

```js
module.exports = {
  theme: {
    spacing: {
      // ...
    },
    backgroundSize: ({ theme }) => ({
      auto: 'auto',
      cover: 'cover',
      contain: 'contain',
      ...theme('spacing')
    })
  }
}
```

### Adding Utilities with Plugins

```js
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, addBase, theme }) {
      // Add utilities
      addUtilities({
        '.content-auto': {
          'content-visibility': 'auto',
        },
        '.content-hidden': {
          'content-visibility': 'hidden',
        }
      })

      // Add components
      addComponents({
        '.btn': {
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.semibold'),
        },
        '.btn-primary': {
          backgroundColor: theme('colors.blue.500'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.blue.700'),
          }
        }
      })

      // Add base styles
      addBase({
        'h1': {
          fontSize: theme('fontSize.2xl'),
          fontWeight: theme('fontWeight.bold'),
        },
        'h2': {
          fontSize: theme('fontSize.xl'),
          fontWeight: theme('fontWeight.semibold'),
        }
      })
    })
  ]
}
```

### Adding Variants

```js
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addVariant }) {
      // Add custom variant
      addVariant('optional', '&:optional')
      addVariant('hocus', ['&:hover', '&:focus'])
      addVariant('not-first', '&:not(:first-child)')

      // Child selectors
      addVariant('child', '& > *')
      addVariant('child-hover', '& > *:hover')
    })
  ]
}
```

---

## Best Practices

### DO: Use Utility Classes Directly

```html
<!-- GOOD -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
```

### DON'T: Overuse @apply

```css
/* BAD - Defeating purpose of Tailwind */
.btn {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
```

```html
<!-- Then using it -->
<button class="btn">Click me</button>
```

**Why?** You lose all the benefits:
- Still have to name things
- Jump between files
- CSS bundle grows
- Harder to maintain

### DO: Extract Components

```jsx
// GOOD - Component extraction
function Button({ children, variant = 'primary' }) {
  const baseClasses = 'font-bold py-2 px-4 rounded'
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-700 text-white',
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  )
}
```

### DO: Use Responsive Design Mobile-First

```html
<!-- GOOD -->
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

```html
<!-- BAD - Don't use sm: for mobile -->
<div class="sm:text-sm md:text-base lg:text-lg">
  Wrong approach
</div>
```

### DO: Group Related Utilities

```html
<!-- GOOD - Logical grouping -->
<div class="
  flex items-center justify-between
  p-4 mb-4
  bg-white rounded-lg shadow
  hover:shadow-lg
  transition-shadow duration-200
">
```

### DO: Use Arbitrary Values Sparingly

```html
<!-- GOOD - One-off pixel-perfect adjustment -->
<div class="top-[117px]">

<!-- BETTER - Add to theme if used frequently -->
```

### DON'T: Fight the Framework

```css
/* BAD - Creating custom utility names defeats the purpose */
@layer utilities {
  .custom-padding-top {
    @apply pt-[37px];
  }
}
```

```html
<!-- GOOD - Use Tailwind's conventions -->
<div class="pt-[37px]">
```

### DO: Leverage PurgeCSS/Tree-Shaking

```js
// Ensure content paths are correct
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue,svelte}',
  ],
}
```

**Critical:** Only classes used in these files are included in production build.

### DON'T: Generate Class Names Dynamically

```jsx
// BAD - PurgeCSS can't detect these
<div className={`text-${error ? 'red' : 'green'}-500`}>

// GOOD - Use complete class names
<div className={error ? 'text-red-500' : 'text-green-500'}>
```

### DO: Use Composition for Variants

```jsx
// GOOD
function Alert({ type, children }) {
  const baseClasses = 'p-4 rounded border'
  const typeClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {children}
    </div>
  )
}
```

### DO: Organize Long Class Lists

```html
<!-- Use line breaks for readability -->
<div class="
  relative z-10
  flex flex-col items-center justify-center
  min-h-screen
  p-4
  bg-gradient-to-br from-blue-500 to-purple-600
  text-white
">
```

---

## Common Patterns

### Centered Container

```html
<div class="container mx-auto px-4">
  <!-- Content -->
</div>
```

### Card Component

```html
<div class="bg-white rounded-lg shadow-md overflow-hidden">
  <img class="w-full h-48 object-cover" src="..." alt="...">
  <div class="p-6">
    <h3 class="text-xl font-bold mb-2">Title</h3>
    <p class="text-gray-700">Description</p>
  </div>
</div>
```

### Button Variants

```html
<!-- Primary -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Primary
</button>

<!-- Secondary -->
<button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
  Secondary
</button>

<!-- Outline -->
<button class="bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent font-bold py-2 px-4 rounded">
  Outline
</button>
```

### Form Input

```html
<input
  type="text"
  class="
    w-full
    px-4 py-2
    border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    placeholder:text-gray-400
  "
  placeholder="Enter text..."
>
```

### Modal Overlay

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
    <!-- Modal content -->
  </div>
</div>
```

### Navigation Bar

```html
<nav class="bg-white shadow">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center">
        <img class="h-8" src="/logo.svg" alt="Logo">
      </div>
      <div class="flex space-x-4">
        <a href="#" class="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
          Home
        </a>
        <a href="#" class="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
          About
        </a>
      </div>
    </div>
  </div>
</nav>
```

### Grid Layout

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white p-6 rounded-lg shadow">Item 1</div>
  <div class="bg-white p-6 rounded-lg shadow">Item 2</div>
  <div class="bg-white p-6 rounded-lg shadow">Item 3</div>
</div>
```

### Flex Layout

```html
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1 bg-white p-6 rounded-lg shadow">Column 1</div>
  <div class="flex-1 bg-white p-6 rounded-lg shadow">Column 2</div>
  <div class="flex-1 bg-white p-6 rounded-lg shadow">Column 3</div>
</div>
```

### Hero Section

```html
<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
  <div class="container mx-auto px-4 py-20">
    <div class="max-w-3xl mx-auto text-center">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
        Welcome to Our Site
      </h1>
      <p class="text-xl md:text-2xl mb-8">
        Build amazing things with Tailwind CSS
      </p>
      <button class="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors">
        Get Started
      </button>
    </div>
  </div>
</div>
```

### Badge/Pill

```html
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  Badge
</span>

<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
  </svg>
  Success
</span>
```

### Avatar

```html
<!-- Round avatar -->
<img class="w-12 h-12 rounded-full" src="..." alt="...">

<!-- With ring -->
<img class="w-12 h-12 rounded-full ring-2 ring-white" src="..." alt="...">

<!-- Avatar group -->
<div class="flex -space-x-2">
  <img class="w-10 h-10 rounded-full ring-2 ring-white" src="..." alt="...">
  <img class="w-10 h-10 rounded-full ring-2 ring-white" src="..." alt="...">
  <img class="w-10 h-10 rounded-full ring-2 ring-white" src="..." alt="...">
</div>
```

### Tooltip

```html
<div class="group relative inline-block">
  <button class="bg-blue-500 text-white px-4 py-2 rounded">
    Hover me
  </button>
  <div class="
    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
    px-3 py-1
    bg-black text-white text-sm rounded
    opacity-0 group-hover:opacity-100
    transition-opacity
    pointer-events-none
  ">
    Tooltip text
  </div>
</div>
```

### Loading Spinner

```html
<div class="flex items-center justify-center">
  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
</div>
```

---

## Quick Reference

### Most Common Utilities

```html
<!-- Layout -->
<div class="container mx-auto">
<div class="flex items-center justify-between">
<div class="grid grid-cols-3 gap-4">
<div class="absolute top-0 right-0">
<div class="relative">

<!-- Spacing -->
<div class="p-4 m-4">
<div class="px-4 py-2">
<div class="mt-4 mb-8">
<div class="space-y-4">

<!-- Sizing -->
<div class="w-full h-screen">
<div class="w-1/2 h-64">
<div class="max-w-md mx-auto">
<div class="min-h-screen">

<!-- Typography -->
<div class="text-xl font-bold text-gray-900">
<div class="text-sm text-gray-600">
<div class="leading-relaxed tracking-wide">
<div class="uppercase">

<!-- Colors -->
<div class="bg-blue-500 text-white">
<div class="border border-gray-300">
<div class="text-red-600">

<!-- Effects -->
<div class="shadow-lg rounded-lg">
<div class="opacity-50">
<div class="hover:shadow-xl transition-shadow">

<!-- Responsive -->
<div class="text-base md:text-lg lg:text-xl">
<div class="hidden md:block">
<div class="flex flex-col md:flex-row">

<!-- State -->
<button class="hover:bg-blue-700 focus:outline-none focus:ring-2">
<div class="group-hover:opacity-100">
<input class="focus:border-blue-500 disabled:opacity-50">
```

### Breakpoint Reference

| Prefix | Min Width | CSS |
|--------|-----------|-----|
| `sm:` | 640px | `@media (min-width: 640px)` |
| `md:` | 768px | `@media (min-width: 768px)` |
| `lg:` | 1024px | `@media (min-width: 1024px)` |
| `xl:` | 1280px | `@media (min-width: 1280px)` |
| `2xl:` | 1536px | `@media (min-width: 1536px)` |

### Spacing Scale Reference

| Class | Value | Pixels |
|-------|-------|--------|
| `0` | 0px | 0px |
| `px` | 1px | 1px |
| `0.5` | 0.125rem | 2px |
| `1` | 0.25rem | 4px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `5` | 1.25rem | 20px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `10` | 2.5rem | 40px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |
| `20` | 5rem | 80px |
| `24` | 6rem | 96px |
| `32` | 8rem | 128px |
| `40` | 10rem | 160px |
| `48` | 12rem | 192px |
| `56` | 14rem | 224px |
| `64` | 16rem | 256px |
| `96` | 24rem | 384px |

### Font Size Reference

| Class | Font Size | Line Height |
|-------|-----------|-------------|
| `text-xs` | 0.75rem (12px) | 1rem (16px) |
| `text-sm` | 0.875rem (14px) | 1.25rem (20px) |
| `text-base` | 1rem (16px) | 1.5rem (24px) |
| `text-lg` | 1.125rem (18px) | 1.75rem (28px) |
| `text-xl` | 1.25rem (20px) | 1.75rem (28px) |
| `text-2xl` | 1.5rem (24px) | 2rem (32px) |
| `text-3xl` | 1.875rem (30px) | 2.25rem (36px) |
| `text-4xl` | 2.25rem (36px) | 2.5rem (40px) |
| `text-5xl` | 3rem (48px) | 1 |
| `text-6xl` | 3.75rem (60px) | 1 |
| `text-7xl` | 4.5rem (72px) | 1 |
| `text-8xl` | 6rem (96px) | 1 |
| `text-9xl` | 8rem (128px) | 1 |

### Color Reference

**Available Colors:** `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

**Shades:** `50`, `100`, `200`, `300`, `400`, `500` (base), `600`, `700`, `800`, `900`, `950`

**Special Colors:** `transparent`, `current`, `inherit`, `black`, `white`

---

## End Notes

### Key Takeaways

1. **Utility-first is the way** - Embrace composing utilities instead of writing CSS
2. **Mobile-first responsive** - Design for mobile, enhance for larger screens
3. **Component extraction** - Use your framework's component system, not CSS abstractions
4. **Configuration over customization** - Extend the theme, don't fight it
5. **Tree-shaking is critical** - Configure content paths correctly for production
6. **Arbitrary values for one-offs** - Use `[...]` syntax for unique values
7. **Variants stack infinitely** - Combine responsive, state, and dark mode modifiers
8. **Design system built-in** - Leverage Tailwind's spacing, colors, and typography scales

### Resources

- **Official Documentation:** https://tailwindcss.com/docs
- **Playground:** https://play.tailwindcss.com
- **Component Libraries:** Tailwind UI, Headless UI, DaisyUI, Flowbite
- **IDE Extensions:** Tailwind CSS IntelliSense (VS Code)
- **GitHub:** https://github.com/tailwindlabs/tailwindcss

---

**Last Updated:** 2025-01-18
**Author:** Generated for AI Agent Reference
**Version:** Tailwind CSS 3.4+
