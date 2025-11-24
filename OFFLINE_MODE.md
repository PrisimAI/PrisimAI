# 🔌 Offline Mode - User Guide

PrisimAI's experimental offline mode allows you to run AI models directly in your browser without an internet connection, powered by WebLLM and WebGPU.

## Overview

Offline mode enables you to:
- Use AI chat features without internet connectivity
- Keep your conversations private (no data sent to external servers)
- Continue working in areas with poor or no network coverage
- Reduce latency for faster responses (on capable hardware)

## System Requirements

### Browser Support
- **Chrome** 113 or later
- **Edge** 113 or later
- Other Chromium-based browsers with WebGPU support

> **Note**: Firefox and Safari do not currently support WebGPU and cannot use offline mode.

### Hardware Requirements
- **GPU**: Modern GPU with WebGPU support (most GPUs from 2016 onwards)
- **RAM**: At least 8GB recommended
- **Storage**: 2-5GB of free disk space for model caching

### Checking WebGPU Support
1. Open Chrome/Edge
2. Navigate to `chrome://gpu` (or `edge://gpu`)
3. Look for "WebGPU" in the Graphics Feature Status
4. It should say "Hardware accelerated" or "Enabled"

## Available Models

### Llama 3.2 3B Instruct (Recommended)
- **Size**: 1.8 GB
- **Best for**: General conversation, Q&A, creative writing
- **Speed**: Fast on most GPUs
- **Quality**: Good balance of speed and quality

### Llama 3.1 8B Instruct
- **Size**: 4.5 GB
- **Best for**: Complex reasoning, coding, detailed analysis
- **Speed**: Moderate (requires better GPU)
- **Quality**: Higher quality responses

### Phi 3.5 Mini
- **Size**: 2.2 GB
- **Best for**: Quick responses, simple tasks
- **Speed**: Very fast
- **Quality**: Good for general use

## Setup Instructions

### Step 1: Enable Offline Mode

1. **Log in** to PrisimAI (or use development mode)
2. Click on your **profile icon** in the top-right of the sidebar
3. Select **"Offline Mode"** from the dropdown menu
4. The Offline Mode Settings dialog will open

### Step 2: Check WebGPU Compatibility

The dialog will automatically check if your browser supports WebGPU:
- ✅ **Green checkmark**: Your system is compatible
- ❌ **Red X**: WebGPU is not available
  - Check that you're using Chrome/Edge 113+
  - Ensure hardware acceleration is enabled in browser settings
  - Update your GPU drivers

### Step 3: Select a Model

1. Click the **model dropdown** to see available options
2. Each model shows:
   - Name and description
   - Download size
   - Recommended use cases
3. Choose based on your needs and available storage

### Step 4: Download and Initialize

1. Toggle **"Enable Offline Mode"** to ON
2. The model will begin downloading:
   - Progress bar shows download status
   - Time elapsed counter helps estimate remaining time
   - First download may take 5-10 minutes
3. Once complete, you'll see "Model Ready" status

### Step 5: Start Chatting

1. Close the Offline Mode dialog
2. Notice the **"Offline Mode"** badge in the model selector bar
3. Start a new chat or continue an existing one
4. Your messages will be processed locally!

## Using Offline Mode

### Creating Conversations
- Click **"New Chat"** as usual
- The conversation will automatically use the offline model
- Responses are generated locally on your device

### Switching Models
1. Open **Offline Mode Settings** again
2. Select a different model from the dropdown
3. The new model will download and replace the current one
4. All future chats will use the new model

### Disabling Offline Mode
1. Open **Offline Mode Settings**
2. Toggle **"Enable Offline Mode"** to OFF
3. The system will switch back to online models
4. Downloaded models remain cached for future use

## Performance Tips

### Optimal Performance
- **Close other applications** to free up GPU memory
- **Use a dedicated GPU** if available (not integrated graphics)
- **Enable hardware acceleration** in browser settings
- **Update GPU drivers** to the latest version

