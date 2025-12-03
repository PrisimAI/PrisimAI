# Testing Guide for Image/Video Generation and Search Engine Features

## Prerequisites
- Access to PrisimAI application with valid authentication
- Premium access email (optional, for testing restricted models)

## 1. Image Generation Testing

### Test Case 1: Basic Image Generation with New Parameters
**Objective:** Verify that new image generation parameters work correctly

**Steps:**
1. Navigate to Image mode
2. Enter prompt: "A beautiful sunset over mountains"
3. Select model: "flux"
4. Generate image with default parameters
5. Verify image is generated successfully

**Expected Result:** Image should generate with default quality and settings

### Test Case 2: Image Generation with Advanced Parameters
**Objective:** Test advanced image parameters

**Steps:**
1. Navigate to Image mode
2. Enter prompt: "A futuristic city at night"
3. Select model: "flux"
4. Use the following options (when UI is implemented):
   - Width: 1024
   - Height: 1024
   - Quality: "hd"
   - Enhance: true
   - Negative prompt: "blurry, low quality"
   - Seed: 42
   - Guidance scale: 7.5
5. Generate image

**Expected Result:** High-quality image matching specifications

### Test Case 3: Image-to-Image Generation
**Objective:** Test image-to-image transformation

**Steps:**
1. Navigate to Image mode
2. Upload a reference image
3. Enter prompt: "Transform this into a watercolor painting"
4. Select model: "flux"
5. Generate image

**Expected Result:** New image based on reference with style transformation

### Test Case 4: All Image Models
**Objective:** Verify all image models are available

**Models to Test:**
- [ ] flux (default)
- [ ] turbo
- [ ] gptimage
- [ ] kontext
- [ ] seedream (requires premium)
- [ ] nanobanana
- [ ] nanobanana-pro (requires premium)

**Steps for each model:**
1. Navigate to Image mode
2. Select model from dropdown
3. Enter test prompt: "A red apple on a wooden table"
4. Generate image

**Expected Result:** Each model should generate images with distinct characteristics

### Test Case 5: Transparent Background
**Objective:** Test transparent background generation

**Steps:**
1. Navigate to Image mode
2. Enter prompt: "A logo of a mountain"
3. Set transparent: true
4. Generate image

**Expected Result:** Image with transparent background

## 2. Video Generation Testing

### Test Case 6: Text-to-Video with Veo
**Objective:** Test basic video generation with Veo

**Steps:**
1. Navigate to Video mode
2. Select model: "veo"
3. Enter prompt: "A cat playing with a ball of yarn"
4. Set duration: 6 seconds
5. Set aspect ratio: "16:9"
6. Enable audio: true
7. Generate video

**Expected Result:** 6-second video with audio

### Test Case 7: Text-to-Video with Seedance
**Objective:** Test Seedance video generation

**Steps:**
1. Navigate to Video mode
2. Select model: "seedance"
3. Enter prompt: "Ocean waves crashing on the beach"
4. Set duration: 5 seconds
5. Set aspect ratio: "16:9"
6. Generate video

**Expected Result:** 5-second video of waves

### Test Case 8: Image-to-Video with Seedance
**Objective:** Test image-to-video transformation

**Steps:**
1. Navigate to Video mode
2. Select model: "seedance"
3. Upload a reference image (e.g., landscape photo)
4. Enter prompt: "Add gentle motion to this scene"
5. Set duration: 4 seconds
6. Generate video

**Expected Result:** Video animation from static image

### Test Case 9: Different Aspect Ratios
**Objective:** Test video aspect ratio options

**Steps:**
1. Test 16:9 aspect ratio
2. Test 9:16 aspect ratio
3. Compare results

**Expected Result:** Videos with correct aspect ratios

### Test Case 10: Video Duration Limits
**Objective:** Test model-specific duration constraints

**Veo Tests:**
- [ ] Duration: 4 seconds
- [ ] Duration: 6 seconds
- [ ] Duration: 8 seconds

**Seedance Tests:**
- [ ] Duration: 2 seconds
- [ ] Duration: 5 seconds
- [ ] Duration: 10 seconds

**Expected Result:** Videos respect duration limits

## 3. Experimental Search Engine Testing

### Test Case 11: Enable Search Engine Feature
**Objective:** Enable and configure experimental search engine

**Steps:**
1. Open Settings dialog
2. Navigate to General tab
3. Locate "Experimental Search Engine" toggle
4. Enable the toggle
5. Save settings
6. Reload page

**Expected Result:** Setting persists after reload

### Test Case 12: Search Engine Behavior
**Objective:** Verify search engine provides appropriate responses

**Steps:**
1. Ensure experimental search engine is enabled
2. Start a new chat conversation
3. Enter query: "What is the capital of France?"
4. Observe response

