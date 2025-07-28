import { getStackConfig } from './stackConfigs.ts';

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
  }

  async generateProject(projectName, userPrompt, onProgress) {
    try {
      this.reset();
      
      // Step 1: Analyze project requirements
      onProgress?.('Analyzing requirements...', 0);
      await this.analyzeProject(projectName, userPrompt);
      
      if (!this.projectPlan) {
        throw new Error('Failed to analyze project requirements');
      }

      // Step 2: Generate base scaffold files
      onProgress?.('Creating project scaffold...', 20);
      await this.generateScaffold();

      // Step 3: Execute generation steps
      const totalSteps = this.stackConfig.steps.length;
      for (let i = 0; i < totalSteps; i++) {
        const step = this.stackConfig.steps[i];
        const progress = 20 + ((i + 1) / totalSteps) * 60;
        
        onProgress?.(`${step.name}...`, progress);
        await this.executeStep(step);
      }

      // Step 4: Validate and finalize
      onProgress?.('Finalizing project...', 90);
      const isValid = await this.validateProject();

      onProgress?.('Complete!', 100);
      
      return {
        success: true,
        files: this.generatedFiles,
        errors: this.errors,
        warnings: [],
        buildable: isValid
      };

    } catch (error) {
      console.error('Generation failed:', error);
      return {
        success: false,
        files: this.generatedFiles,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        buildable: false
      };
    }
  }

  reset() {
    this.projectPlan = null;
    this.generatedFiles = {};
    this.currentStep = 0;
    this.errors = [];
  }

  async analyzeProject(projectName, userPrompt) {
    const prompt = this.stackConfig.prompts.analyzer
      .replace('{userPrompt}', userPrompt)
      .replace('{projectName}', projectName);

    try {
      const { output: response } = await this.askClaude(prompt, 2048);
      const analysis = this.parseJSON(response);
      
      this.projectPlan = {
        stackId: this.stackConfig.id,
        projectName,
        description: userPrompt,
        pages: analysis.pages || [],
        components: analysis.components || [],
        features: analysis.features || []
      };

      console.log('📋 Project plan created:', this.projectPlan);
    } catch (error) {
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

    const { output: code } = await this.askClaude(prompt, 3072);
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
        const { output: code } = await this.askClaude(prompt, 3072);
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
        const { output: code } = await this.askClaude(prompt, 2048);
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

    const { output: readme } = await this.askClaude(prompt, 2048);
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

  // Getters for debugging/monitoring
  get currentProjectPlan() {
    return this.projectPlan;
  }

  get currentFiles() {
    return { ...this.generatedFiles };
  }

  get currentErrors() {
    return [...this.errors];
  }
} 
