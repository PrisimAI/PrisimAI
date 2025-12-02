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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Plus, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { MemoryEntry } from '@/lib/memory-types'

interface MemoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memories: MemoryEntry[]
  onAddMemory: (memory: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateMemory: (id: string, memory: Partial<MemoryEntry>) => void
  onDeleteMemory: (id: string) => void
}

export function MemoryManager({
  open,
  onOpenChange,
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
}: MemoryManagerProps) {
  const [newMemory, setNewMemory] = useState({
    key: '',
    value: '',
    category: 'fact' as MemoryEntry['category'],
    priority: 'medium' as MemoryEntry['priority'],
  })

  const handleAddMemory = () => {
    if (!newMemory.key.trim() || !newMemory.value.trim()) {
      toast.error('Please fill in both key and value')
      return
    }

    onAddMemory(newMemory)
    setNewMemory({
      key: '',
      value: '',
      category: 'fact',
      priority: 'medium',
    })
    toast.success('Memory added successfully')
  }

  const handleDeleteMemory = (id: string) => {
    onDeleteMemory(id)
    toast.success('Memory deleted')
  }

  const categorizedMemories = {
    preference: memories.filter(m => m.category === 'preference'),
    fact: memories.filter(m => m.category === 'fact'),
    context: memories.filter(m => m.category === 'context'),
    custom: memories.filter(m => m.category === 'custom'),
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  const renderMemoryCard = (memory: MemoryEntry) => (
    <div key={memory.id} className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{memory.key}</p>
            <Badge variant={getPriorityColor(memory.priority)} className="text-xs">
              {memory.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{memory.value}</p>
          <p className="text-xs text-muted-foreground">
            Added {new Date(memory.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive"
            onClick={() => handleDeleteMemory(memory.id)}
          >
            <Trash size={14} />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain size={24} weight="fill" />
            Custom Memory
          </DialogTitle>
          <DialogDescription>
            Teach the AI to remember important information about you and your preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({memories.length})</TabsTrigger>
            <TabsTrigger value="preference">Preferences ({categorizedMemories.preference.length})</TabsTrigger>
            <TabsTrigger value="fact">Facts ({categorizedMemories.fact.length})</TabsTrigger>
            <TabsTrigger value="context">Context ({categorizedMemories.context.length})</TabsTrigger>
            <TabsTrigger value="custom">Custom ({categorizedMemories.custom.length})</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <TabsContent value="all" className="space-y-3 mt-0">
                {memories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No memories yet</p>
                    <p className="text-sm mt-2">Add information below to help the AI remember you</p>
                  </div>
                ) : (
                  memories.map(renderMemoryCard)
                )}
              </TabsContent>

              <TabsContent value="preference" className="space-y-3 mt-0">
                {categorizedMemories.preference.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No preferences stored</p>
                ) : (
                  categorizedMemories.preference.map(renderMemoryCard)
                )}
              </TabsContent>

              <TabsContent value="fact" className="space-y-3 mt-0">
                {categorizedMemories.fact.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No facts stored</p>
                ) : (
                  categorizedMemories.fact.map(renderMemoryCard)
                )}
              </TabsContent>

              <TabsContent value="context" className="space-y-3 mt-0">
                {categorizedMemories.context.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No context stored</p>
                ) : (
                  categorizedMemories.context.map(renderMemoryCard)
                )}
              </TabsContent>

              <TabsContent value="custom" className="space-y-3 mt-0">
                {categorizedMemories.custom.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No custom memories</p>
                ) : (
                  categorizedMemories.custom.map(renderMemoryCard)
                )}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>

        <Separator className="my-4" />

        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Plus size={16} />
            Add New Memory
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memory-key">Key / Title</Label>
              <Input
                id="memory-key"
                placeholder="e.g., 'Favorite Programming Language'"
                value={newMemory.key}
                onChange={(e) => setNewMemory({ ...newMemory, key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memory-category">Category</Label>
              <Select
                value={newMemory.category}
                onValueChange={(value: MemoryEntry['category']) =>
                  setNewMemory({ ...newMemory, category: value })
                }
              >
                <SelectTrigger id="memory-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="fact">Fact</SelectItem>
                  <SelectItem value="context">Context</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-value">Value / Description</Label>
            <Textarea
              id="memory-value"
              placeholder="e.g., 'TypeScript - I use it for all my projects'"
              value={newMemory.value}
              onChange={(e) => setNewMemory({ ...newMemory, value: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory-priority">Priority</Label>
            <Select
              value={newMemory.priority}
              onValueChange={(value: MemoryEntry['priority']) =>
                setNewMemory({ ...newMemory, priority: value })
              }
            >
              <SelectTrigger id="memory-priority" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High - Always remember</SelectItem>
                <SelectItem value="medium">Medium - Important</SelectItem>
                <SelectItem value="low">Low - Nice to know</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddMemory} className="w-full">
            <Plus size={16} className="mr-2" />
            Add Memory
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
