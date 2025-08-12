import { sectionBlueprints } from "./blueprints.js";
/**
 * Production Orchestration Engine - JavaScript Backend Version
 * Generates bolt.new quality projects with validation and realistic content
 */

class ProductionOrchestrationEngine {
  constructor() {
    this.MINIMUM_SCORE = 90;
  }

  /**
   * Generate a production-ready project with enhanced quality
   */
  async generateProject(config) {
    try {
      console.log(`🚀 Starting production generation for: ${config.name}`);
      
      // Generate with enhanced prompts
      const prompt = this.getEnhancedPrompt(config);
      
      // Call AI service with production prompt
      const rawFiles = await this.callAIService(prompt);
      
      // Post-process for quality
      const processedFiles = await this.postProcessFiles(rawFiles, config);
      
      // Validate project quality
      const validation = await this.validateProject(processedFiles);
      
      // If quality insufficient, improve automatically
      if (validation.score < this.MINIMUM_SCORE) {
        console.log(`⚠️ Quality score ${validation.score}% below threshold, improving...`);
        const improvedFiles = await this.improveProject(processedFiles, validation.issues);
        const finalValidation = await this.validateProject(improvedFiles);
        
        return {
          files: improvedFiles,
          validation: finalValidation,
          metadata: this.getProjectMetadata(improvedFiles)
        };
      }
      
      return {
        files: processedFiles,
        validation,
        metadata: this.getProjectMetadata(processedFiles)
      };
      
    } catch (error) {
      console.error('❌ Production generation failed:', error);
      throw new Error(`Project generation failed: ${error.message}`);
    }
  }

  /**
   * Create enhanced AI prompt for production-quality code
   */
  getEnhancedPrompt(config) {
    const featureList = (config.features || []).join(", ");
    const blueprintSectionHints = Object.entries(sectionBlueprints || {}).map(
      ([name, section]) => {
        return `[Blueprint - ${name}]: ` + JSON.stringify(section);
      }
    ).join("\n");

    return `CRITICAL INSTRUCTIONS:
- Use TypeScript (.tsx)
- Use Tailwind CSS for styling
- Do NOT return markdown or explanations
- Do NOT include file names
- Use realistic placeholder content
- Add motion and accessibility if relevant
- Include only working code

Project Name: ${config.name}
Project Description: ${config.description}
Project Type: ${config.type}
Enabled Features: ${featureList}

${blueprintSectionHints}

Generate the full application structure including components and pages. Return raw code blocks only.`;
  }
    const featureList = (config.features || []).join(", ");
    const blueprintHints = config.blueprints ? Object.entries(config.blueprints).map(
      ([section, details]) => `\n[Blueprint - ${section.toUpperCase()}]: ${JSON.stringify(details)}`
    ).join("\n") : "";

