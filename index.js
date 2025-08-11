import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { createServer } from 'http';
import { Server } from 'socket.io';
import uploadRouter from './upload.js';
import { buildClaudeProjectPrompt } from './buildClaudeProjectPrompt.js';
import { OrchestrationEngine } from './OrchestrationEngine.js';
import { getStackConfig, getAllStacks } from './stackConfigs.js';
import { EnhancedBackendAPI } from './EnhancedBackendAPI.mjs';
import { BuildValidationAPI } from './buildValidationAPI.js';

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

// Check if API key is available
if (!API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY in environment variables');
  console.error('Please set ANTHROPIC_API_KEY in your environment variables');
  // Don't exit - let the server start but return errors for Claude calls
}
if (!API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY in environment variables');
  process.exit(1);
}
const safeApiKey = API_KEY;

const app = express();
const server = createServer(app);

// Initialize Socket.IO for real-time progress updates
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // List of allowed origins
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174', 
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'https://code.zapq.dev',
        'https://zapq-ui-main-f6uekkucl-amit-ks-projects-30a8790d.vercel.app'
      ];
      
      // Allow any Vercel deployment (*.vercel.app)
      const isVercelDomain = origin.endsWith('.vercel.app');
      
      if (allowedOrigins.includes(origin) || isVercelDomain) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
  
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`📡 Client ${socket.id} joined session: ${sessionId}`);
  });
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'https://code.zapq.dev',
      'https://zapq-ui-main-f6uekkucl-amit-ks-projects-30a8790d.vercel.app'
    ];
    
    // Allow any Vercel deployment (*.vercel.app)
    const isVercelDomain = origin.endsWith('.vercel.app');
    
    if (allowedOrigins.includes(origin) || isVercelDomain) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
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

// 🆕 NEW: Generation status endpoint
app.get('/generation-status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // Check if there are any active generations for this session
  const activeGenerations = io.sockets.adapter.rooms.get(sessionId);
  
  if (activeGenerations) {
    res.json({
      success: true,
      status: 'active',
      sessionId,
      message: 'Generation in progress'
    });
  } else {
    res.json({
      success: true,
      status: 'inactive',
      sessionId,
      message: 'No active generation found'
    });
  }
});

// 🆕 NEW: Cancel generation endpoint
app.post('/cancel-generation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  try {
    // Emit cancellation event to all clients in the session
    io.to(sessionId).emit('generation-cancelled', {
      sessionId,
      timestamp: new Date().toISOString(),
      message: 'Generation cancelled by user'
    });
    
    // Remove all clients from the session room
    const room = io.sockets.adapter.rooms.get(sessionId);
    if (room) {
      for (const clientId of room) {
        const socket = io.sockets.sockets.get(clientId);
        if (socket) {
          socket.leave(sessionId);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Generation cancelled successfully',
      sessionId
    });
  } catch (error) {
    console.error('❌ Error cancelling generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel generation'
    });
  }
});

