// blueprints/appTsx.ts
export const appTsxBlueprint = {
  features: {
    darkModeToggle: true,
    animationSupport: true,
    layoutContainer: true,
    suspenseFallback: "LoadingSpinner",
    errorBoundary: "ErrorFallback"
  },
  structure: {
    imports: [
      "React",
      "React Router (BrowserRouter, Routes, Route)",
      "Layout components (Navbar, Footer)",
      "Pages loaded via dynamic routes",
      "ErrorBoundary from react-error-boundary"
    ],
    children: [
      "<Navbar />",
      "<Routes />",
      "<Footer />"
    ],
    wrapper: [
      "<BrowserRouter>",
      "<ErrorBoundary>",
      "<Suspense fallback={<LoadingSpinner />}>"
    ]
  },
  notes: [
    "Component must wrap all routes with <BrowserRouter>",
    "All routes should be inside <Routes><Route/></Routes>",
    "Error boundary handles runtime crashes",
    "Suspense used for lazy-loaded pages",
    "Theme toggle should optionally exist in Navbar",
    "Do NOT hardcode any specific app routes"
  ]
};
