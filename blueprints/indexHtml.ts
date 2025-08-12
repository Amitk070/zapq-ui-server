// blueprints/indexHtml.ts
export const indexHtmlBlueprint = {
  fileType: "HTML Entry Point",
  purpose: "Main HTML file that serves as the entry point for the React application",
  
  // Use template-based generation instead of AI prompts
  generationMethod: "template",
  
  // Actual HTML template (no AI generation needed)
  template: `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{projectDescription}" />
    <meta name="theme-color" content="#3b82f6" />
    <meta name="color-scheme" content="light dark" />
    
    <title>{projectName}</title>
    
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,

  // Template variables for customization
  variables: {
    projectName: "string",
    projectDescription: "string"
  },

  // No validation needed - template is always correct
  validation: {
    isTemplate: true,
    noAI: true
  },

  notes: [
    "This HTML is generated from a template, not from AI prompts",
    "Template ensures valid HTML structure every time",
    "Variables are substituted for project-specific content",
    "No risk of React JSX syntax in HTML files"
  ]
};
