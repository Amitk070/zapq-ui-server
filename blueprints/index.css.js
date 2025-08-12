export const indexCssBlueprint = {
  generationMethod: "template",
  filePurpose: 'Generate index.css with Tailwind directives and custom CSS variables',
  template: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --accent-color: #10b981;
  --background-color: #ffffff;
  --text-color: #1f2937;
}

.dark {
  --primary-color: #60a5fa;
  --secondary-color: #94a3b8;
  --accent-color: #34d399;
  --background-color: #0f172a;
  --text-color: #f1f5f9;
}

@layer base {
  body {
    @apply bg-background text-text transition-colors duration-200;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700;
  }
}`,
  variables: {
    primaryColor: "string",
    secondaryColor: "string"
  },
  validation: {
    isTemplate: true,
    noAI: true
  },
  notes: "Template-based generation ensures correct CSS with Tailwind directives without React code contamination"
}; 