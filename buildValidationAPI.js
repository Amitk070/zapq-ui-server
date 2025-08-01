import { webContainerService } from './WebContainerService.js';

export class BuildValidationAPI {
  constructor() {
    this.activeValidations = new Map();
  }

  setupRoutes(app) {
    // Build validation endpoint
    app.post('/api/validate-build', async (req, res) => {
      try {
        const { files, projectId } = req.body;
        
        if (!files || Object.keys(files).length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No files provided for validation'
          });
        }

        // Generate unique validation ID
        const validationId = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Start validation process
        this.startValidation(validationId, files, projectId);
        
        res.json({
          success: true,
          validationId,
          message: 'Build validation started'
        });
      } catch (error) {
        console.error('❌ Build validation error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to start build validation'
        });
      }
    });

    // Get validation status
    app.get('/api/validate-build/:validationId', (req, res) => {
      const { validationId } = req.params;
      const validation = this.activeValidations.get(validationId);
      
      if (!validation) {
        return res.status(404).json({
          success: false,
          error: 'Validation not found'
        });
      }

      res.json({
        success: true,
        ...validation
      });
    });

    // Stop validation
    app.delete('/api/validate-build/:validationId', async (req, res) => {
      const { validationId } = req.params;
      const validation = this.activeValidations.get(validationId);
      
      if (validation) {
        await webContainerService.cleanup();
        this.activeValidations.delete(validationId);
      }

      res.json({
        success: true,
        message: 'Validation stopped'
      });
    });

    // Get preview URL
    app.get('/api/validate-build/:validationId/preview', (req, res) => {
      const { validationId } = req.params;
      const validation = this.activeValidations.get(validationId);
      
      if (!validation || !validation.previewUrl) {
        return res.status(404).json({
          success: false,
          error: 'Preview not available'
        });
      }

      res.json({
        success: true,
        previewUrl: validation.previewUrl
      });
    });
  }

  async startValidation(validationId, files, projectId) {
    const validation = {
      id: validationId,
      projectId,
      status: 'initializing',
      steps: [
        { name: 'Initialize WebContainer', status: 'pending', logs: [], errors: [] },
        { name: 'Mount Project Files', status: 'pending', logs: [], errors: [] },
        { name: 'Install Dependencies', status: 'pending', logs: [], errors: [] },
        { name: 'Build Project', status: 'pending', logs: [], errors: [] },
        { name: 'Start Dev Server', status: 'pending', logs: [], errors: [] },
      ],
      currentStep: 'Initializing WebContainer...',
      previewUrl: null,
      fixResult: null,
      startTime: new Date(),
      endTime: null
    };

    this.activeValidations.set(validationId, validation);

    try {
      // Step 1: Initialize WebContainer
      validation.steps[0].status = 'running';
      await webContainerService.initialize();
      validation.steps[0].status = 'success';
      validation.steps[0].logs.push('✅ WebContainer initialized successfully');
      validation.currentStep = 'Mounting project files...';

      // Step 2: Mount Project Files
      validation.steps[1].status = 'running';
      await webContainerService.mountProject(files);
      validation.steps[1].status = 'success';
      validation.steps[1].logs.push('✅ Project files mounted successfully');
      validation.currentStep = 'Installing dependencies...';

      // Step 3: Install Dependencies
      validation.steps[2].status = 'running';
      const installLogs = await webContainerService.installDependencies();
      installLogs.forEach(log => validation.steps[2].logs.push(log));
      validation.steps[2].status = 'success';
      validation.currentStep = 'Building project...';

      // Step 4: Build Project
      validation.steps[3].status = 'running';
      const buildResult = await webContainerService.buildProject();
      
      if (buildResult.success) {
        validation.steps[3].status = 'success';
        buildResult.logs.forEach(log => validation.steps[3].logs.push(log));
        validation.steps[3].logs.push('✅ Build completed successfully');
        
        // Step 5: Start Dev Server
        validation.steps[4].status = 'running';
        validation.currentStep = 'Starting dev server...';
        const previewUrl = await webContainerService.startDevServer();
        validation.previewUrl = previewUrl;
        validation.steps[4].status = 'success';
        validation.steps[4].logs.push(`✅ Dev server started at ${previewUrl}`);
        
        validation.status = 'completed';
        validation.currentStep = 'Build validation completed successfully!';
      } else {
        validation.steps[3].status = 'error';
        validation.steps[3].errors = buildResult.errors;
        buildResult.logs.forEach(log => validation.steps[3].logs.push(log));
        
        // Try to fix build errors
        await this.handleBuildErrors(validation, files);
      }
    } catch (error) {
      console.error('❌ Build validation failed:', error);
      validation.status = 'failed';
      validation.currentStep = `Build validation failed: ${error.message}`;
    } finally {
      validation.endTime = new Date();
    }
  }

  async handleBuildErrors(validation, originalFiles) {
    validation.currentStep = 'Attempting to fix build errors...';
    
    try {
      const errors = validation.steps[3].errors;
      const fixResult = await webContainerService.fixBuildErrors(errors, originalFiles);
      
      if (fixResult.success) {
        validation.fixResult = fixResult;
        validation.currentStep = 'Retrying build with fixes...';
        
        // Retry build with fixed files
        const updatedFiles = { ...originalFiles, ...fixResult.fixedFiles };
        await webContainerService.mountProject(updatedFiles);
        
        const retryResult = await webContainerService.buildProject();
        
        if (retryResult.success) {
          validation.steps[3].status = 'success';
          validation.steps[3].logs.push('✅ Build completed successfully after fixes');
          validation.steps[3].errors = [];
          
          // Start dev server
          validation.steps[4].status = 'running';
          const previewUrl = await webContainerService.startDevServer();
          validation.previewUrl = previewUrl;
          validation.steps[4].status = 'success';
          validation.steps[4].logs.push(`✅ Dev server started at ${previewUrl}`);
          
          validation.status = 'completed';
          validation.currentStep = 'Build validation completed with fixes!';
        } else {
          validation.steps[3].status = 'error';
          validation.steps[3].errors = retryResult.errors;
          retryResult.logs.forEach(log => validation.steps[3].logs.push(log));
          validation.status = 'failed';
          validation.currentStep = 'Build still failing after fixes';
        }
      } else {
        validation.status = 'failed';
        validation.currentStep = 'Could not automatically fix build errors';
      }
    } catch (error) {
      console.error('❌ Failed to fix build errors:', error);
      validation.status = 'failed';
      validation.currentStep = 'Failed to fix build errors';
    }
  }

  getValidationStatus(validationId) {
    return this.activeValidations.get(validationId);
  }

  cleanupValidation(validationId) {
    const validation = this.activeValidations.get(validationId);
    if (validation) {
      webContainerService.cleanup();
      this.activeValidations.delete(validationId);
    }
  }
} 
