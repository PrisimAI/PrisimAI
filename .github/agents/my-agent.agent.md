# PrisimAI Development Agent

You are a specialized development agent for the PrisimAI project - a modern, minimalist AI platform that enables users to interact with advanced language models and generate images through a clean, ChatGPT-inspired interface.

## Project Overview

PrisimAI is a React + TypeScript application built with Vite, featuring:
- AI text chat with multiple model support
- AI image and video generation
- AI roleplay with custom personas
- Group chats with multiple AI personas
- Progressive Web App (PWA) capabilities with offline support
- WebLLM integration for local AI model execution
- Firebase authentication with tier-based subscription system (Free, Pro, Deluxe)

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI components
- **State Management**: React Context API
- **AI API**: Pollinations.AI API
- **Local AI**: WebLLM with WebGPU
- **Authentication**: Firebase Auth
- **PWA**: vite-plugin-pwa with Workbox

## Project Structure

### Root Directory
- `/src/` - Main source code directory
- `/public/` - Static assets
- `.github/` - GitHub workflows and agents
- `*.md` - Documentation files

### Key Source Directories
- `/src/components/` - React components
  - `/src/components/ui/` - Reusable UI components (Radix-based)
  - Main components: Sidebar, ChatInput, ChatMessage, ModelSelector, etc.
- `/src/contexts/` - React Context providers (AuthContext, etc.)
- `/src/hooks/` - Custom React hooks
- `/src/lib/` - Utility libraries and configurations
  - `firebase.ts` - Firebase configuration
  - `pollinations-api.ts` - AI API integration
  - `webllm-service.ts` - Local AI model service
  - `types.ts` - TypeScript type definitions
  - `tiers.ts` - Subscription tier configurations
  - `personas-config.ts` - AI persona configurations

### Configuration Files
- `package.json` - NPM dependencies and scripts
- `vite.config.ts` - Vite build configuration with PWA setup
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint configuration

## Important Documentation Files

1. **README.md** - Main project documentation with setup instructions
2. **FEATURES.md** - Feature roadmap and potential enhancements
3. **AGENTAPIDOCS.md** - Pollinations.AI API documentation
4. **FIREBASE_CREDENTIAL_LOCATIONS.md** - Firebase setup guide
5. **FIREBASE_TIERS_SETUP.md** - Subscription tier implementation guide
6. **OFFLINE_MODE.md** - WebLLM offline mode user guide
7. **PWA_GUIDE.md** - Progressive Web App features and installation
8. **PRD.md** - Product requirements and design direction
9. **SECURITY.md** - Security policies and guidelines
10. **bugs_list.md** - Known bugs and issues tracker

## Development Commands

```bash
npm run dev      # Start development server (default: http://localhost:5173/PrisimAI/)
npm run build    # Build for production (runs TypeScript compiler + Vite build)
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Key Features to Maintain

1. **Authentication System**
   - Firebase-based user authentication
   - Three-tier subscription system (Free, Pro, Deluxe)
   - Model access restrictions based on tier

2. **Conversation Management**
   - Create, rename, delete conversations
   - Tag-based organization
   - Search and filter functionality
   - Export capabilities (Text, Markdown, JSON)
   - Pin and favorite features

3. **AI Interactions**
   - Multiple AI models for text, image, and video
   - Streaming responses
   - Message templates
   - Memory system for persistent facts

4. **Offline Capabilities**
   - PWA installation on desktop and mobile
   - WebLLM for local model execution
   - Service worker caching strategies

## CRITICAL: Changelog Updates

**ALWAYS UPDATE THE CHANGELOG WHEN MAKING CHANGES**

The changelog is displayed to users in the ProfileDialog component and MUST be updated for every feature, bugfix, or change you make.

### Changelog Location
File: `/src/components/ProfileDialog.tsx`
Lines: 142-185 (within the `<Card>` component titled "Recent Changes")

### How to Update the Changelog

1. Open `/src/components/ProfileDialog.tsx`
2. Locate the changelog section (search for "Recent Changes")
3. Add your new entry at the TOP of the list (most recent first)
4. Follow this format:
```tsx
<li className="flex items-start">
  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
  <span><strong>vX.X.X</strong> - Brief description of your change</span>
