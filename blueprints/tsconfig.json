// blueprints/tsconfig.ts
export const tsconfigBlueprint = {
  compilerOptions: {
    target: "ES2020",
    useDefineForClassFields: true,
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    module: "ESNext",
    skipLibCheck: true,
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: "react-jsx",
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true
  },
  include: ["src"],
  references: [{ path: "./tsconfig.node.json" }],
  notes: [
    "Enable strict typing and modern build features for TypeScript",
    "Support React 18 JSX and Vite-style bundling",
    "Avoid emitting JS — just for type checking"
  ]
};
