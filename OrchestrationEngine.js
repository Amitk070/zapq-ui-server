import { getStackConfig } from './stackConfigs.js';
import { v4 as uuidv4 } from 'uuid';

export class OrchestrationEngine {
  constructor(sessionId = null, askClaudeFunction = null, stackConfig = null) {
    this.sessionId = sessionId || uuidv4();
    this.askClaude = askClaudeFunction;
    this.stackConfig = stackConfig;
    this.session = {
      sessionId: this.sessionId,
      history: [],
      currentStep: 0,
      totalSteps: 6,
      projectType: null,
      featureToggles: {},
      generatedFiles: {},
      errors: [],
      warnings: [],
      totalTokensUsed: 0
    };
  }

  // Enhanced Claude call with session history and context
  async askClaudeWithSession(prompt, maxTokens = 4096, context = {}) {
    const sessionContext = this.buildSessionContext(context);
    const enhancedPrompt = this.enhancePromptWithHistory(prompt, sessionContext);
    
    if (!this.askClaude) {
      throw new Error('askClaude function not provided to OrchestrationEngine');
    }
    
    const result = await this.askClaude(enhancedPrompt, maxTokens);
    
    // Track in session history
    this.session.history.push({
      timestamp: new Date().toISOString(),
      prompt: enhancedPrompt,
      response: result.output,
      tokensUsed: result.tokensUsed || 0,
      context: context,
      step: this.session.currentStep
    });
    
    this.session.totalTokensUsed += result.tokensUsed || 0;
    console.log(`📊 Session ${this.sessionId} - Claude call: ${result.tokensUsed || 0} tokens (Total: ${this.session.totalTokensUsed})`);
    
    return result;
  }

  // Build intelligent session context for Claude
  buildSessionContext(additionalContext = {}) {
    const context = {
      sessionId: this.sessionId,
      projectType: this.session.projectType,
      featureToggles: this.session.featureToggles,
      currentStep: this.session.currentStep,
      previousSteps: this.session.history.slice(-3), // Last 3 interactions
      projectPlan: this.session.projectPlan,
      errors: this.session.errors,
      warnings: this.session.warnings,
      ...additionalContext
    };
    
    return context;
  }

  // Enhance prompts with session history for intelligent chaining
  enhancePromptWithHistory(prompt, context) {
    let enhancedPrompt = prompt;
    
    // Add session context if available
    if (context.projectType) {
      enhancedPrompt = `[Project Type: ${context.projectType}]\n${enhancedPrompt}`;
    }
    
    // Add recent history for context
    if (context.previousSteps && context.previousSteps.length > 0) {
      enhancedPrompt = `[Previous Context: ${context.previousSteps.map(step => 
        `${step.step}: ${step.response.substring(0, 100)}...`
      ).join(' | ')}]\n${enhancedPrompt}`;
    }
    
    // Add feature toggles context
    if (context.featureToggles && Object.keys(context.featureToggles).length > 0) {
      const toggles = Object.entries(context.featureToggles || {})
        .filter(([_, enabled]) => enabled)
        .map(([feature, _]) => feature)
        .join(', ');
      enhancedPrompt = `[Enabled Features: ${toggles}]\n${enhancedPrompt}`;
    }
    
    return enhancedPrompt;
  }

  // Modular Claude call with intent-based execution
  async executeModularClaudeCall(intent, data, maxTokens = 4096) {
    const prompt = this.getPromptForIntent(intent, data);
    const sessionContext = this.buildSessionContext();
    
    console.log(`🤖 Claude request: ${intent} (${maxTokens} max tokens)`);
    
    const result = await this.askClaudeWithSession(prompt, maxTokens);
    
    console.log(`✅ Claude responded: ${result.output.length} chars, ${result.tokens} tokens`);
    
    return result;
  }

