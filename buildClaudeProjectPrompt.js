// File: utils/buildClaudeProjectPrompt.js
import fs from 'fs';
import path from 'path';

export function buildClaudeProjectPrompt(projectPath: string): string {
  const summaryLines: string[] = [];
  const fileContents: string[] = [];

  function walk(dir: string, prefix = '') {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const relPath = path.join(prefix, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath, relPath);
      } else if (entry.endsWith('.tsx') || entry.endsWith('.ts') || entry.endsWith('.js')) {
        summaryLines.push(`- ${relPath}`);

        // Add only key files to content payload
        if (/app|layout|main|router/i.test(entry)) {
          const code = fs.readFileSync(fullPath, 'utf-8');
          fileContents.push(`### ${relPath}\n\n\n\n${code}`);
        }
      }
    }
  }

  walk(projectPath);

  return `You are an expert AI code reviewer.
Here is the structure of a React+TS project:

${summaryLines.join('\n')}

---

Some important file contents:

${fileContents.join('\n\n')}

---

Please suggest improvements, simplifications, or refactor ideas across the project.`;
}
