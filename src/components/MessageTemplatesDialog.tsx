import { useState } from 'react'
import { Plus, X, Copy, Trash, Pencil, FolderOpen } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { MessageTemplate } from '@/lib/template-types'
import { DEFAULT_CATEGORIES } from '@/lib/template-types'

interface MessageTemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: MessageTemplate[]
  onSaveTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateTemplate: (id: string, template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteTemplate: (id: string) => void
  onUseTemplate: (template: MessageTemplate) => void
}

export function MessageTemplatesDialog({
  open,
  onOpenChange,
  templates,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onUseTemplate,
}: MessageTemplatesDialogProps) {
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'General',
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const categories = ['All', ...DEFAULT_CATEGORIES]
  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  const handleSave = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    onSaveTemplate(newTemplate)
    setNewTemplate({ title: '', content: '', category: 'General' })
    setIsCreating(false)
    toast.success('Template saved')
  }

  const handleUpdate = () => {
    if (!editingTemplate) return
    if (!editingTemplate.title.trim() || !editingTemplate.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    onUpdateTemplate(editingTemplate.id, {
      title: editingTemplate.title,
      content: editingTemplate.content,
      category: editingTemplate.category,
    })
    setEditingTemplate(null)
    toast.success('Template updated')
  }

  const handleDelete = (id: string) => {
    setTemplateToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (templateToDelete) {
      onDeleteTemplate(templateToDelete)
      setEditingTemplate(null)
      setTemplateToDelete(null)
      toast.success('Template deleted')
    }
    setDeleteConfirmOpen(false)
  }

  const handleUse = (template: MessageTemplate) => {
    onUseTemplate(template)
    onOpenChange(false)
    toast.success('Template inserted')
  }

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Content copied to clipboard')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Message Templates</DialogTitle>
          <DialogDescription>
            Save and reuse frequently used prompts
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[500px]">
          {/* Left sidebar - Categories and template list */}
          <div className="w-1/3 border-r pr-4 flex flex-col">
            <div className="mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setIsCreating(true)}
              className="mb-4 w-full justify-start gap-2"
              variant="outline"
            >
              <Plus size={16} />
              New Template
            </Button>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredTemplates.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    {selectedCategory === 'All' 
                      ? 'No templates yet. Create your first template!'
                      : `No templates in ${selectedCategory}`
                    }
                  </p>
                )}
                
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      editingTemplate?.id === template.id
                        ? 'bg-muted border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setEditingTemplate(template)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{template.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {template.content}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right panel - Template editor/viewer */}
          <div className="flex-1 flex flex-col">
            {isCreating ? (
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    placeholder="Template title..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder="Enter your template content..."
                    className="flex-1 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Template
                  </Button>
                </div>
              </div>
            ) : editingTemplate ? (
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={editingTemplate.category}
                    onValueChange={(value) => setEditingTemplate({ ...editingTemplate, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                    className="flex-1 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-between">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(editingTemplate.id)}
                  >
                    <Trash size={16} className="mr-2" />
                    Delete
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCopyContent(editingTemplate.content)}
                    >
                      <Copy size={16} className="mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingTemplate(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdate}>
                      Update
                    </Button>
                    <Button variant="secondary" onClick={() => handleUse(editingTemplate)}>
                      Use Template
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a template to view or edit</p>
                  <p className="text-sm mt-2">or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
