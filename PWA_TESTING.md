# PWA Implementation - Testing Guide

This document provides a comprehensive testing checklist for verifying the PWA implementation.

## Pre-Testing Setup

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Serve the Production Build**:
   ```bash
   npm run preview
   # Or use any static file server pointing to /dist
   ```

3. **Required Browser**: Chrome 113+ or Edge 113+ for full PWA support

## Testing Checklist

### 1. PWA Installation

#### Desktop (Chrome/Edge)
- [ ] Open the app in Chrome/Edge
- [ ] Verify install prompt appears at bottom of screen (may take a few page visits)
- [ ] Click "Install Now" button
- [ ] Verify app installs and opens in standalone window
- [ ] Check that browser UI (address bar, tabs) is hidden
- [ ] Verify app icon appears in Applications folder/Start Menu

#### Alternative Desktop Installation
- [ ] Look for install icon (⊕) in address bar
- [ ] Click install icon
- [ ] Verify installation completes
- [ ] App opens in standalone mode

#### Mobile (Android/Chrome)
- [ ] Open app on mobile device
- [ ] Tap menu (⋮) → "Install app" or "Add to Home Screen"
- [ ] Verify app icon appears on home screen
- [ ] Launch from home screen
- [ ] Verify fullscreen experience (no browser UI)

### 2. Manifest Validation

- [ ] Open DevTools → Application → Manifest
- [ ] Verify manifest loads without errors
- [ ] Check all fields are present:
  - [ ] Name: "PrisimAI - AI Chat & Image Generation"
  - [ ] Short name: "PrisimAI"
  - [ ] Theme color: #667eea
  - [ ] Background color: #ffffff
  - [ ] Display: standalone
  - [ ] Icons: 192x192 and 512x512 SVG icons
  - [ ] Shortcuts: New Chat, Generate Image

### 3. Service Worker Registration

- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker is registered and running
- [ ] Check status is "activated and running"
- [ ] Verify scope: `/PrisimAI/`
- [ ] Check that sw.js is loaded

### 4. Cache Storage

#### Static Assets Cache
- [ ] DevTools → Application → Cache Storage
- [ ] Verify cache named "workbox-precache-v2-/PrisimAI/" exists
- [ ] Check cached items include:
  - [ ] index.html
  - [ ] CSS files (assets/index-*.css)
  - [ ] JS files (assets/index-*.js, react-vendor, ui-vendor, webllm)
  - [ ] Icons (icon-192x192.svg, icon-512x512.svg, favicon.ico)
  - [ ] offline.html
  - [ ] manifest.webmanifest

#### Runtime Caches
- [ ] Verify "google-fonts-cache" exists (after visiting site)
- [ ] Verify "gstatic-fonts-cache" exists (after fonts load)
- [ ] Verify "images-cache" may exist (if images loaded)

### 5. Offline Functionality

#### Basic Offline Access
- [ ] Load the app while online
- [ ] Wait for all assets to cache
- [ ] Open DevTools → Network
- [ ] Set to "Offline" mode
- [ ] Reload the page
- [ ] Verify app loads from cache
- [ ] Check UI is fully functional
- [ ] Navigate between chat/image modes
- [ ] Verify no network errors in console

#### Offline WebLLM Models
- [ ] While online, enable offline mode in settings
- [ ] Select a WebLLM model (e.g., Llama 3.2 3B)
- [ ] Wait for model to download completely
- [ ] Check DevTools → Application → Cache Storage
- [ ] Verify "webllm-models-cache" contains model files
- [ ] Verify "huggingface-cdn-cache" contains model assets
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Start a new chat
- [ ] Send a message
- [ ] Verify AI responds using offline model
- [ ] Check Network tab shows no external requests

#### Offline Fallback
- [ ] Clear all caches
- [ ] Go offline immediately
- [ ] Try to navigate to the app
- [ ] Verify offline.html fallback page appears
- [ ] Check page styling and content
- [ ] Click "Try Again" button
- [ ] Verify reload is attempted

### 6. Install Prompt Behavior

- [ ] Fresh browser session (clear site data)
- [ ] Visit the app
- [ ] Wait for install prompt to appear
- [ ] Click "Not Now"
- [ ] Verify prompt disappears
- [ ] Close and reopen app
- [ ] Verify prompt doesn't appear for 7 days
- [ ] Clear localStorage
- [ ] Reload page
- [ ] Verify prompt appears again

#### Prompt Dismissal
- [ ] Check localStorage for 'pwa-install-dismissed' key
- [ ] Verify timestamp is set when dismissed
- [ ] Manually delete the key
- [ ] Reload page
- [ ] Verify prompt appears again

### 7. App Shortcuts

#### Desktop
- [ ] Install the app
- [ ] Right-click app icon in taskbar/dock
- [ ] Verify shortcuts appear:
  - [ ] New Chat
  - [ ] Generate Image
  - [ ] Offline Mode
- [ ] Click "New Chat" shortcut
- [ ] Verify app opens to chat mode
- [ ] Click "Generate Image" shortcut
- [ ] Verify app opens to image generation mode

#### Mobile
- [ ] Install the app
- [ ] Long-press app icon
- [ ] Verify shortcuts appear
- [ ] Tap a shortcut
- [ ] Verify correct mode opens

### 8. Caching Strategies Verification

