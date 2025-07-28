import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import uploadRouter from './upload.js';
import { buildClaudeProjectPrompt } from './buildClaudeProjectPrompt.js';
import { buildProjectGenPrompt } from './buildProjectGenPrompt.js';

// Inline the utils functions to avoid ES module conflicts
function findBestFileToEdit(userPrompt: string, availableFiles: any[]) {
  if (availableFiles.length === 0) {
    throw new Error('No files available for editing');
  }

  const prompt = userPrompt.toLowerCase();
  let bestFile = availableFiles[0];
  let highestScore = 0;

  // Keyword patterns for file matching
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

    // Check keyword matches
    for (const pattern of patterns) {
      const hasKeyword = pattern.keywords.some(keyword => prompt.includes(keyword));
      if (hasKeyword) {
        // Bonus if file path contains relevant keywords
        const pathMatch = pattern.keywords.some(keyword => filePath.includes(keyword));
        const contentMatch = pattern.keywords.some(keyword => content.includes(keyword));

        if (pathMatch) score += pattern.weight * 2;
        if (contentMatch) score += pattern.weight;
      }
    }

    // Prefer React component files
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      score += 3;
    }

    // Prefer component/page directories
    if (filePath.includes('component') || filePath.includes('page')) {
      score += 3;
    }

    // Avoid config files
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

function buildEditPrompt(userPrompt: string, targetFile: { path: string; content: string }) {
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

dotenv.config();

console.log('Loaded ENV:', {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ Present' : '❌ MISSING'
});

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY in environment variables');
  process.exit(1);
}
const safeApiKey: string = API_KEY;

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5176',
    'https://code.zapq.dev'  // Add your production domain
  ],
  credentials: true
}));
app.use(express.json());
app.use(uploadRouter);

const SRC_DIR = path.join(process.cwd(), 'src');

app.get('/files', (req: Request, res: Response) => {
  const walk = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.lstatSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(filePath));
      } else if (filePath.endsWith('.tsx')) {
        results.push(path.relative(SRC_DIR, filePath));
      }
    });
    return results;
  };

  try {
    const files = walk(SRC_DIR);
    res.json({ files });
  } catch (err) {
    console.error('❌ Failed to list files:', err);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

app.post('/chat', async (req: Request, res: Response) => {
  const { userPrompt, context } = req.body;
  
  try {
    // Determine if this is a code generation request
    const isCodeRequest = userPrompt.toLowerCase().includes('create') && 
                         (userPrompt.toLowerCase().includes('react') || 
                          userPrompt.toLowerCase().includes('component'));

    // Enhanced prompt engineering
    let systemPrompt = userPrompt;
    if (isCodeRequest) {
      systemPrompt = buildProjectGenPrompt(userPrompt);
    }

    const { output, tokensUsed } = await askClaude(systemPrompt);
    
    res.json({ 
      success: true, 
      response: output,
      tokensUsed,
      responseType: isCodeRequest ? 'code' : 'text'
    });
  } catch (err) {
      res.status(500).json({ success: false, error: 'claud couldnt process your request' });
  }
});

app.post('/smart-edit', async (req: Request, res: Response) => {
  const { userPrompt, availableFiles } = req.body;
  
  try {
    // Find best file to edit
    const targetFile = findBestFileToEdit(userPrompt, availableFiles);
    
    // Create edit prompt
    const editPrompt = buildEditPrompt(userPrompt, targetFile);
    
    const { output, tokensUsed } = await askClaude(editPrompt);
    
    res.json({
      success: true,
      filePath: targetFile.path,
      beforeContent: targetFile.content,
      afterContent: output,
      tokensUsed
    });
  } catch (err) {
    res.status(500).json({ success: false, error: ' failed to edit file' });
  }
});

app.get('/file', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  const absPath = path.join(SRC_DIR, filePath);
  if (!absPath.startsWith(SRC_DIR)) {
    return res.status(403).send('Forbidden');
  }

  fs.readFile(absPath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Failed to read file');
    res.send(data);
  });
});

