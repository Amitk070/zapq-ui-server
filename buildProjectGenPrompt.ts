export function buildProjectGenPrompt(userPrompt: string): string {
  return `
You are an expert React + TypeScript + Tailwind developer.

Please generate a complete project based on the following request:

"${userPrompt}"

Respond ONLY with a JSON array of objects. Each object must include:
- "path": string (e.g. "src/App.tsx")
- "content": string (full file contents)

Do not include explanations or markdown formatting. Output must begin with '[' and end with ']'.
`;
}
