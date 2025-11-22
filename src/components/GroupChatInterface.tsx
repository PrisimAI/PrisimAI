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
import { PREMADE_PERSONAS, CHARACTER_PERSONAS } from '@/lib/personas-config'

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

  // Combine premade, character, and custom personas
  const allPersonas: AIPersona[] = [
    ...PREMADE_PERSONAS.map((p, idx) => ({ ...p, id: `premade_${idx}` })),
    ...CHARACTER_PERSONAS.map((p, idx) => ({ ...p, id: `character_${idx}` })),
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
