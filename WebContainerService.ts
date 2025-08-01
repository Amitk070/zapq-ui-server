import { WebContainer } from '@webcontainer/api';
import { callClaude } from '../api/callClaude';

export interface BuildResult {
  success: boolean;
  logs: string[];
  errors: BuildError[];
  previewUrl?: string;
}

export interface BuildError {
  file: string;
  line?: number;
  column?: number;
  message: string;
  type: 'syntax' | 'runtime' | 'dependency' | 'build';
}

export interface FixResult {
  success: boolean;
  fixedFiles: Record<string, string>;
  explanation: string;
  diff?: string;
}

class WebContainerService {
  private webcontainerInstance: WebContainer | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.webcontainerInstance = await WebContainer.boot();
      this.isInitialized = true;
      console.log('✅ WebContainer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize WebContainer:', error);
      throw error;
    }
  }

  async mountProject(files: Record<string, string>): Promise<void> {
    if (!this.webcontainerInstance) {
      throw new Error('WebContainer not initialized');
    }

    // Create a proper project structure
    const projectFiles: Record<string, any> = {
      'package.json': {
        file: {
          contents: this.generatePackageJson(files),
        },
      },
      'index.html': {
        file: {
          contents: files['index.html'] || this.generateDefaultHTML(),
        },
      },
    };

    // Add all other files
    Object.entries(files).forEach(([path, content]) => {
      if (path !== 'index.html' && path !== 'package.json') {
        projectFiles[path] = {
          file: {
            contents: content,
          },
        };
      }
    });

    await this.webcontainerInstance.mount(projectFiles);
    console.log('📁 Project files mounted to WebContainer');
  }

  async installDependencies(): Promise<string[]> {
    if (!this.webcontainerInstance) {
      throw new Error('WebContainer not initialized');
    }

    const logs: string[] = [];
    
    try {
      const installProcess = await this.webcontainerInstance.spawn('npm', ['install']);
      
      installProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          logs.push(chunk);
          console.log('📦 Install:', chunk);
        }
      }));

      const exitCode = await installProcess.exit;
      
      if (exitCode !== 0) {
        throw new Error(`npm install failed with exit code ${exitCode}`);
      }

      console.log('✅ Dependencies installed successfully');
      return logs;
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error);
      throw error;
    }
  }

  async buildProject(): Promise<BuildResult> {
    if (!this.webcontainerInstance) {
      throw new Error('WebContainer not initialized');
    }

    const logs: string[] = [];
    const errors: BuildError[] = [];

    try {
      const buildProcess = await this.webcontainerInstance.spawn('npm', ['run', 'build']);
      
      buildProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          logs.push(chunk);
          console.log('🔨 Build:', chunk);
        }
      }));

      const exitCode = await buildProcess.exit;
      
      if (exitCode !== 0) {
        // Parse build errors
        const errorLogs = logs.filter(log => log.includes('ERROR') || log.includes('error'));
        errors.push(...this.parseBuildErrors(errorLogs));
        
        return {
          success: false,
          logs,
          errors,
        };
      }

      console.log('✅ Build completed successfully');
      return {
        success: true,
        logs,
        errors: [],
      };
    } catch (error) {
      console.error('❌ Build failed:', error);
      return {
        success: false,
        logs,
        errors: [{
          file: 'unknown',
          message: error instanceof Error ? error.message : 'Build failed',
          type: 'build'
        }],
      };
    }
  }

  async startDevServer(): Promise<string> {
    if (!this.webcontainerInstance) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const devProcess = await this.webcontainerInstance.spawn('npm', ['run', 'dev']);
      
      // Wait for the server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get the preview URL
      const previewUrl = this.webcontainerInstance.url;
      console.log('🚀 Dev server started at:', previewUrl);
      
      return previewUrl;
    } catch (error) {
      console.error('❌ Failed to start dev server:', error);
      throw error;
    }
  }

  async fixBuildErrors(errors: BuildError[], originalFiles: Record<string, string>): Promise<FixResult> {
    const fixedFiles: Record<string, string> = {};
    let explanation = '';

    for (const error of errors) {
      if (error.file && error.file !== 'unknown') {
        try {
          const fixResult = await this.fixFile(error, originalFiles[error.file]);
          
          if (fixResult.success) {
            fixedFiles[error.file] = fixResult.fixedContent;
            explanation += `\n\nFixed ${error.file}:\n${fixResult.explanation}`;
          }
        } catch (fixError) {
          console.error(`❌ Failed to fix ${error.file}:`, fixError);
        }
      }
    }

    return {
      success: Object.keys(fixedFiles).length > 0,
      fixedFiles,
      explanation: explanation.trim(),
    };
  }

  private async fixFile(error: BuildError, originalContent: string): Promise<{
    success: boolean;
    fixedContent: string;
    explanation: string;
  }> {
    const prompt = `I have a build error in my ${error.file} file. Please fix it and return only the corrected file content.

Error details:
- File: ${error.file}
- Line: ${error.line || 'unknown'}
- Column: ${error.column || 'unknown'}
- Error: ${error.message}
- Type: ${error.type}

Original file content:
\`\`\`
${originalContent}
\`\`\`

Please return only the corrected file content, no explanations in the response.`;

    try {
      const response = await callClaude(prompt);
      const fixedContent = this.extractCodeFromResponse(response);
      
      return {
        success: true,
        fixedContent,
        explanation: `Fixed ${error.type} error: ${error.message}`,
      };
    } catch (error) {
      console.error('❌ Failed to get fix from Claude:', error);
      return {
        success: false,
        fixedContent: originalContent,
        explanation: `Failed to fix: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private parseBuildErrors(errorLogs: string[]): BuildError[] {
    const errors: BuildError[] = [];

    for (const log of errorLogs) {
      // Parse common error patterns
      const fileMatch = log.match(/([^\/\s]+\.(js|jsx|ts|tsx|css|html))/);
      const lineMatch = log.match(/line (\d+)/);
      const columnMatch = log.match(/column (\d+)/);
      const messageMatch = log.match(/error[:\s]+(.+)/i);

      if (fileMatch) {
        errors.push({
          file: fileMatch[1],
          line: lineMatch ? parseInt(lineMatch[1]) : undefined,
          column: columnMatch ? parseInt(columnMatch[1]) : undefined,
          message: messageMatch ? messageMatch[1].trim() : log,
          type: this.determineErrorType(log),
        });
      }
    }

    return errors;
  }

  private determineErrorType(log: string): BuildError['type'] {
    if (log.includes('syntax') || log.includes('Unexpected token')) return 'syntax';
    if (log.includes('Cannot find module') || log.includes('Module not found')) return 'dependency';
    if (log.includes('ReferenceError') || log.includes('TypeError')) return 'runtime';
    return 'build';
  }

  private extractCodeFromResponse(response: string): string {
    // Extract code blocks from Claude's response
    const codeBlockMatch = response.match(/```[\s\S]*?```/);
    if (codeBlockMatch) {
      return codeBlockMatch[0].replace(/```[\s\S]*?```/, '').trim();
    }
    return response.trim();
  }

  private generatePackageJson(files: Record<string, string>): string {
    const hasReact = Object.values(files).some(content => 
      content.includes('react') || content.includes('React')
    );
    
    const hasTypeScript = Object.keys(files).some(file => 
      file.endsWith('.ts') || file.endsWith('.tsx')
    );

    const dependencies: Record<string, string> = {
      "vite": "^5.0.0",
      "@vitejs/plugin-react": "^4.0.0",
    };

    if (hasReact) {
      dependencies["react"] = "^18.0.0";
      dependencies["react-dom"] = "^18.0.0";
    }

    if (hasTypeScript) {
      dependencies["typescript"] = "^5.0.0";
      dependencies["@types/react"] = "^18.0.0";
      dependencies["@types/react-dom"] = "^18.0.0";
    }

    return JSON.stringify({
      name: "zapq-project",
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },
      dependencies,
      devDependencies: {
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^5.0.0"
      }
    }, null, 2);
  }

  private generateDefaultHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ZapQ Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
  }

  async cleanup(): Promise<void> {
    if (this.webcontainerInstance) {
      await this.webcontainerInstance.teardown();
      this.webcontainerInstance = null;
      this.isInitialized = false;
      console.log('🧹 WebContainer cleaned up');
    }
  }
}

export const webContainerService = new WebContainerService(); 
