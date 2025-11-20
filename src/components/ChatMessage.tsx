import { useState } from 'react'
import { User, Sparkle, Copy, Check, ArrowsClockwise } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import { marked } from 'marked'

interface ChatMessageProps {
  message: ChatMessageType
  onRegenerate?: () => void
}

export function ChatMessage({ message, onRegenerate }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse markdown for assistant messages
  const formattedContent = !isUser && !message.isStreaming
    ? marked.parse(message.content, { async: false }) as string
    : message.content

  return (
    <div className={cn('group flex gap-4 px-6 py-4', !isUser && 'bg-muted/50')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(isUser ? 'bg-primary' : 'prism-gradient')}>
          {isUser ? (
            <User className="text-primary-foreground" size={18} weight="bold" />
          ) : (
            <Sparkle className="text-white" size={18} weight="fill" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-sm font-medium">{isUser ? 'You' : 'PrismAI'}</p>
        <div className={cn('prose prose-sm dark:prose-invert max-w-none', message.isStreaming && 'streaming-cursor')}>
          {!isUser && !message.isStreaming ? (
            <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
          ) : (
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          )}
        </div>
        
        {!message.isStreaming && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={14} className="mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  Copy
                </>
              )}
            </Button>
            {!isUser && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onRegenerate}
              >
                <ArrowsClockwise size={14} className="mr-1" />
                Regenerate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
