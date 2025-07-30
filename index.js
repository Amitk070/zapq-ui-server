import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import uploadRouter from './upload.js';
import { buildClaudeProjectPrompt } from './buildClaudeProjectPrompt.js';
import { OrchestrationEngine } from './OrchestrationEngine.js';
import { getStackConfig, getAllStacks } from './stackConfigs.js';

// Inline the utils functions to avoid ES module conflicts
function findBestFileToEdit(userPrompt, availableFiles) {
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

function buildEditPrompt(userPrompt, targetFile) {
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
const safeApiKey = API_KEY;

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'https://code.zapq.dev'
  ],
  credentials: true
}));
app.use(express.json());
app.use(uploadRouter);

const SRC_DIR = path.join(process.cwd(), 'src');

app.get('/files', (req, res) => {
  const walk = (dir) => {
    let results = [];
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

// 🆕 NEW ARCHITECTURE: Get available technology stacks
app.get('/stacks', (req, res) => {
  try {
    const stacks = getAllStacks();
    console.log(`📚 Returning ${stacks.length} available stacks`);
    
    res.json({
      success: true,
      stacks: stacks.map(stack => ({
        id: stack.id,
        name: stack.name,
        description: stack.description,
        framework: stack.framework,
        buildTool: stack.buildTool,
        styling: stack.styling,
        language: stack.language,
        icon: stack.icon
      }))
    });
  } catch (error) {
    console.error('❌ Failed to get stacks:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get available stacks' 
    });
  }
});

// 🆕 NEW ARCHITECTURE: Orchestrated project generation
app.post('/orchestrate-project', async (req, res) => {
  const { stackId, projectName, userPrompt } = req.body;
  
  if (!stackId || !projectName || !userPrompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'stackId, projectName, and userPrompt are required' 
    });
  }
  
  try {
    console.log(`🏗️ Starting orchestrated project generation: ${projectName} (${stackId})`);
    
    // Create orchestration engine instance
    const engine = new OrchestrationEngine(stackId, askClaude);
    
    // Progress tracking (for future WebSocket implementation)
    const progressCallback = (step, progress) => {
      console.log(`📊 Progress: ${Math.round(progress)}% - ${step}`);
      // TODO: Implement WebSocket for real-time progress updates
    };
    
    // Generate project
    const result = await engine.generateProject(projectName, userPrompt, progressCallback);
    
    if (result.success) {
      console.log(`✅ Orchestrated generation successful: ${Object.keys(result.files).length} files`);
      
      // Debug token tracking values
      console.log('🔍 Token tracking debug:');
      console.log('  - result.tokensUsed:', result.tokensUsed);
      console.log('  - engine.totalTokensUsed:', engine.totalTokensUsed);
      console.log('  - typeof result.tokensUsed:', typeof result.tokensUsed);
      console.log('  - typeof engine.totalTokensUsed:', typeof engine.totalTokensUsed);
      
      // Extract token usage from engine - prioritize actual tracking
      const actualTokens = result.tokensUsed !== undefined ? result.tokensUsed : engine.totalTokensUsed;
      const tokensUsed = (actualTokens !== undefined && actualTokens > 0) ? actualTokens : Math.max(1000, Object.keys(result.files).length * 200);
      
      console.log(`🪙 Final token calculation:`);
      console.log(`  - actualTokens: ${actualTokens}`);
      console.log(`  - tokensUsed (final): ${tokensUsed}`);
      
      res.json({
        success: true,
        files: Object.entries(result.files).map(([path, content]) => ({
          name: path,
          content: content
        })),
        tokensUsed: tokensUsed
      });
    } else {
      console.log(`❌ Orchestrated generation failed:`, result.errors);
      const errorTokens = result.tokensUsed !== undefined ? result.tokensUsed : engine.totalTokensUsed || 0;
      res.status(500).json({
        success: false,
        error: result.errors?.[0] || 'Project generation failed',
        details: result.errors,
        tokensUsed: errorTokens
      });
    }
    
  } catch (error) {
    console.error('🚨 Orchestration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown orchestration error'
    });
  }
});

// 🆕 NEW ARCHITECTURE: Generic chat endpoint for OrchestrationEngine
app.post('/chat', async (req, res) => {
  const { prompt, maxTokens = 2048 } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required and must be a string' 
    });
  }
  
  try {
    console.log(`🤖 Claude request: ${prompt.substring(0, 100)}...`);
    
    const { output, tokensUsed } = await askClaude(prompt, maxTokens);
    
    console.log(`✅ Claude responded: ${output.length} chars, ${tokensUsed} tokens`);
    
    res.json({ 
      success: true, 
      response: output,
      tokensUsed
    });
  } catch (err) {
    console.error('❌ Claude chat error:', err);
    res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Claude request failed' 
    });
  }
});

