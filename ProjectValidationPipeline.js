/**
 * Project Validation Pipeline - JavaScript Backend Version
 * Ensures every generated project meets production standards
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
  }

  /**
   * Validate entire project and return quality assessment
   */
  async validateProject(files) {
    console.log('🔍 Starting project validation...');
    
    const categories = {
      structure: await this.validateStructure(files),
      code: await this.validateCode(files),
      performance: await this.validatePerformance(files),
      accessibility: await this.validateAccessibility(files),
      design: await this.validateDesign(files),
      content: await this.validateContent(files)
    };

    const score = this.calculateOverallScore(categories);
    const issues = this.extractIssues(categories);
    const recommendations = this.generateRecommendations(categories);

    console.log(`📊 Overall quality score: ${score}%`);

    return {
      score,
      passed: score >= this.MINIMUM_SCORE,
      categories,
      issues,
      recommendations
    };
  }

  /**
   * Validate project structure and configuration
   */
  async validateStructure(files) {
    const checks = [];

    // Check required files
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'vite.config.ts',
      'index.html',
      'src/main.tsx',
      'src/App.tsx',
      '.env.example',
      'README.md'
    ];

    for (const file of requiredFiles) {
      checks.push({
        name: `Required file: ${file}`,
        passed: files[file] !== undefined,
        severity: 'error',
        message: files[file] ? `✓ ${file} exists` : `✗ Missing ${file}`,
        fix: files[file] ? undefined : `Create ${file} with proper configuration`
      });
    }

    // Check file structure
    const hasComponents = Object.keys(files).some(f => f.startsWith('src/components/'));
    checks.push({
      name: 'Components directory',
      passed: hasComponents,
      severity: 'error',
      message: hasComponents ? '✓ Components directory exists' : '✗ No components found',
      fix: hasComponents ? undefined : 'Create src/components/ directory with UI components'
    });

    // Check package.json validity
    if (files['package.json']) {
      try {
        const pkg = JSON.parse(files['package.json']);
        
        checks.push({
          name: 'Package.json validity',
          passed: true,
          severity: 'info',
          message: '✓ Valid package.json'
        });

        // Check essential dependencies
        const requiredDeps = ['react', 'react-dom', 'typescript', 'tailwindcss'];
        const hasDeps = requiredDeps.every(dep => pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]);
        
        checks.push({
          name: 'Essential dependencies',
          passed: hasDeps,
          severity: 'error',
          message: hasDeps ? '✓ All essential dependencies present' : '✗ Missing essential dependencies',
          fix: hasDeps ? undefined : 'Add missing dependencies: ' + requiredDeps.join(', ')
        });

      } catch (error) {
        checks.push({
          name: 'Package.json validity',
          passed: false,
          severity: 'error',
          message: '✗ Invalid package.json format',
          fix: 'Fix JSON syntax errors in package.json'
        });
      }
    }

    const score = this.calculateCategoryScore(checks);
    return { score, passed: score >= 80, checks };
  }

  /**
   * Validate code quality and structure
   */
  async validateCode(files) {
    const checks = [];

    // Check for TypeScript usage
    const tsFiles = Object.keys(files).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    checks.push({
      name: 'TypeScript usage',
      passed: tsFiles.length > 0,
      severity: 'warning',
      message: tsFiles.length > 0 ? `✓ ${tsFiles.length} TypeScript files` : '✗ No TypeScript files found'
    });

    // Check for React components
    const reactFiles = Object.entries(files).filter(([path, content]) => 
      (path.endsWith('.tsx') || path.endsWith('.jsx')) && content.includes('React')
    );
    
    checks.push({
      name: 'React components',
      passed: reactFiles.length > 0,
      severity: 'error',
      message: reactFiles.length > 0 ? `✓ ${reactFiles.length} React components` : '✗ No React components found',
      fix: reactFiles.length > 0 ? undefined : 'Create React components in src/components/'
    });

    // Check for proper imports
    let hasImportIssues = false;
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Check for missing React import in JSX files
        if (content.includes('<') && content.includes('>') && !content.includes('import React')) {
          hasImportIssues = true;
          break;
        }
      }
    }

    checks.push({
      name: 'Import statements',
      passed: !hasImportIssues,
      severity: 'error',
      message: !hasImportIssues ? '✓ Proper import statements' : '✗ Missing or incorrect imports',
      fix: hasImportIssues ? 'Add missing React imports in JSX files' : undefined
    });

    // Check for error handling
    const hasErrorBoundary = Object.values(files).some(content => 
      content.includes('ErrorBoundary') || content.includes('componentDidCatch')
    );
    
    checks.push({
      name: 'Error handling',
      passed: hasErrorBoundary,
      severity: 'warning',
      message: hasErrorBoundary ? '✓ Error boundaries implemented' : '⚠ No error boundaries found',
      fix: hasErrorBoundary ? undefined : 'Add error boundaries for better error handling'
    });

    // Check for loading states
    const hasLoadingStates = Object.values(files).some(content => 
      content.includes('loading') || content.includes('Loading') || content.includes('isLoading')
    );
    
    checks.push({
      name: 'Loading states',
      passed: hasLoadingStates,
      severity: 'warning',
      message: hasLoadingStates ? '✓ Loading states implemented' : '⚠ No loading states found',
      fix: hasLoadingStates ? undefined : 'Add loading states for async operations'
    });

    const score = this.calculateCategoryScore(checks);
    return { score, passed: score >= 70, checks };
  }

  /**
   * Validate performance optimization
   */
  async validatePerformance(files) {
    const checks = [];

    // Check for code splitting
    const hasLazyLoading = Object.values(files).some(content => 
      content.includes('React.lazy') || content.includes('lazy(')
    );
    
    checks.push({
      name: 'Code splitting',
      passed: hasLazyLoading,
      severity: 'warning',
      message: hasLazyLoading ? '✓ Code splitting implemented' : '⚠ No code splitting found',
      fix: hasLazyLoading ? undefined : 'Implement React.lazy() for route-based code splitting'
    });

    // Check for image optimization
    const hasImageOptimization = Object.values(files).some(content => 
      content.includes('loading="lazy"') || content.includes('loading: "lazy"')
    );
    
    checks.push({
      name: 'Image optimization',
      passed: hasImageOptimization,
      severity: 'info',
      message: hasImageOptimization ? '✓ Lazy loading images' : 'ℹ Add lazy loading for images',
      fix: hasImageOptimization ? undefined : 'Add loading="lazy" to img elements'
    });

    // Check for memoization
    const hasMemoization = Object.values(files).some(content => 
      content.includes('React.memo') || content.includes('useMemo') || content.includes('useCallback')
    );
    
    checks.push({
      name: 'Component memoization',
      passed: hasMemoization,
      severity: 'info',
      message: hasMemoization ? '✓ Component memoization used' : 'ℹ Consider using React.memo for performance',
      fix: hasMemoization ? undefined : 'Add React.memo to expensive components'
    });

    // Check bundle size indicators
    const hasLargeDependencies = files['package.json'] ? 
      JSON.parse(files['package.json']).dependencies && 
      Object.keys(JSON.parse(files['package.json']).dependencies).length > 20 : false;
    
    checks.push({
      name: 'Dependency count',
      passed: !hasLargeDependencies,
      severity: 'warning',
      message: !hasLargeDependencies ? '✓ Reasonable dependency count' : '⚠ Many dependencies may increase bundle size',
      fix: hasLargeDependencies ? 'Review and remove unnecessary dependencies' : undefined
    });

    const score = this.calculateCategoryScore(checks);
    return { score, passed: score >= 60, checks };
  }

  /**
   * Validate accessibility compliance
   */
  async validateAccessibility(files) {
    const checks = [];

    // Check for semantic HTML
    const hasSemanticHTML = Object.values(files).some(content => 
      content.includes('<header>') || content.includes('<main>') || 
      content.includes('<nav>') || content.includes('<section>')
    );
    
    checks.push({
      name: 'Semantic HTML',
      passed: hasSemanticHTML,
      severity: 'warning',
      message: hasSemanticHTML ? '✓ Semantic HTML elements used' : '⚠ Use semantic HTML elements',
      fix: hasSemanticHTML ? undefined : 'Replace divs with semantic elements (header, main, nav, section)'
    });

    // Check for ARIA labels
    const hasAriaLabels = Object.values(files).some(content => 
      content.includes('aria-label') || content.includes('aria-describedby')
    );
    
    checks.push({
      name: 'ARIA labels',
      passed: hasAriaLabels,
      severity: 'warning',
      message: hasAriaLabels ? '✓ ARIA labels present' : '⚠ Add ARIA labels for accessibility',
      fix: hasAriaLabels ? undefined : 'Add aria-label and aria-describedby attributes'
    });

    // Check for alt tags
    const allContent = Object.values(files).join('');
    const imgTags = allContent.match(/<img[^>]*>/g) || [];
    const hasAltTags = imgTags.length > 0 ? imgTags.every(img => img.includes('alt=')) : true;
    
    checks.push({
      name: 'Image alt tags',
      passed: hasAltTags,
      severity: 'error',
      message: hasAltTags ? '✓ All images have alt tags' : '✗ Missing alt tags on images',
      fix: hasAltTags ? undefined : 'Add descriptive alt attributes to all img elements'
    });

    // Check for keyboard navigation
    const hasKeyboardNav = Object.values(files).some(content => 
      content.includes('onKeyDown') || content.includes('tabIndex') || content.includes('focus')
    );
    
    checks.push({
      name: 'Keyboard navigation',
      passed: hasKeyboardNav,
      severity: 'info',
      message: hasKeyboardNav ? '✓ Keyboard navigation support' : 'ℹ Consider keyboard navigation support',
      fix: hasKeyboardNav ? undefined : 'Add keyboard event handlers and proper tab order'
    });

    const score = this.calculateCategoryScore(checks);
    return { score, passed: score >= 70, checks };
  }

  /**
   * Validate design quality
   */
  async validateDesign(files) {
    const checks = [];

    // Check for responsive design
    const hasResponsive = Object.values(files).some(content => 
      content.includes('md:') || content.includes('lg:') || content.includes('sm:')
    );
    
    checks.push({
      name: 'Responsive design',
      passed: hasResponsive,
      severity: 'warning',
      message: hasResponsive ? '✓ Responsive classes used' : '⚠ No responsive design patterns found',
      fix: hasResponsive ? undefined : 'Add responsive Tailwind classes (sm:, md:, lg:)'
    });

    // Check for dark mode support
    const hasDarkMode = Object.values(files).some(content => 
      content.includes('dark:') || content.includes('darkMode')
    );
    
    checks.push({
      name: 'Dark mode support',
      passed: hasDarkMode,
      severity: 'info',
      message: hasDarkMode ? '✓ Dark mode classes found' : 'ℹ Consider adding dark mode support',
      fix: hasDarkMode ? undefined : 'Add dark: classes and theme toggle functionality'
    });

    // Check for consistent spacing
    const hasSpacingSystem = Object.values(files).some(content => 
      content.includes('p-') || content.includes('m-') || content.includes('space-')
    );
    
    checks.push({
      name: 'Spacing system',
      passed: hasSpacingSystem,
      severity: 'info',
      message: hasSpacingSystem ? '✓ Consistent spacing classes' : 'ℹ Use systematic spacing classes',
      fix: hasSpacingSystem ? undefined : 'Use Tailwind spacing utilities (p-, m-, space-)'
    });

    // Check for animations
    const hasAnimations = Object.values(files).some(content => 
      content.includes('transition') || content.includes('animate-') || content.includes('framer-motion')
    );
    
    checks.push({
      name: 'Animations',
      passed: hasAnimations,
      severity: 'info',
      message: hasAnimations ? '✓ Animations implemented' : 'ℹ Consider adding micro-interactions',
      fix: hasAnimations ? undefined : 'Add transition classes or Framer Motion animations'
    });

    const score = this.calculateCategoryScore(checks);
    return { score, passed: score >= 50, checks };
  }

  /**
   * Validate content quality
   */
  async validateContent(files) {
    const checks = [];

    // Check for realistic content
    const hasPlaceholderContent = Object.values(files).some(content => 
      content.includes('Lorem ipsum') || content.includes('placeholder') || 
      content.includes('Example') || content.includes('Sample')
    );
    
    checks.push({
      name: 'Realistic content',
      passed: !hasPlaceholderContent,
      severity: 'warning',
      message: !hasPlaceholderContent ? '✓ No placeholder content found' : '⚠ Replace placeholder content with realistic data',
      fix: hasPlaceholderContent ? 'Replace Lorem ipsum and placeholder text with industry-specific content' : undefined
    });

    // Check for multiple data points
    const allContent = Object.values(files).join('');
    const contentEntries = allContent.match(/\{[^}]*name[^}]*\}/g) || [];
    const hasMultipleItems = contentEntries.length >= 5;
    
    checks.push({
      name: 'Content variety',
      passed: hasMultipleItems,
      severity: 'info',
      message: hasMultipleItems ? `✓ ${contentEntries.length} content items found` : 'ℹ Add more content variety',
      fix: hasMultipleItems ? undefined : 'Add at least 5 different products/services/posts'
    });

    // Check for professional copy
    const hasProfessionalTerms = Object.values(files).some(content => 
      content.includes('solution') || content.includes('professional') || 
      content.includes('innovative') || content.includes('experience')
    );
    
    checks.push({
      name: 'Professional copy',
      passed: hasProfessionalTerms,
      severity: 'info',
      message: hasProfessionalTerms ? '✓ Professional language used' : 'ℹ Use more professional business language',
      fix: hasProfessionalTerms ? undefined : 'Improve copy with professional business terminology'
    });

    // Check for contact information
    const hasContactInfo = Object.values(files).some(content => 
      content.includes('@') || content.includes('contact') || content.includes('email')
    );
    
    checks.push({
      name: 'Contact information',
      passed: hasContactInfo,
      severity: 'info',
      message: hasContactInfo ? '✓ Contact information present' : 'ℹ Add contact information',
      fix: hasContactInfo ? undefined : 'Add email, phone, or contact form'
    });

    const score = this.calculateCategoryScore(checks);
    return { score, passed: score >= 60, checks };
  }

  /**
   * Calculate score for a category
   */
  calculateCategoryScore(checks) {
    if (checks.length === 0) return 100;

    const weights = { error: 3, warning: 2, info: 1 };
    let totalWeight = 0;
    let passedWeight = 0;

    for (const check of checks) {
      const weight = weights[check.severity];
      totalWeight += weight;
      if (check.passed) {
        passedWeight += weight;
      }
    }

    return Math.round((passedWeight / totalWeight) * 100);
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallScore(categories) {
    const weights = {
      structure: this.WEIGHT_STRUCTURE,
      code: this.WEIGHT_CODE,
      performance: this.WEIGHT_PERFORMANCE,
      accessibility: this.WEIGHT_ACCESSIBILITY,
      design: this.WEIGHT_DESIGN,
      content: this.WEIGHT_CONTENT
    };

    let totalWeight = 0;
    let weightedScore = 0;

    for (const [category, result] of Object.entries(categories)) {
      const weight = weights[category] || 0;
      totalWeight += weight;
      weightedScore += result.score * weight;
    }

    return Math.round(weightedScore / totalWeight);
  }

  /**
   * Extract issues from validation results
   */
  extractIssues(categories) {
    const issues = [];

    for (const [categoryName, category] of Object.entries(categories)) {
      for (const check of category.checks) {
        if (!check.passed && check.severity !== 'info') {
          issues.push({
            file: categoryName,
            type: check.severity === 'error' ? 'error' : 'warning',
            message: check.message,
            fix: check.fix || 'Manual review required'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations(categories) {
    const recommendations = [];

    // Structure recommendations
    if (categories.structure.score < 90) {
      recommendations.push("📁 Improve project structure: Add missing configuration files and organize components properly");
    }

    // Code quality recommendations
    if (categories.code.score < 80) {
      recommendations.push("💻 Enhance code quality: Add error handling, loading states, and proper TypeScript types");
    }

    // Performance recommendations
    if (categories.performance.score < 70) {
      recommendations.push("⚡ Optimize performance: Implement code splitting, lazy loading, and component memoization");
    }

    // Accessibility recommendations
    if (categories.accessibility.score < 80) {
      recommendations.push("♿ Improve accessibility: Add ARIA labels, semantic HTML, and keyboard navigation support");
    }

    // Design recommendations
    if (categories.design.score < 60) {
      recommendations.push("🎨 Enhance design: Add responsive classes, animations, and consistent design patterns");
    }

    // Content recommendations
    if (categories.content.score < 70) {
      recommendations.push("📝 Improve content: Replace placeholder text with realistic, professional content");
    }

    if (recommendations.length === 0) {
      recommendations.push("🎉 Excellent! Your project meets all quality standards for production deployment.");
    }

    return recommendations;
  }

  /**
   * Generate quality report
   */
  async generateQualityReport(validation) {
    const { score, categories, issues, recommendations } = validation;
    
    let report = `
# Project Quality Report

## Overall Score: ${score}/100 ${validation.passed ? '✅ PASSED' : '❌ FAILED'}

## Category Breakdown:
- 📁 Structure: ${categories.structure.score}/100 ${categories.structure.passed ? '✅' : '❌'}
- 💻 Code Quality: ${categories.code.score}/100 ${categories.code.passed ? '✅' : '❌'}
- ⚡ Performance: ${categories.performance.score}/100 ${categories.performance.passed ? '✅' : '❌'}
- ♿ Accessibility: ${categories.accessibility.score}/100 ${categories.accessibility.passed ? '✅' : '❌'}
- 🎨 Design: ${categories.design.score}/100 ${categories.design.passed ? '✅' : '❌'}
- 📝 Content: ${categories.content.score}/100 ${categories.content.passed ? '✅' : '❌'}

## Issues Found: ${issues.length}
${issues.map(issue => `- ${issue.type.toUpperCase()}: ${issue.message}`).join('\n')}

## Recommendations:
${recommendations.map(rec => `- ${rec}`).join('\n')}

---
Generated by ZapQ Quality Pipeline
`;

    return report;
  }
}

module.exports = ProjectValidationPipeline; 
