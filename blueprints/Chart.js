export const chartBlueprint = {
  fileType: "React Component",
  purpose: 'Generate a data visualization component using Recharts library with modern design and animations',
  
  qualityChecks: {
    mustHave: [
      'framer-motion',
      'recharts',
      'responsive design',
      'accessibility features',
      'TypeScript interfaces',
      'loading states',
      'error handling'
    ],
    designSystem: {
      colors: ['primary', 'secondary', 'accent'],
      animations: ['entrance', 'hover', 'data updates'],
      spacing: 'consistent with design system'
    },
    minimumScore: 90
  },

  validation: {
    mustContain: [
      'import.*recharts',
      'import.*framer-motion',
      'interface.*Props',
      'Chart.*component',
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
    'data visualization',
    'responsive charts',
    'interactive elements',
    'accessibility compliance',
    'performance optimization',
    'modern animations'
  ],

  notes: [
    'Use Recharts for data visualization',
    'Include Framer Motion animations',
    'Ensure accessibility with ARIA labels',
    'Implement responsive design',
    'Add loading and error states',
    'Use consistent design system colors'
  ]
}; 