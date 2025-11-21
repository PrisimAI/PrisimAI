import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from '@phosphor-icons/react'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  { key: 'Ctrl/Cmd + K', description: 'Focus search bar' },
  { key: 'Ctrl/Cmd + N', description: 'New conversation' },
  { key: 'Ctrl/Cmd + Shift + D', description: 'Toggle dark mode' },
  { key: 'Ctrl/Cmd + /', description: 'Show keyboard shortcuts' },
  { key: 'Ctrl/Cmd + E', description: 'Export current conversation' },
  { key: 'Ctrl/Cmd + F', description: 'View favorites' },
  { key: 'Ctrl/Cmd + ,', description: 'Open settings' },
  { key: 'Ctrl/Cmd + Enter', description: 'Send message' },
  { key: 'Escape', description: 'Close dialog or cancel action' },
  { key: 'Ctrl/Cmd + 1', description: 'Switch to chat mode' },
  { key: 'Ctrl/Cmd + 2', description: 'Switch to image mode' },
]

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={20} />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
