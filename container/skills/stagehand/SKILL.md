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

**MANDATORY:** Always use `env: "LOCAL"` — we do NOT have Browserbase. Never use `env: "LOCAL"`.

```typescript
const stagehand = new Stagehand({
  env: "LOCAL",  // ALWAYS LOCAL, never BROWSERBASE
  model: "google/gemini-3-flash-preview"
});
```

This uses the local Chrome browser on the machine. Browserbase is a cloud service we don't use.

## Installation

Stagehand is already installed locally in the workspace. All commands should be run from the workspace directory:

```bash
cd ~/.openclaw/workspace
```

## Core Concepts

Stagehand provides four main primitives:

| Primitive   | Purpose                                | AI Level                   |
| ----------- | -------------------------------------- | -------------------------- |
| `act()`     | Execute a single action                | Low — one action at a time |
| `extract()` | Pull structured data from a page       | Low — data extraction      |
| `observe()` | Discover available actions             | Low — page analysis        |
| `agent()`   | Automate entire workflows autonomously | High — full autonomy       |

## Environment Variables

Set these in your `.env` file or export them:

```bash
export BROWSERBASE_API_KEY="your_browserbase_key"
export BROWSERBASE_PROJECT_ID="your_project_id"
export OPENAI_API_KEY="your_openai_key"
export ANTHROPIC_API_KEY="your_anthropic_key"
export GOOGLE_GENERATIVE_AI_API_KEY="your_google_key"
```

## Quick Start Examples

### Basic Page Interaction

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

