export const PROJECT_TYPES = [
  'landing',
  'dashboard',
  'crm',
  'ecommerce',
  'portfolio',
  'marketing',
  'saas'
];

export const STACK_CONFIGS = [
  {
    id: 'react-vite-tailwind',
    name: 'React + Vite + Tailwind',
    description: 'Modern React + Vite + Tailwind stack',
    framework: 'react',
    buildTool: 'vite',
    styling: 'tailwind',
    language: 'typescript',
    icon: '⚛️',
    projectTypes: ['landing', 'portfolio', 'marketing', 'saas'],

    requiredComponents: [
      'Navbar.tsx',
      'Footer.tsx',
      'Hero.tsx',
      'Products.tsx',
      'Gallery.tsx',
      'Testimonials.tsx',
      'Contact.tsx',
      'SEO.tsx',
      'ErrorFallback.tsx',
      'LoadingSpinner.tsx',
      'Button.tsx',
      'Card.tsx',
      'Sidebar.tsx'
    ],

    requiredFiles: [
      'vite.config.ts',
      'tsconfig.json',
      'index.html',
      'src/main.tsx',
      'src/index.css'
    ],

    templates: {
      packageJson: {
        name: '{projectName}',
        version: '1.0.0',
        type: 'module',
        description: '{description}',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'framer-motion': '^11.3.19',
          'react-router-dom': '^6.26.0',
          'react-error-boundary': '^4.0.11',
          '@heroicons/react': '^2.1.1'
        },
        devDependencies: {
          typescript: '^5.5.3',
          vite: '^5.4.2',
          '@vitejs/plugin-react': '^4.3.1',
          tailwindcss: '^3.4.1',
          autoprefixer: '^10.4.18',
          postcss: '^8.4.35'
        }
      }
    },

    prompts: {
      analyze: `Analyze the user request and define an enterprise-quality modern and creative React + Tailwind app structure.

User Request: "{userPrompt}"

Return JSON with:
{
  "projectType": "landing",
  "description": "...",
  "pages": [ { "name": "...", "path": "/" } ],
  "components": [ { "name": "...", "description": "..." } ],
  "featureToggles": {
    "darkMode": true,
    "animations": true,
    "responsive": true
  }
}`,

      plan: `Plan the folder structure and base files for a modern React + Vite + Tailwind app.

Project: {projectName}
Type: {projectType}
Description: {description}

Return:
1. Base files
2. Vite + Tailwind config
3. Component structure
ONLY return JSON. No markdown.`,

      component: `Generate a React + TypeScript component named {name} with Tailwind.

- Include proper props interface
- Use Tailwind classes
- Ensure responsiveness
- Add accessibility
- Use animation if applicable
- No explanations or markdown
Return ONLY valid .tsx code.`
    }
  }
];

export function getStackConfig(stackId) {
  return STACK_CONFIGS.find(s => s.id === stackId);
}

export function getAllStacks() {
  return STACK_CONFIGS;
}
