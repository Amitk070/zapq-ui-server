// blueprints/vite.config.ts
export const viteConfigBlueprint = {
  fileType: "Vite Configuration",
  purpose: "Vite build tool configuration for React + TypeScript project",
  
  // CRITICAL: This is NOT a React component - it's a TypeScript config file
  criticalNote: "DO NOT generate React/TSX code. This must be a valid Vite configuration file.",
  
  template: {
    imports: [
      "import { defineConfig } from 'vite'",
      "import react from '@vitejs/plugin-react'",
      "import path from 'path'"
    ],
    
    config: {
      plugins: ["react()"],
      resolve: {
        alias: {
          "@": "path.resolve(__dirname, './src')"
        }
      },
      optimizeDeps: {
        exclude: ['lucide-react']
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              ui: ['framer-motion', 'lucide-react']
            }
          }
        }
      }
    }
  },

  validation: {
    mustContain: ["defineConfig", "plugins", "react()"],
    mustNotContain: ["JSX", "React component", "return <", "function Component"],
    fileExtension: ".ts",
    isTypeScript: true
  },

  notes: [
    "This is a Vite configuration file, NOT a React component",
    "Must use defineConfig from 'vite'",
    "Include React plugin for JSX support",
    "Set up path aliases for clean imports",
    "Configure build optimization and chunking"
  ]
};
