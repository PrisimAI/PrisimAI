import { useState } from 'react'
import { User, Sparkle, Copy, Check, ArrowsClockwise, PencilSimple, X, File, Image as ImageIcon, FileText } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import { marked } from 'marked'
import { FavoriteButton } from '@/components/FavoriteButton'

interface ChatMessageProps {
  message: ChatMessageType
  onRegenerate?: () => void
  onToggleFavorite?: () => void
  onEdit?: (newContent: string) => void
}

export function ChatMessage({ message, onRegenerate, onToggleFavorite, onEdit }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(editContent)
      setIsEditing(false)
      toast.success('Message updated')
    }
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  // Parse markdown for assistant messages
  const formattedContent = !isUser && !message.isStreaming
    ? marked.parse(message.content, { async: false }) as string
    : message.content

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={16} />
    if (type.startsWith('text/') || type === 'application/json') return <FileText size={16} />
    return <File size={16} />
  }

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
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{isUser ? 'You' : 'PrisimAI'}</p>
          {message.isFavorite && (
            <span className="text-xs text-yellow-600 dark:text-yellow-500">⭐ Favorited</span>
          )}
        </div>

        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2">
            {message.attachments.map((file) => (
              <div key={file.id} className="flex items-center gap-2">
                {file.type.startsWith('image/') && file.content ? (
                  <div className="rounded-lg overflow-hidden border max-w-sm">
                    <img
                      src={file.content}
                      alt={file.name}
                      className="max-h-64 object-contain"
                    />
                    <div className="px-2 py-1 bg-muted/50 text-xs flex items-center gap-1">
                      <ImageIcon size={12} />
                      <span className="truncate">{file.name}</span>
                      <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    {getFileIcon(file.type)}
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                <X size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn('prose prose-sm dark:prose-invert max-w-none', message.isStreaming && 'streaming-cursor')}>
            {!isUser && !message.isStreaming ? (
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            ) : (
              <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
            )}
          </div>
        )}
        
        {!message.isStreaming && !isEditing && (
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
            {onToggleFavorite && (
              <FavoriteButton
                isFavorite={message.isFavorite}
                onToggle={onToggleFavorite}
              />
            )}
            {isUser && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsEditing(true)}
              >
                <PencilSimple size={14} className="mr-1" />
                Edit
              </Button>
            )}
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
