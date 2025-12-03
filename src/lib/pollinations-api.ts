import { webLLMService } from './webllm-service'
import type { Conversation } from './types'

// API Keys - 4 different keys for different usage tiers
const API_KEY_1 = 'plln_sk_niDbx9acZfiWE3tdVmrXKyk0wh5GnGdM' // Primary key for heavy users
const API_KEY_2 = 'plln_sk_gQKCYN1GNHUb0b5OGbasEx2dXqyXO364'
const API_KEY_3 = 'plln_sk_fnpi8FteeCwCDgmXF2A1vciVI73sFxA7'
const API_KEY_4 = 'plln_sk_wfjz4KCVFGQn4izP4AuYEZajHUkS51Hh'

const BASE_URL = 'https://enter.pollinations.ai/api/generate'
const IMAGE_BASE_URL = 'https://enter.pollinations.ai/api/generate/image'
const VIDEO_BASE_URL = 'https://enter.pollinations.ai/api/generate/image' // Video uses same endpoint with video model

// Mock mode disabled - always use production API
const ENABLE_MOCK_MODE = false

// Offline mode state (controlled by App component)
let offlineModeEnabled = false

// Event emitter for offline mode changes
const offlineModeChangeEvent = new Event('offlineModeChange')

export function setOfflineMode(enabled: boolean) {
  offlineModeEnabled = enabled
  // Dispatch event to notify listeners
  window.dispatchEvent(offlineModeChangeEvent)
}

export function isOfflineMode(): boolean {
  return offlineModeEnabled
}

// Subscribe to offline mode changes
export function onOfflineModeChange(callback: (enabled: boolean) => void): () => void {
  const handler = () => callback(offlineModeEnabled)
  window.addEventListener('offlineModeChange', handler)
  return () => window.removeEventListener('offlineModeChange', handler)
}

// Helper function to check if experimental search engine is enabled
export function isExperimentalSearchEnabled(): boolean {
  try {
    const settings = localStorage.getItem('app-settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.experimentalSearchEnabled === true
    }
  } catch (e) {
    console.error('Error reading experimental search setting:', e)
  }
  return false
}

// Content types for multi-modal messages
export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageUrlContent {
  type: 'image_url'
  image_url: {
    url: string
    detail?: 'auto' | 'low' | 'high'
  }
}

export type MessageContent = string | (TextContent | ImageUrlContent)[]

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: MessageContent
  tool_calls?: ToolCall[]
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface Tool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, any>
  }
}

export interface GenerateTextOptions {
  tools?: Tool[]
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
  temperature?: number
  max_tokens?: number
  userEmail?: string | null
}

export interface TextModel {
  id: string
  description?: string
  aliases?: string[]
  tools?: boolean
}

export interface ImageModel {
  name: string
  description?: string
  aliases?: string[]
}

export interface VideoModel {
  name: string
  description?: string
  aliases?: string[]
}

export interface GenerateImageOptions {
  width?: number
  height?: number
  seed?: number
  enhance?: boolean
  negative_prompt?: string
  private?: boolean
  nologo?: boolean
  nofeed?: boolean
  safe?: boolean
  quality?: 'low' | 'medium' | 'high' | 'hd'
  image?: string // Reference image URL(s) for image-to-image. Base64 data URL or comma/pipe separated URLs
  transparent?: boolean
  guidance_scale?: number
  userEmail?: string | null
}

export interface GenerateVideoOptions {
  duration?: number // Video duration in seconds. veo: 4, 6, or 8. seedance: 2-10
  aspectRatio?: '16:9' | '9:16' // Video aspect ratio
  audio?: boolean // Enable audio generation for video (veo only)
  image?: string // Reference image URL for image-to-video (seedance)
  userEmail?: string | null
}

const RESTRICTED_TEXT_MODELS = [
  'midijourney',
  'claude',
  'openai-reasoning',
  'deepseek',
  'perplexity-reasoning',
  'claude-large',
  'gemini-large',
  'openai-audio',
  'kimi-k2-thinking'
]

// Hardcoded list of emails with premium access to all models (normalized to lowercase)
export const PREMIUM_ACCESS_EMAILS: string[] = [
  // Add emails here that should have access to all models
  'example@example.com',
  'christopherhauser1234@gmail.com',
  'dev@example.com', // Development mock user
  'vdireck@gmail.com',
  'man79577957@gmail.com',
  'wizium123@gmail.com',
  'vaibhavsharma42011@gmail.com',
  'emily.jensen2029@gmail.com',
  '9001202@rochesterschools.org',
  'scottdavis8192@gmail.com',
  'armandbeqiri588@gmail.com',
  'wendelin.bacher@gmail.com'
].map(email => email.toLowerCase())

