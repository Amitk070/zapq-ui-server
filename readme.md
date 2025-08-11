# ZapQ UI Server - Enterprise Website Generator

A powerful backend system that generates enterprise-level, production-ready React websites using Claude AI, similar to bolt.new quality with modern animations, gradients, and design patterns.

## 🚀 Features

### ✨ Enterprise-Level Generation
- **Modern Design Patterns**: Glassmorphism, gradient backgrounds, smooth animations
- **Professional Components**: Production-ready React components with TypeScript
- **Accessibility First**: WCAG 2.1 AA compliant with semantic HTML
- **Performance Optimized**: Code splitting, lazy loading, optimized bundles
- **Responsive Design**: Mobile-first approach with progressive enhancement

### 🎨 Design System
- **Color Palette**: Blue to Purple gradients, semantic colors, dark mode support
- **Typography**: Inter font family with responsive scaling
- **Spacing**: 4px base unit system with mobile-first breakpoints
- **Shadows**: Multiple levels for depth hierarchy
- **Animations**: Framer Motion for smooth micro-interactions

### 🛠️ Technology Stack
- **Frontend**: React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1 with custom design system
- **Animations**: Framer Motion 11.3.19
- **Icons**: Lucide React 0.428.0
- **Forms**: React Hook Form 7.52.1 + Zod 3.23.8
- **State**: Zustand 4.5.4
- **Data**: React Query 5.51.23

## 🔧 Architecture

### Core Components

#### 1. OrchestrationEngine
The main engine that coordinates project generation:
- Loads blueprints for each component/file type
- Builds enhanced prompts for Claude
- Manages file generation and dependencies
- Tracks progress and token usage

#### 2. Blueprint System
Comprehensive blueprints for each file type:
- **Configuration Files**: tsconfig.json, vite.config.ts, tailwind.config.ts
- **HTML/CSS**: index.html, index.css with Tailwind directives
- **React Components**: App.tsx, main.tsx, and feature components
- **Validation Rules**: Ensures proper file types and content

#### 3. Enhanced Prompts
Enterprise-level prompts that generate:
- Modern UI patterns and animations
- Accessibility-compliant components
- Performance-optimized code
- Professional design and styling

### File Structure
```
zapq-ui-server/
├── blueprints/           # Component and file blueprints
├── OrchestrationEngine.js # Main generation engine
├── stackConfigs.js      # Technology stack configurations
├── buildClaudeProjectPrompt.js # Enhanced prompt builder
├── index.js             # Express server and API endpoints
└── README.md            # This documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- ANTHROPIC_API_KEY environment variable
- Claude API access

### Installation
```bash
npm install
```

### Environment Setup
```bash
# Create .env file
ANTHROPIC_API_KEY=your_claude_api_key_here
PORT=3001
```

### Running the Server
```bash
npm start
```

## 📡 API Endpoints

### Project Generation
```http
POST /orchestrate-project
Content-Type: application/json

{
  "stackId": "react-vite-tailwind",
  "userPrompt": "Create a modern SaaS landing page for a project management tool",
  "projectName": "ProjectFlow Pro",
  "sessionId": "optional-session-id"
}
```

### Chat Interface
```http
POST /chat
Content-Type: application/json

{
  "prompt": "Your prompt here",
  "maxTokens": 2048
}
```

### File Editing
```http
POST /edit-file
Content-Type: application/json

{
  "prompt": "Add dark mode toggle to the navbar",
  "filePath": "src/components/Navbar.tsx",
  "currentContent": "existing file content"
}
```

## 🎯 Blueprint System

### Configuration Files
Each file type has a detailed blueprint that prevents Claude from generating the wrong content:

#### tsconfig.json Blueprint
- **File Type**: TypeScript Configuration
- **Purpose**: TypeScript compiler configuration
- **Validation**: Must contain compilerOptions, must NOT contain React code
- **Template**: Complete tsconfig.json structure

#### index.css Blueprint
- **File Type**: CSS Stylesheet
- **Purpose**: Main CSS with Tailwind directives
- **Validation**: Must contain @tailwind directives, must NOT contain React code
- **Template**: Tailwind setup with custom utility classes

#### vite.config.ts Blueprint
- **File Type**: Vite Configuration
- **Purpose**: Build tool configuration
- **Validation**: Must use defineConfig, must NOT contain JSX
- **Template**: Vite setup with React plugin and optimizations

### React Components
Each component blueprint includes:

#### Hero Component
- **Features**: Gradient text, glassmorphism, smooth animations
- **Design System**: Color schemes, typography, spacing
- **Animations**: Entrance effects, hover states, scroll triggers
- **Accessibility**: Semantic HTML, ARIA labels, focus management

#### Button Component
- **Variants**: Primary, secondary, outline, ghost, danger, success
- **Sizes**: sm, md, lg, xl with responsive scaling
- **Features**: Icon support, loading states, animations
- **Accessibility**: Proper button semantics, keyboard support

#### Card Component
- **Layouts**: Image top, left, right, hero, no-image
- **Features**: Hover effects, shadows, animations
- **Responsive**: Mobile-first design with breakpoints
- **Content**: Flexible rendering with children prop

## 🎨 Design Patterns

### Glassmorphism
```css
.glass-effect {
  @apply backdrop-blur-lg bg-white/10 border border-white/20;
}
```

### Gradient Backgrounds
```css
.gradient-bg {
  @apply bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500;
}
```

### Smooth Animations
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  Content with smooth entrance
</motion.div>
```

