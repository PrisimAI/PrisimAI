import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { User, PaperPlaneRight, ArrowLeft, IdentificationCard } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Conversation, ChatMessage } from '@/lib/types'
import type { AIPersona } from '@/lib/memory-types'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { CharacterCardDialog } from '@/components/CharacterCardDialog'

interface RoleplayChatProps {
  conversation: Conversation
  persona: AIPersona
  onSendMessage: (content: string) => void
  onBack: () => void
  isGenerating: boolean
}

export function RoleplayChat({
  conversation,
  persona,
  onSendMessage,
  onBack,
  isGenerating,
}: RoleplayChatProps) {
  const [input, setInput] = useState('')
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        // Use setTimeout to ensure the DOM has updated
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
    // Parse markdown for AI messages
    const html = marked.parse(content, { async: false }) as string
    return DOMPurify.sanitize(html)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: persona.color }}
            onClick={() => setCardDialogOpen(true)}
          >
            <span className="text-white text-base sm:text-lg font-semibold">
              {persona.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold truncate">{persona.name}</h1>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">
              {persona.systemPrompt.length > 60 ? `${persona.systemPrompt.substring(0, 60)}...` : persona.systemPrompt}
            </p>
            <p className="text-xs text-muted-foreground truncate sm:hidden">
              Roleplay character
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCardDialogOpen(true)}
            className="shrink-0"
          >
            <IdentificationCard size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">View Card</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 h-full">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {conversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 sm:mb-4"
                style={{ backgroundColor: persona.color }}
              >
                <span className="text-white text-2xl sm:text-3xl font-semibold">
                  {persona.name.charAt(0)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">{persona.name}</h2>
              <p className="text-muted-foreground max-w-md mb-4 sm:mb-6 text-sm sm:text-base">
                {persona.systemPrompt}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Start the conversation below
              </p>
            </div>
          ) : (
            <>
              {conversation.messages.map((message: ChatMessage) => {
                const isUser = message.role === 'user'
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2 sm:gap-3 mb-4 sm:mb-6',
                      isUser && 'flex-row-reverse'
                    )}
                  >
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                      <AvatarFallback
                        style={{
                          backgroundColor: isUser ? '#3b82f6' : persona.color,
                        }}
                      >
                        {isUser ? (
                          <User className="text-white" size={16} weight="bold" />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {persona.name.charAt(0)}
                          </span>
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('flex-1 space-y-1', isUser && 'flex flex-col items-end')}>
                      <p className="text-xs sm:text-sm font-medium">
                        {isUser ? 'You' : persona.name}
                      </p>
                      <div
                        className={cn(
                          'rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 max-w-[90%] sm:max-w-[85%] inline-block',
                          isUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-slate-800 border shadow-sm',
                          message.isStreaming && 'streaming-cursor'
                        )}
                      >
                        {isUser || message.isStreaming ? (
                          <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
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
                <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                    <div className="rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-800 border shadow-sm max-w-[90%] sm:max-w-[85%]">
                      <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                      <Skeleton className="h-3 sm:h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm safe-bottom">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex gap-2 sm:gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${persona.name}...`}
              disabled={isGenerating}
              className="min-h-[48px] sm:min-h-[52px] max-h-32 resize-none rounded-2xl bg-white dark:bg-slate-800 border-2 focus-visible:ring-1 text-sm sm:text-base"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              size="lg"
              className="h-[48px] sm:h-[52px] px-4 sm:px-5 rounded-2xl shrink-0"
              style={{ backgroundColor: input.trim() && !isGenerating ? persona.color : undefined }}
            >
              <PaperPlaneRight size={18} className="sm:w-5 sm:h-5" weight="fill" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground px-2">
            Remember: AI characters are not real. Responses are generated by AI.
          </p>
        </div>
      </div>

      {/* Character Card Dialog */}
      <CharacterCardDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        persona={persona}
      />
    </div>
  )
}
