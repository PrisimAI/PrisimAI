import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Robot, Users, User } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AIPersona, GroupChatParticipant } from '@/lib/memory-types'

interface CreateGroupChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personas: AIPersona[]
  currentUserId: string
  currentUserName: string
  onCreateGroupChat: (title: string, participants: GroupChatParticipant[]) => void
}

export function CreateGroupChatDialog({
  open,
  onOpenChange,
  personas,
  currentUserId,
  currentUserName,
  onCreateGroupChat,
}: CreateGroupChatDialogProps) {
  const [title, setTitle] = useState('')
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set())

  const handleTogglePersona = (personaId: string) => {
    const newSelected = new Set(selectedPersonas)
    if (newSelected.has(personaId)) {
      newSelected.delete(personaId)
    } else {
      newSelected.add(personaId)
    }
    setSelectedPersonas(newSelected)
  }

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (selectedPersonas.size === 0) {
      toast.error('Please select at least one AI persona')
      return
    }

    const participants: GroupChatParticipant[] = [
      {
        id: currentUserId,
        type: 'user',
        name: currentUserName,
        color: '#3b82f6',
      },
      ...Array.from(selectedPersonas).map((personaId) => {
        const persona = personas.find(p => p.id === personaId)!
        return {
          id: `ai_${personaId}`,
          type: 'ai' as const,
          personaId,
          name: persona.name,
          color: persona.color,
        }
      }),
    ]

    onCreateGroupChat(title, participants)
    setTitle('')
    setSelectedPersonas(new Set())
    onOpenChange(false)
  }

  const enabledPersonas = personas.filter(p => p.enabled)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={24} weight="fill" />
            Create Group Chat
          </DialogTitle>
          <DialogDescription>
            Create a conversation with multiple AI personas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-title">Group Chat Title</Label>
            <Input
              id="group-title"
              placeholder="e.g., 'Project Brainstorm', 'Debug Session'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Select AI Participants ({selectedPersonas.size} selected)</Label>
            {enabledPersonas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Robot size={48} className="mx-auto mb-2 opacity-50" />
                <p>No personas available</p>
                <p className="text-sm mt-1">Create personas in the Persona Manager first</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-3">
                  {enabledPersonas.map((persona) => (
                    <div
                      key={persona.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleTogglePersona(persona.id)}
                    >
                      <Checkbox
                        checked={selectedPersonas.has(persona.id)}
                        onCheckedChange={() => handleTogglePersona(persona.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: persona.color }}
                          >
                            <Robot size={14} weight="fill" className="text-white" />
                          </div>
                          <p className="font-medium">{persona.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            Temp: {persona.temperature}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {persona.systemPrompt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {selectedPersonas.size > 0 && (
            <div className="border rounded-lg p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">Selected Participants:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">
                  <User size={12} className="mr-1" />
                  You
                </Badge>
                {Array.from(selectedPersonas).map((personaId) => {
                  const persona = personas.find(p => p.id === personaId)!
                  return (
                    <Badge
                      key={personaId}
                      style={{ backgroundColor: persona.color }}
                      className="text-white"
                    >
                      <Robot size={12} className="mr-1" />
                      {persona.name}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || selectedPersonas.size === 0}
          >
            <Users size={16} className="mr-2" />
            Create Group Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