## 🔍 Quality Assurance

### Validation Rules
Each blueprint includes validation to ensure:
- **Correct File Types**: JSON for config, CSS for styles, TSX for components
- **Required Content**: Must contain specific elements/patterns
- **Forbidden Content**: Must NOT contain wrong syntax or patterns
- **File Extensions**: Proper file extensions for each type

### Error Prevention
The enhanced prompt system prevents common issues:
- **File Type Mismatches**: Clear instructions for each file type
- **React in Config Files**: Explicit warnings against JSX in JSON/CSS
- **Missing Dependencies**: Automatic scanning and inclusion
- **Build Failures**: Validation before generation

## 🚀 Performance Features

### Code Splitting
```tsx
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
```

### Image Optimization
```tsx
<img 
  src="https://images.unsplash.com/photo-..." 
  alt="Professional hero image"
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

### Animation Performance
```tsx
<motion.div
  style={{ willChange: 'transform' }}
  whileHover={{ scale: 1.05 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  Optimized hover animation
</motion.div>
```

## 🔧 Customization

### Adding New Blueprints
1. Create a new blueprint file in `blueprints/`
2. Define file type, purpose, and validation rules
3. Add to the orchestration engine
4. Update stack configurations if needed

### Modifying Design System
1. Update color schemes in blueprints
2. Modify Tailwind configuration
3. Adjust animation parameters
4. Update accessibility requirements

### Extending Features
1. Add new component types
2. Include additional dependencies
3. Enhance validation rules
4. Expand enterprise features

## 📊 Monitoring & Analytics

### Token Usage Tracking
- Automatic tracking of Claude API usage
- Per-project and per-session token counting
- Cost optimization recommendations

### Generation Quality
- File type validation
- Build success rates
- Component complexity metrics
- Performance benchmarks

## 🐛 Troubleshooting

### Common Issues

#### File Type Mismatches
**Problem**: Claude generates React components instead of config files
**Solution**: Enhanced blueprints with explicit file type instructions

#### Build Failures
**Problem**: Generated code doesn't compile
**Solution**: Validation rules and enhanced prompts

#### Missing Dependencies
**Problem**: Import errors in generated code
**Solution**: Automatic dependency scanning and inclusion

### Debug Mode
Enable detailed logging:
```bash
DEBUG=zapq:* npm start
```

## 🚀 Future Enhancements

### Planned Features
- **WebSocket Progress Updates**: Real-time generation progress
- **Template Library**: Pre-built component templates
- **Quality Scoring**: AI-powered code quality assessment
- **Custom Stacks**: User-defined technology stacks
- **Plugin System**: Extensible blueprint system

### Integration Roadmap
- **Vercel Deployment**: One-click deployment
- **GitHub Integration**: Direct repository creation
- **Design System Sync**: Figma integration
- **Performance Monitoring**: Lighthouse integration

## 🤝 Contributing

### Development Setup
```bash
git clone <repository>
cd zapq-ui-server
npm install
npm run dev
```

### Code Standards
- TypeScript for all new code
- ESLint + Prettier for formatting
- Comprehensive testing
- Documentation updates

### Blueprint Contributions
- Follow existing blueprint structure
- Include validation rules
- Add enterprise features
- Ensure accessibility compliance

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

### Documentation
- [API Reference](./docs/api.md)
- [Blueprint Guide](./docs/blueprints.md)
- [Design System](./docs/design-system.md)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Wiki for detailed guides

---

**Built with ❤️ by the ZapQ Team**

Transform your ideas into enterprise-level websites with the power of AI and modern web technologies. 
