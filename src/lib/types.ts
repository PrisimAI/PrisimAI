export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
  isFavorite?: boolean
  attachments?: FileAttachment[]
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  content?: string // For text files, base64 for images
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

export interface GeneratedVideo {
  id: string
  prompt: string
  url: string
  timestamp: number
  model: string
}

export type AppMode = 'chat' | 'image' | 'video' | 'roleplay'

export interface OfflineSettings {
  enabled: boolean
  selectedModel: string | null
  modelLoaded: boolean
}
