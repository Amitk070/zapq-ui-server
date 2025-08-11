// blueprints/Card.ts
export const cardBlueprint = {
  fileType: "React Component",
  purpose: "Versatile card component with enterprise-level design, multiple layouts, and interactive features",
  
  variants: {
    default: "Standard card with title, subtitle, and description",
    image: "Card with featured image at top or left",
    interactive: "Clickable card with hover effects and actions",
    glassmorphism: "Glass effect card with backdrop blur",
    gradient: "Card with gradient background or border",
    elevated: "Card with enhanced shadows and depth"
  },
  
  layouts: {
    imageTop: "Image above content with title and description below",
    imageLeft: "Image on left with content on right",
    imageRight: "Image on right with content on left",
    noImage: "Text-only card with icon or emoji",
    hero: "Large card with prominent image and overlay text"
  },
  
  features: {
    hoverEffects: "Subtle scale, shadow, and color transitions",
    responsive: "Mobile-first responsive design with breakpoints",
    shadows: "Multiple shadow levels for depth hierarchy",
    borders: "Configurable border styles and colors",
    animations: "Framer Motion entrance and hover animations"
  },

  designSystem: {
    colors: {
      background: "bg-white dark:bg-gray-800",
      border: "border border-gray-200 dark:border-gray-700",
      text: {
        title: "text-gray-900 dark:text-white",
        subtitle: "text-gray-600 dark:text-gray-300",
        body: "text-gray-700 dark:text-gray-200"
      }
    },
    spacing: {
      padding: "p-6",
      image: "aspect-video object-cover",
      content: "space-y-3",
      actions: "pt-4 border-t border-gray-100 dark:border-gray-700"
    },
    shadows: {
      default: "shadow-sm",
      hover: "shadow-lg",
      elevated: "shadow-xl"
    }
  },

  accessibility: {
    semantic: "Use <article> or <div> with proper heading hierarchy",
    aria: "aria-label for interactive cards, aria-describedby for content",
    focus: "Visible focus indicators for keyboard navigation",
    screenReader: "Proper content structure and descriptions"
  },

  animations: {
    entrance: "Fade in with staggered children",
    hover: "Lift effect with shadow and scale",
    image: "Subtle zoom on image hover",
    content: "Smooth content transitions"
  },

  enterpriseFeatures: [
    "TypeScript interface with comprehensive prop types",
    "Flexible content rendering with children prop",
    "Image optimization with lazy loading support",
    "Customizable className and style props",
    "Event handler props for interactive cards",
    "Responsive image handling with proper alt text",
    "Dark mode support with Tailwind classes",
    "Performance optimized with React.memo",
    "Accessibility compliant (WCAG AA)",
    "SEO-friendly semantic markup"
  ],

  contentStructure: {
    header: "Title, subtitle, and optional badge",
    media: "Image, video, or icon with proper alt text",
    body: "Main content with proper typography hierarchy",
    footer: "Actions, metadata, or additional information"
  },

  notes: [
    "Generate a professional, versatile card component",
    "Support multiple variants and layout options",
    "Include smooth animations with Framer Motion",
    "Implement proper accessibility features",
    "Use responsive design with mobile-first approach",
    "Ensure proper TypeScript typing and validation"
  ]
};