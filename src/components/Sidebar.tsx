import { useState } from 'react'
import { Plus, ChatCircle, Image, Trash, Sparkle, PushPin, TrashSimple, UsersThree, MaskHappy, VideoCamera } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Conversation, AppMode } from '@/lib/types'
import { UserMenu } from '@/components/UserMenu'
import { SearchBar } from '@/components/SearchBar'
import { ClearAllDialog } from '@/components/ClearAllDialog'
import { ConversationActions } from '@/components/ConversationActions'
import { RenameConversationDialog } from '@/components/RenameConversationDialog'
import { TagsDisplay } from '@/components/TagsManager'

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  mode: AppMode
  onNewChat: () => void
  onNewGroupChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onModeChange: (mode: AppMode) => void
  onPinConversation?: (id: string) => void
  onClearAll?: () => void
  onRenameConversation?: (id: string, newTitle: string) => void
  onUpdateConversationTags?: (id: string, tags: string[]) => void
  onOpenMemory?: () => void
  onOpenPersonas?: () => void
  onOpenFavorites?: () => void
  onOpenOfflineMode?: () => void
}

export function Sidebar({
  conversations,
  currentConversationId,
  mode,
  onNewChat,
  onNewGroupChat,
  onSelectConversation,
  onDeleteConversation,
  onModeChange,
  onPinConversation,
  onClearAll,
  onRenameConversation,
  onUpdateConversationTags,
  onOpenMemory,
  onOpenPersonas,
  onOpenFavorites,
  onOpenOfflineMode,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [renameConvId, setRenameConvId] = useState<string | null>(null)

  const chatConversations = conversations.filter((c) => c.mode === 'chat')
  const imageConversations = conversations.filter((c) => c.mode === 'image')
  const videoConversations = conversations.filter((c) => c.mode === 'video')
  const roleplayConversations = conversations.filter((c) => c.mode === 'roleplay')
  
  const currentModeConversations = mode === 'chat' ? chatConversations : mode === 'image' ? imageConversations : mode === 'video' ? videoConversations : roleplayConversations
  
  // Get all unique tags from conversations
  const allTags = [...new Set(currentModeConversations.flatMap(c => c.tags || []))].sort()
  
  // Filter conversations based on search query and selected tag
  const filteredConversations = currentModeConversations.filter((c) => {
    // Filter by tag if selected
    if (selectedTag && (!c.tags || !c.tags.includes(selectedTag))) {
      return false
    }
    
    // Filter by search query
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      c.title.toLowerCase().includes(query) ||
      c.messages.some(m => m.content.toLowerCase().includes(query)) ||
      (c.tags && c.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  })
  
  // Sort: pinned first, then by updatedAt
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.updatedAt - a.updatedAt
  })

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll()
      setClearAllOpen(false)
    }
  }

  const renameConversation = conversations.find(c => c.id === renameConvId)
  
  const handleRename = (newTitle: string) => {
    if (renameConvId && onRenameConversation) {
      onRenameConversation(renameConvId, newTitle)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-900/40 backdrop-blur-xl border-white/30 shadow-lg">
      <div className="flex items-center justify-between gap-2 p-6">
        <div className="flex items-center gap-2">
          <div className="prism-gradient rounded-lg p-2">
            <Sparkle className="text-white" size={24} weight="fill" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">PrisimAI</h1>
        </div>
        <UserMenu 
          onOpenMemory={onOpenMemory}
          onOpenPersonas={onOpenPersonas}
          onOpenFavorites={onOpenFavorites}
          onOpenOfflineMode={onOpenOfflineMode}
        />
      </div>

      <div className="px-3 pb-3">
        <Button onClick={onNewChat} className="w-full justify-start gap-2" variant="default">
          <Plus size={18} />
          New Chat
        </Button>
      </div>

      <div className="px-3 pb-3">
        <Button onClick={onNewGroupChat} className="w-full justify-start gap-2" variant="outline">
          <UsersThree size={18} />
          New Group Chat
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
        <Button
          onClick={() => onModeChange('video')}
          variant={mode === 'video' ? 'secondary' : 'ghost'}
          className="flex-1 gap-2"
          size="sm"
        >
          <VideoCamera size={16} />
          Video
        </Button>
      </div>

      <Separator />

      <div className="px-3 pb-3 pt-3">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="px-3 pb-3">
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedTag === null ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {currentModeConversations.length === 0 && (
            <p className="px-3 py-2 text-sm text-white/60">
              {mode === 'chat' ? 'No conversations yet' : mode === 'image' ? 'No image generations yet' : mode === 'video' ? 'No video generations yet' : 'No group chats yet'}
            </p>
          )}
          
          {currentModeConversations.length > 0 && sortedConversations.length === 0 && (
            <p className="px-3 py-2 text-sm text-white/60">
              No results found for "{searchQuery}"
            </p>
          )}
          
          {sortedConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'group relative flex flex-col gap-1 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                currentConversationId === conversation.id && 'bg-muted'
              )}
            >
              <div className="flex items-center gap-2">
                {conversation.isPinned && (
                  <PushPin size={12} className="text-white/70 shrink-0" weight="fill" />
                )}
                <button
                  onClick={() => onSelectConversation(conversation.id)}
                  className="flex-1 truncate text-left text-white"
                >
                  {conversation.title}
                </button>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <ConversationActions
                    conversation={conversation}
                    onPin={onPinConversation ? () => onPinConversation(conversation.id) : undefined}
                    onDelete={() => onDeleteConversation(conversation.id)}
                    onRename={onRenameConversation ? () => setRenameConvId(conversation.id) : undefined}
                    onTagsChange={onUpdateConversationTags ? (tags) => onUpdateConversationTags(conversation.id, tags) : undefined}
                    allTags={allTags}
                  />
                </div>
              </div>
              {conversation.tags && conversation.tags.length > 0 && (
                <div className="ml-5">
                  <TagsDisplay tags={conversation.tags} maxDisplay={2} />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {currentModeConversations.length > 0 && onClearAll && (
        <>
          <Separator />
          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={() => setClearAllOpen(true)}
            >
              <TrashSimple size={16} />
              Clear All ({currentModeConversations.length})
            </Button>
          </div>
        </>
      )}

      {/* Roleplay Button - Always visible at the bottom */}
      <Separator />
      <div className="p-3">
        <Button
          variant={mode === 'roleplay' ? 'default' : 'outline'}
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => onModeChange('roleplay')}
        >
          <MaskHappy size={16} weight="fill" />
          AI Roleplay
        </Button>
      </div>

      <ClearAllDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        onConfirm={handleClearAll}
        count={currentModeConversations.length}
      />

      {renameConversation && (
        <RenameConversationDialog
          open={!!renameConvId}
          onOpenChange={(open) => !open && setRenameConvId(null)}
          currentTitle={renameConversation.title}
          onRename={handleRename}
        />
      )}
    </div>
  )
}