    return `CRITICAL INSTRUCTIONS:
- Use TypeScript (.tsx) format
- Use Tailwind CSS for styling
- Do NOT return markdown or explanations
- Do NOT include file names
- Use realistic placeholder content
- Add motion and accessibility if relevant
- Include only working code

Project Name: ${config.name}
Project Description: ${config.description}
Project Type: ${config.type}
Enabled Features: ${featureList}
${blueprintHints}

Generate the full application structure including components and pages. Return raw code blocks only.`;
  }
    const industryContent = this.getIndustrySpecificContent(config.industry, config.type);
    const designTokens = this.getDesignSystemPrompt(config.designStyle);
    
    return `
Generate a complete, production-ready ${config.type} application named "${config.name}".

🎯 PROJECT CONTEXT:
- Industry: ${config.industry}
- Target Audience: ${config.targetAudience}
- Design Style: ${config.designStyle}
- Description: ${config.description}

🏗️ TECHNICAL FOUNDATION (EXACT VERSIONS):
- React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.2
- Tailwind CSS 3.4.1 with custom design system
- Framer Motion 11.3.19 for animations
- Lucide React 0.428.0 for icons
- React Hook Form 7.52.1 + Zod 3.23.8 for forms
- Zustand 4.5.4 for state management
- React Query 5.51.23 for data fetching
- React Router DOM 6.26.0 for navigation

🎨 DESIGN SYSTEM (${config.designStyle} style):
${designTokens}

💫 MODERN UI PATTERNS:
- Glassmorphism effects with backdrop-blur
- Smooth micro-interactions with Framer Motion
- Loading skeletons and empty states
- Toast notifications and modals
- Progressive disclosure patterns
- Card-based responsive layouts
- Hover effects and focus states
- Modern gradient backgrounds

🛡️ ACCESSIBILITY (WCAG 2.1 AA):
- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management and visible focus indicators
- Screen reader compatibility
- Color contrast ratio 4.5:1 minimum
- Alt text for all images
- Form validation with clear error messages

📱 RESPONSIVE DESIGN:
- Mobile-first approach with breakpoints
- Touch-friendly 44px+ interactive elements
- Optimized for all screen sizes (320px to 2560px)
- Responsive typography and spacing
- Mobile navigation patterns

⚡ PERFORMANCE OPTIMIZATION:
- React.lazy() for code splitting
- Image optimization with loading="lazy"
- Virtual scrolling for large lists
- Debounced search and inputs
- Memoized components with React.memo
- Bundle size under 500KB initial load

🎯 ${config.type.toUpperCase()} SPECIFIC FEATURES:
${this.getTypeSpecificFeatures(config)}

📝 CONTENT REQUIREMENTS:
${industryContent}

🔧 FILE STRUCTURE:
src/
├── components/
│   ├── ui/              # Design system components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── pages/               # Page components
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── utils/               # Helper functions
└── data/                # Mock data and constants

🚀 PRODUCTION REQUIREMENTS:
- Error boundaries for graceful error handling
- Loading states for all async operations
- Form validation with user-friendly messages
- Empty states and skeleton screens
- 404 and error pages
- Environment variables setup
- Build optimization for production
- SEO meta tags and structured data

🎭 REALISTIC CONTENT:
- Use real business names, not "Acme Corp"
- Professional copywriting, no Lorem Ipsum
- Industry-appropriate product/service names
- Realistic pricing and statistics
- High-quality Unsplash images (specific URLs)
- Customer testimonials with real names and roles
- Contact information and addresses
- Social media integration

🏆 QUALITY STANDARDS:
- TypeScript strict mode with no any types
- ESLint with React hooks and accessibility rules
- Prettier formatting configuration
- Clean, commented code with JSDoc
- Reusable component patterns
- Consistent naming conventions
- Proper error handling everywhere

OUTPUT FORMAT:
Generate ONLY clean, individual files. NO markdown formatting, NO code blocks, NO explanations.
Each file must be complete, functional, and production-ready.
Start with package.json and include ALL necessary files for a complete application.

CRITICAL: Ensure all imports are correct, all dependencies are listed, and the project builds successfully without errors.
`;
  }

  /**
   * Get industry-specific content for realistic projects
   */
  getIndustrySpecificContent(industry, type) {
    const contentMap = {
      'technology': {
        ecommerce: `
- 15+ realistic tech products (laptops, smartphones, accessories)
- Product specifications and technical details
- Customer reviews with technical feedback
- Comparison tables and feature matrices
- Tech blog with industry insights
`,
        saas: `
- SaaS dashboard with analytics and metrics
- Subscription plans with realistic pricing
- User onboarding flow with progress tracking
- Integration marketplace with popular tools
- Help center with technical documentation
`
      },
      'fashion': {
        ecommerce: `
- 15+ fashion items with size variations
- Color options and material descriptions
- Style guides and outfit suggestions
- Customer photos and reviews
- Seasonal collections and trends
`
      },
      'finance': {
        saas: `
- Financial dashboard with charts and KPIs
- Portfolio management interface
- Transaction history and analytics
- Investment recommendations
- Compliance and security features
`
      }
    };

    return contentMap[industry]?.[type] || `
- Industry-appropriate content for ${industry}
- Professional business copy
- Realistic data and statistics
- High-quality images and media
`;
  }

  /**
   * Get design system prompt based on style
   */
  getDesignSystemPrompt(style) {
    const styles = {
      modern: `
- Primary: Blue gradient (#3b82f6 to #1d4ed8)
- Secondary: Gray scale (#f8fafc to #0f172a)
- Accent: Green (#10b981) and Orange (#f59e0b)
- Rounded corners (8px, 12px, 16px)
- Subtle shadows and depth
`,
      glassmorphism: `
- Primary: Translucent whites with backdrop-blur
- Background: Gradient overlays (#6366f1 to #8b5cf6)
- Glass cards: backdrop-blur-lg with border opacity
- Frosted effect with rgba(255,255,255,0.1)
- Smooth animations and transitions
`,
      minimal: `
- Monochrome palette (#000000 to #ffffff)
- Clean typography with plenty of whitespace
- Sharp edges with minimal rounded corners
- Subtle hover states and interactions
- Focus on content and functionality
`
    };

    return styles[style] || styles.modern;
  }

  /**
   * Get type-specific features for different project types
   */
  getTypeSpecificFeatures(config) {
    switch (config.type) {
      case 'ecommerce':
        return `
- Product catalog with advanced search and filters
- Shopping cart with persistent state
- Checkout flow with form validation
- User accounts and order history
- Product reviews and ratings system
- Wishlist functionality
- Category navigation with breadcrumbs
- Related products and recommendations
- Inventory management indicators
- Multiple payment method UI (Stripe integration ready)
- Responsive product image galleries
- Size/color variant selection
`;

      case 'saas':
        return `
- Analytics dashboard with data visualization
- User onboarding flow with progress indicators
- Settings and profile management
- Billing and subscription interface
- Team management and permissions
- API documentation and integration guides
- Help center with search functionality
- Notification system and activity feeds
- Data export and reporting features
- Integration marketplace UI
- Admin panel with user management
- Feature usage tracking and analytics
`;

      case 'portfolio':
        return `
- Project showcase with detailed case studies
- Skills and expertise timeline
- Professional about page with biography
- Contact form with validation
- Blog/articles section with categories
- Work experience and education
- Client testimonials and recommendations
- Services and pricing pages
- Photo gallery with lightbox
- Resume/CV download functionality
- Social media integration
- Newsletter subscription
`;

      case 'landing':
        return `
- Hero section with compelling value proposition
- Features showcase with icons and descriptions
- Pricing tables with comparison
- Customer testimonials carousel
- FAQ section with search
- Contact forms and lead capture
- Social proof and trust badges
- Product demo or video integration
- Team/about section
- Blog preview with latest posts
- Newsletter signup with validation
- Mobile-optimized conversion flow
`;

      default:
        return `
- Core functionality for ${config.type}
- Modern UI patterns and interactions
- Responsive design across all devices
- Accessibility features built-in
`;
    }
  }

  /**
   * Call AI service (placeholder - integrate with your AI provider)
   */
  async callAIService(prompt) {
    // TODO: Replace with your actual AI service call
    // This is where you'd call Claude, OpenAI, etc.
    console.log('🤖 Calling AI service with enhanced prompt...');
    
    // For now, return a basic structure
    // You'll replace this with your actual AI integration
    return {
      'package.json': JSON.stringify({
        name: 'generated-project',
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          lint: 'eslint .',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'framer-motion': '^11.3.19',
          'lucide-react': '^0.428.0',
          'react-hook-form': '^7.52.1',
          zod: '^3.23.8',
          zustand: '^4.5.4'
        },
        devDependencies: {
          '@types/react': '^18.3.5',
          '@types/react-dom': '^18.3.0',
          '@vitejs/plugin-react': '^4.3.1',
          typescript: '^5.5.3',
          tailwindcss: '^3.4.1',
          vite: '^5.4.2'
        }
      }, null, 2),
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Enhanced Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    };
  }

  /**
   * Post-process generated files for quality
   */
  async postProcessFiles(files, config) {
    const processed = {};
    
    for (const [filePath, content] of Object.entries(files)) {
      let cleanContent = content;
      
      // Remove markdown artifacts
      cleanContent = cleanContent.replace(/```[\w]*\n?/g, '');
      cleanContent = cleanContent.replace(/```/g, '');
      
      // Fix common AI generation issues
      cleanContent = this.fixImports(cleanContent, filePath);
      cleanContent = this.addRealisticContent(cleanContent, config);
      cleanContent = this.formatCode(cleanContent, filePath);
      
      // No validation needed for template-generated files
      // Templates ensure correct syntax automatically
      
      processed[filePath] = cleanContent;
    }
    
    // Ensure required files exist
    return this.ensureRequiredFiles(processed, config);
  }

  /**
   * Fix import statements and common issues
   */
  fixImports(content, filePath) {
    // Fix common import issues
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      // Ensure React import for JSX files
      if (content.includes('JSX') || content.includes('<') && !content.includes('import React')) {
        content = `import React from 'react';\n${content}`;
      }
      
      // Fix relative imports
      content = content.replace(/from ['"]@\/([^'"]*)['"]/g, (match, path) => {
        return `from '../${path}'`;
      });
    }
    
    return content;
  }

  /**
   * Replace placeholder content with realistic data
   */
  addRealisticContent(content, config) {
    const replacements = {
      'Lorem ipsum': this.getRealisticCopy(config.industry),
      'John Doe': this.getRealisticName(),
      'Acme Corp': this.getRealisticCompanyName(config.industry),
      '$99': this.getRealisticPrice(config.type),
      'example@email.com': this.getRealisticEmail()
    };
    
    let updatedContent = content;
    for (const [placeholder, replacement] of Object.entries(replacements)) {
      updatedContent = updatedContent.replace(new RegExp(placeholder, 'gi'), replacement);
    }
    
    return updatedContent;
  }

  /**
   * Format code content
   */
  formatCode(content, filePath) {
    // Apply consistent formatting
    return content.trim();
  }

  /**
   * Ensure all required files exist
   */
  ensureRequiredFiles(files, config) {
    const required = [
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'vite.config.ts',
      'index.html',
      'src/main.tsx',
      'src/App.tsx',
      '.env.example',
      'README.md'
    ];
    
    for (const file of required) {
      if (!files[file]) {
        files[file] = this.generateRequiredFile(file, config);
      }
    }
    
    return files;
  }

  /**
   * Generate missing required files
   */
  generateRequiredFile(filePath, config) {
    switch (filePath) {
      case 'package.json':
        return this.generatePackageJson(config);
      case 'tsconfig.json':
        return this.generateTsConfig();
      case 'README.md':
        return this.generateReadme(config);
      default:
        return '';
    }
  }

  /**
   * Generate enhanced package.json
   */
  generatePackageJson(config) {
    return JSON.stringify({
      name: config.name.toLowerCase().replace(/\s+/g, '-'),
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        lint: "eslint .",
        preview: "vite preview",
        typecheck: "tsc --noEmit"
      },
      dependencies: {
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "typescript": "^5.5.3",
        "framer-motion": "^11.3.19",
        "lucide-react": "^0.428.0",
        "react-hook-form": "^7.52.1",
        "zod": "^3.23.8",
        "zustand": "^4.5.4",
        "@tanstack/react-query": "^5.51.23",
        "react-router-dom": "^6.26.0",
        "clsx": "^2.1.1",
        "tailwind-merge": "^2.4.0"
      },
      devDependencies: {
        "@types/react": "^18.3.5",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        "autoprefixer": "^10.4.18",
        "eslint": "^9.9.1",
        "eslint-plugin-react-hooks": "^5.1.0-rc.0",
        "eslint-plugin-react-refresh": "^0.4.11",
        "postcss": "^8.4.35",
        "tailwindcss": "^3.4.1",
        "typescript-eslint": "^8.3.0",
        "vite": "^5.4.2"
      }
    }, null, 2);
  }

  /**
   * Generate TypeScript config
   */
  generateTsConfig() {
    return JSON.stringify({
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
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["src"],
      references: [{ path: "./tsconfig.node.json" }]
    }, null, 2);
  }

  /**
   * Generate README
   */
  generateReadme(config) {
    return `# ${config.name}

A modern ${config.type} application built with React, TypeScript, and Tailwind CSS.

## Features

- ⚡ React 18 with TypeScript
- 🎨 Tailwind CSS for styling  
- 📱 Fully responsive design
- ♿ Accessibility compliant
- 🚀 Performance optimized

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint

Generated by ZapQ - Production-Ready Project Generator
`;
  }

  /**
   * Validate project quality
   */
  async validateProject(files) {
    // Basic validation - you can enhance this
    const score = this.calculateQualityScore(files);
    
    return {
      score,
      passed: score >= this.MINIMUM_SCORE,
      issues: [],
      recommendations: score < this.MINIMUM_SCORE ? ['Improve code structure', 'Add missing files'] : []
    };
  }

  /**
   * Calculate quality score
   */
  calculateQualityScore(files) {
    let score = 0;
    
    // Check required files
    const requiredFiles = ['package.json', 'src/main.tsx', 'src/App.tsx'];
    const hasRequired = requiredFiles.every(file => files[file]);
    if (hasRequired) score += 30;
    
    // Check TypeScript usage
    const tsFiles = Object.keys(files).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    if (tsFiles.length > 0) score += 20;
    
    // Check for components
    const hasComponents = Object.keys(files).some(f => f.includes('components/'));
    if (hasComponents) score += 20;
    
    // Check package.json validity
    if (files['package.json']) {
      try {
        JSON.parse(files['package.json']);
        score += 30;
      } catch (e) {
        // Invalid JSON
      }
    }
    
    return Math.min(score, 100);
  }

  /**
   * Improve project based on issues
   */
  async improveProject(files, issues) {
    // Apply automatic improvements
    const improved = { ...files };
    
    // Add missing React imports
    for (const [filePath, content] of Object.entries(improved)) {
      if (filePath.endsWith('.tsx') && content.includes('<') && !content.includes('import React')) {
        improved[filePath] = `import React from 'react';\n${content}`;
      }
    }
    
    return improved;
  }

  /**
   * Get project metadata
   */
  getProjectMetadata(files) {
    return {
      fileCount: Object.keys(files).length,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // Utility methods for realistic content
  getRealisticCopy(industry) {
    const copies = {
      technology: "Cutting-edge technology solutions that drive innovation and efficiency.",
      fashion: "Discover the latest trends and timeless styles that define modern fashion.",
      finance: "Secure, reliable financial services tailored to your investment goals."
    };
    return copies[industry] || "Professional solutions tailored to your business needs.";
  }

  getRealisticName() {
    const names = ["Sarah Chen", "Michael Rodriguez", "Emily Johnson", "David Park", "Jessica Williams"];
    return names[Math.floor(Math.random() * names.length)];
  }

  getRealisticCompanyName(industry) {
    const companies = {
      technology: "TechFlow Solutions",
      fashion: "StyleCraft Boutique", 
      finance: "SecureVest Partners"
    };
    return companies[industry] || "Innovation Partners";
  }

  getRealisticPrice(type) {
    const ranges = {
      ecommerce: ["$29.99", "$49.99", "$79.99", "$129.99"],
      saas: ["$19/month", "$49/month", "$99/month"],
      portfolio: ["Starting at $500", "$1,200", "$2,500"]
    };
    const priceRange = ranges[type] || ["$99"];
    return priceRange[Math.floor(Math.random() * priceRange.length)];
  }

  getRealisticEmail() {
    const domains = ["techflow.com", "stylecraft.co", "securevest.io"];
    const names = ["contact", "hello", "info", "support"];
    return `${names[Math.floor(Math.random() * names.length)]}@${domains[Math.floor(Math.random() * domains.length)]}`;
  }
}

module.exports = ProductionOrchestrationEngine;
