export const PROJECT_TYPES = [
  'landing',
  'dashboard',
  'crm',
  'ecommerce',
  'portfolio',
  'marketing',
  'saas',
  'budget-tracker',
  'task-manager',
  'analytics-dashboard'
];

export const STACK_CONFIGS = [
  {
    id: 'react-vite-tailwind',
    name: 'React + Vite + Tailwind',
    description: 'Enterprise-grade React + Vite + Tailwind stack with modern animations, state management, and design patterns',
    framework: 'react',
    buildTool: 'vite',
    styling: 'tailwind',
    language: 'typescript',
    icon: '⚛️',
    projectTypes: ['landing', 'portfolio', 'marketing', 'saas', 'budget-tracker', 'task-manager', 'analytics-dashboard'],

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
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'tsconfig.node.json',
      'tailwind.config.js',
      'postcss.config.js',
      'index.html',
      'src/main.tsx',
      'src/index.css',
      'src/App.tsx'
    ],

    // Enhanced component templates (not blueprint files)
    enhancedComponents: [
      'store',           // Zustand state management
      'Form',            // Form components with validation
      'Page',            // Page components with routing
      'Chart',           // Data visualization components
      'Table',           // Data table components
      'Modal',           // Modal and overlay components
      'Toast'            // Notification components
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
          preview: 'vite preview',
          lint: 'eslint .',
          typecheck: 'tsc --noEmit',
          test: 'vitest',
          'test:ui': 'vitest --ui'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'framer-motion': '^11.3.19',
          'react-router-dom': '^6.26.0',
          'react-error-boundary': '^4.0.11',
          '@heroicons/react': '^2.1.1',
          'lucide-react': '^0.428.0',
          'react-hook-form': '^7.52.1',
          'zod': '^3.23.8',
          'zustand': '^4.5.4',
          '@tanstack/react-query': '^5.51.23',
          'clsx': '^2.1.1',
          'tailwind-merge': '^2.4.0',
          'recharts': '^2.12.0',
          'date-fns': '^3.6.0'
        },
        devDependencies: {
          typescript: '^5.5.3',
          vite: '^5.4.2',
          '@vitejs/plugin-react': '^4.3.1',
          tailwindcss: '^3.4.1',
          autoprefixer: '^10.4.18',
          postcss: '^8.4.35',
          '@types/react': '^18.3.5',
          '@types/react-dom': '^18.3.0',
          eslint: '^9.9.1',
          'eslint-plugin-react-hooks': '^5.1.0-rc.0',
          'eslint-plugin-react-refresh': '^0.4.11',
          'typescript-eslint': '^8.3.0',
          'vitest': '^2.1.8',
          '@testing-library/react': '^16.1.0',
          '@testing-library/jest-dom': '^6.6.3',
          '@vitejs/plugin-react-swc': '^4.0.0'
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
    "responsive": true,
    "glassmorphism": true,
    "gradients": true,
    "microInteractions": true,
    "stateManagement": true,
    "formValidation": true,
    "dataVisualization": true,
    "accessibility": true
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
4. State management setup
5. Routing configuration
ONLY return JSON. No markdown.`,

      component: `Generate a React + TypeScript component named {name} with Tailwind.

- Include proper props interface
- Use Tailwind classes
- Ensure responsiveness
- Add accessibility
- Use animation if applicable
- No explanations or markdown
Return ONLY valid .tsx code.`
    },

    enterpriseFeatures: {
      designSystem: {
        colors: {
          primary: 'Blue to Purple gradients',
          secondary: 'Gray scale with dark mode support',
          accent: 'Emerald and Teal accents',
          semantic: 'Success, warning, error colors'
        },
        typography: {
          font: 'Inter font family',
          scale: 'Responsive text sizing',
          weights: '300, 400, 500, 600, 700'
        },
        spacing: {
          scale: '4px base unit system',
          responsive: 'Mobile-first breakpoints'
        },
        shadows: {
          levels: 'sm, md, lg, xl for depth hierarchy'
        }
      },
      
      animations: {
        library: 'Framer Motion for smooth animations',
        types: 'Entrance, hover, scroll-triggered, micro-interactions',
        performance: 'Optimized with will-change and transform3d'
      },
      
      accessibility: {
        compliance: 'WCAG 2.1 AA standards',
        features: 'Semantic HTML, ARIA labels, keyboard navigation, focus management',
        testing: 'Screen reader compatibility, color contrast validation'
      },
      
      performance: {
        optimization: 'Code splitting, lazy loading, image optimization',
        metrics: 'Core Web Vitals compliance, bundle size optimization',
        caching: 'Service worker ready, static asset optimization'
      },
      
      modernUI: {
        patterns: 'Glassmorphism, gradient backgrounds, smooth transitions',
        components: 'Interactive cards, animated buttons, loading skeletons',
        responsive: 'Mobile-first design with progressive enhancement'
      },

      stateManagement: {
        global: 'Zustand for application-wide state',
        local: 'React hooks for component state',
        persistence: 'Local storage integration',
        devtools: 'Redux DevTools integration'
      },

      formHandling: {
        validation: 'Zod schemas for runtime validation',
        library: 'React Hook Form for form state',
        accessibility: 'Proper labels and ARIA attributes',
        errorHandling: 'Field-level error display'
      },

      routing: {
        library: 'React Router for navigation',
        lazyLoading: 'Code splitting with React.lazy',
        guards: 'Protected routes and authentication',
        nested: 'Nested routing support'
      }
    }
  }
];

export function getStackConfig(stackId) {
  return STACK_CONFIGS.find(s => s.id === stackId);
}

export function getAllStacks() {
  return STACK_CONFIGS;
}
