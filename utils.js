// utils.js - Smart edit helper functions (JavaScript version)

export function findBestFileToEdit(userPrompt, availableFiles) {
  if (availableFiles.length === 0) {
    throw new Error('No files available for editing');
  }

  const prompt = userPrompt.toLowerCase();
  let bestFile = availableFiles[0];
  let highestScore = 0;

  const patterns = [
    { keywords: ['login', 'signin', 'auth'], weight: 10 },
    { keywords: ['header', 'nav', 'navigation'], weight: 10 },
    { keywords: ['footer'], weight: 10 },
    { keywords: ['home', 'landing', 'main'], weight: 8 },
    { keywords: ['dashboard', 'admin'], weight: 8 },
    { keywords: ['profile', 'account'], weight: 8 },
    { keywords: ['settings', 'config'], weight: 6 },
    { keywords: ['button', 'form'], weight: 5 },
  ];

  for (const file of availableFiles) {
    let score = 0;
    const filePath = file.path.toLowerCase();
    const content = file.content.toLowerCase();

    for (const pattern of patterns) {
      const hasKeyword = pattern.keywords.some(keyword => prompt.includes(keyword));
      if (hasKeyword) {
        const pathMatch = pattern.keywords.some(keyword => filePath.includes(keyword));
        const contentMatch = pattern.keywords.some(keyword => content.includes(keyword));

        if (pathMatch) score += pattern.weight * 2;
        if (contentMatch) score += pattern.weight;
      }
    }

    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      score += 3;
    }

    if (filePath.includes('component') || filePath.includes('page')) {
      score += 3;
    }

    if (filePath.includes('config') || filePath.includes('package.json')) {
      score -= 10;
    }

    if (score > highestScore) {
      highestScore = score;
      bestFile = file;
    }
  }

  return bestFile;
}

export function buildEditPrompt(userPrompt, targetFile) {
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
