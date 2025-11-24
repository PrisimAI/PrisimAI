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
  mode: 'chat' | 'image' | 'roleplay'
  isPinned?: boolean
  isGroupChat?: boolean
  participants?: string[] // IDs of personas participating in group chat
}

export interface GeneratedImage {
  id: string
  prompt: string
  url: string
  timestamp: number
  model: string
}

export type AppMode = 'chat' | 'image' | 'roleplay'

export interface OfflineSettings {
  enabled: boolean
  selectedModel: string | null
  modelLoaded: boolean
}
