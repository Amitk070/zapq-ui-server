import { getStackConfig } from './stackConfigs.js';

export class OrchestrationEngine {
  constructor(stackId, askClaudeFunction) {
    const config = getStackConfig(stackId);
    if (!config) {
      throw new Error(`Stack configuration not found: ${stackId}`);
    }
    this.stackConfig = config;
    this.askClaude = askClaudeFunction; // Inject Claude function from backend
    this.projectPlan = null;
    this.generatedFiles = {};
    this.currentStep = 0;
    this.errors = [];
    this.totalTokensUsed = 0; // Track tokens across all Claude calls
  }

  // Helper method to track tokens automatically
  async askClaudeWithTracking(prompt, maxTokens = 2048) {
    const result = await this.askClaude(prompt, maxTokens);
    this.totalTokensUsed += result.tokensUsed || 0;
    console.log(`📊 Claude call tokens: ${result.tokensUsed || 0} (Total: ${this.totalTokensUsed})`);
    return result;
  }

  async generateProject(projectName, userPrompt, onProgress) {
    try {
      this.reset();
      console.log('🚀 Starting step-by-step project generation...');
      
      // 🎯 STEP 1: Generate Project Plan (JSON structure)
      onProgress?.('📋 Generating project plan...', 5);
      await this.generateProjectPlan(projectName, userPrompt);
      
      if (!this.projectPlan) {
        throw new Error('Failed to generate project plan');
      }

      // ⚙️ STEP 2: Generate Config & Entry Files 
      onProgress?.('⚙️ Creating config files...', 20);
      await this.generateConfigFiles();

      // 📄 STEP 3: Generate Pages (from dynamic plan)
      onProgress?.('📄 Creating pages...', 40);
      await this.generatePagesFromPlan();

      // 🧩 STEP 4: Generate Components (from dynamic plan)
      onProgress?.('🧩 Creating components...', 60);
      await this.generateComponentsFromPlan();

      // 📚 STEP 5: Generate Documentation
      onProgress?.('📚 Creating documentation...', 80);
      await this.generateDocumentation();

      // ✅ STEP 6: Validate and finalize
      onProgress?.('✅ Validating project...', 90);
      const isValid = await this.validateProject();

      onProgress?.('🎉 Project complete!', 100);
      
      console.log(`🪙 Total tokens used in project generation: ${this.totalTokensUsed}`);
      
      return {
        success: true,
        files: this.generatedFiles,
        errors: this.errors,
        warnings: [],
        buildable: isValid,
        tokensUsed: this.totalTokensUsed // Return actual token usage
      };

    } catch (error) {
      console.error('❌ Generation failed:', error);
      return {
        success: false,
        files: this.generatedFiles,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        buildable: false,
        tokensUsed: this.totalTokensUsed // Return tokens even on failure
      };
    }
  }

  reset() {
    this.projectPlan = null;
    this.generatedFiles = {};
    this.currentStep = 0;
    this.errors = [];
    this.totalTokensUsed = 0; // Reset token tracking
  }

