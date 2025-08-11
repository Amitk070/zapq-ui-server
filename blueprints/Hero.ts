// blueprints/Hero.ts
export const heroBlueprint = {
  fileType: "React Component",
  purpose: "Hero section component with enterprise-level design, animations, and modern UI patterns",
  
  features: {
    headline: "Compelling value proposition with gradient text",
    subtext: "Professional copy that explains the solution",
    image: "High-quality hero image with proper alt text",
    ctaButtons: ["Primary CTA", "Secondary CTA"],
    background: "Modern gradient or image background",
    animation: "Framer Motion animations with staggered reveals",
    glassmorphism: "Glass effect cards and overlays",
    responsive: "Mobile-first responsive design"
  },

  designSystem: {
    colors: {
      primary: "from-blue-600 to-purple-600",
      secondary: "from-gray-900 to-gray-700",
      accent: "from-emerald-500 to-teal-500"
    },
    typography: {
      headline: "text-4xl md:text-6xl lg:text-7xl font-bold",
      subtext: "text-lg md:text-xl text-gray-600 dark:text-gray-300",
      cta: "text-lg font-semibold"
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
    micro: "Button hover states and transitions"
  },

  accessibility: {
    semantic: "Use <section> with proper heading hierarchy",
    aria: "aria-label for interactive elements",
    focus: "Visible focus indicators",
    contrast: "Ensure sufficient color contrast"
  },

  responsive: {
    mobile: "Stack vertically, full-width elements",
    tablet: "Side-by-side layout, medium spacing",
    desktop: "Multi-column layout, generous spacing"
  },

  enterpriseFeatures: [
    "Glassmorphism cards with backdrop-blur",
    "Gradient text and backgrounds",
    "Smooth scroll animations",
    "Interactive hover states",
    "Professional imagery integration",
    "Trust indicators and social proof",
    "Performance optimized with lazy loading",
    "SEO-friendly semantic markup"
  ],

  notes: [
    "Generate a modern, enterprise-quality hero component",
    "Include Framer Motion for smooth animations",
    "Use Tailwind CSS for responsive design",
    "Implement glassmorphism and modern UI patterns",
    "Ensure accessibility compliance (WCAG AA)",
    "Optimize for performance and SEO"
  ]
};