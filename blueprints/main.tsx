export const mainTsxBlueprint = {
  fileType: "React Entry Point",
  purpose: 'Main entry point that renders the React application with proper providers and error handling',
  
  // CRITICAL: This is a React entry point file, NOT a component
  criticalNote: "This is the main entry point that renders the App component. Do NOT generate a separate component.",
  
  structure: {
    imports: [
      'React and ReactDOM from their respective packages',
      'StrictMode for development checks',
      'App component from ./App',
      'ErrorBoundary for global error handling',
      'ThemeProvider for theme management'
    ],
    
    setup: {
      rootElement: "document.getElementById('root')",
      render: "ReactDOM.createRoot().render()",
      providers: "Wrap App with necessary providers",
      errorBoundary: "Global error boundary for uncaught errors"
    }
  },

  features: {
    strictMode: "Enable React.StrictMode for development",
    errorBoundary: "Global error boundary for uncaught errors",
    themeProvider: "Theme context provider for dark/light mode",
    performance: "React 18 concurrent features enabled",
    development: "Development-only warnings and checks"
  },

  technicalRequirements: {
    reactVersion: "React 18 with createRoot API",
    typescript: "Proper TypeScript typing",
    errorHandling: "Graceful error handling with fallbacks",
    performance: "Optimized rendering with concurrent features"
  },

  validation: {
    mustContain: ["ReactDOM.createRoot", "App", "StrictMode", "render"],
    mustNotContain: ["ReactDOM.render (legacy)", "class components", "JSX in wrong place"],
    fileExtension: ".tsx",
    isReactEntry: true
  },

  notes: [
    "This is the main entry point file that bootstraps the React application",
    "Must use React 18 createRoot API, not legacy render method",
    "Include StrictMode for development checks and warnings",
    "Wrap App with necessary providers (Theme, ErrorBoundary, etc.)",
    "Handle errors gracefully with error boundaries",
    "Ensure proper TypeScript typing throughout"
  ]
};