// Domain list for premium access
export const PREMIUM_ACCESS_DOMAINS: string[] = [
  'rochesterschools.org'
]

// Check if a user email has premium access
export function hasPremiumAccess(email: string | null | undefined): boolean {
  if (!email) return false
  const lowerEmail = email.toLowerCase()
  
  // Check if email is in the premium access list
  if (PREMIUM_ACCESS_EMAILS.includes(lowerEmail)) {
    return true
  }
  
  // Check if email domain is in the premium access domains list
  const atIndex = lowerEmail.lastIndexOf('@')
  if (atIndex > 0) {
    const emailDomain = lowerEmail.substring(atIndex + 1)
    if (emailDomain && PREMIUM_ACCESS_DOMAINS.includes(emailDomain)) {
      return true
    }
  }
  
  return false
}

const FALLBACK_TEXT_MODELS: TextModel[] = [
  { id: 'openai', description: 'OpenAI GPT-4', tools: true },
  { id: 'mistral', description: 'Mistral Large', tools: true },
  { id: 'claude', description: 'Anthropic Claude', tools: true },
  { id: 'llama', description: 'Meta Llama 3', tools: false },
  { id: 'gemini-search', description: 'Gemini Search (Experimental)', tools: false },
]

export function filterRestrictedTextModels(models: TextModel[], userEmail?: string | null): TextModel[] {
  // Premium users get access to all models
  if (hasPremiumAccess(userEmail)) {
    return models
  }
  return models.filter(model => !RESTRICTED_TEXT_MODELS.includes(model.id))
}

export async function getTextModels(): Promise<TextModel[]> {
  try {
    const response = await fetch(`${BASE_URL}/v1/models`, {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    })
    
    if (!response.ok) {
      console.warn('API call failed, using fallback models')
      return FALLBACK_TEXT_MODELS
    }
    
    const data = await response.json()
    let models = Array.isArray(data) ? data : data.data || []
    
    // Transform models to use 'id' field instead of 'name'
    models = models
      .filter((m: any) => m && (m.name || m.id))
      .map((m: any) => ({
        id: m.id || m.name,
        description: m.description,
        aliases: m.aliases,
        tools: m.tools
      }))
    
    // If no valid models, use fallback
    if (models.length === 0) {
      console.warn('No valid models returned, using fallback models')
      return FALLBACK_TEXT_MODELS
    }
    
    return models
  } catch (error) {
    console.error('Error fetching text models:', error)
    return FALLBACK_TEXT_MODELS
  }
}

const RESTRICTED_IMAGE_MODELS: string[] = [
  'seedream',
  'nanobanana-pro'
]

const FALLBACK_IMAGE_MODELS: ImageModel[] = [
  { name: 'flux', description: 'Flux (Default)' },
  { name: 'turbo', description: 'Turbo' },
  { name: 'gptimage', description: 'GPT Image' },
  { name: 'kontext', description: 'Kontext' },
  { name: 'seedream', description: 'Seedream' },
  { name: 'nanobanana', description: 'Nanobanana' },
  { name: 'nanobanana-pro', description: 'Nanobanana Pro' },
]

export function filterRestrictedImageModels(models: ImageModel[], userEmail?: string | null): ImageModel[] {
  // Premium users get access to all models
  if (hasPremiumAccess(userEmail)) {
    return models
  }
  return models.filter(model => !RESTRICTED_IMAGE_MODELS.includes(model.name))
}

