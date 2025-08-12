export const tableBlueprint = {
  fileType: "React Component",
  purpose: 'Generate a data table component with sorting, filtering, and modern design patterns',
  
  qualityChecks: {
    mustHave: [
      'framer-motion',
      'responsive design',
      'accessibility features',
      'TypeScript interfaces',
      'loading states',
      'error handling',
      'sorting functionality',
      'pagination'
    ],
    designSystem: {
      colors: ['primary', 'secondary', 'accent'],
      animations: ['entrance', 'hover', 'row selection'],
      spacing: 'consistent with design system'
    },
    minimumScore: 90
  },

  validation: {
    mustContain: [
      'import.*framer-motion',
      'interface.*Props',
      'Table.*component',
      'responsive.*design',
      'accessibility.*aria',
      'sort.*function',
      'pagination'
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
    'data tables',
    'sorting and filtering',
    'pagination',
    'responsive design',
    'accessibility compliance',
    'performance optimization',
    'modern animations'
  ],

  notes: [
    'Include sorting and filtering capabilities',
    'Add pagination for large datasets',
    'Ensure accessibility with proper table semantics',
    'Implement responsive design for mobile',
    'Add loading and error states',
    'Use consistent design system styling'
  ]
}; 