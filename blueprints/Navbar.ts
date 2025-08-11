// blueprints/Navbar.ts
export const navbarBlueprint = {
  fileType: "React Component",
  purpose: 'Responsive navigation bar with modern design, mobile menu, dark mode toggle, and smooth animations',
  
  features: {
    responsive: "Mobile-first responsive design with hamburger menu",
    darkModeToggle: "Theme toggle with smooth transitions",
    navigation: "Smooth scroll navigation to page sections",
    branding: "Logo and company name with proper styling",
    mobileMenu: "Animated mobile menu with backdrop",
    glassmorphism: "Glass effect with backdrop blur",
    animations: "Framer Motion for smooth interactions"
  },

  designSystem: {
    colors: {
      background: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg",
      border: "border-gray-200 dark:border-gray-700",
      text: {
        primary: "text-gray-900 dark:text-white",
        secondary: "text-gray-600 dark:text-gray-300",
        accent: "text-blue-600 dark:text-blue-400"
      }
    },
    spacing: {
      container: "px-4 sm:px-6 lg:px-8",
      nav: "py-4",
      items: "space-x-8",
      mobile: "space-y-4"
    },
    shadows: {
      default: "shadow-sm",
      elevated: "shadow-lg"
    }
  },

  navigation: {
    links: [
      { name: "Home", href: "#home", smooth: true },
      { name: "Features", href: "#features", smooth: true },
      { name: "About", href: "#about", smooth: true },
      { name: "Contact", href: "#contact", smooth: true }
    ],
    cta: {
      text: "Get Started",
      href: "#cta",
      variant: "primary"
    }
  },

  mobileMenu: {
    trigger: "Hamburger button with animated lines",
    animation: "Slide down with fade effect",
    backdrop: "Semi-transparent backdrop with blur",
    positioning: "Full-width overlay with proper z-index"
  },

  accessibility: {
    semantic: "Use <nav> element with proper aria-label",
    aria: "aria-expanded for mobile menu, aria-current for active page",
    focus: "Visible focus indicators and keyboard navigation",
    screenReader: "Proper navigation announcements and skip links"
  },

  animations: {
    entrance: "Fade in from top with slide effect",
    mobileMenu: "Slide down with staggered children",
    hamburger: "Animated lines for open/close states",
    hover: "Subtle scale and color transitions"
  },

  responsive: {
    mobile: "Stack vertically with hamburger menu",
    tablet: "Horizontal layout with medium spacing",
    desktop: "Full horizontal navigation with generous spacing"
  },

  enterpriseFeatures: [
    "TypeScript interface with comprehensive prop types",
    "Responsive design with mobile-first approach",
    "Dark mode support with theme context",
    "Smooth scroll navigation to page sections",
    "Animated mobile menu with backdrop blur",
    "Glassmorphism effect with backdrop-blur",
    "Accessibility compliance (WCAG AA)",
    "Performance optimized with React.memo",
    "SEO-friendly semantic markup",
    "Modern React patterns (hooks, functional components)"
  ],

  stateManagement: {
    mobileMenu: "useState for mobile menu open/close",
    theme: "useContext for theme management",
    scroll: "useEffect for scroll-based styling changes"
  },

  notes: [
    "Generate a modern, responsive navigation component",
    "Include mobile menu with smooth animations",
    "Implement dark mode toggle functionality",
    "Use Framer Motion for smooth interactions",
    "Ensure accessibility compliance",
    "Support smooth scroll navigation",
    "Include glassmorphism design effects"
  ]
};