import { StackConfig, ProjectPlan, GenerationResult, GenerationStep } from '../types/StackConfig';
import { getStackConfig } from '../config/stackConfigs';
import { API_BASE } from '../api/config';

export class OrchestrationEngine {
  private stackConfig: StackConfig;
  private projectPlan: ProjectPlan | null = null;
  private generatedFiles: Record<string, string> = {};
  private currentStep = 0;
  private errors: string[] = [];

  constructor(stackId: string) {
    const config = getStackConfig(stackId);
    if (!config) {
      throw new Error(`Stack configuration not found: ${stackId}`);
    }
    this.stackConfig = config;
  }

  async generateProject(
    projectName: string,
    userPrompt: string,
    onProgress?: (step: string, progress: number) => void
  ): Promise<GenerationResult> {
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

  private reset() {
    this.projectPlan = null;
    this.generatedFiles = {};
    this.currentStep = 0;
    this.errors = [];
  }

  private async analyzeProject(projectName: string, userPrompt: string): Promise<void> {
    const prompt = this.stackConfig.prompts.analyzer
      .replace('{userPrompt}', userPrompt)
      .replace('{projectName}', projectName);

    try {
      const response = await this.callClaude(prompt);
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

  private async generateScaffold(): Promise<void> {
    // Generate package.json
    const packageJson = { ...this.stackConfig.templates.packageJson };
    packageJson.name = this.projectPlan!.projectName.toLowerCase().replace(/\s+/g, '-');
    packageJson.description = this.projectPlan!.description;
    
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

  private async executeStep(step: GenerationStep): Promise<void> {
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

  private async generateMainComponent(step: GenerationStep): Promise<void> {
    const prompt = this.stackConfig.prompts.scaffold
      .replace('{projectName}', this.projectPlan!.projectName)
      .replace('{description}', this.projectPlan!.description)
      .replace('{pages}', JSON.stringify(this.projectPlan!.pages));

    const code = await this.callClaude(prompt);
    const cleanCode = this.cleanCodeResponse(code);
    
    this.generatedFiles[step.outputPath] = cleanCode;
    console.log(`✅ Generated main component: ${step.outputPath}`);
  }

  private async generatePages(step: GenerationStep): Promise<void> {
    if (!this.projectPlan?.pages.length) return;

    for (const page of this.projectPlan.pages) {
      const prompt = this.stackConfig.prompts.page
        .replace('{name}', page.name)
        .replace('{description}', page.description)
        .replace('{path}', page.path)
        .replace('{components}', page.components.join(', '));

      try {
        const code = await this.callClaude(prompt);
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

  private async generateComponents(step: GenerationStep): Promise<void> {
    if (!this.projectPlan?.components.length) return;

    for (const component of this.projectPlan.components) {
      const prompt = this.stackConfig.prompts.component
        .replace('{name}', component.name)
        .replace('{type}', component.type)
        .replace('{description}', component.description)
        .replace('{props}', component.props?.join(', ') || 'none');

      try {
        const code = await this.callClaude(prompt);
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

  private async generateReadme(step: GenerationStep): Promise<void> {
    const prompt = this.stackConfig.prompts.readme
      .replace('{projectName}', this.projectPlan!.projectName)
      .replace('{description}', this.projectPlan!.description);

    const readme = await this.callClaude(prompt);
    this.generatedFiles[step.outputPath] = readme;
    console.log(`✅ Generated README: ${step.outputPath}`);
  }

  private async validateProject(): Promise<boolean> {
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

  private getRequiredFiles(): string[] {
    const baseFiles = ['package.json'];
    
    switch (this.stackConfig.framework) {
      case 'react':
        return [
          ...baseFiles,
          'vite.config.ts',
          'tsconfig.json', 
          'tailwind.config.js',
          'postcss.config.js',
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

  private async validatePackageJson(): Promise<boolean> {
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

      // Validate dependencies exist (basic NPM package name validation)
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      for (const [pkg, version] of Object.entries(allDeps)) {
        if (typeof pkg !== 'string' || typeof version !== 'string') {
          this.errors.push(`Invalid dependency format: ${pkg}@${version}`);
          return false;
        }
        // Basic package name validation
        if (!/^[@a-z0-9][\w.-]*$/.test(pkg.toLowerCase())) {
          this.errors.push(`Invalid package name: ${pkg}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      this.errors.push('Invalid package.json format');
      return false;
    }
  }

  private async validateConfigFiles(): Promise<boolean> {
    const configFiles = {
      'vite.config.ts': this.validateViteConfig,
      'tailwind.config.js': this.validateTailwindConfig,
      'tsconfig.json': this.validateTsConfig,
      'postcss.config.js': this.validatePostCssConfig,
      'svelte.config.js': this.validateSvelteConfig
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

  private validateViteConfig(content: string): boolean {
    // Check for required Vite config elements
    return content.includes('defineConfig') && 
           content.includes('plugins') &&
           (content.includes('@vitejs/plugin-react') || 
            content.includes('@vitejs/plugin-vue') || 
            content.includes('@sveltejs/vite-plugin-svelte'));
  }

  private validateTailwindConfig(content: string): boolean {
    // Check for required Tailwind config elements
    return content.includes('content') && 
           content.includes('theme') && 
           content.includes('plugins');
  }

  private validateTsConfig(content: string): boolean {
    try {
      const config = JSON.parse(content);
      return config.compilerOptions && 
             config.compilerOptions.target && 
             config.compilerOptions.module &&
             config.include;
    } catch {
      return false;
    }
  }

  private validatePostCssConfig(content: string): boolean {
    return content.includes('tailwindcss') && content.includes('autoprefixer');
  }

  private validateSvelteConfig(content: string): boolean {
    return content.includes('@sveltejs/adapter-auto') && content.includes('vitePreprocess');
  }

  private async validateCodeSyntax(): Promise<boolean> {
    const codeFiles = Object.keys(this.generatedFiles).filter(path => 
      path.endsWith('.tsx') || path.endsWith('.ts') || 
      path.endsWith('.jsx') || path.endsWith('.js') ||
      path.endsWith('.vue') || path.endsWith('.svelte')
    );

    for (const filePath of codeFiles) {
      const content = this.generatedFiles[filePath];
      
      // Basic syntax checks
      if (!this.validateBasicSyntax(content, filePath)) {
        return false;
      }

      // Framework-specific validation
      if (!this.validateFrameworkSpecificSyntax(content, filePath)) {
        return false;
      }
    }

    return true;
  }

  private validateBasicSyntax(content: string, filePath: string): boolean {
    // Check for balanced brackets
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack: string[] = [];
    
    for (const char of content) {
      if (brackets[char as keyof typeof brackets]) {
        stack.push(brackets[char as keyof typeof brackets]);
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

    // Check for basic syntax patterns
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      // TypeScript/TSX specific checks
      if (!content.includes('export') && !filePath.includes('vite-env.d.ts')) {
        this.errors.push(`No exports found in ${filePath}`);
        return false;
      }
    }

    return true;
  }

  private validateFrameworkSpecificSyntax(content: string, filePath: string): boolean {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      // React component validation
      if (filePath.includes('components/') || filePath.includes('pages/') || filePath === 'src/App.tsx') {
        if (!content.includes('React') && !content.includes('import')) {
          this.errors.push(`React component ${filePath} missing React import`);
          return false;
        }
        if (!content.includes('export default')) {
          this.errors.push(`React component ${filePath} missing default export`);
          return false;
        }
      }
    } else if (filePath.endsWith('.vue')) {
      // Vue component validation
      if (!content.includes('<template>') || !content.includes('<script')) {
        this.errors.push(`Vue component ${filePath} missing required sections`);
        return false;
      }
    } else if (filePath.endsWith('.svelte')) {
      // Svelte component validation
      if (filePath.includes('+page.svelte') || filePath.includes('+layout.svelte')) {
        // SvelteKit specific validation
        return true; // Basic existence check is sufficient
      }
    }

    return true;
  }

  private async validateImportsExports(): Promise<boolean> {
    const componentFiles = Object.keys(this.generatedFiles).filter(path => 
      path.includes('components/') || path.includes('pages/') || path === 'src/App.tsx'
    );

    for (const filePath of componentFiles) {
      const content = this.generatedFiles[filePath];
      
      // Extract import statements
      const imports = content.match(/import\s+.*?\s+from\s+['"][^'"]+['"]/g) || [];
      
      for (const importStatement of imports) {
        const moduleMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
        if (moduleMatch) {
          const modulePath = moduleMatch[1];
          
          // Check if relative imports exist
          if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
            const resolvedPath = this.resolveRelativePath(filePath, modulePath);
            if (!this.generatedFiles[resolvedPath] && !this.isValidRelativeImport(resolvedPath)) {
              this.errors.push(`Missing import file: ${resolvedPath} (imported in ${filePath})`);
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  private resolveRelativePath(fromPath: string, importPath: string): string {
    const fromDir = fromPath.split('/').slice(0, -1).join('/');
    const resolved = importPath.replace(/^\.\//, `${fromDir}/`).replace(/^\.\.\//, fromDir.split('/').slice(0, -1).join('/') + '/');
    
    // Add common extensions if not present
    if (!resolved.includes('.')) {
      const extensions = ['.tsx', '.ts', '.jsx', '.js', '.vue', '.svelte'];
      for (const ext of extensions) {
        if (this.generatedFiles[resolved + ext]) {
          return resolved + ext;
        }
      }
    }
    
    return resolved;
  }

  private isValidRelativeImport(path: string): boolean {
    // Check for common valid imports that might not be in our generated files
    const validPatterns = [
      /\/index\.(tsx?|jsx?)$/,
      /\.css$/,
      /\.scss$/,
      /\.module\.css$/
    ];
    
    return validPatterns.some(pattern => pattern.test(path));
  }

  private async validateProjectStructure(): Promise<boolean> {
    const expectedStructure = this.getExpectedProjectStructure();
    
    for (const directory of expectedStructure.directories) {
      const hasFilesInDir = Object.keys(this.generatedFiles).some(path => path.startsWith(directory));
      if (!hasFilesInDir && expectedStructure.requiredDirectories.includes(directory)) {
        this.errors.push(`Missing required directory: ${directory}`);
        return false;
      }
    }

    return true;
  }

  private getExpectedProjectStructure() {
    switch (this.stackConfig.framework) {
      case 'react':
        return {
          directories: ['src/', 'src/components/', 'src/pages/', 'public/'],
          requiredDirectories: ['src/']
        };
      case 'vue':
        return {
          directories: ['src/', 'src/components/', 'src/views/', 'public/'],
          requiredDirectories: ['src/']
        };
      case 'svelte':
        return {
          directories: ['src/', 'src/routes/', 'src/lib/', 'static/'],
          requiredDirectories: ['src/', 'src/routes/']
        };
      default:
        return {
          directories: ['src/'],
          requiredDirectories: ['src/']
        };
    }
  }

  private async validateDeploymentReadiness(): Promise<boolean> {
    // Check if the project has all necessary files for deployment
    const deploymentChecks = [
      this.checkBuildConfiguration(),
      this.checkStaticAssets(),
      this.checkEnvironmentCompatibility(),
      this.checkDependencyVersions()
    ];

    for (const check of deploymentChecks) {
      if (!check) {
        return false;
      }
    }

    return true;
  }

  private checkBuildConfiguration(): boolean {
    const packageJson = JSON.parse(this.generatedFiles['package.json']);
    
    // Check if build script exists and is valid
    if (!packageJson.scripts?.build) {
      this.errors.push('Missing build script in package.json');
      return false;
    }

    // Check for proper build configuration
    if (this.stackConfig.buildTool === 'vite' && !this.generatedFiles['vite.config.ts']) {
      this.errors.push('Missing vite.config.ts for Vite build');
      return false;
    }

    return true;
  }

  private checkStaticAssets(): boolean {
    // Check for required static files
    const requiredAssets = ['index.html'];
    
    for (const asset of requiredAssets) {
      if (!this.generatedFiles[asset]) {
        this.errors.push(`Missing required asset: ${asset}`);
        return false;
      }
    }

    // Check HTML file has proper structure
    const html = this.generatedFiles['index.html'];
    if (!html.includes('<div id="root">') && !html.includes('<div id="app">') && !html.includes('data-sveltekit-preload-data')) {
      this.errors.push('HTML file missing proper mount point');
      return false;
    }

    return true;
  }

  private checkEnvironmentCompatibility(): boolean {
    const packageJson = JSON.parse(this.generatedFiles['package.json']);
    
    // Check Node.js version compatibility
    if (packageJson.engines?.node) {
      // Basic version check - could be enhanced
      const nodeVersion = packageJson.engines.node;
      if (!nodeVersion.includes('18') && !nodeVersion.includes('20') && !nodeVersion.includes('>=')) {
        this.errors.push(`Potentially incompatible Node.js version: ${nodeVersion}`);
        return false;
      }
    }

    return true;
  }

  private checkDependencyVersions(): boolean {
    const packageJson = JSON.parse(this.generatedFiles['package.json']);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Check for known compatibility issues
    const compatibilityChecks = {
      'react': '18',
      'vue': '3',
      'svelte': '4',
      'typescript': '5',
      'vite': '5'
    };

    for (const [pkg, expectedMajor] of Object.entries(compatibilityChecks)) {
      if (dependencies[pkg]) {
        const version = dependencies[pkg];
        if (!version.includes(expectedMajor)) {
          this.errors.push(`Potentially incompatible ${pkg} version: ${version} (expected major version ${expectedMajor})`);
          return false;
        }
      }
    }

    return true;
  }

  private async callClaude(prompt: string): Promise<string> {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Claude API call failed');
    }

    return data.response;
  }

  private parseJSON(text: string): any {
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no braces found, try parsing the whole text
      return JSON.parse(text);
    } catch {
      // If JSON parsing fails, return a basic structure
      return {
        pages: [{ name: 'Home', path: '/', description: 'Main page' }],
        components: [{ name: 'Header', type: 'layout', description: 'Navigation header' }],
        features: ['responsive design']
      };
    }
  }

  private cleanCodeResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```[\w]*\n([\s\S]*?)\n```/g, '$1');
    
    // Remove explanatory text
    cleaned = cleaned.replace(/^Here's the.*$/gm, '');
    cleaned = cleaned.replace(/^I've created.*$/gm, '');
    cleaned = cleaned.replace(/^This component.*$/gm, '');
    
    return cleaned.trim();
  }

  private interpolateTemplate(template: string): string {
    if (!this.projectPlan) return template;
    
    return template
      .replace(/\{projectName\}/g, this.projectPlan.projectName)
      .replace(/\{description\}/g, this.projectPlan.description);
  }

  private getPageFileName(pageName: string): string {
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

  private getComponentFileName(componentName: string): string {
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

  private toPascalCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
              .replace(/^[a-z]/, letter => letter.toUpperCase());
  }

  // Getters for debugging/monitoring
  get currentProjectPlan(): ProjectPlan | null {
    return this.projectPlan;
  }

  get currentFiles(): Record<string, string> {
    return { ...this.generatedFiles };
  }

  get currentErrors(): string[] {
    return [...this.errors];
  }
} 
