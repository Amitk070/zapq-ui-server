
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

// Inject blueprint + plan context into Claude prompt
function buildComponentPrompt(name, blueprint, plan) {
  return `Generate a React component named ${name} for a ${plan.projectType} project.

Description: ${plan.description}

Features:
${Object.entries(blueprint || {}).map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`).join('\n')}

CRITICAL:
- Return ONLY valid TSX
- Do NOT explain
- No markdown
- Component must compile.
- Use Tailwind CSS
- Use proper React 18 patterns and modern hooks
- Must be fully responsive and accessible (WCAG AA)`;
}

// Utility to scan TSX for external packages
function scanImports(tsxContent) {
  const deps = {};
  if (tsxContent.includes('react-router-dom')) deps['react-router-dom'] = '^6.26.0';
  if (tsxContent.includes('react-error-boundary')) deps['react-error-boundary'] = '^4.0.11';
  if (tsxContent.includes('@heroicons/react')) deps['@heroicons/react'] = '^2.1.1';
  if (tsxContent.includes('framer-motion')) deps['framer-motion'] = '^11.3.19';
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
  const packageJson = JSON.parse(JSON.stringify(this.stackConfig.templates.packageJson));
  const generatedDependencies = {};

  // 1️⃣ Generate core project files
  for (const filePath of requiredFiles) {
    const baseName = path.basename(filePath).replace(/\.(tsx|ts|json|html|css)$/, '');
    const blueprint = await loadBlueprint(baseName);
    const prompt = buildComponentPrompt(baseName, blueprint, this.session.projectPlan);
    const result = await this.askClaudeWithSession(prompt);
    const code = result.output?.trim() || '';

    this.session.generatedFiles[filePath] = code;

    // Scan for any new dependencies
    const foundDeps = scanImports(code);
    Object.assign(generatedDependencies, foundDeps);
  }

  // 2️⃣ Generate required components
  for (const file of requiredComponents) {
    const componentName = file.replace('.tsx', '');
    const blueprint = await loadBlueprint(componentName);
    const prompt = buildComponentPrompt(componentName, blueprint, this.session.projectPlan);
    const response = await this.askClaudeWithSession(prompt);
    const tsxCode = response.output?.trim() || '';

    this.session.generatedFiles[`src/components/${file}`] = tsxCode;

    const foundDeps = scanImports(tsxCode);
    Object.assign(generatedDependencies, foundDeps);

    progressCallback(componentName, ((requiredComponents.indexOf(file) + 1) / requiredComponents.length) * 100);
  }

  // 3️⃣ Merge all scanned dependencies into package.json
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
