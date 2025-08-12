// blueprints/vite.config.ts
export const viteConfigBlueprint = {
  generationMethod: "template",
  filePurpose: 'Generate vite.config.ts for a modern React + TypeScript + Vite project',
  template: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src')
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
})`,
  variables: {},
  validation: {
    isTemplate: true,
    noAI: true
  },
  notes: "Template-based generation ensures correct Vite configuration without React code contamination"
};
