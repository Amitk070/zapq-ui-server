export const mainTsxBlueprint = {
  purpose: 'Entrypoint for rendering the root React application. Responsible for mounting App into the DOM with necessary global providers.',

  features: {
    strictMode: true,
    rootMount: 'ReactDOM.createRoot',
    tailwindCss: true,
    globalStylesheet: 'index.css',
    darkModeSupport: true
  },

  structure: {
    imports: [
      'React',
      'ReactDOM from react-dom/client',
      'App component',
      'index.css',
      'Any providers (ThemeProvider, QueryClientProvider, etc. if toggled)'
    ],

    renderFlow: [
      'ReactDOM.createRoot(document.getElementById("root"))',
      '.render(',
      '  <React.StrictMode>',
      '    <App />',
      '  </React.StrictMode>',
      ')'
    ]
  },

  notes: [
    'Assumes App.tsx handles routing, suspense, and layout',
    'Must import ./index.css containing Tailwind layers',
    'If theme provider or Zustand store is needed, wrap <App /> accordingly',
    'Do NOT hardcode project-specific state providers unless required'
  ],

  rules: [
    'Use React 18+ root API',
    'Do NOT explain anything in output',
    'Return only valid .tsx code',
    'No markdown formatting',
    'Ensure App component is the single entry point'
  ]
};
