export function buildEditPrompt(userPrompt: string, targetFile: { path: string; content: string }): string {
  return `You are a TypeScript + Tailwind CSS code assistant.

Apply the following user request to the file:

Request:
"${userPrompt}"

Current contents of ${targetFile.path}:
\`\`\`tsx
${targetFile.content}
\`\`\`

Important: Return ONLY the updated code. Do not include explanations, markdown formatting, or file path comments. Just return the raw updated code that should replace the current file content.

Make minimal, focused changes that directly address the user's request while preserving the existing code structure and style.`;
} 
