
function findBestFileToEdit(userPrompt, availableFiles) {
  if (availableFiles.length === 0) {
    throw new Error('No files available for editing');
  }
  
  // Simple scoring based on keywords
  const prompt = userPrompt.toLowerCase();
  let bestFile = availableFiles[0];
  let highestScore = 0;
  
  for (const file of availableFiles) {
    let score = 0;
    const path = file.path.toLowerCase();
    
    // Score based on common patterns
    if (prompt.includes('header') && path.includes('header')) score += 10;
    if (prompt.includes('login') && path.includes('login')) score += 10;
    if (prompt.includes('home') && path.includes('app')) score += 8;
    if (path.endsWith('.tsx')) score += 3;
    
    if (score > highestScore) {
      highestScore = score;
      bestFile = file;
    }
  }
  
  return bestFile;
}

function buildEditPrompt(userPrompt, targetFile) {
  return `You are a TypeScript + Tailwind CSS code assistant.

Apply this request: "${userPrompt}"

Current file (${targetFile.path}):
\`\`\`tsx
${targetFile.content}
\`\`\`

Return ONLY the updated code, no explanations.`;
}

module.exports = { findBestFileToEdit, buildEditPrompt };
