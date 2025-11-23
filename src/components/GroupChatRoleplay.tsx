import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { User, PaperPlaneRight, ArrowLeft, UsersThree } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Conversation, ChatMessage } from '@/lib/types'
import type { AIPersona } from '@/lib/memory-types'
import { marked } from 'marked'

interface GroupChatRoleplayProps {
  conversation: Conversation
  personas: AIPersona[]
  onSendMessage: (content: string) => void
  onBack: () => void
  isGenerating: boolean
}

export function GroupChatRoleplay({
  conversation,
  personas,
  onSendMessage,
  onBack,
  isGenerating,
}: GroupChatRoleplayProps) {
  const [input, setInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
      }
    }
  }, [conversation.messages, isGenerating])

  const handleSend = () => {
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatMessage = (content: string, isUser: boolean) => {
    if (isUser) {
      return content
    }
    return marked.parse(content, { async: false }) as string
  }

  // Get persona for a message (for assistant messages)
  const getPersonaForMessage = (messageIndex: number): AIPersona | undefined => {
    // Simple logic: cycle through personas for assistant messages
    const assistantMessages = conversation.messages.slice(0, messageIndex + 1).filter(m => m.role === 'assistant')
    const personaIndex = (assistantMessages.length - 1) % personas.length
    return personas[personaIndex]
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-slate-950 dark:to-purple-950">
      {/* Header */}
      <div className="border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-2">
                <UsersThree size={24} weight="fill" className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">{conversation.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {personas.length} AI character{personas.length !== 1 ? 's' : ''} in chat
                </p>
              </div>
            </div>
          </div>
          {/* Participants */}
          <div className="flex gap-2 flex-wrap ml-10">
            <Badge variant="default" className="gap-1">
              <User size={12} />
              You
            </Badge>
            {personas.map((persona) => (
              <Badge
                key={persona.id}
                variant="secondary"
                className="gap-1"
                style={{ borderLeft: `3px solid ${persona.color}` }}
              >
                <span className="text-xs">{persona.name}</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {conversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 mb-4">
                <UsersThree size={48} weight="fill" className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Group Roleplay Chat</h2>
              <p className="text-muted-foreground max-w-md mb-4">
                {personas.length} AI characters are ready to interact with you and each other
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 border shadow-sm"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-semibold"
                      style={{ backgroundColor: persona.color }}
                    >
                      {persona.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{persona.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Start the conversation below
              </p>
            </div>
          ) : (
            <>
              {conversation.messages.map((message: ChatMessage, index: number) => {
                const isUser = message.role === 'user'
                const persona = !isUser ? getPersonaForMessage(index) : undefined
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 mb-6',
                      isUser && 'flex-row-reverse'
                    )}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback
                        style={{
                          backgroundColor: isUser ? '#3b82f6' : persona?.color || '#6b7280',
                        }}
                      >
                        {isUser ? (
                          <User className="text-white" size={18} weight="bold" />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {persona?.name.charAt(0) || 'A'}
                          </span>
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('flex-1 space-y-1', isUser && 'flex flex-col items-end')}>
                      <p className="text-sm font-medium">
                        {isUser ? 'You' : persona?.name || 'AI'}
                      </p>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5 max-w-[85%] inline-block',
                          isUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-slate-800 border shadow-sm',
                          message.isStreaming && 'streaming-cursor'
                        )}
                      >
                        {isUser || message.isStreaming ? (
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        ) : (
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            dangerouslySetInnerHTML={{
                              __html: formatMessage(message.content, isUser),
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {isGenerating && conversation.messages[conversation.messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 mb-6">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <div className="rounded-2xl px-4 py-2.5 bg-white dark:bg-slate-800 border shadow-sm max-w-[85%]">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the group..."
              disabled={isGenerating}
              className="min-h-[52px] max-h-32 resize-none rounded-2xl bg-white dark:bg-slate-800 border-2 focus-visible:ring-1"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              size="lg"
              className="h-[52px] px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <PaperPlaneRight size={20} weight="fill" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI characters will respond in turn • Responses are AI-generated
          </p>
        </div>
      </div>
    </div>
  )
}
