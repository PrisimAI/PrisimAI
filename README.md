# ✨ PrisimAI

A modern, minimalist AI platform that enables users to interact with advanced language models and generate images through a clean, ChatGPT-inspired interface.

## 🚀 Features

- **Text Chat Interface**: Real-time conversation with AI models, supporting multi-turn dialogues with context preservation
- **Image Generation**: Generate images from text descriptions using AI models
- **Conversation History**: Persistent storage of chat conversations with ability to view and continue previous sessions
- **Model Selection**: Choose between different AI models for text and image generation
- **🔐 User Authentication**: Secure account creation and login powered by Firebase
- **💎 Subscription Tiers**: Three-tier system (Free, Pro, Deluxe) with different model access and usage limits
- **🔌 Offline Mode** *(Experimental)*: Run AI models locally in your browser using WebLLM and WebGPU

## 🛠️ Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- A Firebase account (for authentication features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PrisimAI/PrisimAI.git
   cd PrisimAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase authentication:
   - Follow the detailed instructions in [`FIREBASE_CREDENTIAL_LOCATIONS.md`](./FIREBASE_CREDENTIAL_LOCATIONS.md)
   - Add your Firebase credentials directly to `/src/lib/firebase.ts`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local development URL (typically `http://localhost:5173/PrisimAI/`)

## 🔌 Offline Mode (Experimental)

PrisimAI now supports running AI models directly in your browser without an internet connection using WebLLM and WebGPU.

### Requirements

- **Browser**: Chrome 113+ or Edge 113+ (browsers with WebGPU support)
- **GPU**: Modern GPU with WebGPU support
- **Storage**: 2-5 GB of free disk space for model caching

### How to Use

1. **Enable Offline Mode**:
   - Click on your profile icon in the sidebar
   - Select "Offline Mode" from the menu
   - The system will check if your browser supports WebGPU

2. **Select and Download a Model**:
   - Choose from available models:
     - **Llama 3.2 3B** (1.8 GB) - Recommended for most tasks
     - **Llama 3.1 8B** (4.5 GB) - More powerful for complex tasks
     - **Phi 3.5 Mini** (2.2 GB) - Optimized for speed
   - Toggle "Enable Offline Mode"
   - Wait for the model to download (may take several minutes on first use)

3. **Chat Offline**:
   - Once enabled, your chats will use the local model
   - An "Offline Mode" badge will appear in the model selector
   - Models are cached in your browser for future use

### Important Notes

- First-time model download can take 5-10 minutes depending on your connection
- Models are stored in browser cache and persist across sessions
- Performance depends on your GPU capabilities
- Offline mode only works for text chat, not image generation
- You can disable offline mode at any time to switch back to online models

## 📚 Documentation

- **[Firebase Setup Guide](./FIREBASE_CREDENTIAL_LOCATIONS.md)**: Complete guide for setting up authentication with Firebase
- **[Tier System Setup](./FIREBASE_TIERS_SETUP.md)**: Comprehensive guide for implementing Free, Pro, and Deluxe subscription tiers
- **[Quick Tier Setup Reference](./QUICK_TIER_SETUP.md)**: Condensed checklist for tier implementation
- **[Product Requirements](./PRD.md)**: Detailed product requirements and design direction

## 🏗️ Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📄 License

This project is licensed under the MIT License.
