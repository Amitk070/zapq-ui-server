export const indexHtmlBlueprint = {
  generationMethod: "template",
  filePurpose: 'Generate index.html as the main HTML entry point for the React application',
  template: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{projectDescription}" />
    <title>{projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  variables: {
    projectName: "string",
    projectDescription: "string"
  },
  validation: {
    isTemplate: true,
    noAI: true
  },
  notes: "Template-based generation ensures correct HTML structure without React code contamination"
}; 