app.post('/save', (req: Request, res: Response) => {
  const { path: filePath, content } = req.body;
  const absPath = path.join(SRC_DIR, filePath);
  if (!absPath.startsWith(SRC_DIR)) return res.status(403).send('Forbidden');

  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, 'utf-8');
  res.send({ success: true });
});

async function askClaude(prompt: string, max_tokens = 2048): Promise<{ output: string; tokensUsed: number }> {
  const result = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': safeApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const raw: unknown = await result.json();

  const output =
    typeof raw === 'object' &&
    raw !== null &&
    Array.isArray((raw as any).content) &&
    typeof (raw as any).content[0]?.text === 'string'
      ? (raw as any).content[0].text
      : '';

  const tokensUsed =
    typeof raw === 'object' &&
    raw !== null &&
    typeof (raw as any).usage?.output_tokens === 'number'
      ? (raw as any).usage.output_tokens
      : 0;

  return { output, tokensUsed };
}

app.post('/claude', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  try {
    const { output, tokensUsed } = await askClaude(prompt, 1024);
    console.log('✅ Claude responded');
    res.json({ success: true, output, tokensUsed });
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ success: false, error: 'Claude request failed' });
  }
});

// Helper function to clean Claude's response and extract valid JSON
function cleanClaudeResponse(raw: string): string {
  console.log('🧹 Cleaning Claude response...');
  
  // Remove markdown code blocks
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
  
  // Remove common Claude explanations
  cleaned = cleaned.replace(/^Here's the.*$/gm, '');
  cleaned = cleaned.replace(/^I'll create.*$/gm, '');
  cleaned = cleaned.replace(/^This will.*$/gm, '');
  
  // Find JSON array bounds more carefully
  let jsonStart = cleaned.indexOf('[');
  let jsonEnd = -1;
  
  if (jsonStart === -1) {
    throw new Error('No JSON array found in Claude response');
  }
  
  // Find matching closing bracket by counting depth
  let depth = 0;
  for (let i = jsonStart; i < cleaned.length; i++) {
    if (cleaned[i] === '[') depth++;
    if (cleaned[i] === ']') depth--;
    if (depth === 0) {
      jsonEnd = i + 1;
      break;
    }
  }
  
  if (jsonEnd === -1) {
    throw new Error('No matching closing bracket found');
  }
  
  let jsonStr = cleaned.slice(jsonStart, jsonEnd);
  
  // Fix common JSON issues
  jsonStr = jsonStr
    // Fix unterminated strings by finding orphaned quotes
    .replace(/([^\\])"([^"]*?)$/gm, '$1"$2"')
    // Fix missing commas between objects
    .replace(/}\s*{/g, '},{')
    // Fix trailing commas
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix escaped quotes in content
    .replace(/\\"/g, '\\"')
    // Remove control characters that break JSON
    .replace(/[\x00-\x1F\x7F]/g, '');
  
  console.log(`📏 Extracted JSON: ${jsonStr.length} characters`);
  
  return jsonStr;
}

app.post('/generate-project', async (req: Request, res: Response) => {
  const { userPrompt } = req.body;
  const systemPrompt = buildProjectGenPrompt(userPrompt);

  try {
    const { output: raw, tokensUsed } = await askClaude(systemPrompt, 4096);
    console.log(`📝 Raw Claude response: ${raw.length} characters`);
    
    let fileArray: any[];
    
    try {
      // Try robust JSON parsing first
      const cleanJson = cleanClaudeResponse(raw);
      fileArray = JSON.parse(cleanJson);
      console.log(`✅ Successfully parsed JSON with ${fileArray.length} files`);
    } catch (jsonError) {
      console.error('❌ JSON parsing failed:', jsonError);
      
      // Fallback: Try to extract files using regex patterns
      console.log('🔄 Attempting fallback parsing...');
      
      const fileMatches = Array.from(raw.matchAll(/"path":\s*"([^"]+)",\s*"content":\s*"([^"]*(?:\\.[^"]*)*)"/g));
      
      if (fileMatches.length === 0) {
        throw new Error(`Failed to parse Claude response. JSON error: ${jsonError instanceof Error ? jsonError.message : 'Unknown parsing error'}`);
      }
      
      fileArray = fileMatches.map(match => ({
        path: match[1],
        content: match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      }));
      
      console.log(`🔧 Fallback parsing extracted ${fileArray.length} files`);
    }

    const validFiles: { path: string; content: string }[] = [];

    fileArray.forEach(({ path: filePath, content }: any) => {
      if (typeof filePath !== 'string' || typeof content !== 'string' || !content.trim()) {
        console.warn(`⚠️ Skipping ${filePath} due to missing or empty content`);
        return;
      }

      const absPath = path.join(process.cwd(), filePath);
      
      try {
        fs.mkdirSync(path.dirname(absPath), { recursive: true });
        fs.writeFileSync(absPath, content, 'utf-8');
        validFiles.push({ path: filePath, content });
        console.log(`📄 Created: ${filePath} (${content.length} chars)`);
      } catch (fileError) {
        console.error(`❌ Failed to write ${filePath}:`, fileError);
      }
    });

    if (validFiles.length === 0) {
      throw new Error('No valid files were generated by Claude');
    }
    
    console.log(`🎉 Successfully generated ${validFiles.length} files`);
    
    res.json({
      success: true,
      files: validFiles, // Full objects with path AND content
      tokensUsed
    });

  } catch (err) {
    console.error('🚨 Claude project generation error:', err);
    res.status(500).json({ 
      success: false, 
      error: `Failed to generate project: ${err instanceof Error ? err.message : 'Unknown error'}` 
    });
  }
});

