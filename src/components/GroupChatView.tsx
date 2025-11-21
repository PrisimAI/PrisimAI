import { useState, useRef, useEffect } from 'react'
import { User, Robot, PaperPlaneRight, ArrowBendUpLeft } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { GroupChat, GroupChatMessage, GroupChatParticipant, AIPersona } from '@/lib/memory-types'

interface GroupChatViewProps {
  groupChat: GroupChat
  personas: AIPersona[]
  currentUserId: string
  onSendMessage: (content: string, replyTo?: string) => void
  isGenerating: boolean
}

export function GroupChatView({
  groupChat,
  personas,
  currentUserId,
  onSendMessage,
  isGenerating,
}: GroupChatViewProps) {
  const [message, setMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<GroupChatMessage | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [groupChat.messages])

  const handleSend = () => {
    if (!message.trim() || isGenerating) return
    onSendMessage(message, replyingTo?.id)
    setMessage('')
    setReplyingTo(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getParticipant = (participantId: string): GroupChatParticipant | undefined => {
    return groupChat.participants.find(p => p.id === participantId)
  }

  const getPersona = (personaId: string | undefined): AIPersona | undefined => {
    if (!personaId) return undefined
    return personas.find(p => p.id === personaId)
  }

  const renderMessage = (msg: GroupChatMessage) => {
    const participant = getParticipant(msg.participantId)
    if (!participant) return null

    const isUser = participant.type === 'user'
    const persona = participant.personaId ? getPersona(participant.personaId) : undefined
    const color = persona?.color || participant.color || (isUser ? '#3b82f6' : '#8b5cf6')
    
    const replyToMsg = msg.replyTo ? groupChat.messages.find(m => m.id === msg.replyTo) : null
    const replyToParticipant = replyToMsg ? getParticipant(replyToMsg.participantId) : null

    return (
      <div key={msg.id} className={cn('flex gap-3 px-6 py-4 group', !isUser && 'bg-muted/30')}>
        <Avatar className="h-8 w-8 shrink-0" style={{ backgroundColor: color }}>
          <AvatarFallback className="text-white">
            {isUser ? (
              <User size={18} weight="bold" />
            ) : (
              <Robot size={18} weight="fill" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2 overflow-hidden min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium" style={{ color }}>
              {participant.name}
            </p>
            {persona && (
              <Badge variant="outline" className="text-xs">
                {persona.name}
              </Badge>
            )}
          </div>
          
          {replyToMsg && replyToParticipant && (
            <div className="border-l-2 pl-2 py-1 text-xs text-muted-foreground bg-muted/50 rounded">
              <p className="font-medium">{replyToParticipant.name}</p>
              <p className="line-clamp-2">{replyToMsg.content}</p>
            </div>
          )}
          
          <div className={cn(
            'prose prose-sm dark:prose-invert max-w-none',
            msg.isStreaming && 'streaming-cursor'
          )}>
            <p className="whitespace-pre-wrap break-words leading-relaxed m-0">
              {msg.content}
            </p>
          </div>

          {!msg.isStreaming && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setReplyingTo(msg)}
              >
                <ArrowBendUpLeft size={12} className="mr-1" />
                Reply
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Participants bar */}
      <div className="border-b px-6 py-3 bg-card">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">Participants:</p>
          {groupChat.participants.map((participant) => {
            const persona = participant.personaId ? getPersona(participant.personaId) : undefined
            const color = persona?.color || participant.color || '#3b82f6'
            return (
              <Badge
                key={participant.id}
                variant="secondary"
                className="gap-1"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                {participant.type === 'user' ? (
                  <User size={12} />
                ) : (
                  <Robot size={12} />
                )}
                {participant.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="min-h-full">
          {groupChat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-12 text-center">
              <div>
                <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Start the conversation</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Multiple AI personas will respond to your messages
                </p>
              </div>
            </div>
          ) : (
            groupChat.messages.map(renderMessage)
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        {replyingTo && (
          <div className="mb-2 border-l-2 pl-2 py-1 text-xs bg-muted/50 rounded flex items-center justify-between">
            <div>
              <p className="font-medium">
                Replying to {getParticipant(replyingTo.participantId)?.name}
              </p>
              <p className="line-clamp-1">{replyingTo.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setReplyingTo(null)}
            >
              ×
            </Button>
          </div>
        )}
        <div className="flex gap-2">
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
