# ✨ PrisimAI

A modern, minimalist AI platform that enables users to interact with advanced language models and generate images through a clean, ChatGPT-inspired interface.

## 🚀 Features

- **Text Chat Interface**: Real-time conversation with AI models, supporting multi-turn dialogues with context preservation
- **Image Generation**: Generate images from text descriptions using AI models
- **Conversation History**: Persistent storage of chat conversations with ability to view and continue previous sessions
- **Model Selection**: Choose between different AI models for text and image generation
- **🔐 User Authentication**: Secure account creation and login powered by Supabase

## 🛠️ Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- A Supabase account (for authentication features)

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

3. Configure Supabase authentication:
   - Copy `.env.example` to `.env`
   - Follow the detailed instructions in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
   - Add your Supabase credentials to `.env`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local development URL (typically `http://localhost:5000`)

## 📚 Documentation

- **[Supabase Setup Guide](./SUPABASE_SETUP.md)**: Complete guide for setting up authentication
- **[Product Requirements](./PRD.md)**: Detailed product requirements and design direction

## 🏗️ Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
