import { useState, useRef, useEffect } from 'react'
import { User, Robot, PaperPlaneRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatMessage as ChatMessageComponent } from '@/components/ChatMessage'
import type { Conversation } from '@/lib/types'
import type { AIPersona } from '@/lib/memory-types'

// Premade personas - same as in RoleplayPage
const PREMADE_PERSONAS: Omit<AIPersona, 'id'>[] = [
  {
    name: 'Creative Writer',
    systemPrompt: 'You are a creative and imaginative writer who loves crafting stories, poems, and creative content. You provide vivid descriptions and engaging narratives.',
    temperature: 0.9,
    color: '#8b5cf6',
    enabled: true,
  },
  {
    name: 'Tech Expert',
    systemPrompt: 'You are a knowledgeable technology expert who can explain complex technical concepts in simple terms. You stay up-to-date with the latest tech trends and provide practical advice.',
    temperature: 0.7,
    color: '#3b82f6',
    enabled: true,
  },
  {
    name: 'Life Coach',
    systemPrompt: 'You are a supportive and motivational life coach who helps people achieve their goals and overcome challenges. You provide encouragement and practical strategies for personal growth.',
    temperature: 0.8,
    color: '#10b981',
    enabled: true,
  },
  {
    name: 'Comedian',
    systemPrompt: 'You are a witty and humorous comedian who loves making people laugh. You use clever wordplay, jokes, and funny observations to lighten the mood.',
    temperature: 0.9,
    color: '#f59e0b',
    enabled: true,
  },
  {
    name: 'Philosopher',
    systemPrompt: 'You are a thoughtful philosopher who explores deep questions about life, existence, and meaning. You encourage critical thinking and provide different perspectives on complex topics.',
    temperature: 0.7,
    color: '#6366f1',
    enabled: true,
  },
  {
    name: 'Scientist',
    systemPrompt: 'You are a curious and analytical scientist who loves exploring how the world works. You explain scientific concepts clearly and encourage evidence-based thinking.',
    temperature: 0.6,
    color: '#06b6d4',
    enabled: true,
  },
]

interface GroupChatInterfaceProps {
  conversation: Conversation
  personas: AIPersona[]
  onSendMessage: (content: string) => void
  isGenerating: boolean
}

export function GroupChatInterface({
  conversation,
  personas,
  onSendMessage,
  isGenerating,
}: GroupChatInterfaceProps) {
  const [message, setMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [conversation.messages])

  const handleSend = () => {
    if (!message.trim() || isGenerating) return
    onSendMessage(message)
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Combine premade and custom personas
  const allPersonas: AIPersona[] = [
    ...PREMADE_PERSONAS.map((p, idx) => ({ ...p, id: `premade_${idx}` })),
    ...personas,
  ]

  // Get personas participating in this group chat
  const participatingPersonas = allPersonas.filter(p => 
    conversation.participants?.includes(p.id)
  )

  return (
    <div className="flex flex-col h-full">
      {/* Participants bar */}
      <div className="border-b px-6 py-3 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{conversation.title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-muted-foreground">Participants:</p>
            <Badge variant="default" className="gap-1">
              <User size={12} />
              You
            </Badge>
            {participatingPersonas.map((persona) => (
              <Badge
                key={persona.id}
                variant="secondary"
                className="gap-1"
                style={{ borderLeft: `3px solid ${persona.color}` }}
              >
                <Robot size={12} />
                {persona.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="mx-auto max-w-3xl">
          {conversation.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-12 text-center">
              <div>
                <Robot size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Start the group conversation</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {participatingPersonas.length} AI persona{participatingPersonas.length !== 1 ? 's' : ''} will respond to your messages
                </p>
              </div>
            </div>
          ) : (
            conversation.messages.map((msg) => (
              <ChatMessageComponent 
                key={msg.id} 
                message={msg}
                onToggleFavorite={() => {}}
              />
            ))
          )}
          {isGenerating && (
            <div className="flex gap-4 bg-muted/50 px-6 py-4">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="min-h-[60px] resize-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isGenerating}
            size="lg"
            className="px-4"
          >
            <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </div>
      </div>
    </div>
  )
}
