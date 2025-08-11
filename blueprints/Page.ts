// blueprints/Page.ts
export const pageBlueprint = {
  fileType: "React Page Component",
  purpose: "Page-level component with routing, state management, and proper layout structure",
  
  features: {
    routing: "React Router integration with proper route handling",
    layout: "Consistent page layout with header, content, and footer",
    stateManagement: "Integration with global state stores",
    dataFetching: "Data loading with loading states and error handling",
    responsive: "Mobile-first responsive page design",
    accessibility: "WCAG 2.1 AA compliant page structure",
    seo: "SEO optimization with meta tags and structured data"
  },

  pageTypes: {
    home: "Landing page with hero, features, and CTAs",
    dashboard: "Data dashboard with charts and analytics",
    list: "List page with search, filters, and pagination",
    detail: "Detail page with comprehensive information",
    form: "Form page with multi-step or single-step forms",
    settings: "Configuration page with user preferences",
    profile: "User profile page with editable information",
    error: "Error page with helpful navigation options"
  },

  structure: {
    header: "Page header with title, breadcrumbs, and actions",
    content: "Main page content with proper semantic structure",
    sidebar: "Optional sidebar for navigation or filters",
    footer: "Page footer with additional information or actions",
    navigation: "Breadcrumb navigation and page navigation"
  },

  dataHandling: {
    loading: "Loading states with skeleton screens",
    error: "Error boundaries and error display",
    empty: "Empty state handling for no data",
    pagination: "Pagination for large datasets",
    search: "Search functionality with filters",
    sorting: "Data sorting and organization"
  },

  stateManagement: {
    global: "Integration with Zustand stores",
    local: "Local state for page-specific functionality",
    form: "Form state management with React Hook Form",
    cache: "Data caching and optimization",
    sync: "State synchronization across components"
  },

  routing: {
    params: "Route parameter handling and validation",
    query: "Query string parameter management",
    navigation: "Programmatic navigation and routing",
    guards: "Route protection and authentication",
    nested: "Nested routing support"
  },

  accessibility: {
    semantic: "Proper HTML5 semantic structure",
    aria: "ARIA labels and roles for screen readers",
    keyboard: "Full keyboard navigation support",
    focus: "Focus management and visible indicators",
    landmarks: "Proper landmark structure for navigation",
    headings: "Logical heading hierarchy (h1, h2, h3)"
  },

  seo: {
    meta: "Meta tags for search engine optimization",
    structured: "Structured data markup (JSON-LD)",
    titles: "Dynamic page titles and descriptions",
    images: "Optimized images with alt text",
    performance: "Core Web Vitals optimization"
  },

  designSystem: {
    layout: "Consistent page layout patterns",
    spacing: "Standardized spacing and margins",
    typography: "Typography hierarchy and scaling",
    colors: "Theme-aware color schemes",
    components: "Reusable UI component integration"
  },

  performance: {
    lazy: "Lazy loading for page content",
    memo: "Component memoization for optimization",
    virtual: "Virtual scrolling for large lists",
    images: "Image optimization and lazy loading",
    bundle: "Code splitting and bundle optimization"
  },

  validation: {
    mustContain: ["semantic HTML", "accessibility features", "responsive design", "state management"],
    mustNotContain: ["hardcoded data", "inline styles", "accessibility violations"],
    fileExtension: ".tsx",
    isReactComponent: true
  },

  enterpriseFeatures: [
    "TypeScript with strict mode and proper typing",
    "React Router integration with proper routing",
    "Zustand store integration for state management",
    "Accessibility compliance (WCAG 2.1 AA)",
    "Responsive design with mobile-first approach",
    "SEO optimization with meta tags and structured data",
    "Performance optimization with lazy loading",
    "Error boundaries and loading states",
    "Testing utilities and accessibility testing",
    "Performance monitoring and Core Web Vitals"
  ],

  examples: {
    homePage: "Landing page with hero and features",
    dashboardPage: "Analytics dashboard with charts",
    listPage: "Data list with search and filters",
    detailPage: "Detailed information display",
    formPage: "Multi-step form with validation"
  },

  notes: [
    "Generate a production-ready page component",
    "Include proper routing and navigation",
    "Integrate with global state management",
    "Implement accessibility features",
    "Add SEO optimization and meta tags",
    "Ensure responsive design across devices",
    "Include performance optimizations",
    "Add proper error handling and loading states"
  ]
}; 