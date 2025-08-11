export const appTsxBlueprint = {
  purpose: 'Entry point React component that sets up global layout, routing, and error handling for the application.',
  
  features: {
    darkModeToggle: true,
    animationSupport: true,
    layoutContainer: true,
    suspenseFallback: 'LoadingSpinner',
    errorBoundary: 'ErrorFallback',
    pageTransitions: true,
    responsive: true,
    accessibilityCompliant: true
  },

  structure: {
    imports: [
      'React',
      'ReactDOM',
      'BrowserRouter, Routes, Route from react-router-dom',
      'Navbar, Footer, LoadingSpinner, ErrorFallback',
      'React.Suspense and lazy-loaded pages',
      'framer-motion AnimatePresence (optional)',
      'useState and useEffect (for dark mode toggle)',
      'Tailwind styling'
    ],

    hierarchy: [
      '<BrowserRouter>',
      '  <ErrorBoundary>',
      '    <AnimatePresence>',
      '      <Suspense fallback={<LoadingSpinner />}>',
      '        <Navbar />',
      '        <Routes>',
      '          {/* Dynamically loaded routes */}',
      '        </Routes>',
      '        <Footer />',
      '      </Suspense>',
      '    </AnimatePresence>',
      '  </ErrorBoundary>',
      '</BrowserRouter>'
    ]
  },

  accessibility: {
    requirements: [
      'Wrap entire layout with main tag if applicable',
      'Ensure semantic HTML (nav, main, footer)',
      'Add aria-labels and keyboard navigation where needed'
    ]
  },

  behavior: {
    darkMode: {
      implementation: 'useState + useEffect to toggle dark class on <html>',
      default: 'system-preferred or light'
    },
    errorHandling: 'Wrap with <ErrorBoundary> from react-error-boundary',
    lazyLoading: 'Pages/components imported via React.lazy() + Suspense',
    animation: 'Wrap transitions with AnimatePresence from framer-motion'
  },

  rules: [
    'Do NOT hardcode any specific routes',
    'Do NOT include markdown or explanations',
    'Return ONLY valid .tsx code',
    'Use modern React 18 patterns with functional components and hooks',
    'Must be production-grade and compile successfully'
  ]
};
