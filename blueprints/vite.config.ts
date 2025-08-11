// blueprints/vite.config.ts
export const viteConfigBlueprint = {
  framework: "React",
  basePath: "./", // Use '/' or '/code/' for subpath deployment
  outputDir: "dist",
  plugins: ["@vitejs/plugin-react"],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  notes: [
    "Use defineConfig from 'vite'",
    "Enable proper relative asset resolution for Vercel",
    "Ensure correct build output folder"
  ]
};
