// blueprints/Form.ts
export const formBlueprint = {
  fileType: "React Form Component",
  purpose: "Reusable form component with validation, accessibility, and modern design patterns",
  
  features: {
    validation: "Zod schema validation with real-time feedback",
    accessibility: "WCAG 2.1 AA compliant form design",
    responsive: "Mobile-first responsive form layout",
    animations: "Smooth form interactions and transitions",
    errorHandling: "Comprehensive error display and management",
    accessibility: "Proper labels, ARIA attributes, and keyboard navigation",
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
    isReactComponent: true
  },

  enterpriseFeatures: [
    "TypeScript with strict mode and proper typing",
    "React Hook Form for efficient form state management",
    "Zod schemas for runtime validation",
    "Accessibility compliance (WCAG 2.1 AA)",
    "Responsive design with mobile-first approach",
    "Performance optimized with debounced validation",
    "Error handling and user feedback",
    "Theme support and design system integration",
    "Testing utilities and accessibility testing",
    "Performance monitoring and optimization"
  ],

  examples: {
    contactForm: "Simple contact form with validation",
    signupForm: "Complex registration form with multiple steps",
    settingsForm: "Configuration form with conditional fields",
    searchForm: "Search form with filters and suggestions"
  },

  notes: [
    "Generate a production-ready form component",
    "Include React Hook Form and Zod validation",
    "Implement comprehensive accessibility features",
    "Use consistent design system styling",
    "Add proper error handling and user feedback",
    "Ensure responsive design across all devices",
    "Include performance optimizations",
    "Add proper TypeScript typing"
  ]
}; 