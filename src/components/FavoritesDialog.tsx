import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Star, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Conversation } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FavoritesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversations: Conversation[]
  onUnfavorite?: (conversationId: string, messageId: string) => void
}

export function FavoritesDialog({ 
  open, 
  onOpenChange, 
  conversations,
  onUnfavorite 
}: FavoritesDialogProps) {
  const favoriteMessages = conversations.flatMap(conv => 
    conv.messages
      .filter(msg => msg.isFavorite)
      .map(msg => ({ ...msg, conversationTitle: conv.title, conversationId: conv.id }))
  )

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star size={20} weight="fill" className="text-yellow-500" />
            Favorite Messages
          </DialogTitle>
          <DialogDescription>
            Your saved messages across all conversations
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {favoriteMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No favorite messages yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click the star icon on any message to save it here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteMessages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      From: {msg.conversationTitle}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleCopy(msg.content)}
                      >
                        <Copy size={14} />
                      </Button>
                      {onUnfavorite && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => onUnfavorite(msg.conversationId, msg.id)}
                        >
                          <Star size={14} weight="fill" className="text-yellow-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className={cn(
                    'text-sm font-medium',
                    msg.role === 'user' ? 'text-primary' : 'text-foreground'
                  )}>
                    {msg.role === 'user' ? 'You' : 'PrisimAI'}
                  </p>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
