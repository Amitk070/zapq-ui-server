/**
 * Enhanced Backend API - ES Module Version
 * Adds production-quality endpoints with validation
 */

import { ProductionOrchestrationEngine } from './ProductionOrchestrationEngine.mjs';

export class EnhancedBackendAPI {
  constructor() {
    this.productionEngine = new ProductionOrchestrationEngine();
  }

  /**
   * Setup enhanced API routes
   */
  setupRoutes(app) {
    // Enhanced project generation endpoint
    app.post('/api/generate-enhanced-project', async (req, res) => {
      try {
        console.log('🚀 Enhanced project generation request received');
        const { prompt, projectConfig, options = {} } = req.body;

        if (!prompt || !projectConfig) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: prompt and projectConfig'
          });
        }

        // Parse project configuration
        const config = {
          name: projectConfig.name || 'Generated Project',
          description: projectConfig.description || prompt,
          type: projectConfig.type || this.detectProjectType(prompt),
          industry: projectConfig.industry || this.detectIndustry(prompt),
          designStyle: projectConfig.designStyle || 'modern',
          targetAudience: projectConfig.targetAudience || 'General audience',
          features: projectConfig.features || []
        };

        console.log(`📊 Project config:`, config);

        // Generate with production engine
        const result = await this.productionEngine.generateProject(config);

        // Enhanced response with quality metrics
        res.json({
          success: true,
          files: result.files,
          validation: result.validation,
          metadata: {
            ...result.metadata,
            generationType: 'enhanced',
            qualityScore: result.validation.score,
            timestamp: new Date().toISOString()
          },
          message: result.validation.passed 
            ? '✅ Production-ready project generated successfully!'
            : '⚠️ Project generated with quality improvements needed'
        });

      } catch (error) {
        console.error('❌ Enhanced project generation failed:', error);
        res.status(500).json({
          success: false,
          error: error.message,
          fallback: true
        });
      }
    });

    // Get enhanced project templates
    app.get('/api/project-templates', (req, res) => {
      try {
        const templates = this.getEnhancedTemplates();
        
        res.json({
          success: true,
          templates,
          message: 'Enhanced project templates loaded'
        });

      } catch (error) {
        console.error('❌ Failed to load templates:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Enhanced project generation with streaming
    app.post('/api/generate-project-stream', async (req, res) => {
      try {
        console.log('🌊 Streaming project generation request received');
        
        // Set up Server-Sent Events
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        });

        const { prompt, projectConfig } = req.body;
        
        // Send progress updates
        const sendProgress = (step, percentage, data = {}) => {
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            step,
            percentage,
            ...data
          })}\n\n`);
        };

        // Generate project with progress updates
        sendProgress('Initializing enhanced generation...', 10);
        
        const config = {
          name: projectConfig.name || 'Generated Project',
          description: projectConfig.description || prompt,
          type: projectConfig.type || this.detectProjectType(prompt),
          industry: projectConfig.industry || this.detectIndustry(prompt),
          designStyle: projectConfig.designStyle || 'modern',
          targetAudience: projectConfig.targetAudience || 'General audience',
          features: projectConfig.features || []
        };

        sendProgress('Generating project with AI...', 30);
        const result = await this.productionEngine.generateProject(config);
        
        sendProgress('Validating project quality...', 70);
        sendProgress('Applying quality improvements...', 85);
        sendProgress('Finalizing project...', 95);

        // Send final result
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          success: true,
          files: result.files,
          validation: result.validation,
          metadata: result.metadata
        })}\n\n`);

        sendProgress('Project generated successfully!', 100);
        res.end();

      } catch (error) {
        console.error('❌ Streaming generation failed:', error);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          success: false,
          error: error.message
        })}\n\n`);
        res.end();
      }
    });
  }

  /**
   * Detect project type from prompt
   */
  detectProjectType(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shopping') || lowerPrompt.includes('store')) {
      return 'ecommerce';
    }
    if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin')) {
      return 'dashboard';
    }
    if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('personal')) {
      return 'portfolio';
    }
    if (lowerPrompt.includes('saas') || lowerPrompt.includes('software')) {
      return 'saas';
    }
    if (lowerPrompt.includes('blog') || lowerPrompt.includes('article')) {
      return 'blog';
    }
    
    return 'landing'; // Default
  }

  /**
   * Detect industry from prompt
   */
  detectIndustry(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('tech') || lowerPrompt.includes('software') || lowerPrompt.includes('ai')) {
      return 'technology';
    }
    if (lowerPrompt.includes('fashion') || lowerPrompt.includes('clothing') || lowerPrompt.includes('style')) {
      return 'fashion';
    }
    if (lowerPrompt.includes('finance') || lowerPrompt.includes('bank') || lowerPrompt.includes('investment')) {
      return 'finance';
    }
    if (lowerPrompt.includes('health') || lowerPrompt.includes('medical') || lowerPrompt.includes('fitness')) {
      return 'healthcare';
    }
    if (lowerPrompt.includes('food') || lowerPrompt.includes('restaurant') || lowerPrompt.includes('recipe')) {
      return 'food';
    }
    
    return 'technology'; // Default
  }

  /**
   * Get enhanced project templates
   */
  getEnhancedTemplates() {
    return [
      {
        id: 'ecommerce-fashion',
        name: 'Fashion E-commerce Store',
        type: 'ecommerce',
        industry: 'fashion',
        description: 'Modern online fashion boutique with product catalog, shopping cart, and user reviews',
        features: ['Product Catalog', 'Shopping Cart', 'User Authentication', 'Reviews & Ratings', 'Wishlist'],
        designStyle: 'modern',
        estimatedTime: '2-3 minutes',
        qualityScore: 95
      },
      {
        id: 'saas-analytics',
        name: 'SaaS Analytics Dashboard',
        type: 'saas',
        industry: 'technology',
        description: 'Professional dashboard with data visualization, user management, and real-time analytics',
        features: ['Dashboard', 'Data Visualization', 'User Management', 'Billing', 'API Integration'],
        designStyle: 'professional',
        estimatedTime: '3-4 minutes',
        qualityScore: 97
      },
      {
        id: 'portfolio-creative',
        name: 'Creative Portfolio',
        type: 'portfolio',
        industry: 'technology',
        description: 'Personal portfolio website with project showcase, blog, and contact form',
        features: ['Project Gallery', 'Blog', 'Contact Form', 'About Section', 'Resume Download'],
        designStyle: 'minimal',
        estimatedTime: '1-2 minutes',
        qualityScore: 93
      },
      {
        id: 'landing-startup',
        name: 'Startup Landing Page',
        type: 'landing',
        industry: 'technology',
        description: 'High-converting landing page with modern design and call-to-action sections',
        features: ['Hero Section', 'Features', 'Pricing', 'Testimonials', 'Contact Form'],
        designStyle: 'modern',
        estimatedTime: '1-2 minutes',
        qualityScore: 94
      }
    ];
  }
}

export default EnhancedBackendAPI; 
