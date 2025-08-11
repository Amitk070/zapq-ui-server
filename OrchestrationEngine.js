
import { getStackConfig } from './stackConfigs.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load blueprint object from /blueprints/ComponentName.ts
async function loadBlueprint(componentName) {
  const filePath = path.join(__dirname, 'blueprints', `${componentName}.ts`);
  if (!fs.existsSync(filePath)) return null;

  const module = await import(`file://${filePath}`);
  const key = Object.keys(module)[0];
  return module[key];
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
    const enhancedBlueprints = this.stackConfig.enhancedBlueprints || [];
    const packageJson = JSON.parse(JSON.stringify(this.stackConfig.templates.packageJson));
    const generatedDependencies = {};

    // 1️⃣ Generate core project files with enhanced prompts
    for (const filePath of requiredFiles) {
      const baseName = path.basename(filePath).replace(/\.(tsx|ts|json|html|css)$/, '');
      const blueprint = await loadBlueprint(baseName);
      const prompt = buildEnterpriseComponentPrompt(baseName, blueprint, this.session.projectPlan);
      const result = await this.askClaudeWithSession(prompt);
      const code = result.output?.trim() || '';

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

      this.session.generatedFiles[`src/components/${file}`] = tsxCode;

      const foundDeps = scanImports(tsxCode);
      Object.assign(generatedDependencies, foundDeps);

      progressCallback(componentName, ((requiredComponents.indexOf(file) + 1) / requiredComponents.length) * 100);
    }

    // 3️⃣ Generate enhanced blueprints for additional functionality
    if (enhancedBlueprints.length > 0) {
      progressCallback('Enhanced Blueprints', 90);
      
      for (const blueprintFile of enhancedBlueprints) {
        const blueprintName = blueprintFile.replace('.ts', '');
        const blueprint = await loadBlueprint(blueprintName);
        
        if (blueprint) {
          const prompt = buildEnterpriseComponentPrompt(blueprintName, blueprint, this.session.projectPlan);
          const response = await this.askClaudeWithSession(prompt);
          const code = response.output?.trim() || '';

          // Store enhanced blueprint code for reference
          this.session.generatedFiles[`blueprints/${blueprintFile}`] = code;

          const foundDeps = scanImports(code);
          Object.assign(generatedDependencies, foundDeps);
        }
      }
    }

    // 4️⃣ Merge all scanned dependencies into package.json
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...generatedDependencies
    };

    this.session.generatedFiles['package.json'] = JSON.stringify(packageJson, null, 2);

    return {
      success: true,
      files: this.session.generatedFiles,
      tokensUsed: this.session.totalTokensUsed
    };
  }
}
