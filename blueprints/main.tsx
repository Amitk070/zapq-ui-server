export const mainTsxBlueprint = {
  generationMethod: "template",
  filePurpose: 'Generate main.tsx as the React 18 entry point for the application',
  template: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  variables: {},
  validation: {
    isTemplate: true,
    noAI: true
  },
  notes: "Template-based generation ensures correct React 18 entry point setup without React component code contamination"
};