// 🆕 NEW ARCHITECTURE: Orchestrated project generation with WebSocket progress
app.post('/orchestrate-project', async (req, res) => {
  const { stackId, userPrompt, sessionId, projectName } = req.body;
  
  if (!stackId || !userPrompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'stackId and userPrompt are required' 
    });
  }
  
  try {
    console.log(`🏗️ Starting orchestrated project generation: ${projectName || userPrompt} (${stackId})`);
    
    // Get stack configuration
    const stackConfig = getStackConfig(stackId);
    if (!stackConfig) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid stackId: ${stackId}` 
      });
    }
    
    // Create orchestration engine instance
    const engine = new OrchestrationEngine(sessionId, askClaude, stackConfig);
    
    // Enhanced progress tracking with WebSocket
    const progressCallback = (step, progress) => {
      console.log(`📊 Progress: ${Math.round(progress)}% - ${step}`);
      
      // Emit real-time progress via WebSocket
      if (sessionId) {
        io.to(sessionId).emit('generation-progress', {
          step,
          progress: Math.round(progress),
          timestamp: new Date().toISOString()
        });
      }
    };
    
    // Emit start event
    if (sessionId) {
      io.to(sessionId).emit('generation-started', {
        sessionId,
        projectName: projectName || userPrompt,
        timestamp: new Date().toISOString(),
        message: 'Project generation started'
      });
    }
    
    // Generate project with enhanced timeout handling (10 minutes for enterprise generation)
    const result = await Promise.race([
      engine.generateProject(projectName || userPrompt, userPrompt, progressCallback),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Generation timeout after 10 minutes')), 10 * 60 * 1000)
      )
    ]);
    
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
      
      // Emit completion event
      if (sessionId) {
        io.to(sessionId).emit('generation-complete', {
          success: true,
          fileCount: Object.keys(result.files).length,
          tokensUsed,
          sessionId,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        success: true,
        files: Object.entries(result.files).map(([path, content]) => ({
          name: path,
          content: content
        })),
        tokensUsed: tokensUsed,
        sessionId: sessionId
      });
    } else {
      console.log(`❌ Orchestrated generation failed:`, result.errors);
      const errorTokens = result.tokensUsed !== undefined ? result.tokensUsed : engine.totalTokensUsed || 0;
      
      // Emit error event
      if (sessionId) {
        io.to(sessionId).emit('generation-error', {
          success: false,
          error: result.errors?.[0] || 'Project generation failed',
          details: result.errors,
          sessionId,
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(500).json({
        success: false,
        error: result.errors?.[0] || 'Project generation failed',
        details: result.errors,
        tokensUsed: errorTokens,
        sessionId: sessionId
      });
    }
    
  } catch (error) {
    console.error('🚨 Orchestration error:', error);
    
    // Emit error event
    if (sessionId) {
      io.to(sessionId).emit('generation-error', {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown orchestration error',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown orchestration error',
      sessionId: sessionId
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
      
      // Get actual tokens used from the orchestration engine
      const actualTokens = result.tokensUsed || engine.totalTokensUsed || 0;
      const tokensUsed = actualTokens > 0 ? actualTokens : Math.max(1000, Object.keys(result.files).length * 200);
      console.log(`🪙 Project generation used ${tokensUsed} tokens (actual: ${actualTokens}, engine: ${engine.totalTokensUsed})`);
      
      res.json({
        success: true,
        files: Object.entries(result.files).map(([path, content]) => ({
          path,
          content
        })),
        tokensUsed: tokensUsed
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
  const baseDelay = 2000;

  try {
    const result = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    // Retry if 500 error
    if (result.status >= 500) {
      if (retryCount < maxRetries) {
        const delay = baseDelay * (retryCount + 1);
        console.warn(`🔁 Claude 500 error, retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        return askClaude(prompt, max_tokens, retryCount + 1);
      } else {
        throw new Error(`Claude API failed after retries: ${result.status} ${result.statusText}`);
      }
    }

    if (!result.ok) {
      const errorText = await result.text();
      console.error('❌ Error details:', errorText);
      throw new Error(`Claude API failed: ${result.status} ${result.statusText}`);
    }

    const raw = await result.json();
    const output = raw.content?.[0]?.text || '';
    const tokensUsed = raw.usage?.output_tokens || 0;

    return { output, tokensUsed };

  } catch (error) {
    console.error('❌ Claude API crashed:', error);
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
// Add this after your other routes
app.get('/debug-api-key', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  res.json({
    success: true,
    hasKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyPrefix: apiKey ? apiKey.substring(0, 7) : 'none',
    isValidFormat: apiKey ? apiKey.startsWith('sk-ant-') && apiKey.length > 40 : false
  });
});

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

const enhancedAPI = new EnhancedBackendAPI();
const buildValidationAPI = new BuildValidationAPI();

enhancedAPI.setupRoutes(app);
buildValidationAPI.setupRoutes(app);

const PORT = process.env.PORT || 3001;

// Use server.listen instead of app.listen for WebSocket support
server.listen(PORT, () => {
  console.log(`🚀 NEW ARCHITECTURE: Claude backend running on port ${PORT}`);
  console.log(`🔗 Supporting OrchestrationEngine + StackConfigs`);
  console.log(`📡 CORS enabled for localhost, code.zapq.dev, and all Vercel deployments`);
  console.log(`🧩 Available stacks: ${getAllStacks().length}`);
  console.log(`🔧 WebContainer Build Validation System Ready`);
  console.log(`🔌 WebSocket support enabled for real-time progress updates`);
  console.log(`📊 Build validation endpoints available:`);
  console.log(`  POST /api/validate-build`);
  console.log(`  GET  /api/validate-build/:validationId`);
  console.log(`  DELETE /api/validate-build/:validationId`);
  console.log(`  GET  /api/validate-build/:validationId/preview`);
});