// 🆕 NEW ARCHITECTURE: Step-by-step project generation using OrchestrationEngine
app.post('/generate-project', async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required and must be a string' 
    });
  }
  
  try {
    console.log(`🚀 Starting step-by-step generation: ${prompt.substring(0, 100)}...`);
    
    // Parse project name from prompt for better organization
    const projectName = prompt.split(' ').slice(0, 3).join(' ');
    
    // Use React + Vite + Tailwind stack for all projects
    const engine = new OrchestrationEngine('react-vite-tailwind', askClaude);
    
    // Progress callback for logging
    const progressCallback = (step, progress) => {
      console.log(`📊 Progress: ${Math.round(progress)}% - ${step}`);
    };
    
    // Generate project using step-by-step approach
    const result = await engine.generateProject(projectName, prompt, progressCallback);
    
    if (result.success) {
      console.log(`✅ Step-by-step generation successful: ${Object.keys(result.files).length} files`);
      
      res.json({
        success: true,
        files: Object.entries(result.files).map(([path, content]) => ({
          path,
          content
        })),
        tokensUsed: 0 // TODO: Track tokens across all steps
      });
    } else {
      console.log(`❌ Step-by-step generation failed:`, result.errors);
      res.status(500).json({
        success: false,
        error: result.errors?.[0] || 'Project generation failed',
        details: result.errors
      });
    }
    
  } catch (error) {
    console.error('🚨 Step-by-step generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown generation error'
    });
  }
});

app.post('/smart-edit', async (req, res) => {
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

app.get('/file', (req, res) => {
  const filePath = req.query.path;
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

// Enhanced askClaude function with rate limiting and retry logic
async function askClaude(prompt, max_tokens = 2048, retryCount = 0) {
  const maxRetries = 3;
  const baseDelay = 60000; // 1 minute base delay
  
  try {
    console.log(`🤖 Claude request: ${prompt.substring(0, 100)}... (${max_tokens} max tokens)`);
    
    const result = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: max_tokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (result.status === 429) {
      // Rate limit hit
      const retryAfter = result.headers.get('retry-after');
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, retryCount);
      
      console.log(`⏱️ Rate limit hit. Retrying in ${delay/1000} seconds... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await askClaude(prompt, max_tokens, retryCount + 1);
      } else {
        throw new Error(`Rate limit exceeded. Max retries (${maxRetries}) reached. Please try again later.`);
      }
    }

    if (!result.ok) {
      console.error(`❌ Claude API error: ${result.status} ${result.statusText}`);
      const errorText = await result.text();
      console.error('❌ Error details:', errorText);
      throw new Error(`Claude API failed: ${result.status} ${result.statusText}`);
    }

    const raw = await result.json();
    console.log('🔍 Claude raw response structure:', Object.keys(raw));

    if (raw.error) {
      console.error('❌ Claude API returned error:', raw.error);
      throw new Error(`Claude API error: ${raw.error.message || 'Unknown error'}`);
    }

    const output = raw.content?.[0]?.text || '';
    const tokensUsed = raw.usage?.output_tokens || 0;

    console.log(`✅ Claude responded: ${output.length} chars, ${tokensUsed} tokens`);

    if (output.length === 0) {
      console.warn('⚠️ Claude returned empty response');
      console.log('🔍 Full raw response:', JSON.stringify(raw, null, 2));
    }

    return { output, tokensUsed };
  } catch (error) {
    if (error.message.includes('Rate limit') && retryCount < maxRetries) {
      console.log(`🔄 Retrying after error: ${error.message}`);
      const delay = baseDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return await askClaude(prompt, max_tokens, retryCount + 1);
    }
    
    console.error('❌ askClaude error:', error);
    throw error;
  }
}

// Legacy endpoint for direct Claude calls
app.post('/claude', async (req, res) => {
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
function cleanClaudeResponse(raw) {
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

app.post('/claude-project', async (req, res) => {
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

// 🆕 NEW ARCHITECTURE: Simplified file editing for OrchestrationEngine
app.post('/edit-file', async (req, res) => {
  const { prompt, filePath, currentContent, maxTokens = 2048 } = req.body;

  if (!prompt || !filePath || !currentContent) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt, filePath, and currentContent are required' 
    });
  }

  try {
    const editPrompt = `You are a TypeScript + Tailwind CSS code assistant.

Apply the following user request to the file:

Request: "${prompt}"

Current contents of ${filePath}:
\`\`\`tsx
${currentContent}
\`\`\`

Important: Return ONLY the updated code. Do not include explanations, markdown formatting, or file path comments. Just return the raw updated code that should replace the current file content.

Make minimal, focused changes that directly address the user's request while preserving the existing code structure and style.`;

    const { output, tokensUsed } = await askClaude(editPrompt, maxTokens);

    res.json({
      success: true,
      updatedContent: output,
      filePath,
      tokensUsed
    });
  } catch (err) {
    console.error('❌ edit-file error:', err);
    res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to edit file' 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 NEW ARCHITECTURE: Claude backend running on port ${PORT}`);
  console.log(`🔗 Supporting OrchestrationEngine + StackConfigs`);
  console.log(`📡 CORS enabled for localhost:5177 and code.zapq.dev`);
  console.log(`🧩 Available stacks: ${getAllStacks().length}`);
}); 
