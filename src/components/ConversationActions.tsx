import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { 
  DotsThree, 
  Download, 
  Copy, 
  Trash, 
  PushPin,
  ChartBar,
  FileText,
  File,
  FileCode,
  PencilSimple,
  Tag,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Conversation } from '@/lib/types'
import { 
  exportAsText, 
  exportAsMarkdown, 
  exportAsJSON, 
  downloadFile,
  getConversationStats 
} from '@/lib/export-utils'
import { TagsManager } from '@/components/TagsManager'

interface ConversationActionsProps {
  conversation: Conversation
  onPin?: () => void
  onDelete?: () => void
  onRename?: () => void
  onTagsChange?: (tags: string[]) => void
  allTags?: string[]
}

export function ConversationActions({ conversation, onPin, onDelete, onRename, onTagsChange, allTags }: ConversationActionsProps) {

  const handleExportText = () => {
    const content = exportAsText(conversation)
    const filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.txt`
    downloadFile(filename, content, 'text/plain')
    toast.success('Exported as text file')
  }

  const handleExportMarkdown = () => {
    const content = exportAsMarkdown(conversation)
    const filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.md`
    downloadFile(filename, content, 'text/markdown')
    toast.success('Exported as markdown file')
  }

  const handleExportJSON = () => {
    const content = exportAsJSON(conversation)
    const filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`
    downloadFile(filename, content, 'application/json')
    toast.success('Exported as JSON file')
  }

  const handleCopyAll = () => {
    const content = exportAsText(conversation)
    navigator.clipboard.writeText(content)
    toast.success('Conversation copied to clipboard')
  }

  const handleShowStats = () => {
    const stats = getConversationStats(conversation)
    toast.info(
      `📊 Conversation Statistics:\n\n` +
      `Messages: ${stats.messageCount}\n` +
      `Your messages: ${stats.userMessageCount}\n` +
      `AI messages: ${stats.assistantMessageCount}\n` +
      `Total words: ${stats.totalWords.toLocaleString()}\n` +
      `Total characters: ${stats.totalChars.toLocaleString()}`,
      { duration: 5000 }
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <DotsThree size={18} weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {onRename && (
          <>
            <DropdownMenuItem onClick={onRename}>
              <PencilSimple className="mr-2 h-4 w-4" />
              Rename Conversation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {onPin && (
          <>
            <DropdownMenuItem onClick={onPin}>
              <PushPin className="mr-2 h-4 w-4" />
              {conversation.isPinned ? 'Unpin' : 'Pin'} Conversation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {onTagsChange && (
          <>
            <div className="px-2 py-1.5">
              <TagsManager 
                tags={conversation.tags} 
                onTagsChange={onTagsChange}
                allTags={allTags}
              />
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Download className="mr-2 h-4 w-4" />
            Export Conversation
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleExportText}>
              <FileText className="mr-2 h-4 w-4" />
              As Text (.txt)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportMarkdown}>
              <File className="mr-2 h-4 w-4" />
              As Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON}>
              <FileCode className="mr-2 h-4 w-4" />
              As JSON (.json)
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={handleCopyAll}>
          <Copy className="mr-2 h-4 w-4" />
          Copy All Messages
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShowStats}>
          <ChartBar className="mr-2 h-4 w-4" />
          View Statistics
        </DropdownMenuItem>

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete Conversation
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
