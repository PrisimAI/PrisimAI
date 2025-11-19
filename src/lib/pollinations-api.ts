const API_KEY = 'plln_sk_niDbx9acZfiWE3tdVmrXKyk0wh5GnGdM'
const BASE_URL = 'https://enter.pollinations.ai/api'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface TextModel {
  name: string
  description: string
  aliases?: string[]
}

export interface ImageModel {
  name: string
  description: string
  aliases?: string[]
}

export async function getTextModels(): Promise<TextModel[]> {
  try {
    const response = await fetch(`${BASE_URL}/v1/models`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })
    
    if (!response.ok) {
      console.warn('API call failed, using fallback models')
      return [
        { name: 'openai', description: 'OpenAI GPT' },
        { name: 'mistral', description: 'Mistral AI' },
        { name: 'claude', description: 'Anthropic Claude' },
        { name: 'llama', description: 'Meta Llama' },
      ]
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error fetching text models:', error)
    return [
      { name: 'openai', description: 'OpenAI GPT' },
      { name: 'mistral', description: 'Mistral AI' },
      { name: 'claude', description: 'Anthropic Claude' },
      { name: 'llama', description: 'Meta Llama' },
    ]
  }
}

export async function getImageModels(): Promise<ImageModel[]> {
  try {
    const response = await fetch(`${BASE_URL}/image/models`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })
    
    if (!response.ok) {
      console.warn('API call failed, using fallback models')
      return [
        { name: 'flux', description: 'Flux' },
        { name: 'flux-realism', description: 'Flux Realism' },
        { name: 'flux-anime', description: 'Flux Anime' },
        { name: 'flux-3d', description: 'Flux 3D' },
        { name: 'turbo', description: 'Turbo' },
      ]
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error fetching image models:', error)
    return [
      { name: 'flux', description: 'Flux' },
      { name: 'flux-realism', description: 'Flux Realism' },
      { name: 'flux-anime', description: 'Flux Anime' },
      { name: 'flux-3d', description: 'Flux 3D' },
      { name: 'turbo', description: 'Turbo' },
    ]
  }
}

export async function generateText(
  messages: Message[],
  model: string = 'openai',
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: !!onChunk,
    }),
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
