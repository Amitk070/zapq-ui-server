export interface StackConfig {
  id: string;
  name: string;
  description: string;
  framework: 'react' | 'vue' | 'svelte';
  buildTool: 'vite' | 'nextjs' | 'webpack';
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  language: 'typescript' | 'javascript';
  icon: string;
  
  // File templates
  templates: {
    packageJson: Record<string, any>;
    configFiles: Record<string, string>;
    baseFiles: Record<string, string>;
  };
  
  // Generation commands
  commands: {
    install: string;
    dev: string;
    build: string;
    lint: string;
    test?: string;
  };
  
  // AI Prompts for each generation step
  prompts: {
    analyzer: string;
    scaffold: string;
    page: string;
    component: string;
    layout: string;
    styles: string;
    readme: string;
  };
  
  // Generation steps order
  steps: GenerationStep[];
}

export interface GenerationStep {
  id: string;
  name: string;
  description: string;
  promptType: keyof StackConfig['prompts'];
  outputPath: string;
  dependencies?: string[];
}

export interface ProjectPlan {
  stackId: string;
  projectName: string;
  description: string;
  pages: PagePlan[];
  components: ComponentPlan[];
  features: string[];
}

export interface PagePlan {
  name: string;
  path: string;
  description: string;
  components: string[];
}

export interface ComponentPlan {
  name: string;
  type: 'layout' | 'ui' | 'feature';
  description: string;
  props?: string[];
}

export interface GenerationResult {
  success: boolean;
  files: Record<string, string>;
  errors?: string[];
  warnings?: string[];
  buildable: boolean;
} 
