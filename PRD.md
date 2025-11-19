# Planning Guide

A modern, minimalist AI platform that enables users to interact with advanced language models and generate images through a clean, ChatGPT-inspired interface.

**Experience Qualities**: 
1. **Effortless** - Interactions should feel natural and require minimal cognitive load, with the AI interface fading into the background
2. **Intelligent** - The interface should feel responsive and adaptive, providing instant feedback and smart suggestions
3. **Refined** - Every element should feel polished and purposeful, with attention to subtle details that elevate the experience

**Complexity Level**: Light Application (multiple features with basic state)
  - The app provides both text chat and image generation capabilities with conversation history persistence, but maintains a simple, focused interface without complex account management or advanced settings

## Essential Features

### Text Chat Interface
- **Functionality**: Real-time conversation with AI models, supporting multi-turn dialogues with context preservation
- **Purpose**: Enable users to get answers, brainstorm ideas, and have natural conversations with AI
- **Trigger**: User types message and presses Enter or clicks send button
- **Progression**: User enters prompt → Message appears in chat → Loading indicator shows → AI response streams in → Response completes → User can continue conversation
- **Success criteria**: Messages persist across sessions, responses are coherent and contextual, streaming provides real-time feedback

### Image Generation
- **Functionality**: Generate images from text descriptions using AI models
- **Purpose**: Allow users to create visual content through natural language descriptions
- **Trigger**: User switches to image mode and enters a prompt
- **Progression**: User selects image mode → Enters description → Clicks generate → Loading state displays → Generated image appears → User can download or generate variations
- **Success criteria**: Images generate successfully, multiple model options available, results display clearly with download capability

### Conversation History
- **Functionality**: Persistent storage of chat conversations with ability to view and continue previous sessions
- **Purpose**: Allow users to maintain context and return to previous conversations
- **Trigger**: Automatic save on each message, sidebar displays conversation list
- **Progression**: New conversation creates entry → Each message auto-saves → User can click to switch conversations → Previous context loads instantly
- **Success criteria**: All conversations persist between sessions, switching is instant, conversations can be deleted

### Model Selection
- **Functionality**: Choose between different AI models for text and image generation
- **Purpose**: Give users control over the AI behavior and capabilities for different use cases
- **Trigger**: User clicks model selector dropdown
- **Progression**: User opens dropdown → Available models display with descriptions → User selects model → Selection persists for session
- **Success criteria**: Models load dynamically from API, selection affects generation behavior, clear model descriptions

## Edge Case Handling
- **Empty conversations** - Display welcoming empty state with example prompts to guide first-time users
- **API failures** - Show clear error messages with retry options, don't lose user's input on failure
- **Long responses** - Implement smooth scrolling and virtualization for very long chat histories
- **Rate limiting** - Display informative messages about rate limits and when user can try again
- **Network issues** - Gracefully handle offline state with cached conversations still viewable

## Design Direction
The design should feel modern, clean, and intelligent - similar to ChatGPT's refined simplicity but with a unique visual identity through the "Prism" concept. The interface should be minimal to keep focus on the content, with subtle prismatic color accents that suggest light refraction and AI intelligence. The overall aesthetic should feel professional yet approachable, technical yet human.

## Color Selection
Custom palette - A sophisticated neutral foundation with prismatic accent colors that evoke the refraction of light through a prism, suggesting the multi-faceted nature of AI intelligence.

- **Primary Color**: Deep Indigo `oklch(0.35 0.15 270)` - Represents intelligence, depth, and technology. Used for primary actions and brand elements
- **Secondary Colors**: 
  - Soft Violet `oklch(0.75 0.12 285)` for secondary UI elements
  - Cool Cyan `oklch(0.70 0.15 210)` for information and highlights
  - Subtle Magenta `oklch(0.68 0.18 330)` for image generation mode
