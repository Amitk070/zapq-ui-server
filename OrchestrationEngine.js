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
    
    // Add exponential backoff for rate limiting
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 2000; // 2 seconds
    
    while (retryCount <= maxRetries) {
      try {
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
      } catch (error) {
        console.error(`❌ askClaude error (attempt ${retryCount + 1}):`, error);
        
        // Handle rate limiting specifically
        if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
          retryCount++;
          if (retryCount <= maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount - 1); // Exponential backoff
            console.log(`⏱️ Rate limit detected, waiting ${delay}ms before retry ${retryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error('Rate limit exceeded after multiple retries. Please try again later.');
          }
        }
        
        // For non-rate-limit errors, don't retry
        this.session.errors.push(error.message);
        throw error;
      }
    }
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
    return `Plan the technical structure for a COMPLETE, ENTERPRISE-READY ${data.projectType} project using ${stackConfig.framework} with ${stackConfig.buildTool}.

Project: ${data.projectName}
Description: ${data.description}
Tech Stack: ${stackConfig.framework} + ${stackConfig.buildTool} + ${stackConfig.styling}

🚀 PLANNING REQUIREMENTS:
- Plan for a FULLY FUNCTIONAL website with complete content
- Include ALL necessary components and pages
- Use realistic, professional content (no Lorem Ipsum)
- Implement responsive design with mobile-first approach
- Add proper SEO meta tags and structured data
- Include error handling and loading states
- Use modern React patterns with TypeScript
- Implement accessibility features (ARIA labels, keyboard navigation)
- Add smooth animations and transitions
- Include proper form validation and user feedback

📁 REQUIRED CONFIGURATION FILES:
- package.json (ALL dependencies)
- vite.config.ts/next.config.js (build config)
- tailwind.config.js, tsconfig.json, tsconfig.node.json
- index.html (SEO-optimized)
- src/main.tsx, src/App.tsx, src/index.css

🎯 PLANNING REQUIREMENTS:
- Plan for realistic business content and structure
- Include proper component hierarchy and data flow
- Plan for responsive design and mobile optimization
- Include SEO and accessibility planning
- Plan for performance optimization
- Include error handling and user experience planning

🔧 TECHNICAL PLANNING:
- TypeScript strict mode with proper types
- ESLint configuration for code quality
- Prettier formatting configuration
- Responsive design for all screen sizes
- Performance optimization (lazy loading, code splitting)
- SEO optimization (meta tags, structured data)
- Accessibility compliance (WCAG guidelines)

CRITICAL: Plan for COMPLETE, FUNCTIONAL code. NO placeholder content, NO incomplete sections. Each file must be production-ready.

EXAMPLE FORMAT:
package.json:{"name":"project-name","version":"1.0.0",...}
tsconfig.json:{"compilerOptions":{...}}
index.html:<!DOCTYPE html>...

IMPORTANT: Each file must be complete and production-ready.`;
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
    return `Generate a COMPLETE, ENTERPRISE-READY ${data.projectType} project using ${stackConfig.framework} with ${stackConfig.buildTool}.

Project: ${data.projectName}
Description: ${data.description}
Tech Stack: ${stackConfig.framework} + ${stackConfig.buildTool} + ${stackConfig.styling}

🚀 REQUIREMENTS:
- FULLY FUNCTIONAL website with complete content
- Realistic, professional content (no Lorem Ipsum)
- Responsive design with mobile-first approach
- SEO meta tags and structured data
- Error handling and loading states
- Accessibility features (ARIA labels, keyboard navigation)
- Smooth animations and transitions
- Form validation and user feedback

📁 REQUIRED FILES:
- package.json (ALL dependencies)
- vite.config.ts/next.config.js (build config)
- tailwind.config.js, tsconfig.json, tsconfig.node.json
- index.html (SEO-optimized)
- src/main.tsx, src/App.tsx, src/index.css
- src/components/Header.tsx, Hero.tsx, Features.tsx, Products.tsx, Testimonials.tsx, Contact.tsx, Footer.tsx
- src/components/Loading.tsx, ErrorBoundary.tsx

🎯 CONTENT: Real business names, professional copywriting, realistic products, customer testimonials, proper contact info, high-quality images, social media integration.

🔧 TECHNICAL:
- TypeScript strict mode with proper types
- ESLint configuration for code quality
- Prettier formatting configuration
- Responsive design for all screen sizes
- Performance optimization (lazy loading, code splitting)
- SEO optimization (meta tags, structured data)
- Accessibility compliance (WCAG guidelines)

CRITICAL: Generate COMPLETE, FUNCTIONAL code. NO placeholder content, NO incomplete sections, NO "Content will be added here" comments. Each file must be production-ready.

EXAMPLE FORMAT:
package.json:{"name":"project-name","version":"1.0.0",...}
src/App.tsx:import React from 'react'...
index.html:<!DOCTYPE html>...

IMPORTANT: Each file must be complete and production-ready.`;
  }

  getGenerateCorePrompt(data) {
    const stackConfig = this.stackConfig || {};
    
    return `Generate ONLY the core configuration files for a ${data.projectType} project using ${stackConfig.framework} with ${stackConfig.buildTool}.

Project: ${data.projectName}
Description: ${data.description}
Tech Stack: ${stackConfig.framework} + ${stackConfig.buildTool} + ${stackConfig.styling} + ${stackConfig.language}

📁 CORE CONFIGURATION FILES:

1. **package.json** - Complete project configuration with ALL dependencies
2. **${stackConfig.buildTool === 'vite' ? 'vite.config.ts' : 'next.config.js'}** - Build configuration
3. **tailwind.config.js** - Tailwind CSS configuration with custom theme
4. **tsconfig.json** - TypeScript configuration
5. **tsconfig.node.json** - Node TypeScript configuration
6. **index.html** - Complete HTML with proper meta tags and SEO

🔧 TECHNICAL REQUIREMENTS:
- Include ALL necessary dependencies: React 18+, TypeScript, Vite, Tailwind CSS, Framer Motion, React Hook Form, Zod, React Hot Toast, React Icons, Headless UI
- Proper TypeScript configuration with strict mode
- Tailwind CSS with custom theme and responsive design
- SEO-optimized HTML with proper meta tags
- Build tool configuration for production deployment
- Error boundaries and loading states
- Accessibility compliance (WCAG guidelines)
- Performance optimization (lazy loading, code splitting)

CRITICAL: Generate COMPLETE, FUNCTIONAL configuration files. NO placeholder content.

EXAMPLE FORMAT:
package.json:{"name":"project-name","version":"1.0.0",...}
tsconfig.json:{"compilerOptions":{...}}
index.html:<!DOCTYPE html>...

IMPORTANT: Each file must be complete and production-ready.`;
  }

  getGenerateComponentsPrompt(data) {
    const stackConfig = this.stackConfig || {};
    
    return `Generate ALL individual components for a ${data.projectType} project using ${stackConfig.framework} with ${stackConfig.buildTool}.

Project: ${data.projectName}
Description: ${data.description}
Tech Stack: ${stackConfig.framework} + ${stackConfig.buildTool} + ${stackConfig.styling} + ${stackConfig.language}

🧩 REQUIRED COMPONENTS:

1. **src/components/Header.tsx** - Complete navigation with mobile menu
2. **src/components/Hero.tsx** - Hero section with compelling content
3. **src/components/Features.tsx** - Features/benefits section
4. **src/components/Products.tsx** - Product showcase with grid layout
5. **src/components/Testimonials.tsx** - Customer testimonials section
6. **src/components/Contact.tsx** - Contact form with validation
7. **src/components/Footer.tsx** - Complete footer with links
8. **src/components/Loading.tsx** - Loading spinner component
9. **src/components/ErrorBoundary.tsx** - Error boundary component
10. **src/components/Button.tsx** - Reusable button component
11. **src/components/Card.tsx** - Reusable card component
12. **src/components/Modal.tsx** - Modal component for dialogs

🎯 COMPONENT REQUIREMENTS:
- Each component must be COMPLETE and FUNCTIONAL
- Use realistic, professional content (no Lorem Ipsum)
- Include proper TypeScript types and interfaces
- Add responsive design for all screen sizes
- Include accessibility features (ARIA labels, keyboard navigation)
- Add smooth animations and transitions with Framer Motion
- Include proper error handling and loading states
- Use modern React patterns with hooks
- Implement proper state management and form validation
- Add loading spinners and skeleton screens
- Include proper SEO meta tags and structured data
- Add proper keyboard navigation and focus management

🔧 TECHNICAL REQUIREMENTS:
- TypeScript strict mode with proper types
- Responsive design with mobile-first approach
- Accessibility compliance (WCAG guidelines)
- Performance optimization (memo, lazy loading)
- Proper prop validation and default values
- Clean, commented code with JSDoc

CRITICAL: Generate COMPLETE, FUNCTIONAL components. NO placeholder content, NO incomplete sections.

EXAMPLE FORMAT:
src/components/Header.tsx:import React from 'react'...
src/components/Hero.tsx:import React from 'react'...

IMPORTANT: Each component must be complete and production-ready.`;
  }

  getGenerateIntegrationPrompt(data) {
    const stackConfig = this.stackConfig || {};
    
    return `Generate the main App integration that brings ALL components together for a ${data.projectType} project using ${stackConfig.framework} with ${stackConfig.buildTool}.

Project: ${data.projectName}
Description: ${data.description}
Tech Stack: ${stackConfig.framework} + ${stackConfig.buildTool} + ${stackConfig.styling} + ${stackConfig.language}

🔗 MAIN APP INTEGRATION FILES:

1. **src/App.tsx** - COMPLETE main App component that integrates ALL sections
2. **src/main.tsx** - React entry point with error boundaries
3. **src/index.css** - Global styles with Tailwind and custom CSS
4. **src/types/index.ts** - TypeScript types and interfaces
5. **src/utils/index.ts** - Utility functions and helpers
6. **src/hooks/index.ts** - Custom React hooks
7. **src/context/AppContext.tsx** - Global state management
8. **src/services/api.ts** - API service functions
9. **src/constants/index.ts** - Application constants
10. **src/assets/** - Images and static assets
11. **src/styles/** - Additional CSS modules
12. **src/layouts/** - Layout components
13. **src/pages/** - Page components (if needed)
14. **src/routes/** - Routing configuration
15. **src/store/** - State management (Zustand/Redux)
16. **src/middleware/** - Custom middleware
17. **src/validators/** - Form validation schemas
18. **src/helpers/** - Helper functions

🎯 INTEGRATION REQUIREMENTS:
- App.tsx must import and use ALL generated components
- Create a COMPLETE, FUNCTIONAL website layout
- Include proper routing and state management
- Add smooth page transitions and animations
- Include error boundaries and loading states
- Add proper SEO meta tags and structured data
- Include accessibility features throughout
- Add proper form validation and user feedback

🔧 TECHNICAL REQUIREMENTS:
- TypeScript strict mode with proper types
- Responsive design with mobile-first approach
- Performance optimization (lazy loading, code splitting)
- SEO optimization (meta tags, structured data)
- Accessibility compliance (WCAG guidelines)
- Error handling and user experience optimization

CRITICAL: Generate COMPLETE, FUNCTIONAL integration. NO placeholder content, NO incomplete sections.

EXAMPLE FORMAT:
src/App.tsx:import React from 'react'...
src/main.tsx:import React from 'react'...

IMPORTANT: Each file must be complete and production-ready.`;
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

CRITICAL REQUIREMENTS:
- Return ONLY clean markdown files, NO code blocks around the entire file
- Format each file as: FILENAME:content (no markdown blocks)
- Each file must be complete and properly formatted
- Do not include partial content or placeholder text

Generate README.md with clean markdown:

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
    this.session.totalSteps = 8; // Increased steps for better planning
    
    console.log(`🚀 Starting project generation: ${projectName}`);
    console.log(`📋 User Request: ${userPrompt}`);
    
    try {
      // Step 1: Analyze (Enhanced)
      this.updateProgress(5, '📋 Analyzing project requirements...');
      const analyzeResult = await this.executeModularClaudeCall('analyze', { userPrompt, projectName }, 4096);
      
      const analysis = this.parseJSON(analyzeResult.output);
      if (!analysis) {
        throw new Error('Failed to analyze project requirements');
      }
      
      // Step 2: Plan (Enhanced with detailed structure)
      this.updateProgress(15, '⚙️ Planning project structure...');
      const planResult = await this.executeModularClaudeCall('plan', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 8192);
      
      // Step 3: Generate Core Files
      this.updateProgress(30, '📄 Generating core configuration files...');
      const coreResult = await this.executeModularClaudeCall('generate-core', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 8192);
      
      // Step 4: Generate Components
      this.updateProgress(50, '🧩 Generating components and pages...');
      const componentsResult = await this.executeModularClaudeCall('generate-components', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 8192);
      
      // Step 5: Generate App Integration
      this.updateProgress(70, '🔗 Integrating components into main app...');
      const integrationResult = await this.executeModularClaudeCall('generate-integration', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 8192);
      
      // Step 6: Create Documentation
      this.updateProgress(80, '📚 Creating documentation...');
      const composeResult = await this.executeModularClaudeCall('compose', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 4096);
      
      // Step 7: Validate
      this.updateProgress(90, '✅ Validating project quality...');
      const validateResult = await this.executeModularClaudeCall('validate', { 
        ...analysis, 
        projectName, 
        userPrompt 
      }, 4096);
      
      // Step 8: Improve
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
        files: this.extractAllFiles([coreResult, componentsResult, integrationResult, composeResult, improveResult]),
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
    const processedFiles = new Set();
    
    // Clean the text first
    const cleanedText = text.trim();
    
    // Split the text into lines and process each file
    const lines = cleanedText.split('\n');
    let currentFile = null;
    let currentContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line starts a new file
      const fileMatch = line.match(/^([a-zA-Z0-9\/\-_\.]+\.(tsx?|jsx?|html|css|json|js|md)):\s*(.*)$/);
      
      if (fileMatch) {
        // Save the previous file if it exists
        if (currentFile && currentContent.length > 0) {
          const correctedPath = this.correctFileExtension(currentFile);
          if (!processedFiles.has(correctedPath)) {
            const content = currentContent.join('\n').trim();
            if (content) {
              files[correctedPath] = content;
              processedFiles.add(correctedPath);
              console.log(`📁 Extracted: ${correctedPath} (${content.length} chars)`);
            }
          }
        }
        
        // Start new file
        currentFile = fileMatch[1];
        currentContent = [fileMatch[3] || '']; // Include any content on the same line
      } else if (currentFile) {
        // Add line to current file content
        currentContent.push(line);
      }
    }
    
    // Save the last file
    if (currentFile && currentContent.length > 0) {
      const correctedPath = this.correctFileExtension(currentFile);
      if (!processedFiles.has(correctedPath)) {
        const content = currentContent.join('\n').trim();
        if (content) {
          files[correctedPath] = content;
          processedFiles.add(correctedPath);
          console.log(`📁 Extracted: ${correctedPath} (${content.length} chars)`);
        }
      }
    }
    
    // Secondary pattern: Code blocks with file paths
    const codeBlockPattern = /```(?:(\w+):([^\n]+)\n)?([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockPattern.exec(cleanedText)) !== null) {
      const [, language, filePath, content] = match;
      if (filePath && content) {
        const cleanPath = filePath.trim();
        const cleanContent = content.trim();
        const correctedPath = this.correctFileExtension(cleanPath);
        
        if (!processedFiles.has(correctedPath)) {
          files[correctedPath] = cleanContent;
          processedFiles.add(correctedPath);
          console.log(`📁 Extracted from code block: ${correctedPath} (${cleanContent.length} chars)`);
        }
      }
    }
    
    // Fallback: Look for specific file patterns
    const specificFiles = [
      'package.json', 'vite.config.ts', 'tailwind.config.js', 'tsconfig.json', 'tsconfig.node.json',
      'index.html', 'src/main.tsx', 'src/App.tsx', 'src/index.css',
      'src/components/Header.tsx', 'src/components/Hero.tsx', 
      'src/components/Footer.tsx', 'src/components/Products.tsx'
    ];
    
    for (const fileName of specificFiles) {
      if (processedFiles.has(fileName)) continue;
      
      // Look for the file name followed by content
      const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const fileRegex = new RegExp(`${escapedFileName}\\s*:\\s*([\\s\\S]*?)(?=\\n\\n|$)`, 'g');
      const fileMatch = fileRegex.exec(cleanedText);
      
      if (fileMatch && fileMatch[1]) {
        const cleanContent = fileMatch[1].trim();
        if (cleanContent && !cleanContent.includes(':')) { // Avoid nested file content
          files[fileName] = cleanContent;
          processedFiles.add(fileName);
          console.log(`📁 Extracted specific file: ${fileName} (${cleanContent.length} chars)`);
        }
      }
    }
    
    // Validate and clean extracted files
    const validatedFiles = {};
    for (const [filePath, content] of Object.entries(files)) {
      if (this.isValidFileContent(filePath, content)) {
        validatedFiles[filePath] = this.cleanFileContent(content);
      } else {
        console.log(`⚠️ Skipping invalid file: ${filePath}`);
      }
    }
    
    console.log(`✅ Extracted ${Object.keys(validatedFiles).length} valid files`);
    return validatedFiles;
  }

  correctFileExtension(filePath) {
    // Map common wrong extensions to correct ones
    const extensionMap = {
      'package.js': 'package.json',
      'tsconfig.js': 'tsconfig.json',
      'tsconfig.node.js': 'tsconfig.node.json',
      'tailwind.config.js': 'tailwind.config.js', // This one is correct
      'vite.config.js': 'vite.config.ts',
      'next.config.js': 'next.config.js', // This one is correct
      'remix.config.js': 'remix.config.js' // This one is correct
    };
    
    return extensionMap[filePath] || filePath;
  }

  isValidFileContent(filePath, content) {
    // Basic validation for different file types
    if (!content || content.length < 10) return false;
    
    if (filePath.endsWith('.json')) {
      try {
        JSON.parse(content);
        return true;
      } catch {
        return false;
      }
    }
    
    if (filePath.endsWith('.html')) {
      return content.includes('<html') || content.includes('<!DOCTYPE');
    }
    
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      return content.includes('import') || content.includes('export') || content.includes('function') || content.includes('const');
    }
    
    if (filePath.endsWith('.css')) {
      return content.includes('{') && content.includes('}');
    }
    
    if (filePath.endsWith('.js')) {
      return content.includes('import') || content.includes('export') || content.includes('function') || content.includes('const');
    }
    
    return true; // Default to valid for other file types
  }

  cleanFileContent(content) {
    // Remove common artifacts and clean up content
    let cleaned = content.trim();
    
    // Remove markdown code block markers if present
    cleaned = cleaned.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
    
    // Remove leading/trailing whitespace and normalize line endings
    cleaned = cleaned.replace(/\r\n/g, '\n').trim();
    
    // Remove any remaining file path prefixes
    cleaned = cleaned.replace(/^[a-zA-Z0-9\/\-_\.]+\.(tsx?|jsx?|html|css|json|js|md):\s*/, '');
    
    return cleaned;
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
    const missingFiles = requiredFiles.required.filter(file => !this.session.generatedFiles[file]);
    
    if (missingFiles.length > 0) {
      this.session.errors.push(`Missing required files: ${missingFiles.join(', ')}`);
      return false;
    }
    console.log('✅ All required files present');

    // 2. Validate complete file structure (enterprise-level)
    if (!await this.validateCompleteFileStructure()) {
      console.log('⚠️ File structure validation failed - missing enterprise features');
    }

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

  async validateCompleteFileStructure() {
    console.log('🔍 Validating complete file structure...');
    
    const requiredFiles = this.getRequiredFiles();
    const generatedFiles = Object.keys(this.session.generatedFiles || {});
    
    // Check required files
    const missingRequired = requiredFiles.required.filter(file => !generatedFiles.includes(file));
    const missingOptional = requiredFiles.optional.filter(file => !generatedFiles.includes(file));
    
    // Check for enterprise-level requirements
    const enterpriseChecks = {
      hasErrorBoundary: generatedFiles.includes('src/components/ErrorBoundary.tsx'),
      hasLoadingStates: generatedFiles.includes('src/components/Loading.tsx'),
      hasStateManagement: generatedFiles.includes('src/context/AppContext.tsx') || generatedFiles.includes('src/store/index.ts'),
      hasFormValidation: generatedFiles.includes('src/validators/index.ts'),
      hasAPI: generatedFiles.includes('src/services/api.ts'),
      hasTypes: generatedFiles.includes('src/types/index.ts'),
      hasUtils: generatedFiles.includes('src/utils/index.ts'),
      hasHooks: generatedFiles.includes('src/hooks/index.ts'),
      hasConstants: generatedFiles.includes('src/constants/index.ts'),
      hasHelpers: generatedFiles.includes('src/helpers/index.ts'),
      hasCompleteComponents: [
        'src/components/Header.tsx',
        'src/components/Hero.tsx',
        'src/components/Features.tsx',
        'src/components/Products.tsx',
        'src/components/Testimonials.tsx',
        'src/components/Contact.tsx',
        'src/components/Footer.tsx'
      ].every(file => generatedFiles.includes(file))
    };
    
    const failedChecks = Object.entries(enterpriseChecks)
      .filter(([_, passed]) => !passed)
      .map(([check, _]) => check);
    
    // Report results
    if (missingRequired.length > 0) {
      console.log(`❌ Missing required files: ${missingRequired.join(', ')}`);
      this.session.errors.push(`Missing required files: ${missingRequired.join(', ')}`);
    }
    
    if (missingOptional.length > 0) {
      console.log(`⚠️ Missing optional files: ${missingOptional.join(', ')}`);
      this.session.warnings.push(`Missing optional files: ${missingOptional.join(', ')}`);
    }
    
    if (failedChecks.length > 0) {
      console.log(`⚠️ Missing enterprise features: ${failedChecks.join(', ')}`);
      this.session.warnings.push(`Missing enterprise features: ${failedChecks.join(', ')}`);
    }
    
    const allChecksPassed = missingRequired.length === 0 && failedChecks.length === 0;
    
    if (allChecksPassed) {
      console.log('✅ Complete file structure validation passed');
    }
    
    return allChecksPassed;
  }

  getRequiredFiles() {
    const baseFiles = [
      'package.json',
      'vite.config.ts',
      'tailwind.config.js',
      'tsconfig.json',
      'tsconfig.node.json',
      'index.html',
      'src/main.tsx',
      'src/App.tsx',
      'src/index.css'
    ];

    const componentFiles = [
      'src/components/Header.tsx',
      'src/components/Hero.tsx',
      'src/components/Features.tsx',
      'src/components/Products.tsx',
      'src/components/Testimonials.tsx',
      'src/components/Contact.tsx',
      'src/components/Footer.tsx',
      'src/components/Loading.tsx',
      'src/components/ErrorBoundary.tsx',
      'src/components/Button.tsx',
      'src/components/Card.tsx',
      'src/components/Modal.tsx'
    ];

    const utilityFiles = [
      'src/types/index.ts',
      'src/utils/index.ts',
      'src/hooks/index.ts',
      'src/context/AppContext.tsx',
      'src/services/api.ts',
      'src/constants/index.ts',
      'src/validators/index.ts',
      'src/helpers/index.ts'
    ];

    const optionalFiles = [
      'src/layouts/MainLayout.tsx',
      'src/pages/Home.tsx',
      'src/routes/index.tsx',
      'src/store/index.ts',
      'src/middleware/index.ts',
      'src/styles/components.css',
      'src/assets/images/',
      'README.md'
    ];

    return {
      required: [...baseFiles, ...componentFiles, ...utilityFiles],
      optional: optionalFiles,
      all: [...baseFiles, ...componentFiles, ...utilityFiles, ...optionalFiles]
    };
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
      case 'generate-core':
        return this.getGenerateCorePrompt(data);
      case 'generate-components':
        return this.getGenerateComponentsPrompt(data);
      case 'generate-integration':
        return this.getGenerateIntegrationPrompt(data);
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
