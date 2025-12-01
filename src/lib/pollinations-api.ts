import { webLLMService } from './webllm-service'
import type { Conversation } from './types'

// API Keys - 4 different keys for different usage tiers
const API_KEY_1 = 'plln_sk_niDbx9acZfiWE3tdVmrXKyk0wh5GnGdM' // Primary key for heavy users
const API_KEY_2 = 'plln_sk_gQKCYN1GNHUb0b5OGbasEx2dXqyXO364'
const API_KEY_3 = 'plln_sk_fnpi8FteeCwCDgmXF2A1vciVI73sFxA7'
const API_KEY_4 = 'plln_sk_wfjz4KCVFGQn4izP4AuYEZajHUkS51Hh'

const BASE_URL = 'https://enter.pollinations.ai/api/generate'
const IMAGE_BASE_URL = 'https://enter.pollinations.ai/api/generate/image'

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

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
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

export interface GenerateImageOptions {
  width?: number
  height?: number
  nologo?: boolean
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

// Hardcoded list of emails with premium access to all models
export const PREMIUM_ACCESS_EMAILS: string[] = [
  // Add emails here that should have access to all models
  // Example: 'premium@example.com'
]

// Check if a user email has premium access
export function hasPremiumAccess(email: string | null | undefined): boolean {
  if (!email) return false
  return PREMIUM_ACCESS_EMAILS.includes(email.toLowerCase())
}

const FALLBACK_TEXT_MODELS: TextModel[] = [
  { id: 'openai', description: 'OpenAI GPT-4', tools: true },
  { id: 'mistral', description: 'Mistral Large', tools: true },
  { id: 'claude', description: 'Anthropic Claude', tools: true },
  { id: 'llama', description: 'Meta Llama 3', tools: false },
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
  { name: 'flux', description: 'Flux' },
  { name: 'flux-realism', description: 'Flux Realism' },
  { name: 'flux-anime', description: 'Flux Anime' },
  { name: 'flux-3d', description: 'Flux 3D' },
  { name: 'turbo', description: 'Turbo' },
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
  if (options?.nologo !== undefined) queryParams.set('nologo', String(options.nologo))
  
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