### Expected Response Times
- **Llama 3.2 3B**: 1-3 seconds per response (fast GPU)
- **Llama 3.1 8B**: 3-7 seconds per response (fast GPU)
- **Phi 3.5 Mini**: 0.5-2 seconds per response (fast GPU)

> Times will be longer on slower GPUs or integrated graphics

### Managing Storage
- Models are stored in browser cache
- To clear: Browser Settings → Privacy → Clear browsing data → Cached images and files
- Each model only needs to be downloaded once

## Troubleshooting

### "WebGPU is not supported"
- **Solution**: Use Chrome 113+ or Edge 113+
- Enable hardware acceleration: Settings → System → Use hardware acceleration
- Update browser to latest version

### "Failed to load model"
- **Solution**: Check internet connection (needed for initial download)
- Ensure sufficient disk space (2-5GB free)
- Try a smaller model first
- Clear browser cache and try again

### "Model running slowly"
- **Solution**: Try a smaller model (Phi 3.5 Mini)
- Close other GPU-intensive applications
- Check Task Manager for GPU usage
- Consider upgrading GPU drivers

### "Download stuck at X%"
- **Solution**: Check internet connection stability
- Disable VPN if using one
- Try again later if server is busy
- Clear browser cache and restart download

### Chat responses are poor quality
- **Solution**: Try a larger model (Llama 3.1 8B)
- Provide more context in your prompts
- Remember: offline models are smaller than cloud models

## Limitations

### Current Restrictions
- ✅ **Text chat** - Fully supported
- ❌ **Image generation** - Not supported (requires online mode)
- ❌ **Tool calling** - Not supported in offline mode
- ❌ **Voice input** - Not supported

### Quality Differences
- Offline models are smaller than cloud-based models
- Responses may be less sophisticated
- Some complex reasoning tasks may be challenging
- Trade-off: privacy and offline access vs. response quality

### Browser Limitations
- Only works in Chromium-based browsers
- Requires modern GPU hardware
- Mobile browsers not yet supported
- Incognito/private mode may have issues

## Privacy & Security

### Data Privacy
- **100% local processing**: No data sent to external servers
- **No tracking**: Conversations never leave your device
- **Cache storage**: Models stored in browser, not uploaded
- **Secure**: Same security as browser's local storage

### Security Considerations
- Models are downloaded from official sources
- WebGPU runs in browser sandbox
- No credential or API key exposure
- All processing happens client-side

## FAQ

**Q: Do I need internet to use offline mode?**
A: You need internet to download the model initially. After that, it works completely offline.

**Q: How much does offline mode cost?**
A: It's completely free! No API costs or usage limits.

**Q: Can I use multiple models at once?**
A: No, only one model can be loaded at a time. Switch models in settings.

**Q: Will this slow down my computer?**
A: It uses GPU resources. Performance depends on your hardware. Close other GPU-intensive apps for best results.

**Q: Can I use this on mobile?**
A: Not currently. WebGPU support on mobile browsers is limited.

**Q: Is the offline mode stable?**
A: It's marked as "Experimental" because WebGPU is relatively new. Most users should have a good experience.

**Q: Can I contribute my own models?**
A: Currently, only pre-configured models are supported. Custom models may be added in the future.

## Feedback

Offline mode is an experimental feature. If you encounter issues or have suggestions:
- Open an issue on GitHub
- Include browser version, GPU model, and error details
- Screenshots are helpful for UI issues

## Technical Details

For developers and advanced users:

### Architecture
- **WebLLM**: Machine learning inference library for web
- **WebGPU**: GPU acceleration API for browsers
- **MLC-LLM**: Model compilation framework
- **Quantization**: Models use 4-bit quantization for size reduction

### Model Format
- **Format**: MLC-compiled WebGPU models
- **Quantization**: q4f16_1 (4-bit weights, 16-bit activations)
- **Cache**: Browser's Cache API + IndexedDB

### API Compatibility
- Implements OpenAI-compatible chat API
- Streaming responses supported
- Context window: 2048 tokens
- Temperature: 0.7 (configurable in code)

---

**Enjoy using PrisimAI offline!** 🚀
