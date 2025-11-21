export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
  isFavorite?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  mode: 'chat' | 'image'
  isPinned?: boolean
}

export interface GeneratedImage {
  id: string
  prompt: string
  url: string
  timestamp: number
  model: string
}

export type AppMode = 'chat' | 'image'
