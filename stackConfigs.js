import { StackConfig } from '../types/StackConfig';

export const STACK_CONFIGS = [
  {
    id: 'react-vite-tailwind',
    name: 'React + Vite + Tailwind',
    description: 'Modern React with Vite build tool and Tailwind CSS',
    framework: 'react',
    buildTool: 'vite',
    styling: 'tailwind',
    language: 'typescript',
    icon: '⚛️',
    
    templates: {
      packageJson: {
        name: '{projectName}',
        version: '1.0.0',
        description: '{description}',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'eslint src --ext .ts,.tsx',
          format: 'prettier --write src/'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'lucide-react': '^0.525.0',
          'react-router-dom': '^6.26.0'
        },
        devDependencies: {
          '@types/react': '^18.3.5',
          '@types/react-dom': '^18.3.0',
          '@vitejs/plugin-react': '^4.3.1',
          typescript: '^5.5.3',
          vite: '^5.4.2',
          tailwindcss: '^3.4.1',
          autoprefixer: '^10.4.18',
          postcss: '^8.4.35',
          eslint: '^9.9.1',
          prettier: '^3.0.0'
        }
      },
      
      configFiles: {
        'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})`,
        
        'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
        
        'tsconfig.json': JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: false,
            noUnusedParameters: false,
            noFallthroughCasesInSwitch: true
          },
          include: ['src'],
          references: [{ path: './tsconfig.node.json' }]
        }, null, 2)
      },
      
      baseFiles: {
        'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        
        'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        
        'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
  }
}`
      }
    },
    
    commands: {
      install: 'npm install',
      dev: 'npm run dev',
      build: 'npm run build',
      lint: 'npm run lint'
    },
    
    prompts: {
      analyzer: `Analyze this project description: '{userPrompt}'. 

Based on the request, determine:
1. What type of application this is (landing page, dashboard, e-commerce, blog, portfolio, etc.)
2. Required pages and their purposes
3. Necessary components and their functionality
4. Key features and user interactions
5. Overall structure and navigation

Return a JSON response in this exact format:
{
  "type": "landing-page|dashboard|ecommerce|blog|portfolio|crm|custom",
  "pages": [
    {"name": "Home", "path": "/", "description": "Main landing page", "filename": "Home.tsx"},
    {"name": "About", "path": "/about", "description": "About page", "filename": "About.tsx"}
  ],
  "components": [
    {"name": "Header", "description": "Navigation header with menu", "filename": "Header.tsx"},
    {"name": "Footer", "description": "Site footer with links", "filename": "Footer.tsx"}
  ],
  "features": ["responsive design", "contact form", "animations"]
}`,

      scaffold: `Generate the main App.tsx component for a React + TypeScript project.

Project: {projectName}
Description: {description}
Pages: {pages}

Create a complete App.tsx with:
- React Router DOM setup for all pages
- TypeScript interfaces and types
- Tailwind CSS styling
- Professional layout structure
- Navigation between pages
- Error boundary implementation
- Loading states if needed

Include imports for all page components that will be created.
Return ONLY the complete App.tsx code with no explanations.`,

      page: `Generate a React functional page component for:

Page: {name}
Description: {description}
Path: {path}
Project Context: {projectContext}

Requirements:
- TypeScript functional component
- Tailwind CSS for all styling
- Professional, modern design
- Mobile responsive (mobile-first approach)
- Realistic, professional content (NO Lorem Ipsum)
- Proper semantic HTML
- Accessibility features (ARIA labels)
- Component should be complete and production-ready

The component should fit the overall project theme and be visually appealing.
Return ONLY the complete component code with no explanations.`,

      component: `Generate a React functional component for:

Component: {name}
Description: {description}
Type: {type}
Props needed: {props}

Requirements:
- TypeScript with proper prop interfaces
- Tailwind CSS styling
- Professional design that fits modern web standards
- Reusable and flexible component
- Mobile responsive
- Proper TypeScript types for all props
- Export as default

Return ONLY the complete component code with no explanations.`,

      layout: `Generate a Layout component that wraps page content.

Requirements:
- Accept children prop
- Include Header and Footer components
- Tailwind CSS styling
- Responsive design
- Professional structure
- TypeScript interfaces

Return ONLY the complete Layout.tsx code.`,

      styles: `Generate additional CSS utilities or Tailwind configuration for:

Feature: {feature}
Description: {description}

Requirements:
- Use Tailwind CSS utilities
- Custom CSS only if absolutely necessary
- Mobile-first responsive approach
- Professional styling
- Performance optimized

