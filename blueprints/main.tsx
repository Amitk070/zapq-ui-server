// blueprints/mainTsx.ts
export const mainTsxBlueprint = {
  rootElementId: "root",
  strictMode: true,
  router: true,
  cssImport: "./index.css",
  notes: [
    "Initialize app using ReactDOM.createRoot",
    "Wrap with <React.StrictMode>",
    "Use BrowserRouter for navigation",
    "Import Tailwind index.css"
  ]
};
