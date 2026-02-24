# Tavily Skill

REST API for search, extract, crawl, map, and deep research.
Base URL: `https://api.tavily.com`

**Auth header for all requests:**
```bash
TAVILY_KEY=$TAVILY_API_KEY
```

---

## Search
```bash
curl -s -X POST https://api.tavily.com/search \
  -H "Authorization: Bearer $TAVILY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "YOUR QUERY",
    "search_depth": "basic",
    "topic": "general",
    "max_results": 10,
    "include_answer": "basic",
    "time_range": "day"
  }' | jq '.answer, .results[] | {title, url, content}'
```
- `topic`: `general` | `news` | `finance`
- `time_range`: `day` | `week` | `month` | `year`
- `search_depth`: `basic` (1 credit) | `advanced` (2 credits)
- Add `"include_raw_content": "markdown"` for full page content

## Extract (scrape URLs)
```bash
curl -s -X POST https://api.tavily.com/extract \
  -H "Authorization: Bearer $TAVILY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com"],
    "extract_depth": "basic"
  }' | jq '.results[] | {url, raw_content}'
```
- Up to 20 URLs per request
- `extract_depth`: `basic` (1 credit/5 URLs) | `advanced` (2 credits/5 URLs)
- Add `"query": "topic"` to get ranked chunks instead of full content

## Crawl (entire site)
```bash
curl -s -X POST https://api.tavily.com/crawl \
  -H "Authorization: Bearer $TAVILY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "max_depth": 2,
    "limit": 50,
    "extract_depth": "basic"
  }' | jq '.results[] | {url, raw_content}'
```
- Add `"instructions": "find all blog posts"` for guided crawl (2 credits/10 pages)
- Add `"select_paths": ["/docs/.*"]` to scope by path regex

## Map (discover URLs)
```bash
curl -s -X POST https://api.tavily.com/map \
  -H "Authorization: Bearer $TAVILY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "max_depth": 2,
    "limit": 100
  }' | jq '.results[]'
```
- Returns list of discovered URLs, no content
- Add `"instructions": "find blog pages"` for guided discovery

## Research (deep multi-search report)
```bash
curl -s -X POST https://api.tavily.com/research \
  -H "Authorization: Bearer $TAVILY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "YOUR RESEARCH QUESTION",
    "model": "auto"
  }' | jq '.'
```
- `model`: `mini` (fast, narrow topics) | `pro` (deep, complex topics) | `auto`
- Returns a full research report with citations
- Add `"citation_format": "apa"` for `numbered` | `mla` | `apa` | `chicago`

## Tips
- Always assign key first: `TAVILY_KEY=$TAVILY_API_KEY`
- Pipe through `jq` for clean output
- `search` with `include_answer: "advanced"` gives a great LLM summary
- Use `research` for deep dives — it runs multiple searches and synthesizes
- Credits: basic search = 1, advanced = 2, extract = 1/5 URLs
