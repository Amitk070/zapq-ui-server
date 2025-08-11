// blueprints/indexHtml.ts
export const indexHtmlBlueprint = {
  fileType: "HTML Entry Point",
  purpose: "Main HTML file that serves as the entry point for the React application",
  
  // CRITICAL: This is NOT a React component - it's an HTML file
  criticalNote: "DO NOT generate React/TSX code. This must be a valid HTML file.",
  
  template: {
    doctype: "<!DOCTYPE html>",
    htmlAttributes: {
      lang: "en",
      class: "scroll-smooth"
    },
    
    head: {
      meta: [
        '<meta charset="UTF-8" />',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        '<meta name="description" content="{projectDescription}" />',
        '<meta name="theme-color" content="#3b82f6" />',
        '<meta name="color-scheme" content="light dark" />'
      ],
      title: '<title>{projectName}</title>',
      links: [
        '<link rel="icon" type="image/svg+xml" href="/vite.svg" />',
        '<link rel="preconnect" href="https://fonts.googleapis.com" />',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />'
      ]
    },
    
    body: {
      rootDiv: '<div id="root"></div>',
      script: '<script type="module" src="/src/main.tsx"></script>'
    }
  },

  validation: {
    mustContain: ["<!DOCTYPE html>", "<html", "<head", "<body", "id=\"root\"", "main.tsx"],
    mustNotContain: ["import", "export", "function", "const", "JSX", "React", "return"],
    fileExtension: ".html",
    isHtml: true
  },

  notes: [
    "This is an HTML file, NOT a React component",
    "Must contain proper HTML structure with DOCTYPE",
    "Include viewport meta tag for responsive design",
    "Set up root div for React mounting",
    "Link to main.tsx entry point"
  ]
};
