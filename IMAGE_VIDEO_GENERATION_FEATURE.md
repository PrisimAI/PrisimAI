# Image and Video Generation Feature Enhancement

This document describes the enhancements made to PrisimAI's image and video generation capabilities using the Pollinations AI API.

## Overview

The following changes have been implemented to provide comprehensive support for image and video generation with advanced configuration options:

## 1. Enhanced Image Generation

### New Image Models
The following image models are now supported (in addition to existing models):
- **flux** (default) - High-quality image generation
- **turbo** - Fast image generation
- **gptimage** - GPT-powered image generation
- **kontext** - Context-aware image generation
- **seedream** - Advanced image generation
- **nanobanana** - Efficient image generation
- **nanobanana-pro** - Premium nanobanana model

### New Image Generation Parameters
The `GenerateImageOptions` interface now supports the following parameters:

```typescript
interface GenerateImageOptions {
  width?: number                  // Image width in pixels (default: 1024)
  height?: number                 // Image height in pixels (default: 1024)
  seed?: number                   // Random seed for reproducible results (0-1844674407370955, default: 42)
  enhance?: boolean               // Let AI improve your prompt for better results (default: false)
  negative_prompt?: string        // What to avoid in the generated image (default: "worst quality, blurry")
  private?: boolean               // Hide image from public feeds (default: false)
  nologo?: boolean                // Remove Pollinations watermark (default: false)
  nofeed?: boolean                // Don't add to public feed (default: false)
  safe?: boolean                  // Enable safety content filters (default: false)
  quality?: 'low' | 'medium' | 'high' | 'hd'  // Image quality level (default: 'medium')
  image?: string                  // Reference image URL(s) for image-to-image (comma/pipe separated)
  transparent?: boolean           // Generate with transparent background (default: false)
  guidance_scale?: number         // How closely to follow the prompt (1-20)
  userEmail?: string | null       // User email for authentication
}
```

### Usage Example

```typescript
const imageUrl = await generateImage(
  "A beautiful sunset over the ocean",
  "flux",
  {
    width: 1024,
    height: 1024,
    quality: 'hd',
    enhance: true,
    negative_prompt: 'blurry, low quality',
    nologo: true,
    safe: true,
    seed: 42,
    guidance_scale: 7.5
  }
)
```

## 2. Enhanced Video Generation

### Supported Video Models
- **veo** - Google's Veo 3.1 Fast video generation model
  - Text-to-video only
  - Duration: 4, 6, or 8 seconds
  - Audio generation supported

- **seedance** - BytePlus video generation model
  - Text-to-video and image-to-video
  - Duration: 2-10 seconds
  - Supports aspect ratios: 16:9 or 9:16

### New Video Generation Parameters
The `GenerateVideoOptions` interface now supports:

```typescript
interface GenerateVideoOptions {
  duration?: number               // Video duration in seconds
                                  // veo: 4, 6, or 8
                                  // seedance: 2-10
  aspectRatio?: '16:9' | '9:16'  // Video aspect ratio
  audio?: boolean                 // Enable audio generation (veo only, default: false)
  image?: string                  // Reference image URL for image-to-video (seedance)
  userEmail?: string | null       // User email for authentication
}
```

### Usage Example

```typescript
// Text-to-video with Veo
const videoUrl = await generateVideo(
  "A cat playing with a ball",
  "veo",
  {
    duration: 6,
    aspectRatio: '16:9',
    audio: true
  }
)

// Image-to-video with Seedance
const videoUrl = await generateVideo(
  "Animate this image with smooth motion",
  "seedance",
  {
    duration: 5,
    aspectRatio: '16:9',
    image: 'https://example.com/reference-image.jpg'
  }
)
```

## 3. Experimental Search Engine Feature

### Overview
A new experimental search engine feature has been added that uses the `gemini-search` model to provide web search capabilities within the chat interface.

### Enabling the Feature
1. Open the **Settings** dialog (accessible via the user menu)
2. Navigate to the **General** tab
3. Toggle the **"Experimental Search Engine"** switch
4. Click **Save Changes**

### How It Works
When enabled:
- The chat model automatically switches to `gemini-search`
- A system prompt is injected that instructs the model to act as a search engine
- The model provides comprehensive, fact-based answers with citations and sources
- Focus is on accuracy and up-to-date information

### System Prompt
```
You are a search engine assistant. Provide comprehensive, fact-based answers 
to user queries by searching and synthesizing information. Format your 
responses with clear citations and sources when possible. Focus on accuracy 
and up-to-date information.
```

### Settings Storage
The experimental search engine setting is stored in `localStorage` under the key `app-settings` with the property `experimentalSearchEnabled`.

## Implementation Details

### Modified Files

1. **`src/lib/pollinations-api.ts`**
   - Added `GenerateImageOptions` interface with all new parameters
   - Added `GenerateVideoOptions` interface with all new parameters
   - Updated `FALLBACK_IMAGE_MODELS` to include all specified models
   - Added `gemini-search` to text models list
   - Implemented `isExperimentalSearchEnabled()` helper function
   - Modified `generateText()` to use gemini-search when enabled
   - Updated `generateImage()` to pass all new parameters to the API
   - Updated `generateVideo()` to pass all new parameters to the API

2. **`src/components/SettingsDialog.tsx`**
   - Added `experimentalSearchEnabled` to default settings
   - Added state management for experimental search toggle
   - Added UI toggle in the General settings tab
   - Updated save/load logic to persist the setting

### API Endpoint
All image and video generation requests are made to:
- Images: `https://enter.pollinations.ai/api/generate/image/{prompt}?{params}`
- Videos: `https://enter.pollinations.ai/api/generate/image/{prompt}?{params}` (with video model)

### Authentication
API requests include authentication via the `Authorization` header:
```
Authorization: Bearer {API_KEY}
```

## Testing

### Manual Testing Steps

1. **Image Generation with New Parameters:**
   - Create a new image generation conversation
   - Use advanced parameters in the generation options
   - Verify the generated image matches the specified parameters

2. **Video Generation:**
   - Create a new video generation conversation
   - Test both veo and seedance models
   - Test different durations and aspect ratios
   - Verify video generation with audio (veo)
   - Test image-to-video (seedance)

3. **Experimental Search Engine:**
   - Open Settings and enable the experimental search engine
   - Start a new chat conversation
   - Verify that responses are search-oriented with citations
   - Disable the feature and verify normal chat behavior returns

## Notes

- Premium users have access to restricted models: `seedream` and `nanobanana-pro`
- Image quality levels: low, medium (default), high, hd
- Seed values range from 0 to 1844674407370955
- Guidance scale values typically range from 1-20
- Video durations are model-specific (veo: 4/6/8s, seedance: 2-10s)

## Future Enhancements

Potential future improvements could include:
- UI controls for image/video generation parameters
- Preset configurations for common use cases
- Advanced editing capabilities for generated content
- Batch generation support
- More granular control over search engine behavior