async function basicAutomation() {
  const stagehand = new Stagehand({ 
    env: "LOCAL",
    model: "google/gemini-3-flash-preview" // Fast and cost-effective
  });
  
  await stagehand.init();
  const page = stagehand.context.pages()[0];
  
  // Navigate to a page
  await page.goto("https://example.com");
  
  // Perform actions with natural language
  await stagehand.act("click the login button");
  await stagehand.act("type 'username' into the email field");
  await stagehand.act("type 'password' into the password field");
  await stagehand.act("click the submit button");
  
  // Extract data
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
  
  // Extract structured product data
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
async function autonomousBooking() {
  const stagehand = new Stagehand({ 
    env: "LOCAL",
    experimental: true // Required for advanced agent features
  });
  
  await stagehand.init();
  
  const agent = stagehand.agent({
    mode: "hybrid", // Combines coordinate and DOM-based actions
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
  
  // Observe form structure first
  const formFields = await stagehand.observe("find all form input fields");
  console.log("Available form fields:", formFields);
  
  // Fill form step by step with error handling
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
    
    // Wait for dynamic content to load
    await stagehand.act("wait for the address fields to appear");
    
    await stagehand.act("fill the address field with '%address%'", {
      variables: { address: formData.address }
    });
    
    // Submit and extract confirmation
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
  highlightCursor: true // Visual debugging
});
```

### Streaming Agent Responses

For real-time feedback:

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

// Stream progress updates
for await (const delta of streamResult.textStream) {
  console.log("Agent progress:", delta);
}

const finalResult = await streamResult.result;
```

### Cost Optimization

```typescript
// Use caching for repeated actions
const stagehand = new Stagehand({
  env: "LOCAL",
  model: "google/gemini-3-flash-preview", // Cheapest, fastest option
  cacheDir: "stagehand-cache" // Cache actions to avoid repeated LLM calls
});

// Observe once, then act multiple times without LLM calls
const buttons = await stagehand.observe("find all action buttons");
for (const button of buttons) {
  await stagehand.act(button); // No LLM inference needed
}
```

## Error Handling & Debugging

```typescript
async function robustAutomation(url: string, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const stagehand = new Stagehand({ 
      env: "LOCAL",
      verbose: 2, // Enable debug logging
      model: "google/gemini-3-flash-preview"
    });
    
    try {
      await stagehand.init();
      const page = stagehand.context.pages()[0];
      
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Wait for dynamic content
      await stagehand.act("wait for the page to fully load");
      
      // Your automation logic here
      const result = await stagehand.extract("extract page data");
      
      await stagehand.close();
      return result;
      
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      await stagehand?.close();
      
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Exponential backoff
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
  selector: table.selector // Targets specific element
});
```

## Command Line Usage

Create automation scripts in the workspace:

```bash
cd ~/.openclaw/workspace

# Create a new automation script
cat > scrape_example.js << 'EOF'
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod/v3";

async function scrapeWebsite() {
  const stagehand = new Stagehand({ 
    env: "LOCAL",
    model: "google/gemini-3-flash-preview"
  });
  
  await stagehand.init();
  const page = stagehand.context.pages()[0];
  
  await page.goto(process.argv[2] || "https://example.com");
  
  // Your automation logic here
  const title = await stagehand.extract("extract the page title", z.string());
  console.log("Page title:", title);
  
  await stagehand.close();
}

scrapeWebsite().catch(console.error);
EOF

# Run the script
node scrape_example.js https://news.ycombinator.com
```

## Integration with OpenClaw

Use Stagehand in OpenClaw workflows:

```typescript
// In an OpenClaw skill or agent
async function automateTask(instruction: string, targetUrl?: string) {
  const { Stagehand } = await import("@browserbasehq/stagehand");
  
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-3-flash-preview"
  });
  
  try {
    await stagehand.init();
    
    if (targetUrl) {
      const page = stagehand.context.pages()[0];
      await page.goto(targetUrl);
    }
    
    // Use agent for complex instructions
    const agent = stagehand.agent();
    const result = await agent.execute({
      instruction: instruction,
      maxSteps: 20
    });
    
    return result;
    
  } finally {
    await stagehand.close();
  }
}

// Usage in OpenClaw
// "Use stagehand to automate booking a hotel room on booking.com"
// "Extract product prices from amazon.com search results"
// "Fill out the contact form on company website with my details"
```

## Model Recommendations

| Use Case | Recommended Model | Reasoning |
|----------|------------------|-----------|
| Fast scraping | `google/gemini-3-flash-preview` | Fastest, cheapest |
| Complex forms | `anthropic/claude-sonnet-4-20250514` | Best reasoning |
| Visual automation | `google/gemini-2.5-computer-use-preview-10-2025` | CUA support |
| Cost-sensitive | `google/gemini-3-flash-preview` | Latest flash, cost-effective |
| High accuracy | `google/gemini-3-pro-preview` | Most capable Gemini model |

## Troubleshooting

### Common Issues

1. **Permission errors**: Use Browserbase (cloud) instead of local browser
2. **Timeout errors**: Increase timeout in action options
3. **Element not found**: Use `observe()` first to check available elements
4. **Rate limiting**: Add delays between actions
5. **Dynamic content**: Use `act("wait for content to load")` before extraction

### Debug Mode

```typescript
const stagehand = new Stagehand({
  env: "LOCAL",
  verbose: 2, // Maximum debugging
  logInferenceToFile: true // Save AI reasoning to files
});
```

### View Metrics

```typescript
const metrics = await stagehand.metrics;
console.log(`Tokens used: ${metrics.totalPromptTokens + metrics.totalCompletionTokens}`);
console.log(`Cost estimate: $${(metrics.totalPromptTokens + metrics.totalCompletionTokens) * 0.000001}`);
```

## Examples Repository

Check the workspace for more examples:

```bash
ls ~/.openclaw/workspace/stagehand-examples/
```

## Documentation Links

- [Stagehand v3 Documentation](https://docs.stagehand.dev/v3/first-steps/introduction)
- [GitHub Repository](https://github.com/browserbase/stagehand)
- [API Reference](https://docs.stagehand.dev/v3/api)
- [Best Practices](https://docs.stagehand.dev/v3/guides/best-practices)

---

This skill enables powerful browser automation with natural language commands. Use it for web scraping, form automation, testing, and any browser-based task that would be tedious to do manually.