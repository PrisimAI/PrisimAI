import { User, Sparkle } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/lib/types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-4 px-6 py-4', !isUser && 'bg-muted/50')}>
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
        <div className={cn('prose prose-sm max-w-none', message.isStreaming && 'streaming-cursor')}>
          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
