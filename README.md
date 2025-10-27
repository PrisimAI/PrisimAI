[![pages-build-deployment](https://github.com/PrisimAI/PrisimAI/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/PrisimAI/PrisimAI/actions/workflows/pages/pages-build-deployment)

# PrisimAI

PrisimAI is a progressive web app (PWA) that lets you chat with models powered by Pollinations.ai. It’s designed to look sleek, run fast, and stay usable even when offline. Once installed, PrisimAI behaves like a native app on desktop or mobile, complete with icons, splash screens, and offline support.

## ✨ Features

- Chat Interface – Seamless, modern chat UI built with Tailwind CSS.
- Model Selection – Choose different AI models from Pollinations API.
- PWA Support – Installable on desktop and mobile, with offline caching.
- Offline Mode – Displays a custom offline page when there’s no internet, styled to match the site theme with a retry button.
- Theming – Colors and fonts configured for a clean, modern experience.
- Cross-Platform Support – Works on Chrome, Edge, Safari, and mobile browsers.

## 🚀 Getting Started
### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/prisimai.git
cd prisimai
```

### 2. Add Icons
Place your generated icons in the /icons folder.

**Required:** icon-192.png and icon-512.png

*Optional:* Apple Touch Icon (apple-touch-icon.png) and favicons

If you don’t already have icons, you can generate them using a favicon generator (e.g. favicon.io).

### 3. Run Locally
You need a local server to test service workers (they don’t run from file://).

*Quick option: use Python’s HTTP server:*
```bash
# Python 3
python -m http.server 8080
```

### 4. Offline Page Styling
When you are offline, PrisimAI will show a dedicated offline page matching the dark theme of the app, with a concise message and a retry button.

This is cached by the service worker and does not require internet access to display.