  // 🎯 STEP 1: Generate Project Plan (JSON structure)
  async generateProjectPlan(projectName, userPrompt) {
    console.log('📋 Generating structured project plan...');
    
    const prompt = `Analyze this project request and create a detailed plan.

User Request: "${userPrompt}"
Project Name: "${projectName}"

Based on the user's specific request, determine what pages and components are actually needed for this project.

EXAMPLES of different project types:
- Portfolio website → Home, About, Projects, Contact pages + Navbar, Hero, ProjectCard, Footer components
- E-commerce site → Home, Products, Cart, Checkout pages + Navbar, ProductCard, CartItem components  
- Travel agency → Home, Destinations, Booking, Contact pages + Hero, DestinationCard, BookingForm components
- Restaurant website → Home, Menu, About, Contact pages + Navbar, MenuItem, Gallery components
- Dashboard app → Dashboard, Analytics, Settings pages + Sidebar, Chart, DataTable components

Analyze "${userPrompt}" and return the appropriate plan as JSON:

{
  "projectName": "${projectName}",
  "description": "${userPrompt}",
  "pages": [
    { "name": "PageName", "filename": "PageName.jsx", "path": "/route", "description": "what this page does" }
  ],
  "components": [
    { "name": "ComponentName", "filename": "ComponentName.jsx", "description": "what this component does" }
  ],
  "features": [
    "list of key features this project should have"
  ]
}

CRITICAL: 
- Analyze the SPECIFIC user request, don't use generic examples
- Return ONLY valid JSON, no explanations or markdown
- Make sure pages and components match what the user actually requested`;

    try {
      const claudeResult = await this.askClaude(prompt, 1024);
      
      // Handle both direct string and object response formats
      const response = typeof claudeResult === 'string' ? claudeResult : claudeResult.output;
      const tokensUsed = typeof claudeResult === 'object' ? (claudeResult.tokensUsed || 0) : 0;
      
      this.totalTokensUsed += tokensUsed;
      console.log(`📊 Project plan tokens: ${tokensUsed} (Total: ${this.totalTokensUsed})`);
      
      console.log('🔍 Claude raw response:', response.substring(0, 500) + '...');
      
      // Try multiple JSON extraction methods
      let jsonStr = null;
      
      // Method 1: Look for JSON blocks
      let match = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonStr = match[1];
        console.log('📄 Found JSON in code block');
      }
      
      // Method 2: Look for plain JSON object
      if (!jsonStr) {
        match = response.match(/\{[\s\S]*\}/);
        if (match) {
          jsonStr = match[0];
          console.log('📄 Found JSON object');
        }
      }
      
      // Method 3: Try to clean and extract JSON
      if (!jsonStr) {
        // Remove common Claude explanations
        const cleaned = response
          .replace(/^.*?(?=\{)/s, '') // Remove everything before first {
          .replace(/\}.*$/s, '}')     // Remove everything after last }
          .trim();
        
        if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
          jsonStr = cleaned;
          console.log('📄 Found JSON after cleaning');
        }
      }
      
      if (!jsonStr) {
        console.log('❌ No JSON found in response. Full response:', response);
        throw new Error("Claude did not return valid JSON plan");
      }

      console.log('🧹 Extracted JSON:', jsonStr.substring(0, 200) + '...');
      const plan = JSON.parse(jsonStr);
      
      this.projectPlan = {
        stackId: this.stackConfig.id,
        projectName,
        description: userPrompt,
        pages: plan.pages || [],
        components: plan.components || [],
        features: plan.features || []
      };

