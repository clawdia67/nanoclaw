---
name: stagehand
description: Advanced AI-powered browser automation using Stagehand with natural language commands, intelligent element detection, and visual automation capabilities.
metadata:
  openclaw:
    requires:
      bins:
        - node
        - npm
      environment:
        - OPENAI_API_KEY
        - ANTHROPIC_API_KEY
        - GOOGLE_GENERATIVE_AI_API_KEY
---

# Stagehand — AI-Powered Browser Automation

Stagehand is a browser automation framework that controls web browsers with **natural language and code**. It combines AI precision with deterministic automation, making web scraping, testing, and automation flexible and maintainable.

## ⚠️ CRITICAL: Always Use Local Browser

**MANDATORY:** Always use `env: "LOCAL"` — we do NOT have Browserbase. Never use `env: "BROWSERBASE"`.

```typescript
const stagehand = new Stagehand({
  env: "LOCAL",  // ALWAYS LOCAL, never BROWSERBASE
  model: "google/gemini-3-flash-preview"
});
```

## ⚠️ CRITICAL: Persistent Sessions for Authenticated Sites

**If the task requires logging into a website, ALWAYS use a persistent browser profile** so credentials are saved and you don't have to log in again next time.

The group folder at `/workspace/group/` is persisted between container runs. Store the browser profile there:

```typescript
const stagehand = new Stagehand({
  env: "LOCAL",
  model: "google/gemini-3-flash-preview",
  localBrowserLaunchOptions: {
    userDataDir: "/workspace/group/browser-profile"  // persisted on host
  }
});
```

**First run:** Stagehand logs in, saves cookies/session to `/workspace/group/browser-profile/`.
**All future runs:** Browser opens already authenticated — no login needed.

Use a site-specific subdirectory when managing multiple accounts:

```typescript
localBrowserLaunchOptions: {
  userDataDir: "/workspace/group/browser-profile/github"   // GitHub session
}
localBrowserLaunchOptions: {
  userDataDir: "/workspace/group/browser-profile/twitter"  // Twitter session
}
```

## Core Concepts

Stagehand provides four main primitives:

| Primitive   | Purpose                                | AI Level                   |
| ----------- | -------------------------------------- | -------------------------- |
| `act()`     | Execute a single action                | Low — one action at a time |
| `extract()` | Pull structured data from a page       | Low — data extraction      |
| `observe()` | Discover available actions             | Low — page analysis        |
| `agent()`   | Automate entire workflows autonomously | High — full autonomy       |

## Installation

Scripts should be written to `/workspace/group/` and run from there:

```bash
cd /workspace/group
npm init -y
npm install @browserbasehq/stagehand zod
```

## Quick Start Examples

### Basic Page Interaction

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

async function basicAutomation() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-3-flash-preview"
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  await page.goto("https://example.com");

  await stagehand.act("click the login button");
  await stagehand.act("type 'username' into the email field");
  await stagehand.act("type 'password' into the password field");
  await stagehand.act("click the submit button");

  const userInfo = await stagehand.extract(
    "extract the user profile information",
    z.object({
      name: z.string(),
      email: z.string(),
      lastLogin: z.string()
    })
  );

  await stagehand.close();
  return userInfo;
}
```

### Authenticated Site (Persistent Session)

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

async function automateWithAuth(siteName: string, loginUrl: string) {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-3-flash-preview",
    localBrowserLaunchOptions: {
      userDataDir: `/workspace/group/browser-profile/${siteName}`
    }
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];
  await page.goto(loginUrl);

  // Check if already logged in
  const isLoggedIn = await stagehand.extract(
    "is the user currently logged in? look for user avatar, logout button, or dashboard",
    z.object({ loggedIn: z.boolean() })
  );

  if (!isLoggedIn.loggedIn) {
    // First time — log in (credentials saved automatically to userDataDir)
    await stagehand.act("type %username% into the email field", {
      variables: { username: process.env.LOGIN_USERNAME }
    });
    await stagehand.act("type %password% into the password field", {
      variables: { password: process.env.LOGIN_PASSWORD }
    });
    await stagehand.act("click the login/submit button");
    await page.waitForNavigation();
  }

  // Now authenticated — do the actual task
  return stagehand;
}
```

