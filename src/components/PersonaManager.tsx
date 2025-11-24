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

  // Color palette presets
  const colorPalettes = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
  ]

  // Quick scenario templates
  const scenarioTemplates = [
    'You are in your workspace, ready to assist with any task.',
    'You\'re in a cozy study surrounded by books and reference materials.',
    'You\'re in a modern office with state-of-the-art equipment.',
    'You\'re in a laboratory conducting cutting-edge research.',
    'You\'re in a creative studio filled with inspiration.',
  ]

  // Character type templates
  const characterTypeTemplates = [
    {
      type: 'Helper',
      prompt: 'You are a helpful and supportive assistant who provides clear, practical advice.',
      temp: 0.7,
      color: '#3b82f6',
    },
    {
      type: 'Creative',
      prompt: 'You are a creative and imaginative thinker who loves exploring new ideas and possibilities.',
      temp: 0.9,
      color: '#a855f7',
    },
    {
      type: 'Analytical',
      prompt: 'You are a logical and analytical thinker who breaks down complex problems methodically.',
      temp: 0.5,
      color: '#10b981',
    },
    {
      type: 'Roleplay',
      prompt: 'You are a character in a roleplay scenario. ALWAYS format your responses with spoken dialogue in regular text and actions in *italics*.',
      temp: 0.8,
      color: '#ec4899',
    },
  ]

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
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Plus size={16} />
              Create New Persona
            </h4>
            <Badge variant="outline" className="text-xs">
              Custom Character
            </Badge>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label className="text-sm">Quick Start Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              {characterTypeTemplates.map((template) => (
                <Button
                  key={template.type}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => setNewPersona({
                    ...newPersona,
                    systemPrompt: template.prompt,
                    temperature: template.temp,
                    color: template.color,
                  })}
                >
                  {template.type}
                </Button>
              ))}
            </div>
          </div>

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
              <Label htmlFor="persona-color">Theme Color</Label>
              <div className="flex gap-2">
                <Input
                  id="persona-color"
                  type="color"
                  value={newPersona.color}
                  onChange={(e) => setNewPersona({ ...newPersona, color: e.target.value })}
                  className="w-20 h-10"
                />
                <div className="flex-1 flex flex-wrap gap-1">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.value}
                      className="w-8 h-8 rounded-md border-2 border-transparent hover:border-foreground transition-colors"
                      style={{ backgroundColor: palette.value }}
                      onClick={() => setNewPersona({ ...newPersona, color: palette.value })}
                      title={palette.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-prompt">Character Description & Behavior</Label>
            <Textarea
              id="persona-prompt"
              placeholder="Describe the persona's behavior, expertise, and personality..."
              value={newPersona.systemPrompt}
              onChange={(e) => setNewPersona({ ...newPersona, systemPrompt: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="persona-scenario">Starting Scenario (Optional)</Label>
              <div className="flex gap-1">
                {scenarioTemplates.slice(0, 2).map((template, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => setNewPersona({ ...newPersona, scenario: template })}
                  >
                    Example {idx + 1}
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              id="persona-scenario"
              placeholder="Describe the current situation or setting for this character..."
              value={newPersona.scenario || ''}
              onChange={(e) => setNewPersona({ ...newPersona, scenario: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="persona-temp">
                Creativity Level: {newPersona.temperature.toFixed(1)}
              </Label>
              <Badge variant="secondary" className="text-xs">
                {newPersona.temperature < 0.5 ? 'Focused' : newPersona.temperature < 0.8 ? 'Balanced' : 'Creative'}
              </Badge>
            </div>
            <Slider
              id="persona-temp"
              min={0}
              max={2}
              step={0.1}
              value={[newPersona.temperature]}
              onValueChange={(value) => setNewPersona({ ...newPersona, temperature: value[0] })}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Lower = More predictable & focused • Higher = More creative & varied
            </p>
          </div>

          <Button 
            onClick={handleAddPersona} 
            className="w-full"
            size="lg"
            style={{ backgroundColor: newPersona.color }}
          >
            <Plus size={18} className="mr-2" />
            Create Persona
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