app.post('/claude-project', async (req: Request, res: Response) => {
  const { projectPath } = req.body;
  try {
    const prompt = buildClaudeProjectPrompt(projectPath);
    const { output, tokensUsed } = await askClaude(prompt, 2048);
    res.json({ success: true, output, tokensUsed });
  } catch (err) {
    console.error('Claude project refactor error:', err);
    res.status(500).json({ success: false, error: 'Claude failed to analyze project' });
  }
});

app.post('/edit-file', async (req: Request, res: Response) => {
  const { userPrompt } = req.body;

  try {
    const walk = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          results = results.concat(walk(filePath));
        } else if (file.endsWith('.tsx')) {
          results.push(path.relative(SRC_DIR, filePath));
        }
      });
      return results;
    };

    const fileList = walk(SRC_DIR);

    const fileGuessPrompt = `
You are a developer assistant.

A user wants to make the following change to their React app:

"${userPrompt}"

Here is their project file list:
${fileList.map(f => `- ${f}`).join('\n')}

Based on the prompt, which one of these files should be updated?

Respond with ONLY the file path (exactly as listed above). No extra explanation.
`;

    const { output: chosenPathRaw, tokensUsed: step1Tokens } = await askClaude(fileGuessPrompt);
    const normalized = (chosenPathRaw || '').trim().replace(/^\/+/, '');
    const chosenPath = fileList.find(f => f.endsWith(normalized)) ?? '';
    const absPath = path.join(SRC_DIR, chosenPath);
    if (!absPath.startsWith(SRC_DIR) || !fs.existsSync(absPath)) {
      return res.status(400).json({ success: false, error: 'Invalid or unknown file suggested by Claude.' });
    }

    const originalCode = fs.readFileSync(absPath, 'utf-8');

    const editPrompt = `
You are a TypeScript + Tailwind CSS code assistant.

Apply the following user request to the file:

Request:
"${userPrompt}"

Current contents of ${chosenPath}:
\`\`\`tsx
${originalCode}
\`\`\`

Respond ONLY with the updated code in \`\`\`tsx\`\`\` format.
`;

    const { output: updatedRaw, tokensUsed: step2Tokens } = await askClaude(editPrompt);
    const match = updatedRaw.match(/```(?:tsx)?\s*([\s\S]+?)```/);
    const updatedCode = match ? match[1].trim() : updatedRaw;

    fs.writeFileSync(absPath, updatedCode, 'utf-8');

    res.json({
      success: true,
      updatedPath: chosenPath,
      tokensUsed: step1Tokens + step2Tokens
    });
  } catch (err) {
    console.error('❌ edit-file error:', err);
    res.status(500).json({ success: false, error: 'Failed to edit file' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Claude backend + file API running on port ${PORT}`);
}); 