### Web Scraping with Structure

```typescript
import { z } from "zod/v3";

async function scrapeProductData(url: string) {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-3-flash-preview"
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];
  await page.goto(url);

  const products = await stagehand.extract(
    "extract all product listings",
    z.array(z.object({
      name: z.string().describe("Product name"),
      price: z.string().describe("Price including currency"),
      rating: z.number().describe("Average rating"),
      availability: z.string().describe("Stock status"),
      link: z.string().url().describe("Product page URL")
    }))
  );

  await stagehand.close();
  return products;
}
```

### Autonomous Agent Workflow

```typescript
async function autonomousTask() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    experimental: true
  });

  await stagehand.init();

  const agent = stagehand.agent({
    mode: "hybrid",
    model: "google/gemini-3-flash-preview"
  });

  const result = await agent.execute({
    instruction: "Go to booking.com, search for hotels in Paris for next weekend, filter by 4-star rating, and find the cheapest option",
    maxSteps: 25,
    output: z.object({
      hotelName: z.string(),
      price: z.string(),
      rating: z.number(),
      bookingUrl: z.string()
    })
  });

  await stagehand.close();
  return result.output;
}
```

### Multi-step Form Automation

```typescript
async function fillComplexForm(formData: any) {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "anthropic/claude-sonnet-4-20250514"
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];
  await page.goto("https://complex-form.example.com");

  const formFields = await stagehand.observe("find all form input fields");
  console.log("Available form fields:", formFields);

  try {
    await stagehand.act("fill the first name field with '%firstName%'", {
      variables: { firstName: formData.firstName }
    });
    await stagehand.act("fill the last name field with '%lastName%'", {
      variables: { lastName: formData.lastName }
    });
    await stagehand.act("select '%country%' from the country dropdown", {
      variables: { country: formData.country }
    });
    await stagehand.act("wait for the address fields to appear");
    await stagehand.act("fill the address field with '%address%'", {
      variables: { address: formData.address }
    });
    await stagehand.act("click the submit button");

    const confirmation = await stagehand.extract(
      "extract the confirmation message",
      z.object({
        message: z.string(),
        confirmationId: z.string().optional()
      })
    );

    await stagehand.close();
    return confirmation;

  } catch (error) {
    await stagehand.close();
    throw error;
  }
}
```

## Advanced Features

### Computer Use Agent (CUA) Mode

For complex visual interactions:

```typescript
const agent = stagehand.agent({
  mode: "cua",
  model: "google/gemini-2.5-computer-use-preview-10-2025",
  systemPrompt: "You are an expert web automation assistant"
});

await agent.execute({
  instruction: "Navigate to the dashboard, click the export button, and download the CSV file",
  maxSteps: 15,
  highlightCursor: true
});
```

### Streaming Agent Responses

```typescript
const agent = stagehand.agent({
  model: "anthropic/claude-sonnet-4-5-20250929",
  stream: true,
  experimental: true
});

const streamResult = await agent.execute({
  instruction: "Research competitive pricing for laptops",
  maxSteps: 30
});

for await (const delta of streamResult.textStream) {
  console.log("Agent progress:", delta);
}

const finalResult = await streamResult.result;
```

### Cost Optimization

```typescript
const stagehand = new Stagehand({
  env: "LOCAL",
  model: "google/gemini-3-flash-preview",
  cacheDir: "/workspace/group/stagehand-cache"
});

// Observe once, then act multiple times without LLM calls
const buttons = await stagehand.observe("find all action buttons");
for (const button of buttons) {
  await stagehand.act(button);
}
```