  // Intent-based prompt templates
  getAnalyzePrompt(data) {
    const stackConfig = this.stackConfig || {};
    if (stackConfig.prompts && stackConfig.prompts.analyze) {
      return stackConfig.prompts.analyze
        .replace('{userPrompt}', data.userPrompt)
        .replace('{projectName}', data.projectName || 'Project');
    }
    
    // Fallback to basic prompt if no stack-specific prompt
    return `Analyze this project request and determine the optimal project type and structure for ${stackConfig.framework} with ${stackConfig.buildTool}.

User Request: "${data.userPrompt}"

Return the project analysis as JSON:
{
  "projectType": "landing|dashboard|ecommerce|portfolio|crm",
  "description": "Brief project description",
  "pages": [
    {"name": "HomePage", "path": "/", "description": "Main page"}
  ],
  "components": [
    {"name": "Navbar", "description": "Navigation component"}
  ],
  "featureToggles": {
    "darkMode": false,
    "authentication": false,
    "chatbot": false,
    "analytics": true,
    "responsive": true
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or explanations.`;
  }

  getPlanPrompt(data) {
    const stackConfig = this.stackConfig || {};
    const featureToggles = data.featureToggles || {};
    const enabledFeatures = Object.entries(featureToggles)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature)
      .join(', ');

    // Use stack-specific plan prompt if available
    if (stackConfig.prompts && stackConfig.prompts.plan) {
      return stackConfig.prompts.plan
        .replace('{projectType}', data.projectType)
        .replace('{projectName}', data.projectName)
        .replace('{description}', data.description)
        .replace('{enabledFeatures}', enabledFeatures)
        .replace('{framework}', stackConfig.framework)
        .replace('{buildTool}', stackConfig.buildTool)
        .replace('{styling}', stackConfig.styling)
        .replace('{language}', stackConfig.language);
    }

