
import { getStackConfig } from './stackConfigs.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load blueprint object from /blueprints/ComponentName.js
async function loadBlueprint(componentName) {
  // Try .js first, then fallback to .ts for backward compatibility
  let filePath = path.join(__dirname, 'blueprints', `${componentName}.js`);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'blueprints', `${componentName}.ts`);
    if (!fs.existsSync(filePath)) return null;
  }

  try {
    const module = await import(`file://${filePath}`);
    const key = Object.keys(module)[0];
    return module[key];
  } catch (error) {
    console.warn(`⚠️  Failed to load blueprint for ${componentName}:`, error.message);
    return null;
  }
}

// Enhanced prompt builder for enterprise-level generation
function buildEnterpriseComponentPrompt(name, blueprint, plan) {
  const fileType = blueprint?.fileType || 'React Component';
  const purpose = blueprint?.purpose || 'Component for the application';
  
  let prompt = `Generate a ${fileType} named ${name} for a ${plan.projectType} project.

Description: ${plan.description}

Purpose: ${purpose}

`;

  // Add file type specific instructions
  if (blueprint?.fileType === 'TypeScript Configuration') {
    prompt += `CRITICAL: This is a TypeScript configuration file (tsconfig.json), NOT a React component.
- Return ONLY valid JSON configuration
- Do NOT include any React/TSX code
- Do NOT include import/export statements
- Must be parseable JSON for TypeScript compiler
`;
  } else if (blueprint?.fileType === 'CSS Stylesheet') {
    prompt += `CRITICAL: This is a CSS file, NOT a React component.
- Return ONLY valid CSS with Tailwind directives
- Do NOT include any React/TSX code
- Do NOT include import/export statements
- Must start with @tailwind directives
`;
  } else if (blueprint?.fileType === 'Vite Configuration') {
    prompt += `CRITICAL: This is a Vite configuration file, NOT a React component.
- Return ONLY valid TypeScript configuration code
- Do NOT include any React/TSX code
- Do NOT include JSX syntax
- Must use defineConfig and proper Vite syntax
`;
  } else if (blueprint?.fileType === 'HTML Entry Point') {
    prompt += `CRITICAL: This is an HTML file, NOT a React component.
- Return ONLY valid HTML markup
- Do NOT include any React/TSX code
- Do NOT include import/export statements
- Must include proper HTML structure with DOCTYPE
`;
  } else if (blueprint?.fileType === 'State Management Store') {
    prompt += `CRITICAL: This is a Zustand store file, NOT a React component.
- Return ONLY valid TypeScript store code
- Do NOT include JSX syntax or React components
- Must use Zustand create function with proper middleware
- Include TypeScript interfaces and types
`;
  } else if (blueprint?.fileType === 'React Form Component') {
    prompt += `CRITICAL: This is a React form component.
- Return ONLY valid TSX code
- Must include React Hook Form and Zod validation
- Include proper accessibility features
- Use consistent design system styling
`;
  } else if (blueprint?.fileType === 'React Page Component') {
    prompt += `CRITICAL: This is a React page component.
- Return ONLY valid TSX code
- Must include proper routing and navigation
- Integrate with global state management
- Include accessibility and SEO features
`;
  } else {
    // React component
    prompt += `CRITICAL: This is a React component file.
- Return ONLY valid TSX code
- Do NOT include markdown or explanations
- Component must compile successfully
- Use modern React 18 patterns with functional components and hooks
`;
  }

  // Add blueprint features if available
  if (blueprint?.features) {
    prompt += `\nFeatures to implement:\n`;
    Object.entries(blueprint.features).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
  }

  // Add design system if available
  if (blueprint?.designSystem) {
    prompt += `\nDesign System:\n`;
    Object.entries(blueprint.designSystem).forEach(([key, value]) => {
      if (typeof value === 'object') {
        prompt += `- ${key}:\n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          prompt += `  - ${subKey}: ${subValue}\n`;
        });
      } else {
        prompt += `- ${key}: ${value}\n`;
      }
    });
  }

  // Add enterprise features if available
  if (blueprint?.enterpriseFeatures) {
    prompt += `\nEnterprise Features:\n`;
    blueprint.enterpriseFeatures.forEach(feature => {
      prompt += `- ${feature}\n`;
    });
  }

  // Add accessibility requirements
  if (blueprint?.accessibility) {
    prompt += `\nAccessibility Requirements:\n`;
    Object.entries(blueprint.accessibility).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
  }

  // Add animation requirements
  if (blueprint?.animations) {
    prompt += `\nAnimation Requirements:\n`;
    Object.entries(blueprint.animations).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
  }

  // Add responsive design requirements
  if (blueprint?.responsive) {
    prompt += `\nResponsive Design:\n`;
    Object.entries(blueprint.responsive).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
  }

  // Add validation rules
  if (blueprint?.validation) {
    prompt += `\nValidation Rules:\n`;
    if (blueprint.validation.mustContain) {
      prompt += `- Must contain: ${blueprint.validation.mustContain.join(', ')}\n`;
    }
    if (blueprint.validation.mustNotContain) {
      prompt += `- Must NOT contain: ${blueprint.validation.mustNotContain.join(', ')}\n`;
    }
    if (blueprint.validation.fileExtension) {
      prompt += `- File extension: ${blueprint.validation.fileExtension}\n`;
    }
  }

  // Add state management requirements
  if (blueprint?.stateManagement) {
    prompt += `\nState Management:\n`;
    Object.entries(blueprint.stateManagement).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
  }

  // Add form handling requirements
  if (blueprint?.formHandling) {
    prompt += `\nForm Handling:\n`;
    Object.entries(blueprint.formHandling).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
  }

  // Add routing requirements
  if (blueprint?.routing) {
    prompt += `\nRouting Requirements:\n`;
    Object.entries(blueprint.routing).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });
  }

  prompt += `\nTechnical Requirements:
- Use TypeScript with strict typing
- Use Tailwind CSS for styling
- Include Framer Motion for animations
- Ensure accessibility compliance (WCAG AA)
- Use modern React patterns (hooks, functional components)
- Implement responsive design with mobile-first approach
- Include proper error handling and loading states
- Optimize for performance and SEO
- Use Zustand for state management where applicable
- Include React Hook Form with Zod validation where applicable
- Implement proper routing with React Router where applicable

Return ONLY the requested file content. No explanations, no markdown, no code blocks.`;

  return prompt;
}

// Utility to scan TSX for external packages
function scanImports(tsxContent) {
  const deps = {};
  if (tsxContent.includes('react-router-dom')) deps['react-router-dom'] = '^6.26.0';
  if (tsxContent.includes('react-error-boundary')) deps['react-error-boundary'] = '^4.0.11';
  if (tsxContent.includes('@heroicons/react')) deps['@heroicons/react'] = '^2.1.1';
  if (tsxContent.includes('framer-motion')) deps['framer-motion'] = '^11.3.19';
  if (tsxContent.includes('lucide-react')) deps['lucide-react'] = '^0.428.0';
  if (tsxContent.includes('react-hook-form')) deps['react-hook-form'] = '^7.52.1';
  if (tsxContent.includes('zod')) deps['zod'] = '^3.23.8';
  if (tsxContent.includes('zustand')) deps['zustand'] = '^4.5.4';
  if (tsxContent.includes('recharts')) deps['recharts'] = '^2.12.0';
  if (tsxContent.includes('date-fns')) deps['date-fns'] = '^3.6.0';
  if (tsxContent.includes('clsx')) deps['clsx'] = '^2.1.1';
  if (tsxContent.includes('tailwind-merge')) deps['tailwind-merge'] = '^2.4.0';
  return deps;
}

export class OrchestrationEngine {
  constructor(sessionId = null, claudeInstance, stackConfig) {
    this.sessionId = sessionId || uuidv4();
    this.session = {
      sessionId: this.sessionId,
      generatedFiles: {},
      projectPlan: null,
      totalTokensUsed: 0
    };
    this.claude = claudeInstance;
    this.stackConfig = stackConfig;
  }

  async askClaudeWithSession(prompt) {
    const result = await this.claude(prompt);
    this.session.totalTokensUsed += result.tokensUsed || 0;
    return result;
  }

  async generateProject(projectName, userPrompt, progressCallback = () => {}) {
    this.session.projectPlan = {
      projectName,
      description: userPrompt,
      projectType: this.stackConfig.projectTypes[0]
    };

    const requiredComponents = this.stackConfig.requiredComponents || [];
    const requiredFiles = this.stackConfig.requiredFiles || [];
    const enhancedComponents = this.stackConfig.enhancedComponents || [];
    const packageJson = JSON.parse(JSON.stringify(this.stackConfig.templates.packageJson));
    const generatedDependencies = {};

    // 1️⃣ Generate core project files using TEMPLATES (not AI)
    for (const filePath of requiredFiles) {
      const baseName = path.basename(filePath).replace(/\.(tsx|ts|json|html|css)$/, '');
      const blueprint = await loadBlueprint(baseName);
      
      let code;
      
      // Use template-based generation for static files (like bolt.new)
      if (blueprint?.generationMethod === 'template') {
        code = this.generateFromTemplate(blueprint, this.session.projectPlan);
        console.log(`📄 Generated ${filePath} from template`);
      } else {
        // Fallback to AI generation only for components that need it
        const prompt = buildEnterpriseComponentPrompt(baseName, blueprint, this.session.projectPlan);
        const result = await this.askClaudeWithSession(prompt);
        code = result.output?.trim() || '';
        console.log(`🤖 Generated ${filePath} with AI`);
      }

      this.session.generatedFiles[filePath] = code;

      // Scan for any new dependencies
      const foundDeps = scanImports(code);
      Object.assign(generatedDependencies, foundDeps);
    }

    // 2️⃣ Generate required components with enhanced prompts
    for (const file of requiredComponents) {
      const componentName = file.replace('.tsx', '');
      const blueprint = await loadBlueprint(componentName);
      const prompt = buildEnterpriseComponentPrompt(componentName, blueprint, this.session.projectPlan);
      const response = await this.askClaudeWithSession(prompt);
      const tsxCode = response.output?.trim() || '';

      // Quality validation before accepting the component
      const qualityResult = this.validateComponentQuality(tsxCode, blueprint);
      
      if (!qualityResult.passed) {
        console.warn(`⚠️  Component ${componentName} failed quality check. Regenerating...`);
        
        // Try to regenerate with improved prompt
        const improvedPrompt = this.buildQualityFocusedPrompt(componentName, blueprint, this.session.projectPlan, qualityResult.issues);
        const retryResponse = await this.askClaudeWithSession(improvedPrompt);
        const retryCode = retryResponse.output?.trim() || '';
        
        // Validate retry attempt
        const retryQuality = this.validateComponentQuality(retryCode, blueprint);
        
        if (retryQuality.passed) {
          console.log(`✅ Component ${componentName} quality improved after retry: ${retryQuality.score}/${retryQuality.maxScore}`);
          this.session.generatedFiles[`src/components/${file}`] = retryCode;
        } else {
          console.error(`❌ Component ${componentName} still fails quality check after retry. Using fallback template.`);
          // Use a high-quality template as fallback
          this.session.generatedFiles[`src/components/${file}`] = this.generateFallbackComponent(componentName, blueprint);
        }
      } else {
        this.session.generatedFiles[`src/components/${file}`] = tsxCode;
      }

      const foundDeps = scanImports(tsxCode);
      Object.assign(generatedDependencies, foundDeps);

      progressCallback(componentName, ((requiredComponents.indexOf(file) + 1) / requiredComponents.length) * 100);
    }

    // 3️⃣ Generate enhanced components for additional functionality
    if (enhancedComponents.length > 0) {
      progressCallback('Enhanced Components', 90);
      
      for (const componentFile of enhancedComponents) {
        const componentName = componentFile.replace('.ts', '');
        const blueprint = await loadBlueprint(componentName);
        
        if (blueprint) {
          const prompt = buildEnterpriseComponentPrompt(componentName, blueprint, this.session.projectPlan);
          const response = await this.askClaudeWithSession(prompt);
          const code = response.output?.trim() || '';

          // Quality validation for enhanced components
          const qualityResult = this.validateComponentQuality(code, blueprint);
          
          if (!qualityResult.passed) {
            console.warn(`⚠️  Enhanced component ${componentName} failed quality check. Regenerating...`);
            
            const improvedPrompt = this.buildQualityFocusedPrompt(componentName, blueprint, this.session.projectPlan, qualityResult.issues);
            const retryResponse = await this.askClaudeWithSession(improvedPrompt);
            const retryCode = retryResponse.output?.trim() || '';
            
            const retryQuality = this.validateComponentQuality(retryCode, blueprint);
            
            if (retryQuality.passed) {
              console.log(`✅ Enhanced component ${componentName} quality improved after retry: ${retryQuality.score}/${retryQuality.maxScore}`);
              const componentPath = `src/components/${componentName}.tsx`;
              this.session.generatedFiles[componentPath] = retryCode;
            } else {
              console.error(`❌ Enhanced component ${componentName} still fails quality check. Using fallback template.`);
              const componentPath = `src/components/${componentName}.tsx`;
              this.session.generatedFiles[componentPath] = this.generateFallbackComponent(componentName, blueprint);
            }
          } else {
            const componentPath = `src/components/${componentName}.tsx`;
            this.session.generatedFiles[componentPath] = code;
          }
          
          // Scan for dependencies
          const foundDeps = scanImports(code);
          Object.assign(generatedDependencies, foundDeps);
        }
      }
    }

    // 4️⃣ Update package.json with generated dependencies
    if (Object.keys(generatedDependencies).length > 0) {
      Object.assign(packageJson.dependencies, generatedDependencies);
    }

    // 5️⃣ Generate quality dashboard and final report
    progressCallback('Quality Assessment', 95);
    
    console.log('\n🔍 Assessing project quality...');
    const qualityDashboard = this.printQualityDashboard();
    
    // Store quality metrics in session
    this.session.qualityMetrics = qualityDashboard;

    progressCallback('Project Complete', 100);
    
    return {
      files: this.session.generatedFiles,
      packageJson,
      qualityMetrics: qualityDashboard,
      totalTokensUsed: this.session.totalTokensUsed
    };
  }

  /**
   * Post-process and validate generated code to ensure it matches the expected file type
   */
  postProcessAndValidate(code, filePath, blueprint) {
    let processedCode = code;

    // Remove markdown artifacts
    processedCode = processedCode.replace(/```[\w]*\n?/g, '');
    processedCode = processedCode.replace(/```/g, '');

    // No validation needed for template-generated files
    if (blueprint?.generationMethod === 'template') {
      return processedCode;
    }

    // Only validate AI-generated files if needed
    return processedCode;
  }

  /**
   * Generate code from template instead of AI prompts (bolt.new approach)
   */
  generateFromTemplate(blueprint, projectPlan) {
    if (!blueprint.template) {
      throw new Error(`Blueprint ${blueprint.fileType} missing template`);
    }

    let code = blueprint.template;

    // Replace template variables with project-specific values
    if (blueprint.variables) {
      for (const [variable, type] of Object.entries(blueprint.variables)) {
        const placeholder = `{${variable}}`;
        
        if (type === 'string') {
          let value;
          
          switch (variable) {
            case 'projectName':
              value = projectPlan.projectName || 'Generated Project';
              break;
            case 'projectDescription':
              value = projectPlan.description || 'A modern web application';
              break;
            case 'primaryColor':
              value = '#3b82f6'; // Default blue
              break;
            case 'secondaryColor':
              value = '#8b5cf6'; // Default purple
              break;
            default:
              value = projectPlan[variable] || '';
          }
          
          code = code.replace(new RegExp(placeholder, 'g'), value);
        }
      }
    }

    return code;
  }

  /**
   * Quality Assurance System - Validate component quality against enterprise standards
   */
  validateComponentQuality(component, blueprint) {
    if (!blueprint.qualityChecks) {
      console.warn(`⚠️  No quality checks defined for ${blueprint.fileType}`);
      return { passed: true, score: 100, issues: [] };
    }

    let score = 0;
    const maxScore = 100;
    const issues = [];
    const { mustHave, designSystem, minimumScore = 70 } = blueprint.qualityChecks;

    // Check for required features
    if (mustHave) {
      for (const requirement of mustHave) {
        if (this.checkRequirement(component, requirement)) {
          score += Math.floor(maxScore / mustHave.length);
        } else {
          issues.push(`Missing required feature: ${requirement}`);
        }
      }
    }

    // Check design system compliance
    if (designSystem) {
      score += this.validateDesignSystem(component, designSystem);
    }

    // Check for modern UI patterns
    score += this.checkModernUIPatterns(component);

    // Check for accessibility features
    score += this.checkAccessibilityFeatures(component);

    // Check for performance optimizations
    score += this.checkPerformanceFeatures(component);

    // Check for code quality
    score += this.checkCodeQuality(component);

    // Ensure score doesn't exceed 100
    score = Math.min(score, maxScore);

    const passed = score >= minimumScore;

    if (!passed) {
      console.warn(`❌ Component quality check failed: ${score}/${maxScore} (minimum: ${minimumScore})`);
      console.warn(`Issues: ${issues.join(', ')}`);
    } else {
      console.log(`✅ Component quality check passed: ${score}/${maxScore}`);
    }

    return { passed, score, issues, maxScore };
  }

  /**
   * Check if a specific requirement is met
   */
  checkRequirement(component, requirement) {
    const checks = {
      "Framer Motion animations": () => component.includes('framer-motion') || component.includes('motion'),
      "Responsive design with Tailwind breakpoints": () => /(sm:|md:|lg:|xl:)/.test(component),
      "Accessibility features (WCAG AA compliant)": () => /aria-|role=|semantic/.test(component),
      "Modern UI patterns (gradients, glassmorphism)": () => /gradient|backdrop-blur|glass/.test(component),
      "TypeScript interfaces with proper prop types": () => /interface|type.*Props/.test(component),
      "Loading and disabled states": () => /loading|disabled|spinner/.test(component),
      "Icon integration support": () => /icon|Lucide|Heroicons/.test(component),
      "Hover and focus effects": () => /hover:|focus:|transition/.test(component)
    };

    const check = checks[requirement];
    return check ? check() : component.includes(requirement);
  }

  /**
   * Validate design system compliance
   */
  validateDesignSystem(component, designSystem) {
    let score = 0;

    if (designSystem.colors) {
      const colorPatterns = designSystem.colors.map(pattern => {
        if (pattern === 'gradients') return /from-.*to-|bg-gradient/.test(component);
        if (pattern === 'glassmorphism') return /backdrop-blur|bg-.*\/\d+/.test(component);
        if (pattern === 'dark mode support') return /dark:/.test(component);
        return component.includes(pattern);
      });
      
      score += colorPatterns.filter(Boolean).length * 5;
    }

    if (designSystem.animations) {
      const animationPatterns = designSystem.animations.map(pattern => {
        if (pattern === 'entrance') return /animate|motion|fade/.test(component);
        if (pattern === 'hover') return /hover:|scale|shadow/.test(component);
        if (pattern === 'click') return /active|click|press/.test(component);
        if (pattern === 'loading') return /loading|spinner|skeleton/.test(component);
        return component.includes(pattern);
      });
      
      score += animationPatterns.filter(Boolean).length * 5;
    }

    return score;
  }

  /**
   * Check for modern UI patterns
   */
  checkModernUIPatterns(component) {
    let score = 0;

    // Glassmorphism effects
    if (/backdrop-blur|bg-.*\/\d+/.test(component)) score += 10;
    
    // Gradient backgrounds
    if (/bg-gradient|from-.*to-/.test(component)) score += 10;
    
    // Smooth transitions
    if (/transition-|duration-|ease-/.test(component)) score += 10;
    
    // Modern shadows
    if (/shadow-|drop-shadow/.test(component)) score += 5;

    return score;
  }

  /**
   * Check for accessibility features
   */
  checkAccessibilityFeatures(component) {
    let score = 0;

    // ARIA attributes
    if (/aria-/.test(component)) score += 15;
    
    // Semantic HTML
    if (/<section|<article|<nav|<main|<header|<footer/.test(component)) score += 10;
    
    // Focus management
    if (/focus:|focus-visible|focus-ring/.test(component)) score += 10;
    
    // Keyboard navigation
    if (/onKeyDown|onKeyUp|tabIndex/.test(component)) score += 5;

    return score;
  }

  /**
   * Check for performance features
   */
  checkPerformanceFeatures(component) {
    let score = 0;

    // React.memo optimization
    if (/React\.memo|memo\(/.test(component)) score += 10;
    
    // Lazy loading
    if (/React\.lazy|lazy\(/.test(component)) score += 10;
    
    // Proper event handling
    if (/useCallback|useMemo/.test(component)) score += 5;
    
    // Image optimization
    if (/loading="lazy"|sizes=|srcset/.test(component)) score += 5;

    return score;
  }

  /**
   * Check for code quality
   */
  checkCodeQuality(component) {
    let score = 0;

    // TypeScript usage
    if (/interface|type|Props/.test(component)) score += 10;
    
    // No console.log or alerts
    if (!/console\.|alert\(/.test(component)) score += 10;
    
    // Proper error handling
    if (/try|catch|error|Error/.test(component)) score += 5;
    
    // Clean imports
    if (/import.*from/.test(component)) score += 5;

    return score;
  }

  /**
   * Build a prompt focused on improving component quality based on previous issues
   */
  buildQualityFocusedPrompt(name, blueprint, plan, previousIssues) {
    let prompt = `Generate a ${blueprint?.fileType || 'React Component'} named ${name} for a ${plan.projectType} project.

Description: ${plan.description}

Purpose: ${blueprint?.purpose || 'Component for the application'}

`;

    // Add file type specific instructions
    if (blueprint?.fileType === 'TypeScript Configuration') {
      prompt += `CRITICAL: This is a TypeScript configuration file (tsconfig.json), NOT a React component.
- Return ONLY valid JSON configuration
- Do NOT include any React/TSX code
- Do NOT include import/export statements
- Must be parseable JSON for TypeScript compiler
`;
    } else if (blueprint?.fileType === 'CSS Stylesheet') {
      prompt += `CRITICAL: This is a CSS file, NOT a React component.
- Return ONLY valid CSS with Tailwind directives
- Do NOT include any React/TSX code
- Do NOT include import/export statements
- Must start with @tailwind directives
`;
    } else if (blueprint?.fileType === 'Vite Configuration') {
      prompt += `CRITICAL: This is a Vite configuration file, NOT a React component.
- Return ONLY valid TypeScript configuration code
- Do NOT include any React/TSX code
- Do NOT include JSX syntax
- Must use defineConfig and proper Vite syntax
`;
    } else if (blueprint?.fileType === 'HTML Entry Point') {
      prompt += `CRITICAL: This is an HTML file, NOT a React component.
- Return ONLY valid HTML markup
- Do NOT include any React/TSX code
- Do NOT include import/export statements
- Must include proper HTML structure with DOCTYPE
`;
    } else if (blueprint?.fileType === 'State Management Store') {
      prompt += `CRITICAL: This is a Zustand store file, NOT a React component.
- Return ONLY valid TypeScript store code
- Do NOT include JSX syntax or React components
- Must use Zustand create function with proper middleware
- Include TypeScript interfaces and types
`;
    } else if (blueprint?.fileType === 'React Form Component') {
      prompt += `CRITICAL: This is a React form component.
- Return ONLY valid TSX code
- Must include React Hook Form and Zod validation
- Include proper accessibility features
- Use consistent design system styling
`;
    } else if (blueprint?.fileType === 'React Page Component') {
      prompt += `CRITICAL: This is a React page component.
- Return ONLY valid TSX code
- Must include proper routing and navigation
- Integrate with global state management
- Include accessibility and SEO features
`;
    } else {
      // React component
      prompt += `CRITICAL: This is a React component file.
- Return ONLY valid TSX code
- Do NOT include markdown or explanations
- Component must compile successfully
- Use modern React 18 patterns with functional components and hooks
`;
    }

    // Add blueprint features if available
    if (blueprint?.features) {
      prompt += `\nFeatures to implement:\n`;
      Object.entries(blueprint.features).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    // Add design system if available
    if (blueprint?.designSystem) {
      prompt += `\nDesign System:\n`;
      Object.entries(blueprint.designSystem).forEach(([key, value]) => {
        if (typeof value === 'object') {
          prompt += `- ${key}:\n`;
          Object.entries(value).forEach(([subKey, subValue]) => {
            prompt += `  - ${subKey}: ${subValue}\n`;
          });
        } else {
          prompt += `- ${key}: ${value}\n`;
        }
      });
    }

    // Add enterprise features if available
    if (blueprint?.enterpriseFeatures) {
      prompt += `\nEnterprise Features:\n`;
      blueprint.enterpriseFeatures.forEach(feature => {
        prompt += `- ${feature}\n`;
      });
    }

    // Add accessibility requirements
    if (blueprint?.accessibility) {
      prompt += `\nAccessibility Requirements:\n`;
      Object.entries(blueprint.accessibility).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    // Add animation requirements
    if (blueprint?.animations) {
      prompt += `\nAnimation Requirements:\n`;
      Object.entries(blueprint.animations).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    // Add responsive design requirements
    if (blueprint?.responsive) {
      prompt += `\nResponsive Design:\n`;
      Object.entries(blueprint.responsive).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    // Add validation rules
    if (blueprint?.validation) {
      prompt += `\nValidation Rules:\n`;
      if (blueprint.validation.mustContain) {
        prompt += `- Must contain: ${blueprint.validation.mustContain.join(', ')}\n`;
      }
      if (blueprint.validation.mustNotContain) {
        prompt += `- Must NOT contain: ${blueprint.validation.mustNotContain.join(', ')}\n`;
      }
      if (blueprint.validation.fileExtension) {
        prompt += `- File extension: ${blueprint.validation.fileExtension}\n`;
      }
    }

    // Add state management requirements
    if (blueprint?.stateManagement) {
      prompt += `\nState Management:\n`;
      Object.entries(blueprint.stateManagement).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    // Add form handling requirements
    if (blueprint?.formHandling) {
      prompt += `\nForm Handling:\n`;
      Object.entries(blueprint.formHandling).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    // Add routing requirements
    if (blueprint?.routing) {
      prompt += `\nRouting Requirements:\n`;
      Object.entries(blueprint.routing).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    prompt += `\nTechnical Requirements:
- Use TypeScript with strict typing
- Use Tailwind CSS for styling
- Include Framer Motion for animations
- Ensure accessibility compliance (WCAG AA)
- Use modern React patterns (hooks, functional components)
- Implement responsive design with mobile-first approach
- Include proper error handling and loading states
- Optimize for performance and SEO
- Use Zustand for state management where applicable
- Include React Hook Form with Zod validation where applicable
- Implement proper routing with React Router where applicable

Return ONLY the requested file content. No explanations, no markdown, no code blocks.`;

    // Add previous issues to the prompt
    if (previousIssues && previousIssues.length > 0) {
      prompt += `\nPrevious Issues:\n`;
      previousIssues.forEach(issue => {
        prompt += `- ${issue}\n`;
      });
      prompt += `\nPlease address these issues in the generated code.`;
    }

    return prompt;
  }

  /**
   * Generate a fallback component if a component fails quality checks
   */
  generateFallbackComponent(name, blueprint) {
    let code = '';
    if (blueprint?.fallbackTemplate) {
      code = blueprint.fallbackTemplate;
      // Replace template variables with project-specific values
      if (blueprint.variables) {
        for (const [variable, type] of Object.entries(blueprint.variables)) {
          const placeholder = `{${variable}}`;
          if (type === 'string') {
            let value;
            switch (variable) {
              case 'projectName':
                value = this.session.projectPlan.projectName || 'Generated Project';
                break;
              case 'projectDescription':
                value = this.session.projectPlan.description || 'A modern web application';
                break;
              case 'primaryColor':
                value = '#3b82f6'; // Default blue
                break;
              case 'secondaryColor':
                value = '#8b5cf6'; // Default purple
                break;
              default:
                value = this.session.projectPlan[variable] || '';
            }
            code = code.replace(new RegExp(placeholder, 'g'), value);
          }
        }
      }
    } else {
      // Fallback to a minimal, high-quality component if no template
      code = `
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ${name} = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">${name}</h1>
        <p className="text-gray-600 mb-6">This component is a placeholder for ${name}.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ${name};
`;
    }
    return code;
  }

  /**
   * Generate quality dashboard for the entire project
   */
  generateQualityDashboard() {
    const dashboard = {
      projectName: this.session.projectPlan.projectName,
      generatedAt: new Date().toISOString(),
      overallScore: 0,
      totalComponents: 0,
      passedComponents: 0,
      failedComponents: 0,
      componentDetails: [],
      qualityMetrics: {
        designSystem: 0,
        animations: 0,
        accessibility: 0,
        performance: 0,
        responsiveness: 0,
        codeQuality: 0
      },
      recommendations: []
    };

    // Calculate overall quality metrics
    let totalScore = 0;
    let totalComponents = 0;

    for (const [filePath, content] of Object.entries(this.session.generatedFiles)) {
      if (filePath.endsWith('.tsx') && !filePath.includes('main.tsx')) {
        const componentName = filePath.split('/').pop().replace('.tsx', '');
        const blueprint = this.getBlueprintForComponent(componentName);
        
        if (blueprint) {
          const qualityResult = this.validateComponentQuality(content, blueprint);
          
          dashboard.componentDetails.push({
            name: componentName,
            filePath,
            score: qualityResult.score,
            passed: qualityResult.passed,
            issues: qualityResult.issues
          });

          if (qualityResult.passed) {
            dashboard.passedComponents++;
          } else {
            dashboard.failedComponents++;
          }

          totalScore += qualityResult.score;
          totalComponents++;

          // Aggregate quality metrics
          this.aggregateQualityMetrics(dashboard.qualityMetrics, content);
        }
      }
    }

    // Calculate overall score
    dashboard.overallScore = totalComponents > 0 ? Math.round(totalScore / totalComponents) : 0;
    dashboard.totalComponents = totalComponents;

    // Generate recommendations
    dashboard.recommendations = this.generateQualityRecommendations(dashboard);

    return dashboard;
  }

  /**
   * Get blueprint for a component
   */
  getBlueprintForComponent(componentName) {
    // Try to find blueprint by component name
    const blueprintFiles = ['Button', 'Card', 'Hero', 'Form', 'Page', 'store'];
    for (const blueprintFile of blueprintFiles) {
      if (componentName.toLowerCase().includes(blueprintFile.toLowerCase())) {
        return this.loadBlueprintSync(blueprintFile);
      }
    }
    return null;
  }

  /**
   * Load blueprint synchronously (for dashboard generation)
   */
  loadBlueprintSync(componentName) {
    try {
      // Try .js first, then fallback to .ts for backward compatibility
      let filePath = path.join(__dirname, 'blueprints', `${componentName}.js`);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'blueprints', `${componentName}.ts`);
        if (!fs.existsSync(filePath)) return null;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      // Extract the blueprint object from the file content
      const match = content.match(/export const \w+Blueprint = ({[\s\S]*});/);
      if (match) {
        return eval(`(${match[1]})`);
      }
    } catch (error) {
      console.warn(`Could not load blueprint for ${componentName}:`, error.message);
    }
    return null;
  }

  /**
   * Aggregate quality metrics across components
   */
  aggregateQualityMetrics(metrics, content) {
    // Design System
    if (/gradient|backdrop-blur|glass/.test(content)) metrics.designSystem++;
    
    // Animations
    if (/framer-motion|motion|animate/.test(content)) metrics.animations++;
    
    // Accessibility
    if (/aria-|role=|semantic/.test(content)) metrics.accessibility++;
    
    // Performance
    if (/React\.memo|memo\(|lazy/.test(content)) metrics.performance++;
    
    // Responsiveness
    if (/(sm:|md:|lg:|xl:)/.test(content)) metrics.responsiveness++;
    
    // Code Quality
    if (/interface|type|Props/.test(content)) metrics.codeQuality++;
  }

  /**
   * Generate quality recommendations
   */
  generateQualityRecommendations(dashboard) {
    const recommendations = [];

    if (dashboard.overallScore < 80) {
      recommendations.push("Overall project quality is below enterprise standards. Consider regenerating components.");
    }

    if (dashboard.failedComponents > 0) {
      recommendations.push(`${dashboard.failedComponents} components failed quality checks. Review and regenerate these components.`);
    }

    if (dashboard.qualityMetrics.designSystem < dashboard.totalComponents * 0.8) {
      recommendations.push("Many components lack modern UI patterns. Ensure gradients, glassmorphism, and modern design elements.");
    }

    if (dashboard.qualityMetrics.animations < dashboard.totalComponents * 0.8) {
      recommendations.push("Animation coverage is low. Implement Framer Motion animations for better user experience.");
    }

    if (dashboard.qualityMetrics.accessibility < dashboard.totalComponents * 0.9) {
      recommendations.push("Accessibility compliance is insufficient. Ensure WCAG AA compliance across all components.");
    }

    if (dashboard.qualityMetrics.responsiveness < dashboard.totalComponents * 0.9) {
      recommendations.push("Responsive design coverage is low. Implement mobile-first design with proper breakpoints.");
    }

    return recommendations;
  }

  /**
   * Print quality dashboard to console
   */
  printQualityDashboard() {
    const dashboard = this.generateQualityDashboard();
    
    console.log('\n🎯 PROJECT QUALITY DASHBOARD');
    console.log('=' .repeat(50));
    console.log(`Project: ${dashboard.projectName}`);
    console.log(`Generated: ${dashboard.generatedAt}`);
    console.log(`Overall Score: ${dashboard.overallScore}/100`);
    console.log(`Components: ${dashboard.passedComponents} passed, ${dashboard.failedComponents} failed`);
    
    console.log('\n📊 QUALITY METRICS');
    console.log('-'.repeat(30));
    Object.entries(dashboard.qualityMetrics).forEach(([metric, count]) => {
      const percentage = dashboard.totalComponents > 0 ? Math.round((count / dashboard.totalComponents) * 100) : 0;
      console.log(`${metric}: ${count}/${dashboard.totalComponents} (${percentage}%)`);
    });
    
    if (dashboard.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS');
      console.log('-'.repeat(30));
      dashboard.recommendations.forEach(rec => console.log(`• ${rec}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    return dashboard;
  }
}