Return ONLY the CSS/configuration code.`,

      readme: `Generate a comprehensive README.md for this project:

Project: {projectName}
Description: {description}
Stack: React + Vite + TypeScript + Tailwind CSS

Include:
- Project overview and purpose
- Technology stack details
- Prerequisites and installation steps
- Development commands (dev, build, preview, lint)
- Project structure explanation
- Deployment instructions for Vercel/Netlify
- Contributing guidelines
- License information
- Professional formatting with badges and sections

Return ONLY the README content in markdown format.`
    },
    
    steps: [
      {
        id: 'analyze',
        name: 'Analyze Project Requirements',
        description: 'Parse user requirements and create detailed project plan',
        promptType: 'analyzer',
        outputPath: 'analysis.json'
      },
      {
        id: 'scaffold',
        name: 'Create App Structure',
        description: 'Generate main App component with routing',
        promptType: 'scaffold',
        outputPath: 'src/App.tsx'
      },
      {
        id: 'pages',
        name: 'Generate Pages',
        description: 'Create all application pages',
        promptType: 'page',
        outputPath: 'src/pages/',
        dependencies: ['scaffold']
      },
      {
        id: 'components',
        name: 'Generate Components',
        description: 'Create reusable UI components',
        promptType: 'component',
        outputPath: 'src/components/',
        dependencies: ['pages']
      },
      {
        id: 'readme',
        name: 'Generate Documentation',
        description: 'Create comprehensive project documentation',
        promptType: 'readme',
        outputPath: 'README.md',
        dependencies: ['components']
      }
    ]
  },

  // Vue 3 configuration
  {
    id: 'vue3-vite-tailwind',
    name: 'Vue 3 + Vite + Tailwind',
    description: 'Modern Vue 3 with Composition API and Tailwind CSS',
    framework: 'vue',
    buildTool: 'vite',
    styling: 'tailwind',
    language: 'typescript',
    icon: '💚',
    
    templates: {
      packageJson: {
        name: '{projectName}',
        version: '1.0.0',
        description: '{description}',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore'
        },
        dependencies: {
          vue: '^3.4.0',
          'vue-router': '^4.4.0',
          '@heroicons/vue': '^2.0.0'
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.0.0',
          '@vue/tsconfig': '^0.5.0',
          typescript: '^5.5.3',
          vite: '^5.4.2',
          tailwindcss: '^3.4.1',
          autoprefixer: '^10.4.18',
          postcss: '^8.4.35'
        }
      },
      
      configFiles: {
        'vite.config.ts': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`,
        
        'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
      },
      
      baseFiles: {
        'src/main.ts': `import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: []
})

createApp(App).use(router).mount('#app')`,
        
        'src/style.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`
      }
    },
    
    commands: {
      install: 'npm install',
      dev: 'npm run dev',
      build: 'npm run build',
      lint: 'npm run lint'
    },
    
    prompts: {
      analyzer: `Analyze this Vue 3 project request: "{userPrompt}"

Determine the required pages, components, and features for a Vue 3 + TypeScript + Tailwind project.
Return JSON with pages, components, and features arrays.`,

      scaffold: `Generate the main App.vue file for Vue 3 project:

Project: {projectName}
Description: {description}

Requirements:
- Vue 3 Composition API
- TypeScript with <script setup lang="ts">
- Vue Router integration
- Tailwind CSS styling
- Professional layout

Return ONLY the App.vue code.`,

      page: `Generate a Vue 3 page component:

Page: {name}
Description: {description}

Requirements:
- Vue 3 Composition API with <script setup lang="ts">
- Tailwind CSS styling
- Realistic content
- Mobile responsive

Return ONLY the .vue component code.`,

      component: `Generate a Vue 3 component:

Component: {name}
Description: {description}

Requirements:
- Vue 3 Composition API with <script setup lang="ts">
- TypeScript
- Tailwind CSS
- Reusable design

Return ONLY the .vue component code.`,

      layout: `Generate a Vue 3 layout component:

Layout: {name}
Description: {description}

Requirements:
- Vue 3 Composition API
- TypeScript
- Tailwind CSS
- Accept slots

Return ONLY the .vue component code.`,

      styles: `Generate additional CSS for Vue 3 project:

Feature: {feature}
Description: {description}

Return ONLY the CSS code.`,

      readme: `Generate README.md for Vue 3 + Vite + Tailwind project:

Project: {projectName}
Description: {description}

Return ONLY the README content.`
    },
    
    steps: [
      {
        id: 'analyze',
        name: 'Analyze Project',
        description: 'Parse requirements',
        promptType: 'analyzer',
        outputPath: 'analysis.json'
      },
      {
        id: 'scaffold',
        name: 'Create App Structure',
        description: 'Generate App.vue',
        promptType: 'scaffold',
        outputPath: 'src/App.vue'
      },
      {
        id: 'pages',
        name: 'Generate Pages',
        description: 'Create pages',
        promptType: 'page',
        outputPath: 'src/views/'
      },
      {
        id: 'components',
        name: 'Generate Components',
        description: 'Create components',
        promptType: 'component',
        outputPath: 'src/components/'
      }
    ]
  },

  // SvelteKit configuration
  {
    id: 'sveltekit-tailwind',
    name: 'SvelteKit + Tailwind',
    description: 'Full-stack SvelteKit with Tailwind CSS',
    framework: 'svelte',
    buildTool: 'vite',
    styling: 'tailwind',
    language: 'typescript',
    icon: '🧡',
    
    templates: {
      packageJson: {
        name: '{projectName}',
        version: '1.0.0',
        description: '{description}',
        type: 'module',
        scripts: {
          dev: 'vite dev',
          build: 'vite build',
          preview: 'vite preview',
          check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json'
        },
        dependencies: {
          '@sveltejs/kit': '^2.0.0'
        },
        devDependencies: {
          '@sveltejs/adapter-auto': '^3.0.0',
          '@sveltejs/vite-plugin-svelte': '^3.0.0',
          'svelte': '^4.2.0',
          'svelte-check': '^4.0.0',
          typescript: '^5.5.3',
          vite: '^5.4.2',
          tailwindcss: '^3.4.1',
          autoprefixer: '^10.4.18',
          postcss: '^8.4.35'
        }
      },
      
      configFiles: {
        'svelte.config.js': `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};

export default config;`,
        
        'vite.config.ts': `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()]
});`
      },
      
      baseFiles: {
        'src/app.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`,
        
        'src/app.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`
      }
    },
    
    commands: {
      install: 'npm install',
      dev: 'npm run dev',
      build: 'npm run build',
      lint: 'npm run lint'
    },
    
    prompts: {
      analyzer: `Analyze this SvelteKit project request: "{userPrompt}"

Determine pages, components, and features for a SvelteKit + TypeScript + Tailwind project.
Return JSON structure.`,

      scaffold: `Generate the main layout for SvelteKit:

Project: {projectName}
Description: {description}

Requirements:
- SvelteKit layout structure
- TypeScript
- Tailwind CSS
- Professional design

Return ONLY the +layout.svelte code.`,

      page: `Generate a SvelteKit page:

Page: {name}
Description: {description}

Requirements:
- SvelteKit page component
- TypeScript
- Tailwind CSS
- Realistic content

Return ONLY the +page.svelte code.`,

      component: `Generate a Svelte component:

Component: {name}
Description: {description}

Requirements:
- Svelte component
- TypeScript
- Tailwind CSS
- Reusable design

Return ONLY the .svelte component code.`,

      layout: `Generate a SvelteKit layout:

Layout: {name}
Description: {description}

Requirements:
- SvelteKit layout
- TypeScript
- Tailwind CSS
- Slot for content

Return ONLY the +layout.svelte code.`,

      styles: `Generate additional CSS for SvelteKit:

Feature: {feature}
Description: {description}

Return ONLY the CSS code.`,

      readme: `Generate README.md for SvelteKit + Tailwind project:

Project: {projectName}
Description: {description}

Return ONLY the README content.`
    },
    
    steps: [
      {
        id: 'analyze',
        name: 'Analyze Project',
        description: 'Parse requirements',
        promptType: 'analyzer',
        outputPath: 'analysis.json'
      },
      {
        id: 'scaffold',
        name: 'Create Layout',
        description: 'Generate main layout',
        promptType: 'scaffold',
        outputPath: 'src/routes/+layout.svelte'
      },
      {
        id: 'pages',
        name: 'Generate Pages',
        description: 'Create pages',
        promptType: 'page',
        outputPath: 'src/routes/'
      },
      {
        id: 'components',
        name: 'Generate Components',
        description: 'Create components',
        promptType: 'component',
        outputPath: 'src/lib/components/'
      }
    ]
  }
];

export function getStackConfig(stackId: string): StackConfig | undefined {
  return STACK_CONFIGS.find(config => config.id === stackId);
}

export function getAllStacks(): StackConfig[] {
  return STACK_CONFIGS;
} 