## Error Handling & Debugging

```typescript
async function robustAutomation(url: string, maxRetries = 3) {
  let attempt = 0;

  while (attempt < maxRetries) {
    const stagehand = new Stagehand({
      env: "LOCAL",
      verbose: 2,
      model: "google/gemini-3-flash-preview"
    });

    try {
      await stagehand.init();
      const page = stagehand.context.pages()[0];
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await stagehand.act("wait for the page to fully load");

      const result = await stagehand.extract("extract page data");

      await stagehand.close();
      return result;

    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      await stagehand?.close();

      if (attempt === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      attempt++;
    }
  }
}
```

## Usage Patterns & Best Practices

### 1. Single Actions vs Multi-step Workflows

```typescript
// ✅ Good - single actions
await stagehand.act("click the search button");
await stagehand.act("type 'laptops' in the search box");
await stagehand.act("press Enter");

// ❌ Bad - too complex for one action
await stagehand.act("search for laptops and filter by price under $1000");

// ✅ For complex workflows, use agents
const agent = stagehand.agent();
await agent.execute("search for laptops under $1000 and sort by rating");
```

### 2. Secure Variable Handling

```typescript
// ✅ Variables are NOT sent to LLM providers
await stagehand.act("type %username% into the login field", {
  variables: { username: process.env.LOGIN_USERNAME }
});

await stagehand.act("type %password% into the password field", {
  variables: { password: process.env.LOGIN_PASSWORD }
});
```

### 3. Performance Optimization

```typescript
// Use observe() to reduce scope and improve speed
const [table] = await stagehand.observe("find the data table");

const data = await stagehand.extract({
  instruction: "extract all rows from the table",
  schema: DataSchema,
  selector: table.selector
});
```

## Command Line Usage

```bash
cd /workspace/group

# Create a new automation script
cat > scrape_example.mjs << 'EOF'
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod/v3";

const stagehand = new Stagehand({
  env: "LOCAL",
  model: "google/gemini-3-flash-preview"
});

await stagehand.init();
const page = stagehand.context.pages()[0];
await page.goto(process.argv[2] || "https://example.com");

const title = await stagehand.extract("extract the page title", z.string());
console.log("Page title:", title);

await stagehand.close();
EOF

node scrape_example.mjs https://news.ycombinator.com
```

## Model Recommendations

| Use Case | Recommended Model | Reasoning |
|----------|------------------|-----------|
| Fast scraping | `google/gemini-3-flash-preview` | Fastest, cheapest |
| Complex forms | `anthropic/claude-sonnet-4-20250514` | Best reasoning |
| Visual automation | `google/gemini-2.5-computer-use-preview-10-2025` | CUA support |
| High accuracy | `google/gemini-3-pro-preview` | Most capable Gemini model |

## Troubleshooting

### Common Issues

1. **Timeout errors**: Increase timeout in action options
2. **Element not found**: Use `observe()` first to check available elements
3. **Rate limiting**: Add delays between actions
4. **Dynamic content**: Use `act("wait for content to load")` before extraction
5. **Session expired**: Check `/workspace/group/browser-profile/` exists and isn't corrupted — delete it to force re-login

### Debug Mode

```typescript
const stagehand = new Stagehand({
  env: "LOCAL",
  verbose: 2,
  logInferenceToFile: true
});
```

### View Metrics

```typescript
const metrics = await stagehand.metrics;
console.log(`Tokens used: ${metrics.totalPromptTokens + metrics.totalCompletionTokens}`);
```

## Documentation Links

- [Stagehand v3 Documentation](https://docs.stagehand.dev/v3/first-steps/introduction)
- [GitHub Repository](https://github.com/browserbase/stagehand)
- [API Reference](https://docs.stagehand.dev/v3/api)
- [Best Practices](https://docs.stagehand.dev/v3/guides/best-practices)
