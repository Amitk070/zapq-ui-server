export function buildProjectGenPrompt(userPrompt: string): string {
  // Extract project details from the user prompt
  const isReactProject = userPrompt.toLowerCase().includes('react') || userPrompt.toLowerCase().includes('vite');
  const isNodeProject = userPrompt.toLowerCase().includes('node') || userPrompt.toLowerCase().includes('express');
  
  // Determine project type from prompt
  let projectTemplate = 'landing-page'; // default
  if (userPrompt.includes('dashboard')) projectTemplate = 'dashboard';
  else if (userPrompt.includes('ecommerce') || userPrompt.includes('store')) projectTemplate = 'ecommerce';
  else if (userPrompt.includes('blog')) projectTemplate = 'blog';
  else if (userPrompt.includes('portfolio')) projectTemplate = 'portfolio';
  else if (userPrompt.includes('chat')) projectTemplate = 'chat-app';
  else if (userPrompt.includes('social')) projectTemplate = 'social-media';
  else if (userPrompt.includes('crm')) projectTemplate = 'crm';
  else if (userPrompt.includes('booking')) projectTemplate = 'booking-system';
  else if (userPrompt.includes('learning') || userPrompt.includes('education')) projectTemplate = 'learning-platform';
  else if (userPrompt.includes('fitness') || userPrompt.includes('health')) projectTemplate = 'fitness-tracker';
  else if (userPrompt.includes('restaurant') || userPrompt.includes('menu')) projectTemplate = 'restaurant-menu';
  else if (userPrompt.includes('gallery') || userPrompt.includes('photo')) projectTemplate = 'photo-gallery';
  else if (userPrompt.includes('music') || userPrompt.includes('player')) projectTemplate = 'music-player';

  const getProjectInstructions = (template: string) => {
    switch (template) {
      case 'dashboard':
        return `
        Create a modern admin dashboard with:
        - Clean layout with sidebar navigation
        - Dashboard overview with charts (Chart.js or recharts)
        - Data tables with sorting and filtering
        - User management interface
        - Settings and profile pages
        - Responsive design
        - Dark mode support
        `;
      
      case 'ecommerce':
        return `
        Create a complete e-commerce application with:
        - Product listing and detail pages
        - Shopping cart functionality
        - Checkout process (mock payment)
        - User authentication
        - Product search and filtering
        - Admin panel for products
        - Responsive design
        - Modern UI with animations
        `;
      
      case 'blog':
        return `
        Create a modern blog platform with:
        - Homepage with featured posts
        - Individual blog post pages
        - Category and tag system
        - Author profiles
        - Comment system (UI only)
        - Search functionality
        - Admin interface for posts
        - SEO-friendly structure
        `;
      
      case 'portfolio':
        return `
        Create a complete, professional portfolio website with:
        
        **Hero Section:**
        - Professional headshot or avatar
        - Name and professional title (e.g., "Full Stack Developer")
        - Brief tagline/elevator pitch
        - Call-to-action buttons (Contact, Download Resume)
        - Professional background gradient or pattern
        
        **About Section:**
        - Professional summary (3-4 sentences)
        - Technical skills with progress bars or icons
        - Years of experience
        - Current role/status
        - Personal interests (optional)
        
        **Projects Showcase:**
        - At least 3-4 sample projects with:
          * Project names and descriptions
          * Technology stack used
          * Live demo and GitHub links (placeholder)
          * Project screenshots (use placeholder images)
          * Key features and achievements
        
        **Experience/Timeline:**
        - Work experience or education timeline
        - Company names, roles, and dates
        - Key responsibilities and achievements
        - Technologies used in each role
        
        **Testimonials Section:**
        - 2-3 professional testimonials with:
          * Client/colleague names and titles
          * Company names
          * Professional photos (placeholder)
          * Meaningful review content
        
        **Contact Section:**
        - Contact form with name, email, message fields
        - Professional email and phone
        - Social media links (LinkedIn, GitHub, Twitter)
        - Location (city/state)
        - Professional availability status
        
        **Design Requirements:**
        - Modern, clean design with professional color scheme
        - Dark/light mode toggle
        - Smooth scroll animations and hover effects
        - Mobile-responsive design (mobile-first)
        - Professional typography
        - Consistent spacing and layout
        - Loading animations for better UX
        
        **Technical Features:**
        - React components for each section
        - TypeScript for type safety
        - Tailwind CSS for styling
        - Lucide React icons
        - Proper SEO meta tags
        - Accessibility compliance (ARIA labels)
        - Performance optimization
        
        **Content Requirements:**
        - Use realistic, professional content (not Lorem Ipsum)
        - Include actual skill names and technologies
        - Professional writing tone
        - Complete, deployable portfolio ready for use
        `;
      
      case 'chat-app':
        return `
        Create a real-time chat application with:
        - Chat room interface
        - Message list with timestamps
        - User list sidebar
        - Message sending form
        - Emoji support
        - File sharing UI
        - Responsive layout
        - Modern messaging design
        `;
      
      case 'social-media':
        return `
        Create a social media platform with:
        - News feed with posts
        - User profiles
        - Post creation interface
        - Like and comment system
        - Follow/unfollow functionality
        - Notification system
        - Photo sharing
        - Responsive design
        `;
      
      case 'crm':
        return `
        Create a CRM system with:
        - Customer database
        - Lead management
        - Sales pipeline
        - Contact management
        - Activity tracking
        - Reporting dashboard
        - Search and filtering
        - Professional UI
        `;
      
      case 'booking-system':
        return `
        Create a booking system with:
        - Calendar interface
        - Appointment scheduling
        - Time slot selection
        - Customer information forms
        - Booking confirmation
        - Admin booking management
        - Email notifications (UI)
        - Mobile-friendly design
        `;
      
      case 'learning-platform':
        return `
        Create an online learning platform with:
        - Course catalog
        - Video player interface
        - Progress tracking
        - Quiz system
        - Student dashboard
        - Course enrollment
        - Certificate generation (UI)
        - Interactive learning tools
        `;
      
      case 'fitness-tracker':
        return `
        Create a fitness tracking app with:
        - Workout logging
        - Exercise database
        - Progress charts
        - Goal setting
        - Workout plans
        - Nutrition tracking
        - Statistics dashboard
        - Motivational features
        `;
      
      case 'restaurant-menu':
        return `
        Create a digital restaurant menu with:
        - Menu categories
        - Item descriptions and prices
        - Image gallery
        - Order cart system
        - Table reservation
        - Contact information
        - Location and hours
        - Mobile-optimized design
        `;
      
      case 'photo-gallery':
        return `
        Create a photo gallery application with:
        - Grid layout for photos
        - Lightbox for viewing
        - Photo upload interface
        - Albums and categories
        - Search functionality
        - Tags and descriptions
        - Slideshow feature
        - Responsive image handling
        `;
      
      case 'music-player':
        return `
        Create a music player with:
        - Audio player controls
        - Playlist management
        - Song library
        - Search functionality
        - Now playing interface
        - Volume controls
        - Shuffle and repeat
        - Modern player design
        `;
      
      default: // landing-page
        return `
        Create a modern landing page with:
        - Hero section with call-to-action
        - Features section
        - About section
        - Testimonials
        - Contact form
        - Footer with links
        - Smooth scrolling
        - Mobile-responsive design
        `;
    }
  };

  if (isNodeProject) {
    return `
You are a senior Node.js developer.

Create a complete Node.js application using Express.js with the following specifications:

Project Context: ${userPrompt}
Template: ${projectTemplate}

${getProjectInstructions(projectTemplate)}

Required files:
- package.json (with all necessary dependencies)
- server.js or app.js (main entry point)
- routes/ directory with API routes
- models/ directory with data models
- middleware/ directory with custom middleware
- public/ directory for static files
- views/ directory if using templates
- .env.example (environment variables template)
- README.md (setup instructions)

Technical Requirements:
- Use Express.js framework
- Include CORS for cross-origin requests
- Add basic error handling middleware
- Include logging (morgan or winston)
- Use environment variables for configuration
- Include input validation
- Add rate limiting for APIs
- Follow RESTful API design
- Include proper error responses
- Add basic security headers

Generate production-ready code with:
- Proper error handling
- Input validation
- Security best practices
- Clean code structure
- Comprehensive comments
- Functional API endpoints

Return ONLY a JSON array of file objects:
[
  { "path": "package.json", "content": "..." },
  { "path": "server.js", "content": "..." },
  { "path": "routes/api.js", "content": "..." }
]

Do not include explanations or markdown. Output must be clean JSON only.
    `.trim();
  }

  // Default to React project
  return `
You are a senior React developer with expertise in modern web development.

Create a complete React + TypeScript + Tailwind CSS application using Vite with the following specifications:

Project Context: ${userPrompt}
Template: ${projectTemplate}

${getProjectInstructions(projectTemplate)}

Required files structure:
- package.json (with all necessary dependencies)
- vite.config.ts (Vite configuration)
- tsconfig.json (TypeScript configuration)
- tailwind.config.js (Tailwind CSS configuration)
- postcss.config.js (PostCSS configuration)
- index.html (main HTML file)
- src/index.css (global styles with Tailwind imports)
- src/main.tsx (React entry point)
- src/App.tsx (main App component)
- src/components/ (reusable UI components)
- src/pages/ (page components)
- src/hooks/ (custom React hooks if needed)
- src/utils/ (utility functions)
- src/types/ (TypeScript type definitions)
- README.md (project documentation)

Technical Requirements:
- Use functional components with hooks
- Implement TypeScript with proper types
- Use Tailwind CSS for styling
- Include responsive design
- Add smooth animations and transitions
- Implement proper state management
- Include error boundaries
- Add loading states
- Use semantic HTML elements
- Include accessibility features
- Follow React best practices
- Add proper commenting

UI/UX Requirements:
- Modern, clean design
- Consistent color scheme
- Professional typography
- Intuitive navigation
- Mobile-first responsive design
- Loading states and transitions
- Error handling UI
- Accessibility compliance
- Cross-browser compatibility

Generate production-ready, deployable code with:
- Complete functionality for the specified template
- Real content (not lorem ipsum)
- Working interactions
- Professional styling
- Proper component structure
- Type safety throughout
- Performance optimizations
- SEO-friendly structure

Return ONLY a JSON array of file objects with complete, functional code:
[
  { "path": "package.json", "content": "..." },
  { "path": "src/App.tsx", "content": "..." },
  { "path": "src/components/Header.tsx", "content": "..." }
]

Do not include explanations, markdown formatting, or comments outside the code. Output must be clean JSON only.
  `.trim();
} 
