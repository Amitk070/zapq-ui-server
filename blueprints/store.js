// blueprints/store.js
export const storeBlueprint = {
  fileType: "State Management Store",
  purpose: "Zustand store for application-wide state management with persistence and devtools",
  
  features: {
    globalState: "Centralized state management for the entire application",
    persistence: "Local storage integration for data persistence",
    devtools: "Redux DevTools integration for debugging",
    middleware: "Immer for immutable state updates",
    types: "Full TypeScript typing with strict mode",
    selectors: "Computed state values and derived data",
    actions: "State update functions with proper typing",
    subscriptions: "Reactive state changes and side effects"
  },

  structure: {
    imports: [
      "create from 'zustand'",
      "immer from 'zustand/middleware/immer'",
      "devtools from 'zustand/middleware/devtools'",
      "persist from 'zustand/middleware/persist'",
      "shallow from 'zustand/shallow'"
    ],
    
    storeDefinition: {
      state: "Interface defining the store state structure",
      actions: "Functions for updating state",
      selectors: "Computed values and derived state",
      middleware: "Immer, devtools, and persist middleware"
    }
  },

  statePatterns: {
    user: {
      profile: "User profile information",
      preferences: "User settings and preferences",
      authentication: "Login state and tokens"
    },
    data: {
      entities: "Main application data",
      loading: "Loading states for async operations",
      errors: "Error handling and user feedback"
    },
    ui: {
      theme: "Dark/light mode and theme settings",
      navigation: "Navigation state and breadcrumbs",
      modals: "Modal and overlay state management"
    }
  },

  middleware: {
    immer: "Immutable state updates with Immer",
    devtools: "Redux DevTools integration for debugging",
    persist: "Local storage persistence with rehydration",
    subscribeWithSelector: "Selective subscriptions for performance"
  },

  persistence: {
    storage: "localStorage for web, AsyncStorage for React Native",
    serialize: "JSON serialization with error handling",
    rehydrate: "State restoration on app initialization",
    partial: "Selective persistence of specific state slices"
  },

  devtools: {
    name: "Store name for DevTools identification",
    enabled: "Conditional enabling based on environment",
    anonymous: "Anonymous actions for production builds"
  },

  performance: {
    selectors: "Memoized selectors with shallow comparison",
    subscriptions: "Selective subscriptions to prevent unnecessary re-renders",
    batching: "Batch updates for multiple state changes",
    optimization: "React.memo and useMemo integration"
  },

  typescript: {
    strict: "Strict TypeScript configuration",
    interfaces: "Proper state and action interfaces",
    generics: "Generic types for reusable store patterns",
    utility: "Utility types for state manipulation"
  },

  validation: {
    mustContain: ["create", "immer", "devtools", "persist", "interface"],
    mustNotContain: ["useState", "useReducer", "Context", "Redux"],
    fileExtension: ".ts",
    isTypeScript: true
  },

  qualityChecks: {
    mustHave: [
      "Zustand create function",
      "Immer middleware",
      "DevTools integration",
      "Local storage persistence",
      "TypeScript interfaces"
    ],
    designSystem: {
      patterns: ["State management patterns", "Middleware composition"],
      structure: ["Clean separation of concerns", "Proper typing"]
    },
    minimumScore: 80
  },

  enterpriseFeatures: [
    "TypeScript with strict mode and proper typing",
    "Immer for immutable state updates",
    "Redux DevTools integration for debugging",
    "Local storage persistence with rehydration",
    "Performance optimized selectors and subscriptions",
    "Middleware composition and customization",
    "Error handling and validation",
    "Testing utilities and mock stores",
    "State migration and versioning",
    "Performance monitoring and optimization"
  ],

  examples: {
    basicStore: "Simple counter store with actions",
    complexStore: "Multi-slice store with relationships",
    asyncStore: "Store with async actions and loading states",
    formStore: "Form state management with validation"
  },

  notes: [
    "Generate a production-ready Zustand store",
    "Include proper TypeScript interfaces and types",
    "Implement persistence with localStorage",
    "Add Redux DevTools integration",
    "Use Immer for immutable updates",
    "Include performance optimizations",
    "Add proper error handling",
    "Ensure testing compatibility"
  ]
}; 