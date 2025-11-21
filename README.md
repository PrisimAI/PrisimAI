# ✨ PrisimAI

A modern, minimalist AI platform that enables users to interact with advanced language models and generate images through a clean, ChatGPT-inspired interface.

## 🚀 Features

- **Text Chat Interface**: Real-time conversation with AI models, supporting multi-turn dialogues with context preservation
- **Image Generation**: Generate images from text descriptions using AI models
- **Conversation History**: Persistent storage of chat conversations with ability to view and continue previous sessions
- **Model Selection**: Choose between different AI models for text and image generation
- **🔐 User Authentication**: Secure account creation and login powered by Firebase
- **💎 Subscription Tiers**: Three-tier system (Free, Pro, Deluxe) with different model access and usage limits

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