- **Accent Color**: Vibrant Electric Blue `oklch(0.65 0.25 240)` - Attention-grabbing highlight for CTAs, active states, and important interactive elements
- **Foreground/Background Pairings**:
  - Background (Pure White `oklch(0.99 0 0)`): Dark Gray text `oklch(0.25 0 0)` - Ratio 14.2:1 ✓
  - Card (Soft Gray `oklch(0.97 0 0)`): Dark Gray text `oklch(0.25 0 0)` - Ratio 13.5:1 ✓
  - Primary (Deep Indigo `oklch(0.35 0.15 270)`): White text `oklch(0.99 0 0)` - Ratio 8.5:1 ✓
  - Secondary (Soft Violet `oklch(0.75 0.12 285)`): Dark text `oklch(0.25 0 0)` - Ratio 5.2:1 ✓
  - Accent (Electric Blue `oklch(0.65 0.25 240)`): White text `oklch(0.99 0 0)` - Ratio 4.8:1 ✓
  - Muted (Light Gray `oklch(0.94 0 0)`): Medium Gray text `oklch(0.50 0 0)` - Ratio 7.8:1 ✓

## Font Selection
The typeface should feel modern, highly legible, and slightly geometric to suggest precision and technology while remaining warm and approachable. Inter is ideal for its excellent screen readability, subtle tech aesthetic, and comprehensive weight range.

- **Typographic Hierarchy**: 
  - H1 (Brand Title): Inter SemiBold/32px/tight letter-spacing (-0.02em) - Used for PrismAI logo
  - H2 (Section Headers): Inter Medium/20px/normal tracking - For empty state titles
  - Body (Chat Messages): Inter Regular/15px/relaxed line-height (1.6) - Primary readable text
  - Small (Timestamps, Labels): Inter Medium/13px/slight letter-spacing (0.01em) - Secondary information
  - Code: Inter Regular/14px/monospace fallback - For code blocks in responses

## Animations
Animations should feel intelligent and purposeful - subtle micro-interactions that provide feedback without drawing attention away from content. Motion should suggest the smooth, fluid nature of AI thinking, with gentle easing curves that feel natural.

- **Purposeful Meaning**: Streaming text animations suggest AI "thinking" and generating in real-time; smooth transitions between conversations maintain spatial context; hover states provide subtle feedback suggesting interactivity
- **Hierarchy of Movement**: 
  - Critical: Message send/receive animations, streaming text indicators
  - Important: Page transitions, sidebar expand/collapse, model selection
  - Subtle: Button hover states, input focus rings, tooltip appearances
  - Delightful: Prismatic shimmer on logo, gradient shifts on generation

## Component Selection
- **Components**: 
  - `Button` for primary actions (send, generate) with primary variant and icon support
  - `Input` and `Textarea` for message composition with clean focus states
  - `ScrollArea` for chat history with smooth scrolling behavior
  - `Select` for model selection dropdown with descriptions
  - `Card` for message bubbles with subtle shadows
  - `Separator` for visual division between sections
  - `Dialog` for confirmation modals (delete conversation)
  - `Avatar` for user/AI message indicators
  - `Skeleton` for loading states during API calls
  - `Tabs` for switching between chat and image modes
- **Customizations**: 
  - Custom message bubble component with gradient backgrounds for AI messages
  - Streaming text component with cursor animation
  - Image generation grid with aspect ratio handling
  - Sidebar conversation list with hover states and active indicators
- **States**: 
  - Buttons: Subtle scale on hover (0.98), pressed state with slight shadow reduction, disabled state with opacity
  - Inputs: Focused state with accent color ring, error state with destructive color, success validation
  - Messages: Sending state with opacity, error state with retry option, streaming state with animated cursor
- **Icon Selection**: 
  - `PaperPlaneRight` for send message
  - `Image` for image generation mode
  - `ChatCircle` for chat mode
  - `Plus` for new conversation
  - `Trash` for delete conversation
  - `ArrowClockwise` for retry/regenerate
  - `DownloadSimple` for download image
  - `Sparkle` for AI branding elements
- **Spacing**: 
  - Container padding: `p-6` (24px) on desktop, `p-4` (16px) on mobile
  - Message gaps: `gap-4` (16px) between messages
  - Sidebar items: `gap-2` (8px) vertical spacing
  - Button padding: `px-4 py-2` for regular, `px-6 py-3` for primary CTAs
- **Mobile**: 
  - Sidebar collapses to overlay drawer on mobile
  - Input area becomes fixed bottom bar
  - Message bubbles reduce padding and font size slightly
  - Single column layout with hamburger menu for navigation
  - Image generation results stack vertically
  - Touch-optimized tap targets (minimum 44px)
