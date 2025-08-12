// blueprints/Button.ts
export const buttonBlueprint = {
  fileType: "React Component",
  purpose: "Reusable button component with enterprise-level design, multiple variants, and accessibility features",
  
  // Quality Assurance System
  qualityChecks: {
    mustHave: [
      "Framer Motion animations",
      "Responsive design with Tailwind breakpoints",
      "Accessibility features (WCAG AA compliant)",
      "Modern UI patterns (gradients, glassmorphism)",
      "TypeScript interfaces with proper prop types",
      "Loading and disabled states",
      "Icon integration support",
      "Hover and focus effects"
    ],
    designSystem: {
      colors: ["gradients", "glassmorphism", "dark mode support"],
      animations: ["entrance", "hover", "click", "loading"],
      responsive: ["mobile-first", "breakpoint system", "touch-friendly"],
      accessibility: ["ARIA labels", "keyboard navigation", "focus management"]
    },
    minimumScore: 85 // Quality threshold
  },
  
  variants: {
    primary: "Solid primary button with gradient background",
    secondary: "Outlined secondary button with hover effects",
    outline: "Bordered button with transparent background",
    ghost: "Minimal button with subtle hover states",
    danger: "Red button for destructive actions",
    success: "Green button for positive actions"
  },
  
  sizes: {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2.5 px-4 text-base",
    lg: "py-3 px-6 text-lg",
    xl: "py-4 px-8 text-xl"
  },
  
  features: {
    iconSupport: "Left/right icon positioning with proper spacing",
    loading: "Loading state with spinner and disabled state",
    disabled: "Proper disabled styling and aria attributes",
    fullWidth: "Full-width option for mobile layouts",
    animation: "Framer Motion hover and click animations"
  },

  designSystem: {
    colors: {
      primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
      secondary: "border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800",
      outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20",
      ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      success: "bg-green-600 hover:bg-green-700 text-white"
    },
    typography: {
      font: "font-semibold tracking-wide",
      sizes: {
        sm: "text-sm",
        md: "text-base", 
        lg: "text-lg",
        xl: "text-xl"
      }
    },
    spacing: {
      padding: "px-4 py-2",
      icon: "space-x-2",
      fullWidth: "w-full"
    },
    shadows: {
      default: "shadow-sm",
      hover: "shadow-lg",
      active: "shadow-inner"
    }
  },

  accessibility: {
    semantic: "Use <button> element with proper type attribute",
    aria: "aria-label, aria-describedby, aria-pressed for toggle buttons",
    focus: "Visible focus ring with proper contrast",
    keyboard: "Enter and Space key support",
    screenReader: "Proper button text and state announcements"
  },

  animations: {
    hover: "Scale transform and shadow elevation",
    click: "Active state with scale down",
    loading: "Smooth spinner rotation",
    transition: "All transitions with ease-out timing",
    entrance: "Fade in with staggered children"
  },

  enterpriseFeatures: [
    "TypeScript interface with proper prop types",
    "Forwarded ref support for form integration",
    "Customizable className prop for styling overrides",
    "Event handler props (onClick, onFocus, etc.)",
    "Loading and disabled state management",
    "Icon integration with Lucide React",
    "Responsive design with mobile-first approach",
    "Dark mode support with Tailwind classes",
    "Performance optimized with React.memo",
    "Comprehensive error handling",
    "Unit test coverage for critical functionality"
  ],

  // Quality Validation Rules
  validation: {
    mustContain: [
      "import { motion } from 'framer-motion'",
      "interface ButtonProps",
      "forwardRef",
      "aria-",
      "focus:ring",
      "hover:",
      "transition-",
      "dark:"
    ],
    mustNotContain: [
      "any",
      "console.log",
      "alert(",
      "inline styles",
      "!important"
    ],
    fileExtension: ".tsx",
    isReactComponent: true
  },

  notes: [
    "Generate a professional, reusable button component",
    "Include all variants and sizes with proper styling",
    "Implement accessibility features (WCAG AA compliant)",
    "Use Framer Motion for smooth animations",
    "Support icon positioning and loading states",
    "Ensure proper TypeScript typing and prop validation",
    "Must meet enterprise quality standards (score >= 85)",
    "Include comprehensive error handling and loading states"
  ]
};
