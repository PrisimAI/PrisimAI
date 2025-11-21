const API_KEY = 'plln_sk_niDbx9acZfiWE3tdVmrXKyk0wh5GnGdM'
const BASE_URL = 'https://enter.pollinations.ai/api/generate'

// Development/Mock mode - enables fallback responses when API is unavailable
const ENABLE_MOCK_MODE = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK_API === 'true'

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
}

export interface TextModel {
  name: string
  description?: string
  aliases?: string[]
  tools?: boolean
}

export interface ImageModel {
  name: string
  description?: string
  aliases?: string[]
}

const FALLBACK_TEXT_MODELS: TextModel[] = [
  { name: 'openai', description: 'Advanced Reasoning', tools: true },
  { name: 'mistral', description: 'Efficient Intelligence', tools: true },
  { name: 'claude', description: 'Safe Assistant', tools: true },
  { name: 'llama', description: 'Open Source', tools: false },
]

// Helper function to generate a two-word description for a model using AI
async function generateModelDescription(modelName: string, modelType: 'text' | 'image'): Promise<string> {
  try {
    const prompt = `Generate a concise two-word description for an AI model named "${modelName}". The model is a ${modelType} generation model. Respond with ONLY the two-word description, nothing else.`
    
    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate description')
    }

    const data = await response.json()
    const description = data.choices[0].message.content.trim()
    
    // Ensure it's roughly two words (allow some flexibility)
    const words = description.split(/\s+/)
    if (words.length <= 3) {
      return description
    }
    
    // If too long, just return first two words
    return words.slice(0, 2).join(' ')
  } catch (error) {
    console.error(`Failed to generate description for ${modelName}:`, error)
    // Return a simple fallback based on the model name
    return modelName.split('-').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }
}

export async function getTextModels(): Promise<TextModel[]> {
  // In mock mode or if API is blocked, return fallback models immediately
  if (ENABLE_MOCK_MODE) {
    console.info('Using mock/fallback text models')
    return FALLBACK_TEXT_MODELS
  }

  try {
    const response = await fetch(`${BASE_URL}/v1/models`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })
    
    if (!response.ok) {
      console.warn('API call failed, using fallback models')
      return FALLBACK_TEXT_MODELS
    }
    
    const data = await response.json()
    let models = Array.isArray(data) ? data : data.data || []
    
    // Filter out invalid models and ensure they have required properties
    models = models.filter((m: any) => m && m.name)
    
    // If no valid models, use fallback
    if (models.length === 0) {
      console.warn('No valid models returned, using fallback models')
      return FALLBACK_TEXT_MODELS
    }
    
    // Generate descriptions for models that don't have them
    const modelsWithDescriptions = await Promise.all(
      models.map(async (model: any) => {
        if (!model.description) {
          console.info(`Generating description for model: ${model.name}`)
          model.description = await generateModelDescription(model.name, 'text')
        }
        return model
      })
    )
    
    return modelsWithDescriptions
  } catch (error) {
    console.error('Error fetching text models:', error)
    return FALLBACK_TEXT_MODELS
  }
}

const FALLBACK_IMAGE_MODELS: ImageModel[] = [
  { name: 'flux', description: 'Creative Generation' },
  { name: 'flux-realism', description: 'Photorealistic Images' },
  { name: 'flux-anime', description: 'Anime Style' },
  { name: 'flux-3d', description: '3D Rendering' },
  { name: 'turbo', description: 'Fast Generation' },
]

export async function getImageModels(): Promise<ImageModel[]> {
  // In mock mode or if API is blocked, return fallback models immediately
  if (ENABLE_MOCK_MODE) {
    console.info('Using mock/fallback image models')
    return FALLBACK_IMAGE_MODELS
  }

  try {
    const response = await fetch(`${BASE_URL}/image/models`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
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
    
    // Generate descriptions for models that don't have them
    const modelsWithDescriptions = await Promise.all(
      models.map(async (model: any) => {
        if (!model.description) {
          console.info(`Generating description for model: ${model.name}`)
          model.description = await generateModelDescription(model.name, 'image')
        }
        return model
      })
    )
    
    return modelsWithDescriptions
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
  // Mock mode: Simulate AI response when API is unavailable
  if (ENABLE_MOCK_MODE) {
    console.info('Using mock text generation')
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    const userContent = lastUserMessage?.content || ''
    
    // Generate a contextual mock response
    const mockResponse = `I understand you said: "${userContent}". I'm running in mock mode because the external API is unavailable. In production, I would provide a detailed response to your question. This allows you to test the interface and see how messages are displayed even when the AI service is not accessible.`
    
    // Simulate streaming if callback is provided
    if (onChunk) {
      const words = mockResponse.split(' ')
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 50)) // 50ms delay per word
        onChunk(word + ' ')
      }
      return mockResponse
    }
    
    return mockResponse
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
      Authorization: `Bearer ${API_KEY}`,
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

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6))
            const content = data.choices?.[0]?.delta?.content || ''
            if (content) {
              fullText += content
              onChunk(content)
            }
          } catch (e) {
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
  model: string = 'flux'
): Promise<string> {
  // Mock mode: Return a placeholder image when API is unavailable
  if (ENABLE_MOCK_MODE) {
    console.info('Using mock image generation')
    // Escape prompt to prevent XSS in SVG
    const escapedPrompt = prompt
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .substring(0, 50)
    const displayPrompt = prompt.length > 50 ? escapedPrompt + '...' : escapedPrompt
    
    // Create a simple SVG placeholder image with the prompt text
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="#f0f0f0"/>
      <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#666">
        Mock Image
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">
        Prompt: ${displayPrompt}
      </text>
    </svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    return URL.createObjectURL(blob)
  }

  const encodedPrompt = encodeURIComponent(prompt)
  const url = `${BASE_URL}/image/${encodedPrompt}?model=${model}`
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to generate image')
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
