import { useState } from 'react'
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
  FileCsv,
  FileCode,
  PencilSimple,
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

interface ConversationActionsProps {
  conversation: Conversation
  onPin?: () => void
  onDelete?: () => void
  onRename?: () => void
}

export function ConversationActions({ conversation, onPin, onDelete, onRename }: ConversationActionsProps) {
  const [showStats, setShowStats] = useState(false)

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
              <FileCsv className="mr-2 h-4 w-4" />
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