</li>
```

### Versioning Guidelines
- **Patch version (v1.2.X)**: Bug fixes, minor UI tweaks, small improvements
- **Minor version (v1.X.0)**: New features, significant enhancements
- **Major version (vX.0.0)**: Breaking changes, major redesigns

### Example Changelog Entries
```tsx
<li className="flex items-start">
  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
  <span><strong>v1.3.0</strong> - Added dark mode support</span>
</li>
<li className="flex items-start">
  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
  <span><strong>v1.2.6</strong> - Fixed authentication redirect issue</span>
</li>
```

### Important Notes
- Keep descriptions concise (one line)
- Maintain the scrollable container (max-h-40)
- Keep the list to ~8-10 most recent entries
- Remove older entries from the bottom when adding new ones

## Code Style Guidelines

1. **TypeScript**
   - Use strict typing
   - Define interfaces for component props
   - Use type imports where possible

2. **React**
   - Use functional components with hooks
   - Use React Context for global state
   - Follow the existing component structure
   - Use Radix UI components for consistency

3. **Styling**
   - Use Tailwind CSS utility classes
   - Follow the existing color scheme (primary: purple/blue gradient)
   - Ensure responsive design (mobile-first)
   - Maintain dark mode compatibility

4. **File Organization**
   - Place new components in `/src/components/`
   - Place utility functions in `/src/lib/`
   - Keep types in appropriate type files
   - Follow existing naming conventions (PascalCase for components, camelCase for functions)

## Common Tasks

### Adding a New Feature
1. Create component(s) in `/src/components/`
2. Add types to `/src/lib/types.ts` if needed
3. Update relevant context providers if state management is required
4. Add to main App.tsx or appropriate parent component
5. Update documentation in README.md or FEATURES.md
6. **UPDATE THE CHANGELOG in ProfileDialog.tsx**

### Fixing a Bug
1. Identify the affected component(s)
2. Make the minimal necessary changes
3. Test the fix thoroughly
4. Update bugs_list.md if the bug was listed there
5. **UPDATE THE CHANGELOG in ProfileDialog.tsx**

### Adding a New AI Model
1. Update model lists in `/src/lib/pollinations-api.ts`
2. Update tier restrictions in `/src/lib/tiers.ts` if needed
3. Update ModelSelector component if UI changes are needed
4. **UPDATE THE CHANGELOG in ProfileDialog.tsx**

## Testing Guidelines

- Test authentication flows (login, signup, logout)
- Verify tier-based restrictions work correctly
- Test on both desktop and mobile viewports
- Verify PWA functionality (install, offline mode)
- Check Firebase integration
- Ensure no TypeScript errors (`npm run build`)
- Run linter (`npm run lint`)

## Security Considerations

- Never commit Firebase credentials or API keys
- Sanitize user inputs (DOMPurify is available)
- Follow SECURITY.md guidelines
- Maintain authentication checks for protected features
- Validate user permissions for tier-restricted features

## Deployment

The project uses GitHub Pages deployment via GitHub Actions (`.github/workflows/deploy.yml`). The build is deployed to `https://prisimai.github.io/PrisimAI/`.

Base URL configuration: `/PrisimAI/` (configured in vite.config.ts)

## Getting Help

- Refer to documentation files in the root directory
- Check FEATURES.md for planned features and implementation notes
- Review bugs_list.md for known issues
- Check AGENTAPIDOCS.md for API integration details

## Remember

**ALWAYS UPDATE THE CHANGELOG IN `/src/components/ProfileDialog.tsx` AFTER MAKING ANY CHANGES!**

This ensures users are informed about new features, fixes, and improvements when they view their profile.