**Expected Result:** 
- Response should be fact-based
- Should include source information
- Should be comprehensive
- Model should be gemini-search

### Test Case 13: Search vs. Normal Chat
**Objective:** Compare search mode to normal chat

**Steps:**
1. Enable search engine, ask: "Latest developments in AI"
2. Note response style
3. Disable search engine
4. Ask same question
5. Compare responses

**Expected Result:** Search mode provides more factual, sourced information

### Test Case 14: Search Engine Toggle Persistence
**Objective:** Verify settings persist across sessions

**Steps:**
1. Enable experimental search engine
2. Save settings
3. Close browser
4. Reopen application
5. Check settings

**Expected Result:** Search engine remains enabled

## 4. Parameter Validation Testing

### Test Case 15: Image Parameter Edge Cases
**Objective:** Test parameter boundary conditions

**Tests:**
- [ ] Seed: 0 (minimum)
- [ ] Seed: 1844674407370955 (maximum)
- [ ] Guidance scale: 1 (minimum)
- [ ] Guidance scale: 20 (maximum)
- [ ] Quality levels: low, medium, high, hd

**Expected Result:** All values within range work correctly

### Test Case 16: Video Parameter Edge Cases
**Objective:** Test video parameter limits

**Tests:**
- [ ] Veo duration: 4, 6, 8 (valid values)
- [ ] Seedance duration: 2-10 (range)
- [ ] Invalid durations should fail gracefully

**Expected Result:** Valid parameters work, invalid show appropriate errors

## 5. Premium Features Testing

### Test Case 17: Restricted Models (Non-Premium)
**Objective:** Verify restricted models are blocked for non-premium users

**Steps:**
1. Sign in with non-premium account
2. Attempt to use "seedream" model
3. Attempt to use "nanobanana-pro" model

**Expected Result:** Error message indicating model is not available

### Test Case 18: Restricted Models (Premium)
**Objective:** Verify premium users can access all models

**Steps:**
1. Sign in with premium account
2. Access "seedream" model
3. Access "nanobanana-pro" model
4. Generate images

**Expected Result:** All models accessible and functional

## 6. Error Handling Testing

### Test Case 19: Network Errors
**Objective:** Test graceful error handling

**Steps:**
1. Simulate network disconnection
2. Attempt to generate image/video
3. Observe error message

**Expected Result:** User-friendly error message displayed

### Test Case 20: Invalid Prompts
**Objective:** Test handling of problematic prompts

**Steps:**
1. Try empty prompt
2. Try extremely long prompt (>1000 characters)
3. Try prompts with special characters

**Expected Result:** Appropriate validation or error messages

## 7. Performance Testing

### Test Case 21: Generation Speed
**Objective:** Measure generation times

**Metrics:**
- [ ] Image generation time (by model)
- [ ] Video generation time (by model and duration)
- [ ] Response time with search engine enabled

**Expected Result:** Document typical generation times

## 8. UI/UX Testing

### Test Case 22: Model Selection
**Objective:** Verify model dropdown functionality

**Steps:**
1. Check image models dropdown
2. Check video models dropdown
3. Verify all models appear
4. Verify premium models marked appropriately

**Expected Result:** All models visible and selectable

### Test Case 23: Settings UI
**Objective:** Test settings interface

**Steps:**
1. Open Settings dialog
2. Navigate between tabs
3. Toggle experimental search
4. Save and cancel buttons work

**Expected Result:** Settings UI is intuitive and functional

## Test Results Template

| Test Case | Status | Notes | Date | Tester |
|-----------|--------|-------|------|--------|
| TC-01     | [ ]    |       |      |        |
| TC-02     | [ ]    |       |      |        |
| ...       | [ ]    |       |      |        |

**Status Values:**
- ✅ Pass
- ❌ Fail
- ⚠️ Partial
- 🚧 Blocked
- ⏭️ Skipped

## Regression Testing

After implementing these features, verify:
- [ ] Existing chat functionality still works
- [ ] Existing image generation without new parameters works
- [ ] Settings persistence for other features unchanged
- [ ] No performance degradation in unrelated features

## Notes for Testers

1. **Authentication Required:** Most tests require valid authentication
2. **Premium Access:** Some tests require premium user account
3. **API Limits:** Be aware of rate limits during testing
4. **Documentation:** Refer to IMAGE_VIDEO_GENERATION_FEATURE.md for detailed parameter descriptions
5. **Browser Console:** Monitor console for errors during testing
6. **Network Tab:** Use browser dev tools to verify API requests

## Known Limitations

1. Image-to-image requires base64 encoding or URL
2. Video generation may take significant time
3. Some models may be temporarily unavailable
4. Search engine model availability depends on API

## Report Issues

When reporting issues, include:
- Test case number
- Steps to reproduce
- Expected vs. actual result
- Screenshots if applicable
- Browser and version
- Console errors
- Network request details
