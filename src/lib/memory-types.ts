export interface MemoryEntry {
  id: string
  key: string
  value: string
  category: 'preference' | 'fact' | 'context' | 'custom'
  createdAt: number
  updatedAt: number
  priority: 'high' | 'medium' | 'low'
}

export interface AIPersona {
  id: string
  name: string
  avatar?: string
  systemPrompt: string
  temperature: number
  color: string
  enabled: boolean
}

export interface GroupChatParticipant {
  id: string
  type: 'user' | 'ai'
  personaId?: string // For AI participants
  name: string
  avatar?: string
  color?: string
}

export interface GroupChatMessage {
  id: string
  participantId: string
  content: string
  timestamp: number
  isStreaming?: boolean
  replyTo?: string // Message ID this is replying to
}

export interface GroupChat {
  id: string
  title: string
  participants: GroupChatParticipant[]
  messages: GroupChatMessage[]
  createdAt: number
  updatedAt: number
  isPinned?: boolean
}
