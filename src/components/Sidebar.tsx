import { Plus, ChatCircle, Image, Trash, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Conversation, AppMode } from '@/lib/types'
import { UserMenu } from '@/components/UserMenu'

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  mode: AppMode
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onModeChange: (mode: AppMode) => void
}

export function Sidebar({
  conversations,
  currentConversationId,
  mode,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onModeChange,
}: SidebarProps) {
  const chatConversations = conversations.filter((c) => c.mode === 'chat')
  const imageConversations = conversations.filter((c) => c.mode === 'image')

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex items-center justify-between gap-2 p-6">
        <div className="flex items-center gap-2">
          <div className="prism-gradient rounded-lg p-2">
            <Sparkle className="text-white" size={24} weight="fill" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">PrismAI</h1>
        </div>
        <UserMenu />
      </div>

      <div className="px-3 pb-3">
        <Button onClick={onNewChat} className="w-full justify-start gap-2" variant="default">
          <Plus size={18} />
          New Chat
        </Button>
      </div>

      <div className="flex gap-1 px-3 pb-3">
        <Button
          onClick={() => onModeChange('chat')}
          variant={mode === 'chat' ? 'secondary' : 'ghost'}
          className="flex-1 gap-2"
          size="sm"
        >
          <ChatCircle size={16} />
          Chat
        </Button>
        <Button
          onClick={() => onModeChange('image')}
          variant={mode === 'image' ? 'secondary' : 'ghost'}
          className="flex-1 gap-2"
          size="sm"
        >
          <Image size={16} />
          Image
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {mode === 'chat' && chatConversations.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No conversations yet</p>
          )}
          {mode === 'image' && imageConversations.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No image generations yet</p>
          )}
          
          {(mode === 'chat' ? chatConversations : imageConversations).map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                currentConversationId === conversation.id && 'bg-muted'
              )}
            >
              <button
                onClick={() => onSelectConversation(conversation.id)}
                className="flex-1 truncate text-left"
              >
                {conversation.title}
              </button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteConversation(conversation.id)
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash size={14} />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