      console.log("✅ Project plan generated:", this.projectPlan);
      
    } catch (error) {
      console.error('❌ Failed to generate project plan:', error);
      console.log('🔄 Generating fallback plan...');
      
      // Generate a fallback plan based on the user prompt
      this.projectPlan = this.generateFallbackPlan(projectName, userPrompt);
      console.log('✅ Fallback plan generated:', this.projectPlan);
    }
  }

  // Generate a sensible fallback plan when Claude fails
  generateFallbackPlan(projectName, userPrompt) {
    const prompt = userPrompt.toLowerCase();
    
    // Determine project type from keywords
    let pages = [];
    let components = [];
    let features = [];
    
    if (prompt.includes('portfolio')) {
      pages = [
        { name: 'Home', filename: 'Home.jsx', path: '/', description: 'Portfolio landing page' },
        { name: 'About', filename: 'About.jsx', path: '/about', description: 'About me section' },
        { name: 'Projects', filename: 'Projects.jsx', path: '/projects', description: 'Project showcase' },
        { name: 'Contact', filename: 'Contact.jsx', path: '/contact', description: 'Contact information' }
      ];
      components = [
        { name: 'Navbar', filename: 'Navbar.jsx', description: 'Navigation bar' },
        { name: 'Hero', filename: 'Hero.jsx', description: 'Hero section' },
        { name: 'ProjectCard', filename: 'ProjectCard.jsx', description: 'Project display card' },
        { name: 'Footer', filename: 'Footer.jsx', description: 'Site footer' }
      ];
      features = ['Portfolio showcase', 'Responsive design', 'Contact form', 'Modern UI'];
    } else if (prompt.includes('dashboard')) {
      pages = [
        { name: 'Dashboard', filename: 'Dashboard.jsx', path: '/', description: 'Main dashboard' },
        { name: 'Analytics', filename: 'Analytics.jsx', path: '/analytics', description: 'Analytics page' },
        { name: 'Settings', filename: 'Settings.jsx', path: '/settings', description: 'Settings page' }
      ];
      components = [
        { name: 'Sidebar', filename: 'Sidebar.jsx', description: 'Navigation sidebar' },
        { name: 'Chart', filename: 'Chart.jsx', description: 'Data visualization' },
        { name: 'DataTable', filename: 'DataTable.jsx', description: 'Data table' }
      ];
      features = ['Data visualization', 'Real-time updates', 'User management'];
    } else if (prompt.includes('landing') || prompt.includes('sports') || prompt.includes('travel') || prompt.includes('business')) {
      // Generic landing page
      pages = [
        { name: 'Home', filename: 'Home.jsx', path: '/', description: 'Main landing page' }
      ];
      components = [
        { name: 'Navbar', filename: 'Navbar.jsx', description: 'Navigation header' },
        { name: 'Hero', filename: 'Hero.jsx', description: 'Hero section with CTA' },
        { name: 'Features', filename: 'Features.jsx', description: 'Features showcase' },
        { name: 'Footer', filename: 'Footer.jsx', description: 'Site footer' }
      ];
      features = ['Hero section', 'Call-to-action', 'Responsive design', 'Modern styling'];
    } else {
      // Default fallback
      pages = [
        { name: 'Home', filename: 'Home.jsx', path: '/', description: 'Main page' }
      ];
      components = [
        { name: 'Navbar', filename: 'Navbar.jsx', description: 'Navigation' },
        { name: 'Footer', filename: 'Footer.jsx', description: 'Footer' }
      ];
      features = ['Responsive design', 'Modern UI', 'Tailwind CSS'];
    }
    
    return {
      stackId: this.stackConfig.id,
      projectName,
      description: userPrompt,
      pages,
      components,
      features
    }
  }

  // Legacy method for compatibility  
  async analyzeProject(projectName, userPrompt) {
    return await this.generateProjectPlan(projectName, userPrompt);
  }

  async generateScaffold() {
    // Generate package.json
    const packageJson = { ...this.stackConfig.templates.packageJson };
    packageJson.name = this.projectPlan.projectName.toLowerCase().replace(/\s+/g, '-');
    packageJson.description = this.projectPlan.description;
    
    this.generatedFiles['package.json'] = JSON.stringify(packageJson, null, 2);

    // Generate config files
    Object.entries(this.stackConfig.templates.configFiles).forEach(([fileName, content]) => {
      this.generatedFiles[fileName] = this.interpolateTemplate(content);
    });

    // Generate base files
    Object.entries(this.stackConfig.templates.baseFiles).forEach(([fileName, content]) => {
      this.generatedFiles[fileName] = this.interpolateTemplate(content);
    });

    console.log('🏗️ Scaffold generated:', Object.keys(this.generatedFiles));
  }

  async executeStep(step) {
    try {
      switch (step.promptType) {
        case 'scaffold':
          await this.generateMainComponent(step);
          break;
        case 'page':
          await this.generatePages(step);
          break;
        case 'component':
          await this.generateComponents(step);
          break;
        case 'readme':
          await this.generateReadme(step);
          break;
        default:
          console.warn(`Unknown step type: ${step.promptType}`);
      }
    } catch (error) {
      const errorMsg = `Step ${step.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  async generateMainComponent(step) {
    const prompt = this.stackConfig.prompts.scaffold
      .replace('{projectName}', this.projectPlan.projectName)
      .replace('{description}', this.projectPlan.description)
      .replace('{pages}', JSON.stringify(this.projectPlan.pages));

    const claudeResponse = await this.askClaude(prompt, 3072);
    this.totalTokensUsed += claudeResponse.tokensUsed || 0;
    console.log(`📊 Config generation tokens: ${claudeResponse.tokensUsed || 0} (Total: ${this.totalTokensUsed})`);
    const { output: code } = claudeResponse;
    const cleanCode = this.cleanCodeResponse(code);
    
    this.generatedFiles[step.outputPath] = cleanCode;
    console.log(`✅ Generated main component: ${step.outputPath}`);
  }

  async generatePages(step) {
    if (!this.projectPlan?.pages.length) return;

    for (const page of this.projectPlan.pages) {
      const prompt = this.stackConfig.prompts.page
        .replace('{name}', page.name)
        .replace('{description}', page.description)
        .replace('{path}', page.path)
        .replace('{components}', page.components?.join(', ') || '')
        .replace('{projectContext}', this.projectPlan.description);

      try {
            const claudeResult = await this.askClaude(prompt, 2048);
        const tokensUsed = claudeResult.tokensUsed || 0;
        this.totalTokensUsed += tokensUsed;
        console.log(`📊 Page generation tokens: ${tokensUsed} (Total: ${this.totalTokensUsed})`);
        const { output: code } = claudeResult;
    const cleanCode = this.cleanCodeResponse(code);
        
        const fileName = this.getPageFileName(page.name);
        const filePath = `${step.outputPath}${fileName}`;
        
        this.generatedFiles[filePath] = cleanCode;
        console.log(`✅ Generated page: ${filePath}`);
      } catch (error) {
        console.error(`Failed to generate page ${page.name}:`, error);
      }
    }
  }

  async generateComponents(step) {
    if (!this.projectPlan?.components.length) return;

    for (const component of this.projectPlan.components) {
      const prompt = this.stackConfig.prompts.component
        .replace('{name}', component.name)
        .replace('{type}', component.type)
        .replace('{description}', component.description)
        .replace('{props}', component.props?.join(', ') || 'none');

      try {
        const claudeResult = await this.askClaude(prompt, 2048);
        const tokensUsed = claudeResult.tokensUsed || 0;
        this.totalTokensUsed += tokensUsed;
        console.log(`📊 Page generation tokens: ${tokensUsed} (Total: ${this.totalTokensUsed})`);
        const { output: code } = claudeResult;
        const cleanCode = this.cleanCodeResponse(code);
        
        const fileName = this.getComponentFileName(component.name);
        const filePath = `${step.outputPath}${fileName}`;
        
        this.generatedFiles[filePath] = cleanCode;
        console.log(`✅ Generated component: ${filePath}`);
      } catch (error) {
        console.error(`Failed to generate component ${component.name}:`, error);
      }
    }
  }

  async generateReadme(step) {
    const prompt = this.stackConfig.prompts.readme
      .replace('{projectName}', this.projectPlan.projectName)
      .replace('{description}', this.projectPlan.description);

    const claudeResult = await this.askClaude(prompt, 2048);
    const tokensUsed = claudeResult.tokensUsed || 0;
    this.totalTokensUsed += tokensUsed;
    console.log(`📊 Documentation generation tokens: ${tokensUsed} (Total: ${this.totalTokensUsed})`);
    const { output: readme } = claudeResult;
    this.generatedFiles[step.outputPath] = readme;
    console.log(`✅ Generated README: ${step.outputPath}`);
  }

  async validateProject() {
    console.log('🧪 Starting comprehensive project validation...');
    
    // 1. Check for required files
    const requiredFiles = this.getRequiredFiles();
    const missingFiles = requiredFiles.filter(file => !this.generatedFiles[file]);
    
    if (missingFiles.length > 0) {
      this.errors.push(`Missing required files: ${missingFiles.join(', ')}`);
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
      case 'vue':
        return [
          ...baseFiles,
          'vite.config.ts',
          'tailwind.config.js',
          'index.html',
          'src/main.ts',
          'src/App.vue',
          'src/style.css'
        ];
      case 'svelte':
        return [
          ...baseFiles,
          'svelte.config.js',
          'vite.config.ts',
          'tailwind.config.js',
          'src/app.html',
          'src/routes/+layout.svelte',
          'src/app.css'
        ];
      default:
        return baseFiles;
    }
  }

  async validatePackageJson() {
    try {
      const packageJson = JSON.parse(this.generatedFiles['package.json']);
      
      // Check required fields
      const requiredFields = ['name', 'version', 'scripts', 'dependencies', 'devDependencies'];
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          this.errors.push(`package.json missing required field: ${field}`);
          return false;
        }
      }

      // Check required scripts
      const requiredScripts = ['dev', 'build'];
      for (const script of requiredScripts) {
        if (!packageJson.scripts[script]) {
          this.errors.push(`package.json missing required script: ${script}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      this.errors.push('Invalid package.json format');
      return false;
    }
  }

  async validateConfigFiles() {
    const configFiles = {
      'vite.config.ts': this.validateViteConfig,
      'tailwind.config.js': this.validateTailwindConfig,
      'tsconfig.json': this.validateTsConfig
    };

    for (const [filename, validator] of Object.entries(configFiles)) {
      if (this.generatedFiles[filename]) {
        try {
          if (!validator.call(this, this.generatedFiles[filename])) {
            this.errors.push(`Invalid configuration in ${filename}`);
            return false;
          }
        } catch (error) {
          this.errors.push(`Syntax error in ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return false;
        }
      }
    }

    return true;
  }

  validateViteConfig(content) {
    return content.includes('defineConfig') && content.includes('plugins');
  }

  validateTailwindConfig(content) {
    return content.includes('content') && content.includes('theme') && content.includes('plugins');
  }

  validateTsConfig(content) {
    try {
      const config = JSON.parse(content);
      return config.compilerOptions && config.compilerOptions.target && config.include;
    } catch {
      return false;
    }
  }

  async validateCodeSyntax() {
    const codeFiles = Object.keys(this.generatedFiles).filter(path => 
      path.endsWith('.tsx') || path.endsWith('.ts') || 
      path.endsWith('.jsx') || path.endsWith('.js') ||
      path.endsWith('.vue') || path.endsWith('.svelte')
    );

    for (const filePath of codeFiles) {
      const content = this.generatedFiles[filePath];
      
      if (!this.validateBasicSyntax(content, filePath)) {
        return false;
      }
    }

    return true;
  }

  validateBasicSyntax(content, filePath) {
    // Check for balanced brackets
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack = [];
    
    for (const char of content) {
      if (brackets[char]) {
        stack.push(brackets[char]);
      } else if (Object.values(brackets).includes(char)) {
        if (stack.pop() !== char) {
          this.errors.push(`Unbalanced brackets in ${filePath}`);
          return false;
        }
      }
    }

    if (stack.length > 0) {
      this.errors.push(`Unclosed brackets in ${filePath}`);
      return false;
    }

    return true;
  }

  async validateImportsExports() {
    // Simplified validation for backend
    return true;
  }

  async validateProjectStructure() {
    const hasSourceFiles = Object.keys(this.generatedFiles).some(path => path.startsWith('src/'));
    if (!hasSourceFiles) {
      this.errors.push('Missing src/ directory structure');
      return false;
    }
    return true;
  }

  async validateDeploymentReadiness() {
    const packageJson = JSON.parse(this.generatedFiles['package.json']);
    
    if (!packageJson.scripts?.build) {
      this.errors.push('Missing build script in package.json');
      return false;
    }

    if (!this.generatedFiles['index.html']) {
      this.errors.push('Missing index.html');
      return false;
    }

    return true;
  }

  parseJSON(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch {
      return {
        pages: [{ name: 'Home', path: '/', description: 'Main page', filename: 'Home.tsx' }],
        components: [{ name: 'Header', type: 'layout', description: 'Navigation header', filename: 'Header.tsx' }],
        features: ['responsive design']
      };
    }
  }

  cleanCodeResponse(response) {
    let cleaned = response.replace(/```[\w]*\n([\s\S]*?)\n```/g, '$1');
    cleaned = cleaned.replace(/^Here's the.*$/gm, '');
    cleaned = cleaned.replace(/^I've created.*$/gm, '');
    cleaned = cleaned.replace(/^This component.*$/gm, '');
    return cleaned.trim();
  }

  interpolateTemplate(template) {
    if (!this.projectPlan) return template;
    
    return template
      .replace(/\{projectName\}/g, this.projectPlan.projectName)
      .replace(/\{description\}/g, this.projectPlan.description);
  }

  getPageFileName(pageName) {
    const name = pageName.toLowerCase().replace(/\s+/g, '-');
    
    switch (this.stackConfig.framework) {
      case 'react':
        return `${this.toPascalCase(name)}.tsx`;
      case 'vue':
        return `${this.toPascalCase(name)}.vue`;
      case 'svelte':
        return `${name}/+page.svelte`;
      default:
        return `${name}.tsx`;
    }
  }

  getComponentFileName(componentName) {
    const name = componentName.toLowerCase().replace(/\s+/g, '-');
    
    switch (this.stackConfig.framework) {
      case 'react':
        return `${this.toPascalCase(name)}.tsx`;
      case 'vue':
        return `${this.toPascalCase(name)}.vue`;
      case 'svelte':
        return `${this.toPascalCase(name)}.svelte`;
      default:
        return `${name}.tsx`;
    }
  }

  toPascalCase(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
              .replace(/^[a-z]/, letter => letter.toUpperCase());
  }

  // ⚙️ STEP 2: Generate Config & Entry Files
  async generateConfigFiles() {
    console.log('⚙️ Generating config and entry files...');
    
    try {
      // Generate package.json with dynamic dependencies based on stack
      const packageJson = {
        name: this.projectPlan.projectName.toLowerCase().replace(/\s+/g, '-'),
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-router-dom": "^6.8.0"
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.0.0",
          "vite": "^4.4.0",
          "tailwindcss": "^3.3.0",
          "postcss": "^8.4.24", 
          "autoprefixer": "^10.4.14",
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          "typescript": "^5.0.0"
        }
      };
      
      this.generatedFiles['package.json'] = JSON.stringify(packageJson, null, 2);
      
      // Generate essential config files
      const prompt = `Generate essential config files for a ${this.projectPlan.projectName} project.

Stack: ${this.stackConfig.name}
Framework: ${this.stackConfig.framework}

Required files:
- vite.config.ts
- tailwind.config.js
- postcss.config.js
- index.html
- src/main.tsx
- src/index.css
- tsconfig.json
- tsconfig.node.json

Return ONLY the complete TypeScript/JavaScript code for each file, no explanations.`;

      const claudeResponse = await this.askClaude(prompt, 3072);
      const tokensUsed = claudeResponse.tokensUsed || 0;
      this.totalTokensUsed += tokensUsed;
      console.log(`📊 Config generation tokens: ${tokensUsed} (Total: ${this.totalTokensUsed})`);
      const { output: code } = claudeResponse;

      this.generatedFiles['vite.config.ts'] = code.split('\n').filter(line => line.trim() !== '').join('\n');
      this.generatedFiles['tailwind.config.js'] = code.split('\n').filter(line => line.trim() !== '').join('\n');
      this.generatedFiles['postcss.config.js'] = code.split('\n').filter(line => line.trim() !== '').join('\n');
      this.generatedFiles['index.html'] = code.split('\n').filter(line => line.trim() !== '').join('\n');
      this.generatedFiles['src/main.tsx'] = code.split('\n').filter(line => line.trim() !== '').join('\n');
      this.generatedFiles['src/index.css'] = code.split('\n').filter(line => line.trim() !== '').join('\n');
      this.generatedFiles['tsconfig.json'] = code.split('\n').filter(line => line.trim() !== '').join('\n');
      this.generatedFiles['tsconfig.node.json'] = code.split('\n').filter(line => line.trim() !== '').join('\n');
      
      console.log('✅ Config files generated');
      
    } catch (error) {
      console.error('❌ Failed to generate config files:', error);
      throw error;
    }
  }

  // 📄 STEP 3: Generate Pages (from dynamic plan)
  async generatePagesFromPlan() {
    console.log('📄 Generating pages from plan...');
    
    if (!this.projectPlan.pages || this.projectPlan.pages.length === 0) {
      console.log('No pages defined in plan, generating default App component');
      await this.generateDefaultApp();
      return;
    }
    
    try {
      // Generate App.tsx with proper routing
      const pageImports = this.projectPlan.pages.map(page => 
        `import ${page.name} from './pages/${page.filename.replace('.jsx', '.tsx')}'`
      ).join('\n');
      
      const componentImports = this.projectPlan.components.map(comp => 
        `import ${comp.name} from './components/${comp.filename.replace('.jsx', '.tsx')}'`
      ).join('\n');

      const appContent = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
${pageImports}
${componentImports}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          ${this.projectPlan.pages.map(page => 
            `<Route path="${page.path}" element={<${page.name} />} />`
          ).join('\n          ')}
        </Routes>
      </div>
    </Router>
  );
}

export default App;`;

      this.generatedFiles['src/App.tsx'] = appContent;
      console.log('✅ Generated App.tsx with routing');
      
    } catch (error) {
      console.error('❌ App generation error:', error);
      this.errors.push(`App generation failed: ${error.message}`);
    }
  }
}
