/**
 * Memory Extraction for NanoClaw
 *
 * Provides prompts and utilities for extracting memorable information
 * from conversations and storing it in structured memory files.
 */

/**
 * Prompt template for memory extraction.
 * Sent to the agent at the end of significant conversations.
 */
export const MEMORY_EXTRACTION_PROMPT = `
<internal>
## Memory Extraction

Review this conversation and extract any information worth remembering.

### Categories:

1. **LESSONS** (→ memory/lessons.md)
   - Mistakes made that should be avoided
   - New rules or patterns learned
   - Things the user corrected you on

2. **PEOPLE** (→ memory/people.md)
   - User preferences discovered
   - Communication style notes
   - Background information shared

3. **PROJECTS** (→ memory/projects.md)
   - Technical details learned
   - System configurations
   - Tool usage patterns

4. **TASKS** (→ memory/tasks.md)
   - Work started but not completed
   - Follow-up items mentioned
   - Scheduled or promised actions

### Extraction Rules:
- Only extract if confidence is HIGH
- Skip trivial/obvious information
- Skip one-time facts unlikely to be relevant again
- Skip sensitive information
- If nothing significant, don't force it

### Action:
For each item worth remembering, append it to the appropriate memory file.
Use the existing format in each file.
</internal>
`;

/**
 * Categories for memory extraction
 */
export type MemoryCategory = 'lessons' | 'people' | 'projects' | 'tasks';

/**
 * A single extracted memory item
 */
export interface MemoryItem {
  category: MemoryCategory;
  content: string;
  confidence: 'high' | 'medium' | 'low';
  source: string; // conversation reference
}

/**
 * Get the file path for a memory category
 */
export function getMemoryFilePath(category: MemoryCategory, global: boolean = true): string {
  const base = global ? '/workspace/project/groups/global' : '/workspace/group';
  return `${base}/memory/${category}.md`;
}

/**
 * Format a memory item for appending to a file
 */
export function formatMemoryItem(item: MemoryItem, date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0];
  return `\n### ${dateStr}\n${item.content}\n`;
}

/**
 * Check if a conversation is significant enough to warrant memory extraction.
 * Simple heuristic based on message count and length.
 */
export function shouldExtractMemories(
  messageCount: number,
  totalLength: number,
): boolean {
  // Extract if conversation has 5+ messages or 2000+ characters
  return messageCount >= 5 || totalLength >= 2000;
}
