export const postcssBlueprint = {
  generationMethod: "template",
  filePurpose: 'Generate postcss.config.js for Tailwind CSS usage in a Vite + React + TypeScript project',
  template: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  variables: {},
  validation: {
    isTemplate: true,
    noAI: true
  },
  notes: "Template-based generation ensures correct PostCSS configuration without React code contamination"
}; 