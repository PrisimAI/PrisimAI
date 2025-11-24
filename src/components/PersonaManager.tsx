import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Plus, Trash, Pencil, Robot } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AIPersona } from '@/lib/memory-types'

interface PersonaManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personas: AIPersona[]
  onAddPersona: (persona: Omit<AIPersona, 'id'>) => void
  onUpdatePersona: (id: string, persona: Partial<AIPersona>) => void
  onDeletePersona: (id: string) => void
}

const DEFAULT_PERSONAS: Omit<AIPersona, 'id'>[] = [
  {
    name: 'Assistant',
    systemPrompt: 'You are a helpful, knowledgeable AI assistant.',
    temperature: 0.7,
    color: '#3b82f6',
    enabled: true,
  },
  {
    name: 'Creative Writer',
    systemPrompt: 'You are a creative writer with a poetic and imaginative style.',
    temperature: 0.9,
    color: '#a855f7',
    enabled: true,
  },
  {
    name: 'Code Expert',
    systemPrompt: 'You are an expert programmer with deep knowledge of software development.',
    temperature: 0.3,
    color: '#10b981',
    enabled: true,
  },
  {
    name: 'Analyst',
    systemPrompt: 'You are a logical analyst who breaks down complex problems methodically.',
    temperature: 0.5,
    color: '#f59e0b',
    enabled: true,
  },
]

export function PersonaManager({
  open,
  onOpenChange,
  personas,
  onAddPersona,
  onUpdatePersona,
  onDeletePersona,
}: PersonaManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPersona, setNewPersona] = useState<Omit<AIPersona, 'id'>>({
    name: '',
    systemPrompt: '',
    scenario: '',
    temperature: 0.7,
    color: '#3b82f6',
    enabled: true,
  })

  const handleAddPersona = () => {
    if (!newPersona.name.trim() || !newPersona.systemPrompt.trim()) {
      toast.error('Please provide name and system prompt')
      return
    }

    onAddPersona(newPersona)
    setNewPersona({
      name: '',
      systemPrompt: '',
      scenario: '',
      temperature: 0.7,
      color: '#3b82f6',
      enabled: true,
    })
    toast.success('Persona created successfully')
  }

  const handleLoadDefault = (defaultPersona: Omit<AIPersona, 'id'>) => {
    onAddPersona(defaultPersona)
    toast.success(`${defaultPersona.name} persona added`)
  }

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    onUpdatePersona(id, { enabled })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot size={24} weight="fill" />
            AI Personas
          </DialogTitle>
          <DialogDescription>
            Create and manage different AI personalities for group chats
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personas" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personas">My Personas ({personas.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <TabsContent value="personas" className="space-y-3 mt-0">
                {personas.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Robot size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No personas created yet</p>
                    <p className="text-sm mt-2">Create personas to use in group chats</p>
                  </div>
                ) : (
                  personas.map((persona) => (
                    <div key={persona.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: persona.color }}
                          >
                            <Robot size={20} weight="fill" className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{persona.name}</p>
                              {persona.enabled && (
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {persona.systemPrompt}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Temperature: {persona.temperature}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={persona.enabled}
                            onCheckedChange={(checked) => handleToggleEnabled(persona.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingId(persona.id)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => {
                              onDeletePersona(persona.id)
                              toast.success('Persona deleted')
                            }}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="templates" className="space-y-3 mt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Quick-start with these pre-configured personas
                </p>
                {DEFAULT_PERSONAS.map((persona, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: persona.color }}
                        >
                          <Robot size={20} weight="fill" className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{persona.name}</p>
                          <p className="text-sm text-muted-foreground">{persona.systemPrompt}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleLoadDefault(persona)}
                      >
                        <Plus size={14} className="mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>

        <Separator className="my-4" />

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Plus size={16} />
            Create New Persona
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="persona-name">Persona Name</Label>
              <Input
                id="persona-name"
                placeholder="e.g., 'Research Expert'"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="persona-color"
                  type="color"
                  value={newPersona.color}
                  onChange={(e) => setNewPersona({ ...newPersona, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={newPersona.color}
                  onChange={(e) => setNewPersona({ ...newPersona, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona-prompt">System Prompt</Label>
            <Textarea
              id="persona-prompt"
              placeholder="Describe the persona's behavior, expertise, and personality..."
              value={newPersona.systemPrompt}
              onChange={(e) => setNewPersona({ ...newPersona, systemPrompt: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona-scenario">Scenario (Optional)</Label>
            <Textarea
              id="persona-scenario"
              placeholder="Describe the current situation or setting for this character..."
              value={newPersona.scenario || ''}
              onChange={(e) => setNewPersona({ ...newPersona, scenario: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="persona-temp">
              Temperature: {newPersona.temperature.toFixed(1)}
            </Label>
            <Slider
              id="persona-temp"
              min={0}
              max={2}
              step={0.1}
              value={[newPersona.temperature]}
              onValueChange={(value) => setNewPersona({ ...newPersona, temperature: value[0] })}
            />
            <p className="text-xs text-muted-foreground">
              Lower = More focused and deterministic, Higher = More creative and random
            </p>
          </div>
          <Button onClick={handleAddPersona} className="w-full">
            <Plus size={16} className="mr-2" />
            Create Persona
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
