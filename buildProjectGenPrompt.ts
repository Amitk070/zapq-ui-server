export function buildProjectGenPrompt(userPrompt: string): string {
  return `
You are a senior React developer.

The user wants to build this app:
"${userPrompt}"

Generate a complete React + TypeScript + Tailwind CSS project using Vite.

Required files:
- package.json
- vite.config.ts
- tsconfig.json
- tailwind.config.js
- postcss.config.js
- src/index.css
- src/main.tsx
- src/App.tsx
- src/pages/*.tsx (any necessary pages)
- src/components/*.tsx (any reusable UI pieces)

Constraints:
- Use functional components
- Use semantic HTML
- Use Tailwind CSS for styling
- Return only a JSON array of objects like:
  [
    { "path": "src/App.tsx", "content": "..." },
    { "path": "src/pages/About.tsx", "content": "..." }
  ]

Do not include explanations or markdown. Output must be clean JSON only.
  `.trim();
}
