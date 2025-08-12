export const appTsxBlueprint = {
  fileType: "React Component",
  purpose: 'Generate the main App component with routing, theme provider, and error boundary',
  
  qualityChecks: {
    mustHave: [
      'framer-motion',
      'react-router-dom',
      'responsive design',
      'accessibility features',
      'TypeScript interfaces',
      'theme provider',
      'error boundary'
    ],
    designSystem: {
      colors: ['primary', 'secondary', 'accent'],
      animations: ['entrance', 'page transitions'],
      spacing: 'consistent with design system'
    },
    minimumScore: 95
  },

  validation: {
    mustContain: [
      'import.*react-router-dom',
      'import.*framer-motion',
      'interface.*Props',
      'App.*component',
      'Router.*provider',
      'responsive.*design',
      'accessibility.*aria'
    ],
    mustNotContain: [
      'console\\.log',
      'alert\\(',
      'document\\.getElementById',
      'innerHTML'
    ],
    fileExtension: '.tsx'
  },

  enterpriseFeatures: [
    'routing setup',
    'theme management',
    'error handling',
    'responsive design',
    'accessibility compliance',
    'performance optimization',
    'modern animations'
  ],

  notes: [
    'Include React Router setup with BrowserRouter',
    'Add theme provider for dark/light mode',
    'Implement error boundary for graceful error handling',
    'Ensure responsive design with mobile-first approach',
    'Add accessibility features and ARIA labels',
    'Use Framer Motion for smooth page transitions'
  ]
}; 