export const modalBlueprint = {
  fileType: "React Component",
  purpose: 'Generate a modal/overlay component with proper accessibility, animations, and modern design',
  
  qualityChecks: {
    mustHave: [
      'framer-motion',
      'accessibility features',
      'TypeScript interfaces',
      'focus management',
      'keyboard navigation',
      'backdrop handling',
      'escape key support'
    ],
    designSystem: {
      colors: ['primary', 'secondary', 'accent'],
      animations: ['entrance', 'exit', 'backdrop'],
      spacing: 'consistent with design system'
    },
    minimumScore: 90
  },

  validation: {
    mustContain: [
      'import.*framer-motion',
      'interface.*Props',
      'Modal.*component',
      'accessibility.*aria',
      'focus.*management',
      'keyboard.*navigation',
      'backdrop.*click'
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
    'modal overlays',
    'focus management',
    'keyboard navigation',
    'accessibility compliance',
    'smooth animations',
    'backdrop handling'
  ],

  notes: [
    'Implement proper focus management',
    'Add keyboard navigation (Escape to close)',
    'Ensure accessibility with ARIA attributes',
    'Handle backdrop clicks properly',
    'Include smooth entrance/exit animations',
    'Use consistent design system styling'
  ]
}; 