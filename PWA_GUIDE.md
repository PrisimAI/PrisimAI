# 📱 Progressive Web App (PWA) Guide

PrisimAI is a fully-featured Progressive Web App that provides a native app-like experience on any device with powerful offline capabilities.

## What is a PWA?

A Progressive Web App combines the best of web and native apps. You can:
- Install it on your device like a native app
- Use it offline without an internet connection
- Get faster loading times through intelligent caching
- Receive automatic updates
- Access it from your home screen or dock

## Installing PrisimAI as a PWA

### Desktop Installation (Chrome, Edge, Brave)

1. **Automatic Prompt**:
   - When you visit PrisimAI, you may see an install prompt at the bottom of the screen
   - Click "Install Now" to install the app
   
2. **Manual Installation**:
   - Look for the install icon (⊕ or computer icon) in the address bar
   - Click it and confirm the installation
   - Or go to browser menu → "Install PrisimAI"

3. **After Installation**:
   - The app will open in its own window (no browser UI)
   - An app icon will be added to your desktop/applications folder
   - Launch it anytime from your system like any other app

### Mobile Installation (Android)

1. **Using Chrome/Edge**:
   - Tap the menu button (⋮) in the top-right
   - Select "Install app" or "Add to Home Screen"
   - Confirm the installation
   
2. **Result**:
   - PrisimAI icon appears on your home screen
   - Opens in fullscreen mode
   - Appears in your app drawer
   - Can be launched like any native app

### Mobile Installation (iOS/Safari)

1. **Steps**:
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Customize the name if desired
   - Tap "Add"

2. **Result**:
   - PrisimAI appears on your home screen
   - Opens without Safari UI
   - Provides a more app-like experience

## Offline Capabilities

PrisimAI's PWA has extensive offline support:

### What Works Offline

✅ **Full Application Access**
- The entire app interface is cached
- All UI components and styles
- Navigation and interactions

✅ **WebLLM Models**
- Once downloaded, models are cached permanently
- Can use AI chat completely offline
- Models include:
  - Llama 3.2 3B (1.8 GB)
  - Llama 3.1 8B (4.5 GB)
  - Phi 3.5 Mini (2.2 GB)

✅ **Your Data**
- Conversations stored in browser
- Settings and preferences
- Favorites and chat history

✅ **Static Resources**
- All fonts cached for 1 year
- App icons and images
- Stylesheets and scripts

### What Requires Internet

❌ **Online AI Models**
- Pollinations AI text generation (when not using offline mode)
- Image generation (currently requires internet)

❌ **Authentication**
- Initial sign-in requires internet
- Account synchronization

❌ **Model Downloads**
- First-time download of WebLLM models requires internet
- After download, models work completely offline

## Caching Strategy

PrisimAI uses intelligent caching to provide the best experience:

### Static Assets (Permanent Cache)
- **What**: HTML, CSS, JavaScript files
- **Strategy**: CacheFirst - served from cache instantly
- **Updates**: Automatic when new version is deployed

### WebLLM Models (Long-term Cache)
- **What**: AI model files from HuggingFace
- **Strategy**: CacheFirst with 1-year expiration
- **Size**: Models can be several GB
- **Pattern**: 
  - `*.bin`, `*.onnx`, `*.wasm`, `*.safetensors` files
  - All HuggingFace CDN content
  - MLC configuration files

### Google Fonts (Long-term Cache)
- **What**: Inter font family
- **Strategy**: CacheFirst with 1-year expiration
- **Benefit**: Instant text rendering offline

### API Responses (Short-term Cache)
- **What**: Pollinations AI responses
- **Strategy**: NetworkFirst with 5-minute cache
- **Benefit**: Fresh data when online, fallback when offline

### Images (Medium-term Cache)
- **What**: Generated images and assets
- **Strategy**: CacheFirst with 30-day expiration
- **Benefit**: Fast loading and offline access to generated images

## PWA Features

### App Shortcuts

Quick actions available from the app icon:

1. **New Chat** - Start a fresh conversation instantly
2. **Generate Image** - Jump straight to image generation
3. **Offline Mode** - Access offline settings quickly

On desktop: Right-click the app icon
On mobile: Long-press the app icon

### Install Prompt

- Shows automatically after a few visits
- Can be dismissed and will reappear after 7 days
- Respects your preference if you dismiss it
- Won't show if already installed

### Auto-Updates

- Service worker checks for updates automatically
- New versions installed in the background
- Updates applied on next app restart
- No manual update process needed

### Standalone Mode

When installed:
- Opens in its own window (no browser UI)
- Appears as a separate app in task manager
- Can be pinned to taskbar/dock
- Proper app icon and name

