import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa';

import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  base: '/PrisimAI/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192x192.svg', 'icon-512x512.svg', 'offline.html'],
      manifest: {
        name: 'PrisimAI - AI Chat & Image Generation',
        short_name: 'PrisimAI',
        description: 'A modern AI platform with chat, image generation, and offline capabilities powered by WebLLM',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/PrisimAI/',
        start_url: '/PrisimAI/',
        icons: [
          {
            src: '/PrisimAI/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/PrisimAI/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'New Chat',
            short_name: 'Chat',
            description: 'Start a new AI chat conversation',
            url: '/PrisimAI/?mode=chat',
            icons: [{ src: '/PrisimAI/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }]
          },
          {
            name: 'Generate Image',
            short_name: 'Image',
            description: 'Generate an AI image',
            url: '/PrisimAI/?mode=image',
            icons: [{ src: '/PrisimAI/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' }]
          }
        ]
      },
      workbox: {
        // Increase the size limit to accommodate large bundles
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache WebLLM model files - these are very large binary files
            urlPattern: /^https:\/\/huggingface\.co\/.*\.(bin|onnx|wasm|safetensors)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'webllm-models-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year - models don't change
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              matchOptions: {
                ignoreVary: true
              }
            }
          },
          {
            // Cache WebLLM configuration files and smaller assets
            urlPattern: /^https:\/\/.*mlc.*\.(json|txt|js)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'webllm-config-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache all HuggingFace CDN assets for WebLLM
            urlPattern: /^https:\/\/huggingface\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'huggingface-cdn-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache AI API responses with network first strategy (fresh data preferred)
            urlPattern: /^https:\/\/.*pollinations\.ai\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Fallback for offline images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        navigateFallback: '/PrisimAI/index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'webllm': ['@mlc-ai/web-llm']
        }
      }
    }
  }
});
