export const appTsxBlueprint = {
  fileType: "React Component",
  purpose: 'Main application component that sets up global layout, routing, error handling, and theme management',
  
  features: {
    darkModeToggle: "System preference detection with manual override",
    animationSupport: "Framer Motion for page transitions and micro-interactions",
    layoutContainer: "Responsive layout with proper semantic structure",
    suspenseFallback: "LoadingSpinner component for async operations",
    errorBoundary: "ErrorFallback component for graceful error handling",
    pageTransitions: "Smooth page transitions with AnimatePresence",
    responsive: "Mobile-first responsive design",
    accessibilityCompliant: "WCAG 2.1 AA compliance",
    themeProvider: "Context-based theme management",
    routing: "React Router with lazy-loaded pages",
    stateManagement: "Zustand store integration for global state",
    formHandling: "React Hook Form with Zod validation setup"
  },

  structure: {
    imports: [
      'React, ReactDOM, and React.Suspense',
      'BrowserRouter, Routes, Route from react-router-dom',
      'Navbar, Footer, LoadingSpinner, ErrorFallback components',
      'framer-motion AnimatePresence for animations',
      'useState, useEffect, useContext for state management',
      'ThemeProvider and useTheme hook',
      'Zustand store for global state management',
      'React Hook Form and Zod for form handling',
      'Tailwind CSS classes for styling'
    ],

    hierarchy: [
      '<BrowserRouter>',
      '  <ThemeProvider>',
      '    <ErrorBoundary>',
      '      <AnimatePresence mode="wait">',
      '        <Suspense fallback={<LoadingSpinner />}>',
      '          <div className="min-h-screen bg-background">',
      '            <Navbar />',
      '            <main className="flex-1">',
      '              <Routes>',
      '                {/* Lazy-loaded page routes */}',
      '                <Route path="/" element={<HomePage />} />',
      '                <Route path="/dashboard" element={<DashboardPage />} />',
      '                <Route path="/settings" element={<SettingsPage />} />',
      '                <Route path="*" element={<NotFoundPage />} />',
      '              </Routes>',
      '            </main>',
      '            <Footer />',
      '          </div>',
      '        </Suspense>',
      '      </AnimatePresence>',
      '    </ErrorBoundary>',
      '  </ThemeProvider>',
      '</BrowserRouter>'
    ]
  },

  themeManagement: {
    context: "ThemeContext with light/dark/system modes",
    localStorage: "Persist theme preference in localStorage",
    systemPreference: "Detect and follow system color scheme",
    toggle: "Manual theme toggle with smooth transitions"
  },

  routing: {
    lazyLoading: "React.lazy() for all page components",
    suspense: "LoadingSpinner fallback for all routes",
    transitions: "Framer Motion page transitions",
    errorHandling: "Error boundaries for each route",
    routeGuards: "Protected routes with authentication checks",
    nestedRoutes: "Support for nested routing patterns"
  },

  stateManagement: {
    globalState: "Zustand store for application-wide state",
    localState: "useState for component-specific state",
    persistence: "Local storage integration for data persistence",
    devtools: "Redux DevTools integration for debugging"
  },

  formHandling: {
    validation: "Zod schemas for form validation",
    formLibrary: "React Hook Form for form state management",
    errorDisplay: "Field-level error messages and validation",
    accessibility: "Proper form labels and ARIA attributes"
  },

  accessibility: {
    requirements: [
      'Wrap entire layout with main tag',
      'Ensure semantic HTML (nav, main, footer)',
      'Add aria-labels and keyboard navigation',
      'Proper heading hierarchy (h1, h2, h3)',
      'Skip to main content link',
      'Focus management for navigation',
      'Screen reader compatibility',
      'Keyboard navigation support'
    ]
  },

  behavior: {
    darkMode: {
      implementation: 'useContext + useEffect to toggle dark class on <html>',
      default: 'system-preferred with localStorage fallback',
      transition: 'Smooth color transitions with CSS custom properties'
    },
    errorHandling: 'Wrap with <ErrorBoundary> from react-error-boundary',
    lazyLoading: 'Pages/components imported via React.lazy() + Suspense',
    animation: 'Wrap transitions with AnimatePresence from framer-motion',
    responsive: 'Mobile-first design with progressive enhancement',
    statePersistence: 'Zustand store with localStorage persistence',
    formValidation: 'Real-time validation with Zod schemas'
  },

  performance: {
    optimizations: [
      'React.lazy() for code splitting',
      'Suspense boundaries for loading states',
      'Memoized components where appropriate',
      'Optimized re-renders with proper dependency arrays',
      'Virtual scrolling for large lists',
      'Image optimization with lazy loading'
    ]
  },

  enterpriseFeatures: [
    "TypeScript with strict mode and proper typing",
    "Context-based theme management with localStorage persistence",
    "Error boundaries for graceful error handling",
    "Lazy loading for optimal performance",
    "Responsive design with mobile-first approach",
    "Accessibility compliance (WCAG 2.1 AA)",
    "Modern React patterns (hooks, functional components)",
    "Framer Motion for smooth animations",
    "Tailwind CSS for consistent styling",
    "SEO-friendly semantic markup",
    "Zustand for efficient state management",
    "React Hook Form with Zod validation",
    "Protected routing with authentication",
    "Data persistence with localStorage",
    "Performance monitoring and optimization"
  ],

  rules: [
    'Do NOT hardcode any specific routes - use dynamic routing',
    'Do NOT include markdown or explanations',
    'Return ONLY valid .tsx code',
    'Use modern React 18 patterns with functional components and hooks',
    'Must be production-grade and compile successfully',
    'Include proper TypeScript interfaces and types',
    'Implement error boundaries and loading states',
    'Use semantic HTML and accessibility features',
    'Include Zustand store setup and integration',
    'Implement React Hook Form with Zod validation',
    'Add proper routing with React Router',
    'Include loading states and error handling'
  ]
};
