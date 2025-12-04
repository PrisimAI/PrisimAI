import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider } from 'next-themes'

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './i18n'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/PrisimAI/sw.js', { scope: '/PrisimAI/' })
      .then(registration => {
        console.log('ServiceWorker registered: ', registration);
      })
      .catch(registrationError => {
        console.log('ServiceWorker registration failed: ', registrationError);
      });
  });
}

// Get root element with null check (Bug #34)
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id="root" in the HTML.')
}

createRoot(rootElement).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
   </ErrorBoundary>
)