export async function getImageModels(): Promise<ImageModel[]> {
  try {
    const response = await fetch(`${IMAGE_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    })
    
    if (!response.ok) {
      console.warn('API call failed, using fallback models')
      return FALLBACK_IMAGE_MODELS
    }
    
    const data = await response.json()
    let models = Array.isArray(data) ? data : data.data || []
    
    // Filter out invalid models and ensure they have required properties
    models = models.filter((m: any) => m && m.name)
    
    // If no valid models, use fallback
    if (models.length === 0) {
      console.warn('No valid models returned, using fallback models')
      return FALLBACK_IMAGE_MODELS
    }
    
    return models
  } catch (error) {
    console.error('Error fetching image models:', error)
    return FALLBACK_IMAGE_MODELS
  }
}

export async function generateText(
  messages: Message[],
  model: string = 'openai',
  onChunk?: (chunk: string) => void,
  options?: GenerateTextOptions
): Promise<string> {
  // Check if experimental search engine is enabled and override model
  if (isExperimentalSearchEnabled()) {
    model = 'gemini-search'
    // Add a system message to make the model act like a search engine
    const searchSystemMessage: Message = {
      role: 'system',
      content: 'You are a search engine assistant. Provide comprehensive, fact-based answers to user queries by searching and synthesizing information. Format your responses with clear citations and sources when possible. Focus on accuracy and up-to-date information.',
    }
    
    // Check if there's already a system message
    const hasSystemMessage = messages.some(m => m.role === 'system')
    if (!hasSystemMessage) {
      messages = [searchSystemMessage, ...messages]
    }
  }
  
  // Check if model is restricted (premium users bypass this check)
  if (RESTRICTED_TEXT_MODELS.includes(model) && !hasPremiumAccess(options?.userEmail)) {
    throw new Error('This model is temporarily not available.')
  }

  // Offline mode: Use WebLLM if enabled
  if (offlineModeEnabled && webLLMService.isModelLoaded()) {
    console.info('Using offline mode with WebLLM')
    try {
      return await webLLMService.generateText(messages, onChunk)
    } catch (error) {
      console.error('Offline mode error:', error)
      throw new Error('Offline generation failed. Please check if the model is loaded correctly.')
    }
  }

  const requestBody: any = {
    model,
    messages,
    stream: !!onChunk,
  }

  // Add optional parameters
  if (options?.tools && options.tools.length > 0) {
    requestBody.tools = options.tools
    requestBody.tool_choice = options.tool_choice || 'auto'
  }
  
  if (options?.temperature !== undefined) {
    requestBody.temperature = options.temperature
  }
  
  if (options?.max_tokens !== undefined) {
    requestBody.max_tokens = options.max_tokens
  }

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error('Failed to generate text')
  }

  if (onChunk && response.body) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      const lines = buffer.split('\n')
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
          try {
            const data = JSON.parse(trimmedLine.slice(6))
            const content = data.choices?.[0]?.delta?.content || ''
            if (content) {
              fullText += content
              onChunk(content)
            }
          } catch (e) {
            console.warn('Error parsing chunk:', e)
            continue
          }
        }
      }
    }

    return fullText
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function generateImage(
  prompt: string,
  model: string = 'flux',
  options?: GenerateImageOptions
): Promise<string> {
  // Check if model is restricted (premium users bypass this check)
  if (RESTRICTED_IMAGE_MODELS.includes(model) && !hasPremiumAccess(options?.userEmail)) {
    throw new Error('This model is temporarily not available.')
  }

  const encodedPrompt = encodeURIComponent(prompt)
  
  // Build query parameters
  const queryParams = new URLSearchParams()
  queryParams.set('model', model)
  if (options?.width) queryParams.set('width', String(options.width))
  if (options?.height) queryParams.set('height', String(options.height))
  if (options?.seed !== undefined) queryParams.set('seed', String(options.seed))
  if (options?.enhance !== undefined) queryParams.set('enhance', String(options.enhance))
  if (options?.negative_prompt) queryParams.set('negative_prompt', options.negative_prompt)
  if (options?.private !== undefined) queryParams.set('private', String(options.private))
  if (options?.nologo !== undefined) queryParams.set('nologo', String(options.nologo))
  if (options?.nofeed !== undefined) queryParams.set('nofeed', String(options.nofeed))
  if (options?.safe !== undefined) queryParams.set('safe', String(options.safe))
  if (options?.quality) queryParams.set('quality', options.quality)
  if (options?.image) queryParams.set('image', options.image)
  if (options?.transparent !== undefined) queryParams.set('transparent', String(options.transparent))
  if (options?.guidance_scale !== undefined) queryParams.set('guidance_scale', String(options.guidance_scale))
  
  const url = `${IMAGE_BASE_URL}/${encodedPrompt}?${queryParams.toString()}`
  
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    })
  } catch (error) {
    console.error('Network error during image generation:', error)
    throw new Error('Network error: Unable to connect to the image generation service. Please check your internet connection.')
  }

  if (!response.ok) {
    const statusCode = response.status
    let errorMessage = 'Failed to generate image'
    
    if (statusCode === 400) {
      errorMessage = 'Invalid image request. Please try a different prompt.'
    } else if (statusCode === 401) {
      errorMessage = 'Authentication failed. Please check your API credentials.'
    } else if (statusCode === 429) {
      errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.'
    } else if (statusCode >= 500) {
      errorMessage = 'The image generation service is temporarily unavailable. Please try again later.'
    }
    
    console.error(`Image generation failed with status ${statusCode}`)
    throw new Error(errorMessage)
  }

  const blob = await response.blob()
  
  // Verify we got an image response
  if (!blob.type.startsWith('image/')) {
    console.error('Unexpected response type:', blob.type)
    // Try to read text content for error details
    try {
      const text = await blob.text()
      console.error('Response content:', text)
    } catch (e) {
      // Ignore
    }
    throw new Error('Received invalid response from image generation service. The service might be overloaded or the prompt might be invalid.')
  }
  
  return URL.createObjectURL(blob)
}

// Video models - retrieved from image models endpoint (filter by video output modality)
const FALLBACK_VIDEO_MODELS: VideoModel[] = [
  { name: 'veo', description: 'Veo 3.1 Fast - Google\'s video generation model' },
  { name: 'seedance', description: 'Seedance - BytePlus video generation' },
]

export async function getVideoModels(): Promise<VideoModel[]> {
  try {
    // Video models are part of the image models endpoint but with video output modality
    const response = await fetch(`${IMAGE_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${API_KEY_1}`,
      },
    })
    
    if (!response.ok) {
      console.warn('API call failed, using fallback video models')
      return FALLBACK_VIDEO_MODELS
    }
    
    const data = await response.json()
    let models = Array.isArray(data) ? data : data.data || []
    
    // Filter models that have video output modality
    models = models.filter((m: any) => 
      m && m.name && m.output_modalities?.includes('video')
    ).map((m: any) => ({
      name: m.name,
      description: m.description,
      aliases: m.aliases,
    }))
    
    // If no valid video models, use fallback
    if (models.length === 0) {
      console.warn('No valid video models returned, using fallback models')
      return FALLBACK_VIDEO_MODELS
    }
    
    return models
  } catch (error) {
    console.error('Error fetching video models:', error)
    return FALLBACK_VIDEO_MODELS
  }
}

export async function generateVideo(
  prompt: string,
  model: string = 'veo',
  options?: GenerateVideoOptions
): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt)
  
  // Build query parameters
  const queryParams = new URLSearchParams()
  queryParams.set('model', model)
  if (options?.duration !== undefined) queryParams.set('duration', String(options.duration))
  if (options?.aspectRatio) queryParams.set('aspectRatio', options.aspectRatio)
  if (options?.audio !== undefined) queryParams.set('audio', String(options.audio))
  if (options?.image) queryParams.set('image', options.image)
  
  const url = `${VIDEO_BASE_URL}/${encodedPrompt}?${queryParams.toString()}`
  
  let response: Response
  try {
    // Always use API_KEY_1 for video generation as per requirement
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY_1}`,
      },
    })
  } catch (error) {
    console.error('Network error during video generation:', error)
    throw new Error('Network error: Unable to connect to the video generation service. Please check your internet connection.')
  }

  if (!response.ok) {
    const statusCode = response.status
    let errorMessage = 'Failed to generate video'
    
    if (statusCode === 400) {
      errorMessage = 'Invalid video request. Please try a different prompt.'
    } else if (statusCode === 401) {
      errorMessage = 'Authentication failed. Please check your API credentials.'
    } else if (statusCode === 429) {
      errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.'
    } else if (statusCode >= 500) {
      errorMessage = 'The video generation service is temporarily unavailable. Please try again later.'
    }
    
    console.error(`Video generation failed with status ${statusCode}`)
    throw new Error(errorMessage)
  }

  const blob = await response.blob()
  
  // Verify we got a video response
  if (!blob.type.startsWith('video/')) {
    console.error('Unexpected response type:', blob.type)
    // Try to read text content for error details
    try {
      const text = await blob.text()
      console.error('Response content:', text)
    } catch (e) {
      // Ignore
    }
    throw new Error('Received invalid response from video generation service. The service might be overloaded or the prompt might be invalid.')
  }
  
  return URL.createObjectURL(blob)
}

