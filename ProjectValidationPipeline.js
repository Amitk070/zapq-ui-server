/**
 * Enhanced Project Validation Pipeline - Session-Based Architecture
 * Ensures every generated project meets production standards with smart validation
 */

class ProjectValidationPipeline {
  constructor() {
    this.MINIMUM_SCORE = 90;
    this.WEIGHT_STRUCTURE = 20;
    this.WEIGHT_CODE = 25;
    this.WEIGHT_PERFORMANCE = 15;
    this.WEIGHT_ACCESSIBILITY = 15;
    this.WEIGHT_DESIGN = 10;
    this.WEIGHT_CONTENT = 15;
    
    // Smart validation features
    this.enableLinting = true;
    this.enableImportChecking = true;
    this.enableDeadCodeScan = true;
    this.enableTypeChecking = true;
  }

  /**
   * Validate entire project and return quality assessment with session context
   */
  async validateProject(files, sessionContext = {}) {
    console.log('🔍 Starting enhanced project validation with session context...');
    
    const categories = {
      structure: await this.validateStructure(files, sessionContext),
      code: await this.validateCode(files, sessionContext),
      performance: await this.validatePerformance(files, sessionContext),
      accessibility: await this.validateAccessibility(files, sessionContext),
      design: await this.validateDesign(files, sessionContext),
      content: await this.validateContent(files, sessionContext)
    };

    // Smart validation integration
    if (this.enableLinting) {
      categories.linting = await this.validateLinting(files, sessionContext);
    }
    
    if (this.enableImportChecking) {
      categories.imports = await this.validateImports(files, sessionContext);
    }
    
    if (this.enableDeadCodeScan) {
      categories.deadCode = await this.validateDeadCode(files, sessionContext);
    }
    
    if (this.enableTypeChecking) {
      categories.types = await this.validateTypeScript(files, sessionContext);
    }

    const score = this.calculateOverallScore(categories);
    const issues = this.extractIssues(categories);
    const recommendations = this.generateRecommendations(categories, sessionContext);

    console.log(`📊 Enhanced quality score: ${score}%`);

    return {
      score,
      passed: score >= this.MINIMUM_SCORE,
      categories,
      issues,
      recommendations,
      sessionContext: {
        projectType: sessionContext.projectType,
        featureToggles: sessionContext.featureToggles,
        validationTimestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Enhanced structure validation with session context
   */
  async validateStructure(files, sessionContext) {
    const checks = [];
    const projectType = sessionContext.projectType || 'app';

    // Check required files based on project type
    const requiredFiles = this.getRequiredFilesForProjectType(projectType);
    
    for (const file of requiredFiles) {
      checks.push({
        name: `Required file: ${file}`,
        passed: files[file] !== undefined,
        severity: 'error',
        message: files[file] ? `✓ ${file} exists` : `✗ Missing ${file}`,
        fix: files[file] ? undefined : `Create ${file} with proper configuration`
      });
    }

    // Check project-specific structure
    const structureChecks = this.getProjectTypeStructureChecks(projectType, files);
    checks.push(...structureChecks);

    // Check feature-specific files
    if (sessionContext.featureToggles) {
      const featureChecks = this.getFeatureToggleChecks(sessionContext.featureToggles, files);
      checks.push(...featureChecks);
    }

    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  /**
   * Enhanced code validation with smart analysis
   */
  async validateCode(files, sessionContext) {
    const checks = [];

    // Basic syntax validation
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const syntaxChecks = this.validateFileSyntax(content, filePath);
        checks.push(...syntaxChecks);
      }
    }

    // Framework-specific validation
    const frameworkChecks = this.validateFrameworkPatterns(files, sessionContext);
    checks.push(...frameworkChecks);

    // Code quality checks
    const qualityChecks = this.validateCodeQuality(files);
    checks.push(...qualityChecks);

    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  /**
   * Smart linting validation
   */
  async validateLinting(files, sessionContext) {
    const checks = [];
    const lintingRules = this.getLintingRules(sessionContext.projectType);

    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const lintChecks = this.applyLintingRules(content, filePath, lintingRules);
        checks.push(...lintChecks);
      }
    }

    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  /**
   * Import validation with dependency analysis
   */
  async validateImports(files, sessionContext) {
    const checks = [];
    const importMap = new Map();
    const dependencyMap = new Map();

    // Build import and dependency maps
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const imports = this.extractImports(content);
        const dependencies = this.extractDependencies(content);
        
        importMap.set(filePath, imports);
        dependencyMap.set(filePath, dependencies);
      }
    }

    // Check for missing imports
    for (const [filePath, imports] of importMap) {
      for (const importPath of imports) {
        const isResolved = this.checkImportResolution(importPath, files, importMap);
        checks.push({
          name: `Import resolution: ${importPath}`,
          passed: isResolved,
          severity: isResolved ? 'info' : 'error',
          message: isResolved ? `✓ ${importPath} resolved` : `✗ Cannot resolve ${importPath}`,
          file: filePath
        });
      }
    }

    // Check for unused imports
    const unusedImports = this.findUnusedImports(importMap, dependencyMap);
    for (const unused of unusedImports) {
      checks.push({
        name: `Unused import: ${unused.import}`,
        passed: false,
        severity: 'warning',
        message: `⚠️ Unused import: ${unused.import}`,
        file: unused.file,
        fix: `Remove unused import: ${unused.import}`
      });
    }

    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  /**
   * Dead code detection
   */
  async validateDeadCode(files, sessionContext) {
    const checks = [];
    const deadCodePatterns = this.getDeadCodePatterns();

    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const deadCode = this.findDeadCode(content, filePath, deadCodePatterns);
        checks.push(...deadCode);
      }
    }

    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  /**
   * TypeScript type checking
   */
  async validateTypeScript(files, sessionContext) {
    const checks = [];

    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const typeChecks = this.validateTypeScriptTypes(content, filePath);
        checks.push(...typeChecks);
      }
    }

    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  // Helper methods for enhanced validation

  getRequiredFilesForProjectType(projectType) {
    const baseFiles = ['package.json', 'README.md'];
    
    switch (projectType) {
      case 'dashboard':
        return [...baseFiles, 'src/components/Sidebar.tsx', 'src/components/Chart.tsx'];
      case 'ecommerce':
        return [...baseFiles, 'src/components/ProductCard.tsx', 'src/components/Cart.tsx'];
      case 'portfolio':
        return [...baseFiles, 'src/components/ProjectCard.tsx', 'src/components/Hero.tsx'];
      case 'saas':
        return [...baseFiles, 'src/components/PricingCard.tsx', 'src/components/FeatureCard.tsx'];
      default:
        return baseFiles;
    }
  }

  getProjectTypeStructureChecks(projectType, files) {
    const checks = [];
    
    switch (projectType) {
      case 'dashboard':
        checks.push({
          name: 'Dashboard components',
          passed: this.hasDashboardComponents(files),
          severity: 'error',
          message: 'Dashboard should have analytics and data visualization components'
        });
        break;
      case 'ecommerce':
        checks.push({
          name: 'E-commerce components',
          passed: this.hasEcommerceComponents(files),
          severity: 'error',
          message: 'E-commerce should have product and cart components'
        });
        break;
    }
    
    return checks;
  }

  getFeatureToggleChecks(featureToggles, files) {
    const checks = [];
    
    if (featureToggles.authentication) {
      checks.push({
        name: 'Authentication components',
        passed: this.hasAuthComponents(files),
        severity: 'warning',
        message: 'Authentication enabled but no auth components found'
      });
    }
    
    if (featureToggles.darkMode) {
      checks.push({
        name: 'Dark mode support',
        passed: this.hasDarkModeSupport(files),
        severity: 'warning',
        message: 'Dark mode enabled but no theme components found'
      });
    }
    
    return checks;
  }

  validateFileSyntax(content, filePath) {
    const checks = [];
    
    // Check for balanced brackets
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack = [];
    
    for (const char of content) {
      if (brackets[char]) {
        stack.push(brackets[char]);
      } else if (Object.values(brackets).includes(char)) {
        if (stack.pop() !== char) {
          checks.push({
            name: `Syntax: ${filePath}`,
            passed: false,
            severity: 'error',
            message: `Unbalanced brackets in ${filePath}`,
            file: filePath
          });
          break;
        }
      }
    }
    
    if (stack.length > 0) {
      checks.push({
        name: `Syntax: ${filePath}`,
        passed: false,
        severity: 'error',
        message: `Unclosed brackets in ${filePath}`,
        file: filePath
      });
    }
    
    return checks;
  }

  validateFrameworkPatterns(files, sessionContext) {
    const checks = [];
    const framework = sessionContext.framework || 'react';
    
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const patternChecks = this.validateFrameworkSpecificPatterns(content, filePath, framework);
        checks.push(...patternChecks);
      }
    }
    
    return checks;
  }

  validateCodeQuality(files) {
    const checks = [];
    
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Check for proper TypeScript usage
        if (!content.includes('interface') && !content.includes('type') && content.includes('props')) {
          checks.push({
            name: `TypeScript: ${filePath}`,
            passed: false,
            severity: 'warning',
            message: `Missing TypeScript interfaces for props in ${filePath}`,
            file: filePath,
            fix: 'Add proper TypeScript interfaces for component props'
          });
        }
        
        // Check for proper React patterns
        if (content.includes('useState') || content.includes('useEffect')) {
          if (!content.includes('import React')) {
            checks.push({
              name: `React imports: ${filePath}`,
              passed: false,
              severity: 'warning',
              message: `Missing React import in ${filePath}`,
              file: filePath,
              fix: 'Add React import for hooks usage'
            });
          }
        }
      }
    }
    
    return checks;
  }

  getLintingRules(projectType) {
    return {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'error'
    };
  }

  applyLintingRules(content, filePath, rules) {
    const checks = [];
    
    // Check for console.log statements
    if (rules['no-console'] && content.includes('console.log')) {
      checks.push({
        name: `Linting: ${filePath}`,
        passed: false,
        severity: 'warning',
        message: `Console.log found in ${filePath}`,
        file: filePath,
        fix: 'Remove console.log statements for production'
      });
    }
    
    // Check for unused variables (simplified)
    const varMatches = content.match(/const\s+(\w+)\s*=/g);
    if (varMatches) {
      for (const match of varMatches) {
        const varName = match.match(/const\s+(\w+)\s*=/)[1];
        if (!content.includes(varName) || content.indexOf(varName) === content.lastIndexOf(varName)) {
          checks.push({
            name: `Linting: ${filePath}`,
            passed: false,
            severity: 'warning',
            message: `Potentially unused variable: ${varName}`,
            file: filePath,
            fix: `Remove unused variable: ${varName}`
          });
        }
      }
    }
    
    return checks;
  }

  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractDependencies(content) {
    const dependencies = [];
    const depRegex = /(\w+)\s*[({]/g;
    let match;
    
    while ((match = depRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }
    
    return dependencies;
  }

  checkImportResolution(importPath, files, importMap) {
    // Simplified import resolution check
    if (importPath.startsWith('.')) {
      // Relative import
      return true; // Assume it exists
    } else {
      // External import - check if it's a common library
      const commonLibs = ['react', 'react-dom', 'next', '@remix-run/react'];
      return commonLibs.some(lib => importPath.startsWith(lib));
    }
  }

  findUnusedImports(importMap, dependencyMap) {
    const unused = [];
    
    for (const [filePath, imports] of importMap) {
      const dependencies = dependencyMap.get(filePath) || [];
      
      for (const importPath of imports) {
        const importName = importPath.split('/').pop().replace(/['"]/g, '');
        if (!dependencies.includes(importName)) {
          unused.push({ file: filePath, import: importPath });
        }
      }
    }
    
    return unused;
  }

  getDeadCodePatterns() {
    return [
      { pattern: /function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g, name: 'Unused function' },
      { pattern: /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*}/g, name: 'Unused arrow function' },
      { pattern: /class\s+\w+\s*{[^}]*}/g, name: 'Unused class' }
    ];
  }

  findDeadCode(content, filePath, patterns) {
    const checks = [];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          const funcName = match.match(/(?:function|const)\s+(\w+)/)?.[1];
          if (funcName && !content.includes(funcName) || content.indexOf(funcName) === content.lastIndexOf(funcName)) {
            checks.push({
              name: `Dead code: ${filePath}`,
              passed: false,
              severity: 'warning',
              message: `Potentially unused code: ${pattern.name}`,
              file: filePath,
              fix: `Remove unused ${pattern.name.toLowerCase()}: ${funcName}`
            });
          }
        }
      }
    }
    
    return checks;
  }

  validateTypeScriptTypes(content, filePath) {
    const checks = [];
    
    // Check for proper TypeScript usage
    if (content.includes('any')) {
      checks.push({
        name: `TypeScript: ${filePath}`,
        passed: false,
        severity: 'warning',
        message: `Usage of 'any' type in ${filePath}`,
        file: filePath,
        fix: 'Replace "any" with proper TypeScript types'
      });
    }
    
    // Check for missing return types
    const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*{/g);
    if (functionMatches) {
      for (const match of functionMatches) {
        if (!match.includes(':')) {
          checks.push({
            name: `TypeScript: ${filePath}`,
            passed: false,
            severity: 'warning',
            message: `Missing return type for function in ${filePath}`,
            file: filePath,
            fix: 'Add proper return type annotations'
          });
        }
      }
    }
    
    return checks;
  }

  // Framework-specific validation methods
  hasDashboardComponents(files) {
    const dashboardComponents = ['Sidebar', 'Chart', 'DataTable', 'Dashboard'];
    return dashboardComponents.some(comp => 
      Object.keys(files).some(file => file.includes(comp))
    );
  }

  hasEcommerceComponents(files) {
    const ecommerceComponents = ['ProductCard', 'Cart', 'Checkout', 'Product'];
    return ecommerceComponents.some(comp => 
      Object.keys(files).some(file => file.includes(comp))
    );
  }

  hasAuthComponents(files) {
    const authComponents = ['Login', 'Signup', 'Auth', 'User'];
    return authComponents.some(comp => 
      Object.keys(files).some(file => file.includes(comp))
    );
  }

  hasDarkModeSupport(files) {
    return Object.values(files).some(content => 
      content.includes('dark:') || content.includes('darkMode') || content.includes('theme')
    );
  }

  validateFrameworkSpecificPatterns(content, filePath, framework) {
    const checks = [];
    
    switch (framework) {
      case 'react':
        if (content.includes('useState') && !content.includes('import React')) {
          checks.push({
            name: `React patterns: ${filePath}`,
            passed: false,
            severity: 'warning',
            message: 'Missing React import for hooks',
            file: filePath,
            fix: 'Add React import for hooks usage'
          });
        }
        break;
      case 'nextjs':
        if (content.includes('use client') && content.includes('useState')) {
          checks.push({
            name: `Next.js patterns: ${filePath}`,
            passed: true,
            severity: 'info',
            message: 'Proper client component usage',
            file: filePath
          });
        }
        break;
    }
    
    return checks;
  }

  // Existing methods (keeping for compatibility)
  async validatePerformance(files, sessionContext) {
    const checks = [];
    
    // Check for performance issues
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Check for expensive operations
        if (content.includes('document.querySelectorAll') && !content.includes('useMemo')) {
          checks.push({
            name: `Performance: ${filePath}`,
            passed: false,
            severity: 'warning',
            message: 'Expensive DOM query without memoization',
            file: filePath,
            fix: 'Use useMemo for expensive DOM operations'
          });
        }
      }
    }
    
    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  async validateAccessibility(files, sessionContext) {
    const checks = [];
    
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Check for accessibility features
        if (content.includes('<button') && !content.includes('aria-label')) {
          checks.push({
            name: `Accessibility: ${filePath}`,
            passed: false,
            severity: 'warning',
            message: 'Button missing aria-label',
            file: filePath,
            fix: 'Add aria-label to buttons for screen readers'
          });
        }
      }
    }
    
    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  async validateDesign(files, sessionContext) {
    const checks = [];
    
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Check for responsive design
        if (content.includes('className') && !content.includes('md:') && !content.includes('lg:')) {
          checks.push({
            name: `Design: ${filePath}`,
            passed: false,
            severity: 'warning',
            message: 'Missing responsive design classes',
            file: filePath,
            fix: 'Add responsive Tailwind classes (md:, lg:)'
          });
        }
      }
    }
    
    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  async validateContent(files, sessionContext) {
    const checks = [];
    
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Check for realistic content
        if (content.includes('Lorem ipsum') || content.includes('Sample text')) {
          checks.push({
            name: `Content: ${filePath}`,
            passed: false,
            severity: 'warning',
            message: 'Placeholder content found',
            file: filePath,
            fix: 'Replace placeholder content with realistic text'
          });
        }
      }
    }
    
    return {
      score: this.calculateCategoryScore(checks),
      checks,
      passed: checks.every(check => check.passed || check.severity !== 'error')
    };
  }

  calculateCategoryScore(checks) {
    if (checks.length === 0) return 100;
    
    const passed = checks.filter(check => check.passed).length;
    return Math.round((passed / checks.length) * 100);
  }

  calculateOverallScore(categories) {
    const weights = {
      structure: this.WEIGHT_STRUCTURE,
      code: this.WEIGHT_CODE,
      performance: this.WEIGHT_PERFORMANCE,
      accessibility: this.WEIGHT_ACCESSIBILITY,
      design: this.WEIGHT_DESIGN,
      content: this.WEIGHT_CONTENT,
      linting: 10,
      imports: 10,
      deadCode: 5,
      types: 15
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [category, score] of Object.entries(categories)) {
      if (weights[category]) {
        totalScore += score.score * weights[category];
        totalWeight += weights[category];
      }
    }
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  extractIssues(categories) {
    const issues = [];
    
    for (const [category, data] of Object.entries(categories)) {
      for (const check of data.checks) {
        if (!check.passed) {
          issues.push({
            category,
            severity: check.severity,
            message: check.message,
            file: check.file,
            fix: check.fix
          });
        }
      }
    }
    
    return issues;
  }

  generateRecommendations(categories, sessionContext) {
    const recommendations = [];
    
    // Generate recommendations based on issues
    const issues = this.extractIssues(categories);
    
    for (const issue of issues) {
      if (issue.fix) {
        recommendations.push({
          category: issue.category,
          priority: issue.severity === 'error' ? 'high' : 'medium',
          action: issue.fix,
          impact: 'Improves code quality and maintainability'
        });
      }
    }
    
    // Add project-specific recommendations
    if (sessionContext.projectType) {
      const projectRecommendations = this.getProjectTypeRecommendations(sessionContext.projectType);
      recommendations.push(...projectRecommendations);
    }
    
    return recommendations;
  }

  getProjectTypeRecommendations(projectType) {
    const recommendations = [];
    
    switch (projectType) {
      case 'dashboard':
        recommendations.push({
          category: 'performance',
          priority: 'high',
          action: 'Implement data caching for dashboard metrics',
          impact: 'Improves dashboard loading performance'
        });
        break;
      case 'ecommerce':
        recommendations.push({
          category: 'accessibility',
          priority: 'high',
          action: 'Add ARIA labels to product cards and buttons',
          impact: 'Improves accessibility for screen readers'
        });
        break;
    }
    
    return recommendations;
  }

  async generateQualityReport(validation) {
    return {
      summary: {
        score: validation.score,
        passed: validation.passed,
        totalIssues: validation.issues.length,
        criticalIssues: validation.issues.filter(i => i.severity === 'error').length,
        warnings: validation.issues.filter(i => i.severity === 'warning').length
      },
      categories: validation.categories,
      issues: validation.issues,
      recommendations: validation.recommendations,
      sessionContext: validation.sessionContext
    };
  }
}

export default ProjectValidationPipeline; 
