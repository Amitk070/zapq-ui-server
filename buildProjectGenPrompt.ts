export function buildProjectGenPrompt(userPrompt: string): string {
  return `
You are a senior React developer.

The user wants to build this app:
"${userPrompt}"

Generate a complete, production-ready React + TypeScript + Tailwind CSS project using Vite.

✅ Every file must include real, working code — no placeholders or empty content.

Required files:
- package.json
- vite.config.ts
- tsconfig.json
- tailwind.config.js
- postcss.config.js
- src/index.css
- src/main.tsx
- src/App.tsx
- src/pages/*.tsx (pages as needed)
- src/components/*.tsx (reusable UI components)

Constraints:
- Use functional components
- Use semantic HTML
- Use Tailwind CSS for styling
- Do not include markdown, comments, or extra explanation

Return only a valid JSON array:
[
  { "path": "src/App.tsx", "content": "// full working code here" },
  { "path": "src/pages/About.tsx", "content": "// full code" }
]

Do NOT skip any required file. Do NOT leave content empty.
  `.trim();
}