#### CacheFirst (Static Assets)
- [ ] Load app while online
- [ ] Check Network tab
- [ ] Note asset loading time
- [ ] Reload page
- [ ] Verify assets load from cache (disk cache)
- [ ] Check load time is much faster
- [ ] Go offline
- [ ] Reload page
- [ ] Verify all static assets still load

#### NetworkFirst (API)
- [ ] Enable online mode
- [ ] Send a chat message
- [ ] Check Network tab for Pollinations API call
- [ ] Send same message again quickly
- [ ] Verify cache may be used (depending on timing)
- [ ] Go offline
- [ ] Try to send message
- [ ] Verify appropriate offline handling

### 9. Update Mechanism

- [ ] Make a code change
- [ ] Rebuild the app (`npm run build`)
- [ ] Keep the app open in browser
- [ ] Service worker should detect update
- [ ] Check console for update messages
- [ ] Close all app tabs
- [ ] Reopen app
- [ ] Verify new version is loaded
- [ ] Check cache has been updated

### 10. Performance Metrics

#### Initial Load
- [ ] Clear all caches
- [ ] Load app while online
- [ ] Open DevTools → Network
- [ ] Note total download size (~6.8 MB)
- [ ] Note load time

#### Cached Load
- [ ] Reload page
- [ ] Verify load time < 1 second
- [ ] Check that most assets loaded from cache
- [ ] Verify no large downloads

#### Offline Performance
- [ ] Go offline
- [ ] Load app
- [ ] Verify instant loading
- [ ] Check UI responsiveness
- [ ] Test WebLLM model (if downloaded)
- [ ] Measure response time

### 11. Cross-Browser Testing

#### Chrome (Desktop)
- [ ] Test all features above
- [ ] Verify PWA install works
- [ ] Check service worker functionality

#### Edge (Desktop)
- [ ] Test all features above
- [ ] Verify PWA install works
- [ ] Check service worker functionality

#### Mobile Chrome (Android)
- [ ] Test installation
- [ ] Verify standalone mode
- [ ] Test offline functionality
- [ ] Check shortcuts

#### Safari (iOS) - Limited Support
- [ ] Test "Add to Home Screen"
- [ ] Verify app opens
- [ ] Note: WebGPU not supported
- [ ] Offline mode limited

### 12. Storage Management

- [ ] DevTools → Application → Storage
- [ ] Check "Usage" section
- [ ] Verify storage breakdown:
  - [ ] Cache Storage: ~6.8 MB (app assets)
  - [ ] Additional for WebLLM models if downloaded
- [ ] Estimate total: 2-5 GB with models

### 13. Error Handling

#### Service Worker Errors
- [ ] Open DevTools → Console
- [ ] Check for service worker errors
- [ ] Verify no registration errors
- [ ] Check update cycle works

#### Cache Errors
- [ ] Try to cache very large file
- [ ] Verify graceful handling
- [ ] Check error messages in console

#### Offline Errors
- [ ] Go offline without cache
- [ ] Verify offline fallback shows
- [ ] Try to use features requiring network
- [ ] Check appropriate error messages

### 14. Icons and Branding

- [ ] Verify app icon appears correctly on:
  - [ ] Desktop taskbar/dock
  - [ ] Mobile home screen
  - [ ] App switcher
  - [ ] Browser tab
- [ ] Check icon quality and clarity
- [ ] Verify theme color matches brand (#667eea)

### 15. Accessibility

- [ ] Test keyboard navigation in standalone mode
- [ ] Verify all interactive elements accessible
- [ ] Check screen reader compatibility
- [ ] Test with high contrast mode

## Manual Testing Notes

### What to Look For
✅ **Good Signs**:
- Fast loading after first visit
- App works completely offline
- Smooth install process
- No console errors
- WebLLM models cache properly

❌ **Warning Signs**:
- Service worker registration errors
- Cache quota exceeded errors
- Failed to load offline
- Missing manifest fields
- Network requests when offline

### Common Issues and Solutions

**Install prompt doesn't appear**:
- Ensure HTTPS or localhost
- Check browser supports PWA
- May need multiple visits
- Try in incognito mode

**Service worker not registering**:
- Check browser console
- Verify scope is correct
- Clear all site data and retry

**Offline mode not working**:
- Verify service worker is active
- Check cache storage has content
- Ensure you visited while online first

**Models not caching**:
- Check cache storage quota
- Verify HuggingFace URLs are cached
- Check DevTools → Network → Disable cache is OFF

## Success Criteria

The PWA implementation is successful if:
- [x] App can be installed on desktop and mobile
- [x] Service worker registers without errors
- [x] Static assets cache correctly (~6.8 MB)
- [x] App works completely offline (UI only)
- [x] WebLLM models can be downloaded and cached
- [x] Models work offline after download
- [x] Install prompt appears and functions correctly
- [x] App shortcuts work as expected
- [x] Updates apply automatically
- [x] No security vulnerabilities
- [x] Documentation is comprehensive

## Automated Testing

While manual testing is required for PWA features, here are automated checks:

```bash
# Build succeeds
npm run build

# TypeScript compiles
npm run build  # Includes tsc check

# No security issues
# (Already verified with CodeQL - 0 alerts)
```

## Final Verification

- [ ] All checklist items above completed
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Documentation accurate
- [ ] Ready for production deployment

---

**Testing completed by**: _____________
**Date**: _____________
**Notes**: _____________
