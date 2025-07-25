// File: index.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import uploadRouter from './upload.js';
import { buildClaudeProjectPrompt } from './buildClaudeProjectPrompt.js';
import { buildProjectGenPrompt } from './buildProjectGenPrompt.js';
import { findBestFileToEdit, buildEditPrompt } from './utils.js';

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
app.use(cors());
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

app.post('/generate-project', async (req: Request, res: Response) => {
  const { userPrompt } = req.body;
  const systemPrompt = buildProjectGenPrompt(userPrompt);

  try {
    const { output: raw, tokensUsed } = await askClaude(systemPrompt, 4096);
    const jsonStart = raw.indexOf('[');
    const jsonEnd = raw.lastIndexOf(']') + 1;
    const fileArray = JSON.parse(raw.slice(jsonStart, jsonEnd));

    fileArray.forEach(({ path: filePath, content }: any) => {
      const absPath = path.join(process.cwd(), filePath);
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, content, 'utf-8');
    });

    res.json({ success: true, files: fileArray.map((f: any) => f.path), tokensUsed });
  } catch (err) {
    console.error('🚨 Claude project generation error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate project' });
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
