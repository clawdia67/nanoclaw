---
name: perplexity
description: AI-powered web searches with Perplexity, delivering grounded answers with citations and support for batch queries.
metadata:
  openclaw:
    requires:
      bins:
        - curl
        - jq
      environment:
        - PERPLEXITY_API_KEY
---

# Perplexity — AI-Powered Web Search

Perform AI-powered web searches and get grounded answers with citations using the Perplexity API. Supports both single queries and batch queries to fetch concise, sourced responses.

Base URL: `https://api.perplexity.ai`. All endpoints require authentication via `Authorization: Bearer $PERPLEXITY_API_KEY`.

## Single Query Search

Use this for individual research questions that need quick, factual answers with citations.

```bash
curl -s -X POST "https://api.perplexity.ai/chat/completions" \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"model\": \"sonar\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$QUERY\"}],
    \"max_tokens\": 1000,
    \"temperature\": 0.2,
    \"return_citations\": true
  }" | jq .
```

- `model` — Use `sonar` (default), `sonar-pro` (premium), `sonar-reasoning-pro` (complex analysis), or `sonar-deep-research` (comprehensive reports)
- `messages` — Array with user query
- `max_tokens` — Response length limit (adjust as needed)
- `temperature` — Lower values (0.1-0.3) for more focused, factual responses
- `return_citations` — Set to `true` to get source links

## Batch Query Search

Use this for multiple related queries to save API overhead and reduce latency.

```bash
curl -s -X POST "https://api.perplexity.ai/chat/completions" \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"model\": \"sonar\",
    \"messages\": [{
      \"role\": \"user\", 
      \"content\": \"Answer each of these questions separately:\\n1. $QUERY1\\n2. $QUERY2\\n3. $QUERY3\"
    }],
    \"max_tokens\": 2000,
    \"temperature\": 0.2,
    \"return_citations\": true
  }" | jq .
```

## Models

- `sonar` — Basic web search model (default, cost-effective: $1/1M input, $1/1M output)
- `sonar-pro` — Premium model with enhanced quality ($3/1M input, $15/1M output)
- `sonar-reasoning-pro` — Complex analysis model ($2/1M input, $8/1M output)
- `sonar-deep-research` — Comprehensive research reports (multiple pricing tiers)

Default: `sonar` for cost efficiency. Switch model by changing the "model" parameter in the API call.

## Usage Patterns

- **Basic search:** Use `sonar` (default) - 15x cheaper than pro
- **Premium quality:** Use `sonar-pro` when explicitly requested
- **Complex analysis:** Use `sonar-reasoning-pro` for multi-step reasoning
- **Deep research:** Use `sonar-deep-research` for comprehensive reports

## Response Format

Successful searches return:

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Answer with inline citations [1][2]..."
    },
    "finish_reason": "stop"
  }],
  "citations": [
    {
      "url": "https://example.com",
      "title": "Source Title",
      "text": "Relevant excerpt..."
    }
  ]
}
```

## Environment Setup

Set your Perplexity API key:

```bash
export PERPLEXITY_API_KEY="your_api_key_here"
```

## Tips

- Use clear, specific queries for better results
- Lower temperature (0.1-0.3) for factual research
- Always enable `return_citations` for transparency
- Batch related queries to reduce API calls
- Validate citations before using in important decisions
- Rate limits apply - check Perplexity docs for current limits

## Example Use Cases

- Research current AI developments with sources
- Compare companies or products with citations
- Fact-check claims with verifiable references
- Get quick summaries of recent news events
- Gather sourced information for reports or presentations