## Performance Benefits

### Faster Loading
- Static assets cached: **~6.8 MB cached instantly**
- Subsequent loads: **< 1 second**
- No need to re-download resources

### Reduced Data Usage
- After initial install: minimal data usage
- Models downloaded once, used forever
- Fonts and assets never re-downloaded

### Better User Experience
- Instant loading from cache
- Smooth transitions and interactions
- Works on spotty connections
- Resilient to network failures

## Technical Details

### Service Worker

The service worker (`sw.js`) handles:
- Caching of assets and resources
- Offline fallback to `/offline.html`
- Background updates
- Cache cleanup of old versions

### Workbox Configuration

- **Maximum file size**: 10 MB (to accommodate large bundles)
- **Cache names**: Separate caches for different resource types
- **Strategies**:
  - CacheFirst: For static, rarely-changing content
  - NetworkFirst: For dynamic, frequently-changing content
- **Automatic cleanup**: Old caches removed automatically

### Code Splitting

To improve performance, the app is split into chunks:
- **react-vendor**: React and React DOM (~12 KB)
- **ui-vendor**: UI component libraries (~108 KB)
- **webllm**: WebLLM AI engine (~5.5 MB)
- **main**: Application code (~944 KB)

## Storage Requirements

### Browser Cache
- **App Bundle**: ~6.8 MB
- **WebLLM Models**: 1.8 - 4.5 GB (per model)
- **Fonts**: ~200 KB
- **Total**: 2-5 GB for full offline experience

### Browser Storage (IndexedDB/LocalStorage)
- **Conversations**: ~1-10 MB (depending on history)
- **Settings**: ~10 KB
- **Auth tokens**: ~5 KB

## Troubleshooting

### "Install" button doesn't appear

- Ensure you're using a supported browser (Chrome, Edge, Brave)
- Check that you're on HTTPS or localhost
- Try refreshing the page
- Clear browser cache and revisit

### App not working offline

- Make sure you've visited while online first
- Check that service worker is registered (DevTools → Application → Service Workers)
- Verify cache has content (DevTools → Application → Cache Storage)
- For WebLLM: ensure model is downloaded before going offline

### Updates not applying

- Close all instances of the app
- Reopen to apply updates
- If stuck: Clear cache and reinstall

### Cache taking too much space

- Models are large (2-5 GB each)
- Clear specific caches in browser settings
- Or uninstall and reinstall the app

### Service worker errors

- Open DevTools → Console
- Look for service worker errors
- Common fixes:
  - Clear all browser data
  - Unregister service worker manually
  - Refresh and allow re-registration

## Privacy & Security

### Data Storage
- All data stored locally in browser
- No cloud storage of personal data
- Conversations stay on your device

### Service Worker Security
- Runs in browser sandbox
- Can only cache allowed origins
- No access to sensitive system resources
- HTTPS required (except localhost)

### Offline Model Privacy
- Models run entirely in browser
- No data sent to external servers
- Complete privacy for offline chats
- Your prompts never leave your device

## Best Practices

### For Best Performance
1. Install the app instead of using in browser
2. Download offline models while on Wi-Fi
3. Allow app to cache assets on first visit
4. Keep app updated (happens automatically)
5. Don't clear cache if you want offline access

### Managing Storage
1. Only download models you'll use
2. Clear generated image cache periodically
3. Monitor browser storage usage
4. Remove old conversations if needed

### Optimal Setup
1. Install PWA on device
2. Download your preferred WebLLM model
3. Enable offline mode in settings
4. Use app both online and offline seamlessly

## Browser Support

### Fully Supported
✅ Chrome 113+ (Desktop & Android)
✅ Edge 113+ (Desktop & Android)
✅ Brave (Desktop & Android)
✅ Samsung Internet (Android)

### Partial Support
⚠️ Safari (iOS & macOS) - Install works, limited offline features
⚠️ Firefox - No install, basic PWA features

### Not Supported
❌ Internet Explorer
❌ Older browser versions

### WebGPU (for Offline Models)
Required for WebLLM offline AI:
- Chrome 113+
- Edge 113+
- Not available in Firefox or Safari

## Future Enhancements

Planned PWA improvements:
- 🔔 Push notifications for updates
- 🔄 Background sync for saved data
- 📊 Better cache management UI
- 🎨 Offline image generation support
- 📱 Better mobile optimization
- 🌐 Offline model updates

## Feedback & Support

Having issues with PWA features?
- Check DevTools Console for errors
- Verify service worker status
- Review cache contents
- Open issue on GitHub with browser details

---

**Enjoy using PrisimAI offline!** 🚀✨
