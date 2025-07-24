// File: index.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import uploadRouter from './upload.js';
import { buildClaudeProjectPrompt } from './buildClaudeProjectPrompt.js';

dotenv.config();

console.log('Loaded ENV:', {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ Present' : '❌ MISSING'
});

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY in environment variables');
  process.exit(1);
}

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

interface ClaudeResponse {
  content?: { text?: string }[];
}

app.post('/claude', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  try {
    const result = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await result.json() as any;
    const output = data?.content?.[0]?.text || '';
    const tokensUsed = data?.usage?.output_tokens || 0;
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
    const result = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4096,
        messages: [{ role: 'user', content: systemPrompt }]
      })
    });
    const data = await result.json();
    const raw = data?.content?.[0]?.text || '';
    const tokensUsed = data?.usage?.output_tokens || 0;
    const jsonStart = raw.indexOf('[');
    const jsonEnd = raw.lastIndexOf(']') + 1;
    const fileArray = JSON.parse(raw.slice(jsonStart, jsonEnd));

    // Save files
    fileArray.forEach(({ path: filePath, content }: any) => {
      const absPath = path.join(process.cwd(), filePath);
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, content, 'utf-8');
    });
  res.json({
  success: true,
  files: fileArray.map((f: any) => f.path),
  tokensUsed
  });
  } catch (err) {
    console.error('🚨 Claude project generation error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate project' });
  }
});


app.post('/claude-project', async (req: Request, res: Response) => {
  const { projectPath } = req.body;
  try {
    const prompt = buildClaudeProjectPrompt(projectPath);

    const result = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await result.json() as any;
    const output = data?.content?.[0]?.text || '';
    const tokensUsed = data?.usage?.output_tokens || 0;
    res.json({ success: true, output, tokensUsed });

  } catch (err) {
    console.error('Claude project refactor error:', err);
    res.status(500).json({ success: false, error: 'Claude failed to analyze project' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Claude backend + file API running on port ${PORT}`);
});
