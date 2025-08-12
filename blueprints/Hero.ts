// blueprints/Hero.ts
export const heroBlueprint = {
  fileType: "React Component",
  purpose: "Hero section component with enterprise-level design, animations, and modern UI patterns",
  
  // Quality Assurance System
  qualityChecks: {
    mustHave: [
      "Framer Motion animations with staggered reveals",
      "Responsive design with mobile-first approach",
      "Accessibility features (WCAG AA compliant)",
      "Modern UI patterns (gradients, glassmorphism)",
      "TypeScript interfaces with proper prop types",
      "High-quality image integration with alt text",
      "Call-to-action buttons with hover effects",
      "Professional copywriting and typography"
    ],
    designSystem: {
      colors: ["gradients", "glassmorphism", "dark mode support"],
      animations: ["entrance", "hover", "scroll-triggered", "staggered"],
      responsive: ["mobile-first", "breakpoint system", "touch-friendly"],
      accessibility: ["ARIA labels", "semantic HTML", "focus management"]
    },
    minimumScore: 90 // Higher threshold for hero components
  },
  
  features: {
    headline: "Compelling value proposition with gradient text",
    subtext: "Professional copy that explains the solution",
    image: "High-quality hero image with proper alt text",
    ctaButtons: ["Primary CTA", "Secondary CTA"],
    background: "Modern gradient or image background",
    animation: "Framer Motion animations with staggered reveals",
    glassmorphism: "Glass effect cards and overlays",
    responsive: "Mobile-first responsive design",
    formIntegration: "Optional lead capture form",
    videoBackground: "Optional video background support",
    scrollIndicator: "Smooth scroll to next section"
  },

  designSystem: {
    colors: {
      primary: "from-blue-600 to-purple-600",
      secondary: "from-gray-900 to-gray-700",
      accent: "from-emerald-500 to-teal-500",
      glass: "rgba(255, 255, 255, 0.1) with backdrop-blur"
    },
    typography: {
      headline: "text-4xl md:text-6xl lg:text-7xl font-bold",
      subtext: "text-lg md:text-xl text-gray-600 dark:text-gray-300",
      cta: "text-lg font-semibold",
      form: "text-sm font-medium"
    },
    spacing: {
      container: "px-4 sm:px-6 lg:px-8",
      section: "py-16 md:py-24 lg:py-32",
      elements: "space-y-6 md:space-y-8"
    }
  },

  animations: {
    entrance: "Fade in with staggered children",
    hover: "Subtle scale and shadow effects",
    scroll: "Parallax or scroll-triggered animations",
    micro: "Button hover states and transitions",
    form: "Smooth form appearance and validation"
  },

  accessibility: {
    semantic: "Use <section> with proper heading hierarchy",
    aria: "aria-label for interactive elements, aria-describedby for content",
    focus: "Visible focus indicators and keyboard navigation",
    contrast: "Ensure sufficient color contrast (4.5:1 minimum)",
    screenReader: "Proper content announcements and descriptions",
    skipLinks: "Skip to main content navigation"
  },

  responsive: {
    mobile: "Stack vertically, full-width elements",
    tablet: "Side-by-side layout, medium spacing",
    desktop: "Multi-column layout, generous spacing",
    large: "Enhanced spacing and typography scaling"
  },

  formFeatures: {
    leadCapture: "Email signup with validation",
    validation: "Real-time form validation with Zod",
    accessibility: "Proper form labels and error messages",
    styling: "Consistent with design system",
    integration: "Optional backend integration hooks"
  },

  enterpriseFeatures: [
    "Glassmorphism cards with backdrop-blur",
    "Gradient text and backgrounds",
    "Smooth scroll animations",
    "Interactive hover states",
    "Professional imagery integration",
    "Trust indicators and social proof",
    "Performance optimized with lazy loading",
    "SEO-friendly semantic markup",
    "Lead capture form integration",
    "Video background support",
    "Scroll-triggered animations",
    "Accessibility compliance (WCAG AA)",
    "Mobile-first responsive design",
    "Performance optimization"
  ],

  contentStructure: {
    header: "Main headline with gradient text effect",
    subtext: "Compelling description with value proposition",
    media: "Hero image, video, or illustration",
    cta: "Primary and secondary call-to-action buttons",
    form: "Optional lead capture form",
    trust: "Social proof and trust indicators",
    scroll: "Smooth scroll indicator to next section"
  },

  // Quality Validation Rules
  validation: {
    mustContain: [
      "import { motion } from 'framer-motion'",
      "interface HeroProps",
      "<section",
      "gradient",
      "backdrop-blur",
      "aria-",
      "focus:ring",
      "hover:",
      "transition-",
      "dark:",
      "md:",
      "lg:"
    ],
    mustNotContain: [
      "any",
      "console.log",
      "alert(",
      "inline styles",
      "!important",
      "Lorem ipsum"
    ],
    fileExtension: ".tsx",
    isReactComponent: true
  },

  notes: [
    "Generate a professional, enterprise-level hero component",
    "Include compelling copywriting and value proposition",
    "Implement smooth animations with Framer Motion",
    "Use modern UI patterns (gradients, glassmorphism)",
    "Ensure accessibility compliance (WCAG AA)",
    "Implement responsive design with mobile-first approach",
    "Must meet enterprise quality standards (score >= 90)",
    "Include high-quality image integration and CTA buttons"
  ]
};