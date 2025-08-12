// blueprints/Page.js
export const pageBlueprint = {
  fileType: "React Page Component",
  purpose: "Full-page component with routing, layout, and content management",
  
  features: {
    routing: "React Router integration with proper navigation",
    layout: "Consistent page layout and structure",
    content: "Dynamic content loading and management",
    seo: "SEO optimization with meta tags and structured data",
    accessibility: "WCAG 2.1 AA compliant page design",
    responsive: "Mobile-first responsive design",
    animations: "Page transitions and loading states",
    performance: "Optimized rendering and data fetching"
  },

  pageTypes: {
    home: "Landing page with hero section and features",
    about: "Company information and team details",
    services: "Service offerings and descriptions",
    portfolio: "Work showcase and case studies",
    contact: "Contact information and form",
    blog: "Blog posts and article listings",
    dashboard: "User dashboard with data visualization",
    settings: "User preferences and configuration"
  },

  structure: {
    header: "Page header with navigation and branding",
    hero: "Hero section with main message and CTA",
    content: "Main content area with sections",
    sidebar: "Sidebar navigation and related content",
    footer: "Page footer with links and information",
    navigation: "Breadcrumbs and page navigation"
  },

  routing: {
    paths: "URL structure and routing configuration",
    navigation: "Navigation between pages and sections",
    breadcrumbs: "Breadcrumb navigation for deep pages",
    deepLinking: "Direct linking to page sections",
    history: "Browser history management"
  },

  seo: {
    meta: "Meta tags for search engine optimization",
    structured: "Structured data for rich snippets",
    titles: "Page titles and descriptions",
    keywords: "Relevant keywords and phrases",
    canonical: "Canonical URLs and duplicate content"
  },

  accessibility: {
    landmarks: "Semantic HTML landmarks and structure",
    navigation: "Keyboard navigation and focus management",
    announcements: "Screen reader announcements",
    contrast: "Color contrast and readability",
    altText: "Alternative text for images and media"
  },

  responsive: {
    mobile: "Single column layout for mobile devices",
    tablet: "Two-column layout for tablet screens",
    desktop: "Multi-column layout for desktop screens",
    large: "Enhanced layout for large displays"
  },

  animations: {
    entrance: "Page entrance animations and transitions",
    loading: "Loading states and skeleton screens",
    interactions: "Interactive element animations",
    transitions: "Smooth page transitions"
  },

  performance: {
    lazy: "Lazy loading for images and content",
    optimization: "Code splitting and bundle optimization",
    caching: "Content caching and optimization",
    monitoring: "Performance monitoring and metrics"
  },

  validation: {
    mustContain: ["React Router", "proper layout structure", "SEO meta tags", "accessibility features"],
    mustNotContain: ["hardcoded content", "accessibility violations", "poor responsive design"],
    fileExtension: ".tsx",
    isTypeScript: true
  },

  qualityChecks: {
    mustHave: [
      "React Router integration",
      "Proper page structure and layout",
      "SEO meta tags and optimization",
      "Accessibility features and compliance",
      "Responsive design implementation",
      "Performance optimization",
      "Modern styling with Tailwind"
    ],
    designSystem: {
      patterns: ["Page layout patterns", "Content organization"],
      structure: ["Clean page structure", "Proper semantic markup"]
    },
    minimumScore: 85
  },

  enterpriseFeatures: [
    "TypeScript with proper typing",
    "React Router for navigation",
    "SEO optimization and meta tags",
    "WCAG 2.1 AA accessibility compliance",
    "Responsive design with mobile-first approach",
    "Page transitions and animations",
    "Performance optimization and monitoring",
    "Content management and dynamic loading",
    "Structured data and rich snippets",
    "Testing and accessibility validation"
  ],

  notes: [
    "Generate a production-ready page component",
    "Include React Router and proper navigation",
    "Implement SEO optimization and meta tags",
    "Add accessibility features and compliance",
    "Use responsive design and mobile-first approach",
    "Include page transitions and animations",
    "Ensure proper performance optimization",
    "Add comprehensive TypeScript types"
  ]
}; 