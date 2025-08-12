export const tsconfigNodeBlueprint = {
  generationMethod: "template",
  filePurpose: 'Generate tsconfig.node.json for Node.js TypeScript configuration in Vite projects',
  template: JSON.stringify({
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
  }, null, 2),
  variables: {},
  validation: {
    isTemplate: true,
    noAI: true
  },
  notes: "Template-based generation ensures correct Node.js TypeScript configuration without React code contamination"
}; 