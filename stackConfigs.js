// Enhanced Stack Configuration with Enterprise-Level Prompts
// Note: In Node.js environment, we define types inline instead of importing

export const PROJECT_TYPES = [
  'landing',
  'dashboard', 
  'crm',
  'ai-agent',
  'ecommerce',
  'cli-tool',
  'portfolio',
  'marketing',
  'saas',
  'blog',
  'api',
  'mobile-app',
  'desktop-app',
  'game',
  'social-platform'
];

export const FEATURE_TOGGLES = {
  // UI/UX Features
  darkMode: { default: true, description: 'Dark mode support' },
  responsive: { default: true, description: 'Responsive design' },
  animations: { default: true, description: 'Smooth animations' },
  accessibility: { default: true, description: 'WCAG compliance' },
  
  // Authentication & Security
  authentication: { default: false, description: 'User authentication' },
  authorization: { default: false, description: 'Role-based access' },
  oauth: { default: false, description: 'OAuth integration' },
  
  // Data & State
  database: { default: false, description: 'Database integration' },
  api: { default: false, description: 'API endpoints' },
  caching: { default: false, description: 'Data caching' },
  realtime: { default: false, description: 'Real-time updates' },
  
  // Analytics & Monitoring
  analytics: { default: false, description: 'Analytics tracking' },
  errorTracking: { default: false, description: 'Error monitoring' },
  performance: { default: false, description: 'Performance monitoring' },
  
  // AI & Automation
  chatbot: { default: false, description: 'AI chatbot' },
  aiFeatures: { default: false, description: 'AI-powered features' },
  automation: { default: false, description: 'Workflow automation' },
  
  // E-commerce
  payments: { default: false, description: 'Payment processing' },
  inventory: { default: false, description: 'Inventory management' },
  shipping: { default: false, description: 'Shipping integration' },
  
  // Social & Communication
  comments: { default: false, description: 'Comment system' },
  notifications: { default: false, description: 'Push notifications' },
  messaging: { default: false, description: 'In-app messaging' },
  
  // Development & Testing
  testing: { default: true, description: 'Testing setup' },
  linting: { default: true, description: 'Code linting' },
  formatting: { default: true, description: 'Code formatting' },
  documentation: { default: true, description: 'Auto-documentation' }
};

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
    projectTypes: ['landing', 'dashboard', 'portfolio', 'marketing', 'saas'],

    requiredComponents: [
      {
        name: 'Hero',
        blueprint: {
          layout: 'centered',
          cta: true,
          gradientBackground: true,
          animation: 'fade-in',
          accessibility: true
        }
      },
      {
        name: 'Footer',
        blueprint: {
          layout: '3-column',
          links: true,
          newsletter: true,
          socialIcons: true,
          darkModeSupport: true
        }
      },
      {
        name: 'SEO',
        blueprint: {
          dynamicTitle: true,
          metaTags: true,
          openGraphSupport: true
        }
      },
      {
        name: 'ErrorBoundary',
        blueprint: {
          fallbackUI: true,
          errorLogging: true
        }
      }
    ],

    
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
          format: 'prettier --write src/',
          test: 'vitest',
          'test:ui': 'vitest --ui'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'lucide-react': '^0.525.0',
          'react-router-dom': '^6.26.0',
          'framer-motion': '^11.3.19',
          'zustand': '^4.5.4',
          '@tanstack/react-query': '^5.51.23',
          'react-hook-form': '^7.52.1',
          'zod': '^3.23.8',
          'clsx': '^2.1.0',
          'tailwind-merge': '^2.5.4',
          '@headlessui/react': '^1.7.18',
          '@heroicons/react': '^2.1.1'
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
          prettier: '^3.0.0',
          vitest: '^1.6.0',
          '@vitest/ui': '^1.6.0'
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
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})`,
        
        'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
  darkMode: 'class'
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
    <meta name="description" content="{description}" />
    <meta name="theme-color" content="#3b82f6" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        
        'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
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
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', system-ui, sans-serif;
    scroll-behavior: smooth;
  }
  
  html {
    scroll-behavior: smooth;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  }
  
  .btn-secondary {
    @apply bg-secondary-100 hover:bg-secondary-200 text-secondary-900 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-secondary-200;
  }
  
  .btn-ghost {
    @apply text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 font-medium py-3 px-6 rounded-lg transition-all duration-200;
  }
  
  .card {
    @apply bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 p-6 backdrop-blur-sm;
  }
  
  .card-hover {
    @apply card hover:shadow-xl hover:scale-105 transition-all duration-300;
  }
  
  .gradient-bg {
    @apply bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700;
  }
  
  .glass-effect {
    @apply backdrop-blur-md bg-white/10 border border-white/20;
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.4s ease-out;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }
}`
      }
    },
    
    prompts: {
      analyze: `Analyze this project request and determine the optimal structure for an enterprise-level React application.

User Request: "{userPrompt}"
Project Name: "{projectName}"

Available Project Types: ${PROJECT_TYPES.join(', ')}

Based on the user's specific request, determine:
1. Project Type (one of the above)
2. Required pages and components with enterprise-level features
3. Feature toggles needed for modern functionality
4. Technical requirements for production deployment

CRITICAL REQUIREMENTS FOR ENTERPRISE-LEVEL APPS:
- Modern UI with gradients, shadows, and animations
- Professional typography and spacing
- Responsive design with mobile-first approach
- Interactive elements with hover states
- Loading states and error boundaries
- Accessibility compliance (WCAG 2.1 AA)
- Performance optimization
- SEO-friendly structure
- Modern color schemes and visual hierarchy

Return as JSON:
{
  "projectType": "dashboard|ecommerce|portfolio|...",
  "description": "Detailed enterprise-level project description",
  "pages": [
    { 
      "name": "PageName", 
      "path": "/route", 
      "description": "what this page does",
      "features": ["hero section", "interactive elements", "animations"]
    }
  ],
  "components": [
    { 
      "name": "ComponentName", 
      "description": "what this component does",
      "features": ["modern styling", "animations", "responsive"]
    }
  ],
  "featureToggles": {
    "darkMode": true,
    "authentication": true,
    "animations": true,
    "analytics": true,
    "responsive": true
  },
  "technicalRequirements": [
    "list of enterprise-level technical requirements"
  ]
}`,
      
      page: `Generate an enterprise-level React TypeScript page component for {name}.

Project Context:
- Type: {projectType}
- Description: {description}
- Path: {path}
- Features: {features}

ENTERPRISE-LEVEL REQUIREMENTS:
- TypeScript with proper interfaces and types
- Modern React 18 patterns with hooks
- Tailwind CSS for styling
- Responsive design
- Accessibility features
- Feature-specific logic based on toggles
- Modern UI with gradients, shadows, and animations
- Professional typography and spacing
- Realistic, professional content with proper copywriting
- Semantic HTML with accessibility features (ARIA labels, keyboard navigation)
- Modern UI elements: cards, buttons, icons, gradients, glass effects
- Interactive elements with hover states, focus states, and smooth transitions
- Professional layout with proper spacing, typography, and visual hierarchy
- Include SVG icons and modern visual elements
- Loading states and error handling
- SEO optimization with proper meta tags
- Performance optimization with lazy loading
- Modern color schemes and visual effects

SPECIFIC DESIGN PATTERNS:
- Hero sections with compelling headlines and CTAs
- Feature cards with icons, descriptions, and hover effects
- Gradient backgrounds and glass morphism effects
- Smooth animations and micro-interactions
- Professional typography with proper font weights
- Modern button styles with hover and focus states
- Card layouts with shadows and border radius
- Responsive grid systems
- Professional spacing and padding

The component should look like a modern SaaS landing page with:
- Compelling hero sections with gradient backgrounds
- Feature showcases with interactive cards
- Professional call-to-action buttons
- Modern typography and visual hierarchy
- Smooth animations and transitions
- Glass morphism and modern effects

Return ONLY the complete TypeScript React component code with enterprise-level quality.`,
      
      component: `Generate an enterprise-level React TypeScript component for {name}.

Project Context:
- Type: {projectType}
- Description: {description}
- Features: {features}

ENTERPRISE-LEVEL REQUIREMENTS:
- TypeScript with proper prop interfaces and types
- Modern React 18 patterns with hooks
- Tailwind CSS for styling
- Responsive design
- Accessibility features
- Feature-specific logic based on toggles
- Modern UI with gradients, shadows, and animations
- Professional typography and spacing
- Reusable and modular design
- Mobile responsive with proper breakpoints
- Modern UI patterns and interactions
- Include SVG icons and visual elements
- Hover states, focus states, and smooth transitions
- Professional typography and spacing
- Accessibility features (ARIA labels, keyboard navigation)
- Performance optimization
- Modern color schemes and visual effects

SPECIFIC COMPONENT REQUIREMENTS:

For Navbar:
- Modern logo and navigation links
- Mobile hamburger menu with animations
- Search functionality with proper styling
- User authentication states
- Glass morphism effects
- Smooth transitions and hover states

For Hero:
- Compelling headline with gradient text
- Professional description with proper typography
- Multiple CTA buttons with different styles
- Background gradients or images
- Animated elements and micro-interactions
- Responsive design for all screen sizes

For Feature Cards:
- Modern card design with shadows
- Icons with proper styling
- Hover effects and animations
- Professional typography
- Responsive grid layout
- Interactive elements

For Footer:
- Professional layout with sections
- Social media links with icons
- Newsletter signup with modern styling
- Copyright and legal links
- Responsive design
- Modern styling with gradients

For Buttons:
- Multiple variants (primary, secondary, ghost)
- Hover and focus states
- Loading states
- Icon support
- Responsive sizing
- Modern styling with gradients

For Cards:
- Modern design with shadows
- Hover effects and animations
- Professional typography
- Image support with proper sizing
- Interactive elements
- Responsive design

Return ONLY the complete TypeScript React component code with enterprise-level quality and modern design patterns.`
    }
  },

  {
    id: 'nextjs-app-router',
    name: 'Next.js App Router',
    description: 'Modern Next.js with App Router and TypeScript',
    framework: 'nextjs',
    buildTool: 'next',
    styling: 'tailwind',
    language: 'typescript',
    icon: '⚡',
    projectTypes: ['landing', 'dashboard', 'ecommerce', 'saas', 'blog', 'marketing'],
    
    templates: {
      packageJson: {
        name: '{projectName}',
        version: '1.0.0',
        description: '{description}',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
          'type-check': 'tsc --noEmit'
        },
        dependencies: {
          next: '^14.2.0',
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'lucide-react': '^0.525.0',
          'framer-motion': '^11.3.19',
          'zustand': '^4.5.4',
          '@tanstack/react-query': '^5.51.23',
          'react-hook-form': '^7.52.1',
          'zod': '^3.23.8',
          'next-themes': '^0.3.0',
          'clsx': '^2.1.0',
          'tailwind-merge': '^2.5.4',
          '@headlessui/react': '^1.7.18',
          '@heroicons/react': '^2.1.1'
        },
        devDependencies: {
          '@types/node': '^20.14.0',
          '@types/react': '^18.3.5',
          '@types/react-dom': '^18.3.0',
          typescript: '^5.5.3',
          tailwindcss: '^3.4.1',
          autoprefixer: '^10.4.18',
          postcss: '^8.4.35',
          eslint: '^9.9.1',
          'eslint-config-next': '^14.2.0',
          prettier: '^3.0.0'
        }
      },
      
      configFiles: {
        'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
}

module.exports = nextConfig`,
        
        'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}`,
        
        'tsconfig.json': JSON.stringify({
          compilerOptions: {
            target: 'es5',
            lib: ['dom', 'dom.iterable', 'es6'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [
              {
                name: 'next'
              }
            ],
            paths: {
              '@/*': ['./*']
            }
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules']
        }, null, 2)
      },
      
      baseFiles: {
        'app/layout.tsx': `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '{projectName}',
  description: '{description}',
  keywords: ['modern', 'professional', 'enterprise'],
  authors: [{ name: 'Your Company' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}`,
        
        'app/page.tsx': `import { Suspense } from 'react'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { CTA } from '@/components/CTA'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="animate-pulse h-screen bg-gradient-to-br from-primary-50 to-primary-100" />}>
        <Hero />
        <Features />
        <CTA />
      </Suspense>
    </main>
  )
}`,
        
        'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', system-ui, sans-serif;
    scroll-behavior: smooth;
  }
  
  html {
    scroll-behavior: smooth;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  }
  
  .btn-secondary {
    @apply bg-secondary-100 hover:bg-secondary-200 text-secondary-900 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-secondary-200;
  }
  
  .btn-ghost {
    @apply text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 font-medium py-3 px-6 rounded-lg transition-all duration-200;
  }
  
  .card {
    @apply bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 p-6 backdrop-blur-sm;
  }
  
  .card-hover {
    @apply card hover:shadow-xl hover:scale-105 transition-all duration-300;
  }
  
  .gradient-bg {
    @apply bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700;
  }
  
  .glass-effect {
    @apply backdrop-blur-md bg-white/10 border border-white/20;
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.4s ease-out;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }
}`
      }
    },
    
    prompts: {
      analyze: `Analyze this project request and determine the optimal structure for an enterprise-level Next.js App Router application.

User Request: "{userPrompt}"
Project Name: "{projectName}"

Available Project Types: ${PROJECT_TYPES.join(', ')}

Based on the user's specific request, determine:
1. Project Type (one of the above)
2. Required pages and components using App Router structure
3. Feature toggles needed for modern functionality
4. Technical requirements for production deployment

CRITICAL REQUIREMENTS FOR ENTERPRISE-LEVEL APPS:
- Modern UI with gradients, shadows, and animations
- Professional typography and spacing
- Responsive design with mobile-first approach
- Interactive elements with hover states
- Loading states and error boundaries
- Accessibility compliance (WCAG 2.1 AA)
- Performance optimization with Next.js features
- SEO-friendly structure with metadata
- Modern color schemes and visual hierarchy
- Server and Client component optimization

Return as JSON:
{
  "projectType": "dashboard|ecommerce|portfolio|...",
  "description": "Detailed enterprise-level project description",
  "pages": [
    { 
      "name": "PageName", 
      "path": "/route", 
      "description": "what this page does",
      "layout": "default|dashboard|auth",
      "features": ["hero section", "interactive elements", "animations"]
    }
  ],
  "components": [
    { 
      "name": "ComponentName", 
      "description": "what this component does",
      "type": "client|server",
      "features": ["modern styling", "animations", "responsive"]
    }
  ],
  "featureToggles": {
    "darkMode": true,
    "authentication": true,
    "animations": true,
    "analytics": true,
    "responsive": true
  },
  "technicalRequirements": [
    "list of enterprise-level technical requirements"
  ]
}`,
      
      page: `Generate an enterprise-level Next.js App Router page component for {name}.

Project Context:
- Type: {projectType}
- Description: {description}
- Path: {path}
- Layout: {layout}
- Features: {features}

ENTERPRISE-LEVEL REQUIREMENTS:
- Use Next.js 14 App Router patterns
- Server Components by default, Client Components when needed
- TypeScript with proper types and interfaces
- Tailwind CSS for styling
- Responsive design
- Accessibility features
- Feature-specific logic based on toggles
- Modern UI with gradients, shadows, and animations
- Professional typography and spacing
- Realistic, professional content with proper copywriting
- Semantic HTML with accessibility features (ARIA labels, keyboard navigation)
- Modern UI elements: cards, buttons, icons, gradients, glass effects
- Interactive elements with hover states, focus states, and smooth transitions
- Professional layout with proper spacing, typography, and visual hierarchy
- Include SVG icons and modern visual elements
- Loading states and error handling
- SEO optimization with proper metadata
- Performance optimization with Next.js features
- Modern color schemes and visual effects

SPECIFIC DESIGN PATTERNS:
- Hero sections with compelling headlines and CTAs
- Feature cards with icons, descriptions, and hover effects
- Gradient backgrounds and glass morphism effects
- Smooth animations and micro-interactions
- Professional typography with proper font weights
- Modern button styles with hover and focus states
- Card layouts with shadows and border radius
- Responsive grid systems
- Professional spacing and padding

The component should look like a modern SaaS landing page with:
- Compelling hero sections with gradient backgrounds
- Feature showcases with interactive cards
- Professional call-to-action buttons
- Modern typography and visual hierarchy
- Smooth animations and transitions
- Glass morphism and modern effects

Return ONLY the complete TypeScript Next.js component code with enterprise-level quality.`,
      
      component: `Generate an enterprise-level Next.js component for {name}.

Project Context:
- Type: {projectType}
- Description: {description}
- Type: {type} (client|server)
- Features: {features}

ENTERPRISE-LEVEL REQUIREMENTS:
- Use Next.js 14 App Router patterns
- Server Components by default, Client Components when needed
- TypeScript with proper prop interfaces and types
- Tailwind CSS for styling
- Responsive design
- Accessibility features
- Feature-specific logic based on toggles
- Modern UI with gradients, shadows, and animations
- Professional typography and spacing
- Reusable and flexible component architecture
- Mobile responsive with proper breakpoints
- Modern UI patterns and interactions
- Include SVG icons and visual elements
- Hover states, focus states, and smooth transitions
- Professional typography and spacing
- Accessibility features (ARIA labels, keyboard navigation)
- Performance optimization
- Modern color schemes and visual effects

SPECIFIC COMPONENT REQUIREMENTS:

For Navbar:
- Modern logo and navigation links
- Mobile hamburger menu with animations
- Search functionality with proper styling
- User authentication states
- Glass morphism effects
- Smooth transitions and hover states

For Hero:
- Compelling headline with gradient text
- Professional description with proper typography
- Multiple CTA buttons with different styles
- Background gradients or images
- Animated elements and micro-interactions
- Responsive design for all screen sizes

For Feature Cards:
- Modern card design with shadows
- Icons with proper styling
- Hover effects and animations
- Professional typography
- Responsive grid layout
- Interactive elements

For Footer:
- Professional layout with sections
- Social media links with icons
- Newsletter signup with modern styling
- Copyright and legal links
- Responsive design
- Modern styling with gradients

For Buttons:
- Multiple variants (primary, secondary, ghost)
- Hover and focus states
- Loading states
- Icon support
- Responsive sizing
- Modern styling with gradients

For Cards:
- Modern design with shadows
- Hover effects and animations
- Professional typography
- Image support with proper sizing
- Interactive elements
- Responsive design

Return ONLY the complete TypeScript Next.js component code with enterprise-level quality and modern design patterns.`
    }
  }
];

// Helper functions
export function getStackConfig(stackId) {
  return STACK_CONFIGS.find(stack => stack.id === stackId);
}

export function getAllStacks() {
  return STACK_CONFIGS;
}

export function getProjectTypes() {
  return PROJECT_TYPES;
}

export function getFeatureToggles() {
  return FEATURE_TOGGLES;
}

export function getStackByProjectType(projectType) {
  return STACK_CONFIGS.filter(stack => 
    stack.projectTypes.includes(projectType)
  );
}

export function getDefaultFeatureToggles(projectType) {
  const toggles = {};
  
  // Set defaults based on project type
  switch (projectType) {
    case 'dashboard':
      toggles.analytics = true;
      toggles.authentication = true;
      toggles.darkMode = true;
      toggles.animations = true;
      break;
    case 'ecommerce':
      toggles.payments = true;
      toggles.inventory = true;
      toggles.authentication = true;
      toggles.animations = true;
      break;
    case 'saas':
      toggles.authentication = true;
      toggles.analytics = true;
      toggles.darkMode = true;
      toggles.animations = true;
      break;
    case 'blog':
      toggles.comments = true;
      toggles.analytics = true;
      toggles.animations = true;
      break;
    default:
      // Use default toggles
      Object.entries(FEATURE_TOGGLES).forEach(([key, config]) => {
        toggles[key] = config.default;
      });
  }
  
  return toggles;
} 