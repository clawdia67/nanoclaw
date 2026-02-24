# Firecrawl Skill

Use `npx -y firecrawl-cli` to scrape, search, crawl, and extract from the web.

**`FIRECRAWL_API_KEY` is injected as an environment variable — no fallback needed.**

## Commands

### Scrape a URL
```bash
FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY npx -y firecrawl-cli scrape <url> --only-main-content
```
Add `--format markdown,links` for links too. Add `--wait-for 3000` for JS-heavy pages.

### Search the web
```bash
FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY npx -y firecrawl-cli search "<query>" --limit 10 --json
```
Time filters: `--tbs qdr:h` (hour), `qdr:d` (day), `qdr:w` (week).
Add `--scrape --scrape-formats markdown` to also scrape results.

### Map a site (discover all URLs)
```bash
FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY npx -y firecrawl-cli map <url> --limit 100 --json
```
Add `--search "keyword"` to filter URLs.

### Crawl an entire site
```bash
FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY npx -y firecrawl-cli crawl <url> --wait --progress --limit 50 --max-depth 3
```
Add `--include-paths /docs,/blog` to scope it.

### AI Agent (natural language extraction)
```bash
FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY npx -y firecrawl-cli agent "<prompt>" --wait
```
Optionally: `--urls https://example.com` to focus. `--model spark-1-pro` for higher accuracy.

## Tips
- Always use `--only-main-content` for scraping — cleaner output
- `--json` for structured output, pipe with `jq` for parsing
- Save large results with `-o output.md`
- Check credits: `FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY npx -y firecrawl-cli --status`
- `--tbs qdr:d` = last 24h, `qdr:w` = last week