    // Fallback to basic plan prompt
    return `Plan the technical structure for a ${data.projectType} project using ${stackConfig.framework} with ${stackConfig.buildTool}.

Project: ${data.projectName}
Description: ${data.description}
Enabled Features: ${enabledFeatures}
Tech Stack: ${stackConfig.framework} + ${stackConfig.buildTool} + ${stackConfig.styling} + ${stackConfig.language}

Generate the following configuration files with clean code (NO markdown formatting):

1. **package.json** - Project configuration with dependencies
2. **${stackConfig.buildTool === 'vite' ? 'vite.config.ts' : 'next.config.js'}** - Build configuration
3. **tailwind.config.js** - Tailwind CSS configuration
4. **tsconfig.json** - TypeScript configuration
5. **index.html** - Main HTML entry point
6. **src/main.tsx** - React entry point
7. **src/App.tsx** - Main App component
8. **src/index.css** - Global styles with Tailwind imports

IMPORTANT: 
- Return ONLY clean code files, NO markdown formatting
- Use proper file extensions (.json, .ts, .tsx, .js, .html, .css)
- Include all necessary dependencies and configurations
- Use modern React patterns with TypeScript
- Include Tailwind CSS setup
- Adapt configuration based on the selected stack

Format each file as: FILENAME:content (no markdown blocks)`;
  }

  getGeneratePrompt(data) {
    const stackConfig = this.stackConfig || {};
    const featureToggles = data.featureToggles || {};
    const enabledFeatures = Object.entries(featureToggles)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature)
      .join(', ');

    // Use stack-specific generate prompt if available
    if (stackConfig.prompts && stackConfig.prompts.generate) {
      return stackConfig.prompts.generate
        .replace('{projectType}', data.projectType)
        .replace('{projectName}', data.projectName)
        .replace('{description}', data.description)
        .replace('{enabledFeatures}', enabledFeatures)
        .replace('{framework}', stackConfig.framework)
        .replace('{buildTool}', stackConfig.buildTool)
        .replace('{styling}', stackConfig.styling)
        .replace('{language}', stackConfig.language);
    }

    // Fallback to basic generate prompt
    return `Generate all components and pages for this ${data.projectType} project using ${stackConfig.framework} with ${stackConfig.buildTool}.

Project: ${data.projectName}
Description: ${data.description}
Enabled Features: ${enabledFeatures}
Tech Stack: ${stackConfig.framework} + ${stackConfig.buildTool} + ${stackConfig.styling} + ${stackConfig.language}

Generate the following files with clean code (NO markdown formatting):

1. **package.json** - Project configuration with dependencies
2. **${stackConfig.buildTool === 'vite' ? 'vite.config.ts' : 'next.config.js'}** - Build configuration
3. **tailwind.config.js** - Tailwind CSS configuration
4. **tsconfig.json** - TypeScript configuration
5. **index.html** - Main HTML file
6. **src/main.tsx** - React entry point
7. **src/App.tsx** - Main App component
8. **src/index.css** - Global styles
9. **src/components/Header.tsx** - Navigation component
10. **src/components/Hero.tsx** - Hero section
11. **src/components/Footer.tsx** - Footer component
12. **src/components/Products.tsx** - Product showcase (if ecommerce)

IMPORTANT: 
- Return ONLY clean code files, NO markdown formatting
- Use proper file extensions (.json, .ts, .tsx, .js, .html, .css)
- Include all necessary imports and dependencies
- Use modern React patterns with TypeScript
- Include Framer Motion animations
- Use Tailwind CSS for styling
- Make all content dynamic based on project type and stack configuration

Format each file as: FILENAME:content (no markdown blocks)`;
  }

  getValidatePrompt(data) {
    const files = data.files || {};
    const fileList = Object.keys(files).join(', ');
    
    return `Validate this ${data.projectType} project for production readiness.

Project Files: ${fileList}

Check for:
1. Code quality and best practices
2. TypeScript type safety
3. Accessibility compliance
4. Performance optimization
5. Security considerations
6. Build configuration
7. Feature implementation

Return the validation results as JSON:

{
  "score": 85,
  "passed": true,
  "issues": [
    { "severity": "error|warning", "message": "...", "file": "...", "line": 123 }
  ],
  "recommendations": [
    "list of improvements"
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or explanations.`;
  }

  getComposePrompt(data) {
    const featureToggles = data.featureToggles || {};
    const enabledFeatures = Object.entries(featureToggles)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature)
      .join(', ');

    return `Create comprehensive documentation for this ${data.projectType} project.

Project: ${data.projectName}
Description: ${data.description}
Enabled Features: ${enabledFeatures}

Generate README.md with clean markdown (no code blocks around the entire file):

README.md:
# ${data.projectName}

${data.description}

## Features
- ${enabledFeatures.split(', ').map(f => f).join('\n- ')}

## Installation
\`\`\`bash
npm install
\`\`\`

## Development
\`\`\`bash
npm run dev
\`\`\`

## Build
\`\`\`bash
npm run build
\`\`\`

## Tech Stack
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Framer Motion for animations

IMPORTANT: Return ONLY the README.md content, no markdown formatting around it.`;
  }

  getImprovePrompt(data) {
    const issues = data.issues || [];
    const issuesJson = JSON.stringify(issues);
    
    return `Improve this ${data.projectType} project based on validation issues.

Issues: ${issuesJson}

Improve the code to:
1. Fix all validation errors
2. Implement missing features
3. Enhance code quality
4. Optimize performance
5. Improve accessibility

IMPORTANT: Return ONLY valid JSON with improved code files. Do not include any explanations, markdown, or text before or after the JSON.

{
  "index.html": "improved HTML content",
  "src/App.tsx": "improved React component",
  "src/components/ErrorBoundary.tsx": "error boundary component"
}`;
  }

  async generateProject(userPrompt, projectName = 'generated-project') {
    const startTime = Date.now();
    this.session.currentStep = 0;
    this.session.totalSteps = 6;
    
    console.log(`🚀 Starting project generation: ${projectName}`);
    console.log(`📋 User Request: ${userPrompt}`);
    
    try {
      // Step 1: Analyze
      this.updateProgress(5, '📋 Analyzing project requirements...');
      const analyzeResult = await this.executeModularClaudeCall('analyze', { userPrompt, projectName }, 4096);
      
      const analysis = this.parseJSON(analyzeResult.output);
      if (!analysis) {
        throw new Error('Failed to analyze project requirements');
      }
      
      // Step 2: Plan
      this.updateProgress(20, '⚙️ Planning project structure...');
      const planResult = await this.executeModularClaudeCall('plan', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 8192);
      
      // Step 3: Generate
      this.updateProgress(40, '📄 Generating pages and components...');
      const generateResult = await this.executeModularClaudeCall('generate', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 8192);
      
      // Step 4: Compose
      this.updateProgress(80, '📚 Creating documentation...');
      const composeResult = await this.executeModularClaudeCall('compose', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 4096);
      
      // Step 5: Validate
      this.updateProgress(90, '✅ Validating project quality...');
      const validateResult = await this.executeModularClaudeCall('validate', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 4096);
      
      // Step 6: Improve
      this.updateProgress(95, '🔧 Improving project quality...');
      const improveResult = await this.executeModularClaudeCall('improve', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 4096);
      
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Project generation completed in ${(totalTime / 1000).toFixed(1)}s`);
      
      return {
        success: true,
        projectName,
        files: this.extractAllFiles([planResult, generateResult, composeResult, improveResult]),
        sessionId: this.session.sessionId,
        totalTime: totalTime / 1000
      };
      
    } catch (error) {
      console.error(`❌ Session ${this.session.sessionId} - Generation failed:`, error);
      return {
        success: false,
        error: error.message,
        sessionId: this.session.sessionId
      };
    }
  }

  updateProgress(percentage, message) {
    this.session.currentStep++;
    const estimatedTime = this.calculateEstimatedTime();
    console.log(`📊 Progress: ${percentage}% - ${message} (${estimatedTime}s remaining)`);
  }

  calculateEstimatedTime() {
    const elapsedSteps = this.session.currentStep;
    const totalSteps = this.session.totalSteps;
    const averageTimePerStep = 30; // seconds
    const remainingSteps = totalSteps - elapsedSteps;
    return Math.round(remainingSteps * averageTimePerStep);
  }

  reset() {
    this.session.projectPlan = null;
    this.session.generatedFiles = {};
    this.session.currentStep = 0;
    this.session.errors = [];
    this.session.warnings = [];
    this.session.totalTokensUsed = 0;
    this.session.projectType = null;
    this.session.featureToggles = {};
    this.session.validationResults = null;
    // Keep history for session continuity
  }

  // Session management methods
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      createdAt: this.session.createdAt,
      projectType: this.session.projectType,
      currentStep: this.session.currentStep,
      totalTokensUsed: this.session.totalTokensUsed,
      historyLength: this.session.history.length,
      errors: this.session.errors.length,
      warnings: this.session.warnings.length
    };
  }

  getSessionHistory() {
    return this.session.history;
  }

  // Legacy compatibility methods
  async askClaudeWithTracking(prompt, maxTokens = 4096) {
    return await this.askClaudeWithSession(prompt, maxTokens);
  }

  // Helper methods for JSON parsing and code cleaning
  parseJSON(text) {
    try {
      // First, try to parse as-is
      return JSON.parse(text);
    } catch (error) {
      console.log(`❌ JSON parsing failed: ${error.message}`);
      console.log(`🔍 Raw text: ${text.substring(0, 1000)}`);
      console.log(`🔍 Text length: ${text.length}`);
      console.log(`🔍 First 100 chars: ${text.substring(0, 100)}`);
      
      // Try to find JSON in the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonText = jsonMatch[0];
          console.log(`🔄 Found JSON in text, attempting to parse...`);
          return JSON.parse(jsonText);
        } catch (jsonError) {
          console.log(`❌ JSON extraction failed: ${jsonError.message}`);
        }
      }
      
      // Try to complete incomplete JSON
      let cleanedText = text;
      
      // Remove explanatory text before JSON
      const jsonStart = text.indexOf('{');
      if (jsonStart > 0) {
        cleanedText = text.substring(jsonStart);
        console.log(`🔄 Removed explanatory text, attempting to parse...`);
        try {
          return JSON.parse(cleanedText);
        } catch (cleanError) {
          console.log(`❌ Cleaned JSON parsing failed: ${cleanError.message}`);
        }
      }
      
      // Try to fix common JSON issues
      try {
        // Fix trailing commas
        cleanedText = cleanedText.replace(/,(\s*[}\]])/g, '$1');
        // Fix missing quotes around property names
        cleanedText = cleanedText.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        // Fix single quotes to double quotes
        cleanedText = cleanedText.replace(/'/g, '"');
        
        console.log(`🔄 Attempting fallback JSON parsing...`);
        return JSON.parse(cleanedText);
      } catch (fallbackError) {
        console.log(`❌ Fallback parsing also failed: ${fallbackError.message}`);
        throw new Error(`Failed to parse JSON: ${error.message}`);
      }
    }
  }

  cleanCodeResponse(response) {
    if (!response) return '';
    
    // Remove markdown code blocks
    let cleaned = response.replace(/```(tsx?|jsx?|typescript|javascript)?\s*/gi, '').replace(/```\s*/g, '');
    
    // Remove common Claude explanations
    cleaned = cleaned.replace(/^Here's the.*$/gm, '');
    cleaned = cleaned.replace(/^I'll create.*$/gm, '');
    cleaned = cleaned.replace(/^This will.*$/gm, '');
    cleaned = cleaned.replace(/^The component.*$/gm, '');
    
    // Remove file path comments
    cleaned = cleaned.replace(/^\/\/.*$/gm, '');
    cleaned = cleaned.replace(/^\/\*.*?\*\//gms, '');
    
    return cleaned.trim();
  }

  interpolateTemplate(template) {
    return template
      .replace(/{projectName}/g, this.session.projectPlan?.projectName || 'Project')
      .replace(/{description}/g, this.session.projectPlan?.description || '')
      .replace(/{projectType}/g, this.session.projectType || 'app');
  }

  getPageFileName(pageName) {
    // Convert page name to kebab-case filename
    return pageName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')
      .replace(/\s+/g, '-') + '.tsx';
  }

  getComponentFileName(componentName) {
    // Convert component name to PascalCase filename
    return this.toPascalCase(componentName) + '.tsx';
  }

  toPascalCase(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\s+/g, '');
  }

  extractFilesFromText(text) {
    const files = {};
    
    // First, try to extract files in the format "FILENAME:content"
    const filePattern = /^([a-zA-Z0-9\/\-_\.]+\.(tsx?|jsx?|html|css|json|js)):\s*([\s\S]*?)(?=^[a-zA-Z0-9\/\-_\.]+\.(tsx?|jsx?|html|css|json|js):|$)/gm;
    let match;
    
    while ((match = filePattern.exec(text)) !== null) {
      const [, filePath, extension, content] = match;
      if (filePath && content) {
        files[filePath.trim()] = content.trim();
      }
    }
    
    // Fallback: Extract code blocks with file paths
    const codeBlockRegex = /```(?:(\w+):([^\n]+)\n)?([\s\S]*?)```/g;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [, language, filePath, content] = match;
      if (filePath) {
        files[filePath.trim()] = content.trim();
      } else if (language && ['tsx', 'ts', 'jsx', 'js', 'html', 'css', 'json'].includes(language)) {
        // If no file path but has language, try to infer from content
        if (language === 'json' && content.includes('"name"')) {
          files['package.json'] = content.trim();
        } else if (language === 'tsx' || language === 'jsx') {
          files['src/App.tsx'] = content.trim();
        } else if (language === 'html') {
          files['index.html'] = content.trim();
        }
      }
    }
    
    // Also look for file paths in the text
    const filePathRegex = /([a-zA-Z0-9\/\-_\.]+\.(tsx?|jsx?|html|css|json))/g;
    while ((match = filePathRegex.exec(text)) !== null) {
      const filePath = match[1];
      // Extract content after the file path
      const afterPath = text.substring(match.index + filePath.length);
      const nextFileMatch = afterPath.match(/^[a-zA-Z0-9\/\-_\.]+\.(tsx?|jsx?|html|css|json)/);
      const endIndex = nextFileMatch ? afterPath.indexOf(nextFileMatch[0]) : afterPath.length;
      const content = afterPath.substring(0, endIndex).trim();
      
      if (content && !files[filePath]) {
        files[filePath] = content;
      }
    }
    
    return files;
  }

  extractAllFiles(results) {
    const allFiles = {};
    
    for (const result of results) {
      if (result && result.output) {
        const files = this.extractFilesFromText(result.output);
        Object.assign(allFiles, files);
      }
    }
    
    return allFiles;
  }

  // Enhanced validation methods
  async validateProject() {
    console.log('🧪 Starting comprehensive project validation...');
    
    // 1. Check for required files
    const requiredFiles = this.getRequiredFiles();
    const missingFiles = requiredFiles.filter(file => !this.session.generatedFiles[file]);
    
    if (missingFiles.length > 0) {
      this.session.errors.push(`Missing required files: ${missingFiles.join(', ')}`);
      return false;
    }
    console.log('✅ All required files present');

    // 2. Validate package.json structure and dependencies
    if (!await this.validatePackageJson()) {
      return false;
    }
    console.log('✅ package.json validated');

    // 3. Validate configuration files syntax
    if (!await this.validateConfigFiles()) {
      return false;
    }
    console.log('✅ Configuration files validated');

    // 4. Validate TypeScript/JavaScript syntax
    if (!await this.validateCodeSyntax()) {
      return false;
    }
    console.log('✅ Code syntax validated');

    // 5. Validate imports and exports
    if (!await this.validateImportsExports()) {
      return false;
    }
    console.log('✅ Imports/exports validated');

    // 6. Validate project structure
    if (!await this.validateProjectStructure()) {
      return false;
    }
    console.log('✅ Project structure validated');

    // 7. Check deployment readiness
    if (!await this.validateDeploymentReadiness()) {
      return false;
    }
    console.log('✅ Deployment readiness validated');

    console.log('🎉 Project validation completed successfully - ready for deployment!');
    return true;
  }

  getRequiredFiles() {
    const baseFiles = ['package.json'];
    
    switch (this.stackConfig.framework) {
      case 'react':
        return [
          ...baseFiles,
          'vite.config.ts',
          'tsconfig.json', 
          'tailwind.config.js',
          'index.html',
          'src/main.tsx',
          'src/App.tsx',
          'src/index.css'
        ];
      case 'nextjs':
        return [
          ...baseFiles,
          'next.config.js',
          'tsconfig.json',
          'tailwind.config.js',
          'app/layout.tsx',
          'app/page.tsx',
          'app/globals.css'
        ];
      case 'remix':
        return [
          ...baseFiles,
          'remix.config.js',
          'tsconfig.json',
          'tailwind.config.js',
          'app/root.tsx',
          'app/routes/_index.tsx',
          'app/tailwind.css'
        ];
      default:
        return baseFiles;
    }
  }

  async validatePackageJson() {
    try {
      const packageJson = JSON.parse(this.session.generatedFiles['package.json']);
      
      // Check required fields
      const requiredFields = ['name', 'version', 'scripts', 'dependencies', 'devDependencies'];
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          this.session.errors.push(`Missing required field in package.json: ${field}`);
          return false;
        }
      }
      
      // Check for essential dependencies based on framework
      const essentialDeps = {
        react: ['react', 'react-dom'],
        nextjs: ['next', 'react', 'react-dom'],
        remix: ['@remix-run/react', 'react', 'react-dom']
      };
      
      const frameworkDeps = essentialDeps[this.stackConfig.framework] || [];
      for (const dep of frameworkDeps) {
        if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
          this.session.warnings.push(`Missing essential dependency: ${dep}`);
        }
      }
      
      return true;
    } catch (error) {
      this.session.errors.push(`Invalid package.json: ${error.message}`);
      return false;
    }
  }

  async validateConfigFiles() {
    const configFiles = {
      'vite.config.ts': this.validateViteConfig,
      'next.config.js': this.validateNextConfig,
      'remix.config.js': this.validateRemixConfig,
      'tailwind.config.js': this.validateTailwindConfig,
      'tsconfig.json': this.validateTsConfig
    };
    
    for (const [file, validator] of Object.entries(configFiles)) {
      if (this.session.generatedFiles[file]) {
        try {
          const isValid = validator.call(this, this.session.generatedFiles[file]);
          if (!isValid) {
            this.session.errors.push(`Invalid ${file} configuration`);
            return false;
          }
        } catch (error) {
          this.session.errors.push(`Error validating ${file}: ${error.message}`);
          return false;
        }
      }
    }
    
    return true;
  }

  validateViteConfig(content) {
    return content.includes('defineConfig') && content.includes('@vitejs/plugin-react');
  }

  validateNextConfig(content) {
    return content.includes('nextConfig') && content.includes('experimental');
  }

  validateRemixConfig(content) {
    return content.includes('AppConfig') && content.includes('tailwind: true');
  }

  validateTailwindConfig(content) {
    return content.includes('tailwindcss') && content.includes('content:');
  }

  validateTsConfig(content) {
    try {
      const config = JSON.parse(content);
      return config.compilerOptions && config.compilerOptions.target;
    } catch {
      return false;
    }
  }

  async validateCodeSyntax() {
    // Basic syntax validation - in production, you'd use actual TypeScript compiler
    const tsxFiles = Object.entries(this.session.generatedFiles)
      .filter(([path]) => path.endsWith('.tsx') || path.endsWith('.ts'));
    
    for (const [filePath, content] of tsxFiles) {
      if (!this.validateBasicSyntax(content, filePath)) {
        return false;
      }
    }
    
    return true;
  }

  validateBasicSyntax(content, filePath) {
    // Basic checks for common syntax errors
    const checks = [
      { pattern: /import.*from.*['"]/, message: 'Invalid import statement' },
      { pattern: /export.*default/, message: 'Missing default export' },
      { pattern: /function.*\(.*\)/, message: 'Invalid function declaration' },
      { pattern: /const.*=.*=>/, message: 'Invalid arrow function' }
    ];
    
    for (const check of checks) {
      if (!check.pattern.test(content)) {
        this.session.warnings.push(`Potential syntax issue in ${filePath}: ${check.message}`);
      }
    }
    
    return true;
  }

  async validateImportsExports() {
    // Check for circular dependencies and missing imports
    const imports = [];
    const exports = [];
    
    for (const [filePath, content] of Object.entries(this.session.generatedFiles)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Extract imports and exports (simplified)
        const importMatches = content.match(/import.*from.*['"]([^'"]+)['"]/g);
        const exportMatches = content.match(/export.*from.*['"]([^'"]+)['"]/g);
        
        if (importMatches) imports.push(...importMatches);
        if (exportMatches) exports.push(...exportMatches);
      }
    }
    
    // Basic validation
    if (imports.length === 0) {
      this.session.warnings.push('No imports found - check for missing dependencies');
    }
    
    return true;
  }

  async validateProjectStructure() {
    // Check for proper directory structure
    const hasComponents = Object.keys(this.session.generatedFiles).some(f => f.includes('components/'));
    const hasPages = Object.keys(this.session.generatedFiles).some(f => f.includes('pages/') || f.includes('routes/'));
    
    if (!hasComponents) {
      this.session.warnings.push('No components directory found');
    }
    
    if (!hasPages) {
      this.session.warnings.push('No pages/routes directory found');
    }
    
    return true;
  }

  async validateDeploymentReadiness() {
    // Check for deployment-specific requirements
    const hasBuildScript = this.session.generatedFiles['package.json']?.includes('"build"');
    const hasStartScript = this.session.generatedFiles['package.json']?.includes('"start"');
    
    if (!hasBuildScript) {
      this.session.errors.push('Missing build script in package.json');
      return false;
    }
    
    if (!hasStartScript) {
      this.session.warnings.push('Missing start script in package.json');
    }
    
    return true;
  }

  // Legacy methods for backward compatibility
  async generateProjectPlan(projectName, userPrompt) {
    const result = await this.executeModularClaudeCall('analyze', {
      userPrompt,
      projectName
    });
    
    const analysis = this.parseJSON(result.output);
    this.session.projectPlan = analysis;
    this.session.projectType = analysis.projectType;
    this.session.featureToggles = analysis.featureToggles;
    
    return analysis;
  }

  async generateConfigFiles() {
    const result = await this.executeModularClaudeCall('plan', {
      projectType: this.session.projectType,
      projectName: this.session.projectPlan.projectName,
      description: this.session.projectPlan.description,
      featureToggles: this.session.featureToggles
    });
    
    const plan = this.parseJSON(result.output);
    this.session.generatedFiles = {
      ...this.session.generatedFiles,
      ...plan.configFiles,
      ...plan.entryFiles,
      'package.json': plan.packageJson
    };
  }

  async generatePagesFromPlan() {
    if (!this.session.projectPlan?.pages?.length) {
      console.log('⚠️ No pages to generate from plan');
      return;
    }

    for (const page of this.session.projectPlan.pages) {
      const result = await this.executeModularClaudeCall('generate', {
        fileType: 'page',
        projectType: this.session.projectType,
        projectName: this.session.projectPlan.projectName,
        pageName: page.name,
        pagePath: page.path,
        featureToggles: this.session.featureToggles
      });
      
      const fileName = this.getPageFileName(page.name);
      const filePath = `src/pages/${fileName}`;
      this.session.generatedFiles[filePath] = this.cleanCodeResponse(result.output);
    }
  }

  async generateComponentsFromPlan() {
    if (!this.session.projectPlan?.components?.length) {
      console.log('⚠️ No components to generate from plan');
      return;
    }

    for (const component of this.session.projectPlan.components) {
      const result = await this.executeModularClaudeCall('generate', {
        fileType: 'component',
        projectType: this.session.projectType,
        projectName: this.session.projectPlan.projectName,
        componentName: component.name,
        featureToggles: this.session.featureToggles
      });
      
      const fileName = this.getComponentFileName(component.name);
      const filePath = `src/components/${fileName}`;
      this.session.generatedFiles[filePath] = this.cleanCodeResponse(result.output);
    }
  }

  async generateDocumentation() {
    const result = await this.executeModularClaudeCall('compose', {
      projectType: this.session.projectType,
      projectName: this.session.projectPlan.projectName,
      featureToggles: this.session.featureToggles
    });
    
    this.session.generatedFiles['README.md'] = result.output;
  }

  generateFallbackReadme() {
    return `# ${this.session.projectPlan?.projectName || 'Project'}

${this.session.projectPlan?.description || 'A modern web application'}

## 🚀 Quick Start

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start development server:
\`\`\`bash
npm run dev
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`

## 🛠️ Tech Stack

- ${this.stackConfig.framework} framework
- ${this.stackConfig.buildTool} build tool
- ${this.stackConfig.styling} styling
- ${this.stackConfig.language} language

## 📁 Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── pages/         # Application pages
└── ...
\`\`\`

## 🚀 Deployment

This project is ready for deployment on platforms like Vercel, Netlify, or any static hosting service.

## 📝 License

MIT License`;
  }

  enhancePromptForTypeScript(prompt) {
    return `${prompt}

IMPORTANT: 
- Use TypeScript with proper type definitions
- Include interface definitions for props
- Use modern React patterns (hooks, functional components)
- Ensure all imports and exports are properly typed
- Follow TypeScript best practices`;
  }

  getPromptForIntent(intent, data) {
    switch (intent) {
      case 'analyze':
        return this.getAnalyzePrompt(data);
      case 'plan':
        return this.getPlanPrompt(data);
      case 'generate':
        return this.getGeneratePrompt(data);
      case 'validate':
        return this.getValidatePrompt(data);
      case 'compose':
        return this.getComposePrompt(data);
      case 'improve':
        return this.getImprovePrompt(data);
      case 'page':
        return this.getPagePrompt(data);
      case 'component':
        return this.getComponentPrompt(data);
      default:
        throw new Error(`Unknown intent: ${intent}`);
    }
  }

  getPagePrompt(data) {
    const stackConfig = this.stackConfig || {};
    
    // Use stack-specific page prompt if available
    if (stackConfig.prompts && stackConfig.prompts.page) {
      return stackConfig.prompts.page
        .replace('{name}', data.name)
        .replace('{projectType}', data.projectType)
        .replace('{description}', data.description)
        .replace('{path}', data.path)
        .replace('{features}', Array.isArray(data.features) ? data.features.join(', ') : data.features);
    }
    
    // Fallback to basic page prompt
    return `Generate a React TypeScript page component for ${data.name}.

Project Type: ${data.projectType}
Description: ${data.description}
Path: ${data.path}
Features: ${Array.isArray(data.features) ? data.features.join(', ') : data.features}

Return ONLY the complete TypeScript React component code.`;
  }

  getComponentPrompt(data) {
    const stackConfig = this.stackConfig || {};
    
    // Use stack-specific component prompt if available
    if (stackConfig.prompts && stackConfig.prompts.component) {
      return stackConfig.prompts.component
        .replace('{name}', data.name)
        .replace('{projectType}', data.projectType)
        .replace('{description}', data.description)
        .replace('{features}', Array.isArray(data.features) ? data.features.join(', ') : data.features);
    }
    
    // Fallback to basic component prompt
    return `Generate a React TypeScript component for ${data.name}.

Project Type: ${data.projectType}
Description: ${data.description}
Features: ${Array.isArray(data.features) ? data.features.join(', ') : data.features}

Return ONLY the complete TypeScript React component code.`;
  }
}