// Function to determine which API key to use based on user activity
export function getApiKey(): string {
  // Get user activity metrics from localStorage
  const conversationsJson = localStorage.getItem('conversations');
  let conversations: Conversation[] = [];
  
  if (conversationsJson) {
    try {
      conversations = JSON.parse(conversationsJson);
    } catch (e) {
      console.warn('Failed to parse conversations from localStorage', e);
    }
  }
  
  // Count total chats and messages
  let totalChats = 0;
  let totalMessages = 0;
  
  // Count conversations that are not image mode (since image generations don't count as chats)
  for (const conversation of conversations) {
    if (conversation.mode !== 'image') {
      totalChats++;
      totalMessages += conversation.messages.length;
    }
  }
  
  // Determine API key tier based on usage:
  // Tier 1 (heavy users): More than 10 chats or 50 messages
  // Tier 2 (medium users): More than 5 chats or 20 messages
  // Tier 3 (light users): More than 1 chat or 5 messages
  // Tier 4 (new users): Default to lowest tier
  
  if (totalChats > 10 || totalMessages > 50) {
    // Heavy user - use primary API key
    return API_KEY_1;
  } else if (totalChats > 5 || totalMessages > 20) {
    // Medium user - use second API key
    return API_KEY_2;
  } else if (totalChats > 1 || totalMessages > 5) {
    // Light user - use third API key
    return API_KEY_3;
  } else {
    // New user or very light user - use fourth API key
    return API_KEY_4;
  }
}
