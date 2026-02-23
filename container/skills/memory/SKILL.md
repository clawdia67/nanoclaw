---
name: memory
description: Extract and manage memories from conversations. Use after significant conversations to persist learnings.
---

# Memory Management Skill

Use this skill to extract memories from conversations and manage the memory system.

## Memory Files

| File | Purpose | Location |
|------|---------|----------|
| `SOUL.md` | Identity and personality | `/workspace/project/groups/global/SOUL.md` |
| `tasks.md` | Active work, crash recovery | `/workspace/project/groups/global/memory/tasks.md` |
| `lessons.md` | Mistakes to avoid | `/workspace/project/groups/global/memory/lessons.md` |
| `people.md` | Relationships, preferences | `/workspace/project/groups/global/memory/people.md` |
| `projects.md` | Technical context | `/workspace/project/groups/global/memory/projects.md` |
| `daily/*.md` | Daily conversation logs | `/workspace/group/memory/daily/` |

## Extract Memories

After a significant conversation, review and extract memorable information:

### 1. Analyze the conversation

What was discussed? What was learned? What decisions were made?

### 2. Categorize learnings

- **LESSONS**: Mistakes made, corrections received, new rules learned
- **PEOPLE**: User preferences, communication style, background info
- **PROJECTS**: Technical details, configurations, tool patterns
- **TASKS**: Incomplete work, follow-ups, promised actions

### 3. Update memory files

For each category with new learnings:

```bash
# Read current file
cat /workspace/project/groups/global/memory/lessons.md

# Append new content (example)
cat >> /workspace/project/groups/global/memory/lessons.md << 'EOF'

### 2026-02-23
**[Short title]**
- Context: [why this matters]
- Rule: [what to do/avoid]
EOF
```

### 4. Update tasks if needed

If work is in progress or was completed:

```bash
# Read current tasks
cat /workspace/project/groups/global/memory/tasks.md

# Update the relevant section
```

## Extraction Rules

**DO extract:**
- High-confidence learnings
- User preferences that affect future interactions
- Mistakes that shouldn't be repeated
- Technical patterns that will be reused

**DO NOT extract:**
- Trivial/obvious information
- One-time facts unlikely to be relevant
- Sensitive information
- Low-confidence assumptions

## Daily Log

For significant conversations, create a daily log entry:

```bash
DATE=$(date +%Y-%m-%d)
cat >> /workspace/group/memory/daily/${DATE}.md << 'EOF'

## [Time] - [Brief topic]

**Context:** [what was discussed]
**Outcome:** [what was decided/done]
**Follow-up:** [if any]
EOF
```

## View Memory

To see current memory state:

```bash
# List all memory files
find /workspace/project/groups/global/memory -name "*.md" -exec echo "=== {} ===" \; -exec head -20 {} \;

# View specific file
cat /workspace/project/groups/global/memory/lessons.md
```
