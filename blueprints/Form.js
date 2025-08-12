// blueprints/Form.js
export const formBlueprint = {
  fileType: "React Form Component",
  purpose: "Reusable form component with validation, accessibility, and modern design patterns",
  
  features: {
    validation: "Zod schema validation with real-time feedback",
    accessibility: "WCAG 2.1 AA compliant form design",
    responsive: "Mobile-first responsive form layout",
    animations: "Smooth form interactions and transitions",
    errorHandling: "Comprehensive error display and management",
    styling: "Consistent with design system and theme support"
  },

  formTypes: {
    contact: "Contact form with name, email, message fields",
    signup: "User registration with validation",
    login: "Authentication form with error handling",
    settings: "User preferences and configuration",
    dataEntry: "Data input forms with complex validation",
    search: "Search forms with filters and suggestions"
  },

  fieldTypes: {
    text: "Text input with validation and formatting",
    email: "Email input with format validation",
    password: "Password input with strength indicators",
    select: "Dropdown selection with search and multi-select",
    checkbox: "Checkbox groups with validation",
    radio: "Radio button groups with accessibility",
    textarea: "Multi-line text input with character limits",
    file: "File upload with type and size validation",
    date: "Date picker with range validation",
    number: "Numeric input with min/max constraints"
  },

  validation: {
    schema: "Zod schema for form validation",
    realTime: "Real-time validation on field change",
    debounced: "Debounced validation for performance",
    async: "Async validation for server-side checks",
    custom: "Custom validation rules and messages",
    errorDisplay: "Field-level and form-level error messages"
  },

  accessibility: {
    labels: "Proper form labels with associated inputs",
    aria: "ARIA attributes for screen readers",
    keyboard: "Full keyboard navigation support",
    focus: "Visible focus indicators and focus management",
    announcements: "Screen reader announcements for errors",
    skipLinks: "Skip to form navigation for keyboard users"
  },

  designSystem: {
    colors: {
      primary: "Primary color for focus states and validation",
      error: "Error color for validation failures",
      success: "Success color for validation passes",
      neutral: "Neutral colors for labels and borders"
    },
    spacing: {
      field: "Consistent spacing between form elements",
      group: "Group spacing for related fields",
      section: "Section spacing for form sections"
    },
    typography: {
      labels: "Label typography with proper hierarchy",
      inputs: "Input text styling and sizing",
      errors: "Error message typography and styling"
    }
  },

  stateManagement: {
    formState: "React Hook Form for form state management",
    validation: "Zod integration for schema validation",
    errors: "Error state management and display",
    loading: "Loading states for async operations",
    success: "Success state handling and feedback"
  },

  animations: {
    entrance: "Form field entrance animations",
    validation: "Validation feedback animations",
    loading: "Loading state animations",
    success: "Success state celebrations",
    error: "Error state animations and feedback"
  },

  responsive: {
    mobile: "Single column layout with touch-friendly inputs",
    tablet: "Two-column layout for medium screens",
    desktop: "Multi-column layout for large screens",
    large: "Enhanced spacing and typography for large displays"
  },

  validation: {
    mustContain: ["React Hook Form", "Zod validation", "accessibility features", "error handling"],
    mustNotContain: ["inline validation", "hardcoded error messages", "accessibility violations"],
    fileExtension: ".tsx",
    isTypeScript: true
  },

  qualityChecks: {
    mustHave: [
      "React Hook Form integration",
      "Zod schema validation",
      "Accessibility features (ARIA, labels)",
      "Error handling and display",
      "Responsive design",
      "Modern styling with Tailwind"
    ],
    designSystem: {
      patterns: ["Form design patterns", "Validation feedback"],
      structure: ["Clean form structure", "Proper field grouping"]
    },
    minimumScore: 85
  },

  enterpriseFeatures: [
    "TypeScript with proper typing",
    "React Hook Form for state management",
    "Zod for schema validation",
    "WCAG 2.1 AA accessibility compliance",
    "Responsive design with mobile-first approach",
    "Modern animations and transitions",
    "Error handling and user feedback",
    "Design system integration",
    "Performance optimization",
    "Testing and accessibility validation"
  ],

  notes: [
    "Generate a production-ready form component",
    "Include React Hook Form and Zod validation",
    "Implement proper accessibility features",
    "Add responsive design and animations",
    "Use consistent design system styling",
    "Include comprehensive error handling",
    "Ensure mobile-friendly interactions",
    "Add proper TypeScript types"
  ]
}; 