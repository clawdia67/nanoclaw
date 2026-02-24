# Bookie Skill — Independent Odds Assessment

**⚠️ MANDATORY: This skill MUST be run as a subagent with `anthropic/claude-opus-4-6`.**

When this skill is triggered in the main session, spawn a subagent immediately:
```
sessions_spawn(task=<full task below>, model="anthropic/claude-opus-4-6")
```
Do not attempt to run this in the main session.

---

## What This Skill Does

Conducts an independent probabilistic assessment of whether a specific event will occur by a given deadline. It:
- Searches for recent evidence (hours/days, not months)
- Scrapes primary sources directly
- **Explicitly ignores** all prediction market odds (Polymarket, Metaculus, PredictIt, Manifold, etc.)
- Synthesizes its own independent probability estimate from raw evidence

---

## Subagent Task Template

When spawning, pass this full task to the subagent (fill in `[EVENT]` and `[DEADLINE]`):

```
You are an independent probabilistic analyst. Assess the chances of: [EVENT] happening by [DEADLINE].

Follow the Bookie Skill workflow exactly:

### STEP 1 — Setup workspace
Create a temp working directory:
  WORKDIR=/tmp/bookie-$(date +%s)
  mkdir -p $WORKDIR/raw $WORKDIR/scraped
  echo "Assessing: [EVENT] by [DEADLINE]" > $WORKDIR/README.md

### STEP 2 — Tavily news search (multiple angles)
Run 3 targeted searches using Tavily. Save outputs to $WORKDIR/raw/.
Key: TAVILY_API_KEY is injected as an environment variable.

Queries to run (adapt to the specific event):
1. Direct query: the event itself, topic=news, time_range=week, max_results=15, include_answer=advanced
2. Context query: background/history of the key actors involved, time_range=month
3. Counter-signal query: reasons it WON'T happen / obstacles, time_range=week

Save each as $WORKDIR/raw/tavily-1.json, tavily-2.json, tavily-3.json
Collect all URLs found → $WORKDIR/raw/all-urls.txt

### STEP 3 — Perplexity deep research
Run sonar-deep-research on the event.
Key: PERPLEXITY_API_KEY is in env.

Query: "Comprehensive analysis: what are the realistic chances of [EVENT] happening by [DEADLINE]? Focus on recent developments, historical precedents, key decision-makers, and specific preconditions required. Do NOT reference prediction markets."

Save full response to $WORKDIR/raw/perplexity-deep.json
Extract citations → append to $WORKDIR/raw/all-urls.txt

### STEP 4 — Firecrawl top sources
Take the top 5-8 most relevant URLs from all-urls.txt (prioritize primary sources: government, news agencies, official statements over opinion pieces).
Scrape each with:
  FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY npx -y firecrawl-cli scrape <url> --only-main-content -o $WORKDIR/scraped/<slug>.md

Save a manifest: $WORKDIR/scraped/manifest.md listing each URL and its file.

### STEP 5 — Synthesize independently
Read all outputs. DO NOT use any prediction market numbers you may have encountered.

Analyze:
- **Base rate**: historically, how often does this type of event happen in this timeframe?
- **Recent signals FOR** (evidence suggesting it will happen): list with source + date
- **Recent signals AGAINST** (evidence suggesting it won't): list with source + date
- **Key preconditions**: what must happen first? How likely are those?
- **Key actors**: who decides? What are their incentives?
- **Timeline constraint**: how tight is the deadline? Does it help or hurt?
- **Wildcards**: what unexpected events could change the calculus?

### STEP 6 — Output

Save final assessment to $WORKDIR/assessment.md AND print to stdout.

Format:
---
# 🎲 Bookie Assessment
**Event:** [full event description]
**Deadline:** [date]
**Assessment date:** [today]

## Verdict
> **[X]% chance** (confidence: low/medium/high | range: [low]%–[high]%)

## Signals FOR ([X]% weight)
- [date] [source]: [finding]
- ...

## Signals AGAINST ([X]% weight)
- [date] [source]: [finding]
- ...

## Base Rate
[Historical frequency of similar events]

## Key Preconditions
- [ ] [Precondition 1] — [likelihood]
- [ ] [Precondition 2] — [likelihood]

## Wildcards
- [scenario]: [impact on odds]

## Reasoning
[2-3 paragraph narrative explaining the final number]

## Sources
[list of key sources used, with dates]

**Research saved to:** [WORKDIR path]
---
```

---

## Usage Examples

- "estimate chances of US airstrike on Iran before March 15"
- "what are the odds Italy calls snap elections before June"
- "probability that OpenAI releases GPT-5 before April"
- "chances the Fed cuts rates in March"

## Notes
- Always use `sonar-deep-research` for Perplexity, not basic sonar
- Prioritize sources from past 48h for fast-moving events, past week for slower ones
- If an event has a very short deadline (<72h), weight recent signals 80%, base rate 20%
- If deadline is weeks away, weight base rate more heavily
- Never anchor to prediction market numbers — they reflect crowd sentiment, not independent analysis
