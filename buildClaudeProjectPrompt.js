/**
 * Builds a prompt for Claude to analyze and refactor existing projects
 */
export function buildClaudeProjectPrompt(projectPath) {
  return `
You are a senior developer analyzing an existing codebase.

Project path: ${projectPath}

Please analyze this project and provide:

1. **Architecture Overview:**
   - Main technologies used
   - Project structure
   - Key components and their purposes

2. **Code Quality Assessment:**
   - Best practices followed
   - Areas for improvement
   - Potential issues or bugs

3. **Refactoring Suggestions:**
   - Code organization improvements
   - Performance optimizations
   - Modern patterns to adopt

4. **Next Steps:**
   - Immediate improvements to implement
   - Long-term architectural changes
   - Testing strategy recommendations

Please provide a comprehensive but concise analysis focusing on actionable insights.
  `.trim();
} 
