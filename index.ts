import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SRC_DIR = path.join(process.cwd(), '../zapq-ui/src');

// ✅ Check for Claude API key
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY in .env file!');
  process.exit(1);
}

app.get('/files', (req, res) => {
  const walk = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
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
    res.status(500).json({ error: 'Failed to list files' });
  }
});

app.get('/file', (req, res) => {
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

app.post('/save', (req, res) => {
  const { path: filePath, content } = req.body;
  const absPath = path.join(SRC_DIR, filePath);
  if (!absPath.startsWith(SRC_DIR)) return res.status(403).send('Forbidden');

  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, 'utf-8');
  res.send({ success: true });
});

app.post('/claude', async (req, res) => {
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

    const data = await result.json() as { content?: { text?: string }[] };
    const output = data?.content?.[0]?.text || '';
    console.log('✅ Claude responded');
    res.json({ success: true, output });
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ success: false, error: 'Claude request failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Claude backend + file API running at http://localhost:${PORT}`);
});
