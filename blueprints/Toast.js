export const toastBlueprint = {
  fileType: "React Component",
  purpose: 'Generate a toast notification component with different types, animations, and accessibility',
  
  qualityChecks: {
    mustHave: [
      'framer-motion',
      'accessibility features',
      'TypeScript interfaces',
      'multiple types (success, error, warning, info)',
      'auto-dismiss functionality',
      'progress indicators',
      'keyboard navigation'
    ],
    designSystem: {
      colors: ['primary', 'secondary', 'accent', 'success', 'error', 'warning'],
      animations: ['entrance', 'exit', 'progress'],
      spacing: 'consistent with design system'
    },
    minimumScore: 90
  },

  validation: {
    mustContain: [
      'import.*framer-motion',
      'interface.*Props',
      'Toast.*component',
      'accessibility.*aria',
      'multiple.*types',
      'auto.*dismiss',
      'progress.*indicator'
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
    'toast notifications',
    'multiple notification types',
    'auto-dismiss functionality',
    'progress indicators',
    'accessibility compliance',
    'smooth animations'
  ],

  notes: [
    'Support multiple notification types (success, error, warning, info)',
    'Include auto-dismiss with progress indicator',
    'Ensure accessibility with ARIA attributes',
    'Add keyboard navigation support',
    'Include smooth entrance/exit animations',
    'Use consistent design system styling and colors'
  ]
}; 