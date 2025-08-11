// blueprints/indexHtml.ts
export const indexHtmlBlueprint = {
  title: "{projectName}",
  description: "{description}",
  fonts: ["https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"],
  mountId: "root",
  entryScript: "/src/main.tsx",
  notes: [
    "Use <!DOCTYPE html>",
    "Mount point must be <div id='root'>",
    "Load compiled app using <script type='module'>",
    "Preconnect to fonts if needed"
  ]
};
