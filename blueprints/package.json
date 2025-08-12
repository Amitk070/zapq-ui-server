export const packageJsonBlueprint = {
  generationMethod: "template",
  filePurpose: 'Generate package.json with all required dependencies and scripts for a modern React + Vite + TypeScript project',
  template: `{
  "name": "{projectName}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.263.1",
    "react-hook-form": "^7.45.4",
    "zod": "^3.22.2",
    "zustand": "^4.4.1",
    "@tanstack/react-query": "^4.29.19",
    "recharts": "^2.7.2",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vitest": "^0.34.3",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`,
  variables: {
    projectName: "string"
  },
  validation: {
    isTemplate: true,
    noAI: true
  },
  notes: "This template ensures all required dependencies are included with correct versions for a modern React project"
}; 