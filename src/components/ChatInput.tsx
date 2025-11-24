import { useState, KeyboardEvent, useRef } from 'react'
import { PaperPlaneRight, Microphone, Paperclip, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { FileAttachment } from '@/lib/types'

interface ChatInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Ask anything' }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !disabled) {
      onSend(input.trim(), attachments.length > 0 ? attachments : undefined)
      setInput('')
      setAttachments([])
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Limit file size to 10MB
    const maxSize = 10 * 1024 * 1024
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 10MB.`)
        return false
      }
      return true
    })

    // Limit number of files
    if (attachments.length + validFiles.length > 5) {
      toast.error('Maximum 5 files allowed per message')
      return
    }

    // Process files
    const newAttachments: FileAttachment[] = []
    
    for (const file of validFiles) {
      try {
        let content = ''
        
        // Read file content
        if (file.type.startsWith('text/') || file.type === 'application/json') {
          content = await readTextFile(file)
        } else if (file.type.startsWith('image/')) {
          content = await readImageFile(file)
        } else {
          // For other files, just store metadata
          content = ''
        }

        const attachment: FileAttachment = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          content,
        }

        newAttachments.push(attachment)
      } catch (error) {
        console.error('Error processing file:', error)
        toast.error(`Failed to process ${file.name}`)
      }
    }

    setAttachments(prev => [...prev, ...newAttachments])
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const readImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id)
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url)
      }
      return prev.filter(a => a.id !== id)
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-3xl">
        {/* File attachments preview */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((file) => (
              <Badge key={file.id} variant="secondary" className="gap-2 pr-1">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                <button
                  onClick={() => removeAttachment(file.id)}
                  className="ml-1 rounded-sm hover:bg-muted p-0.5"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2">
          <Textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[60px] resize-none pr-32"
            rows={1}
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept=".txt,.json,.csv,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
            >
              <Paperclip size={18} />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={disabled}
              title="Voice input (coming soon)"
            >
              <Microphone size={18} />
            </Button>
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || disabled}
              size="sm"
              className="h-8 w-8 p-0"
              title="Send message"
            >
              <PaperPlaneRight size={18} weight="fill" />
            </Button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          PrisimAI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  )
}
