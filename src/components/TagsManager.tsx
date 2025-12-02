import { useState } from 'react'
import { Tag, X, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TagsManagerProps {
  tags?: string[]
  onTagsChange: (tags: string[]) => void
  allTags?: string[] // All tags used across conversations for suggestions
}

const PREDEFINED_TAGS = [
  'Work',
  'Personal',
  'Research',
  'Creative',
  'Code',
  'Ideas',
  'Important',
  'Learning',
  'Project',
  'Draft',
]

export function TagsManager({ tags = [], onTagsChange, allTags = [] }: TagsManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Get suggested tags (predefined + used tags, excluding already added)
  const suggestedTags = [...new Set([...PREDEFINED_TAGS, ...allTags])]
    .filter(tag => !tags.includes(tag))
    .slice(0, 10)

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(newTag)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Tag size={16} />
          Tags {tags.length > 0 && `(${tags.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Manage Tags</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add tags to organize your conversations
            </p>
          </div>

          {/* Current tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add new tag */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim()}
            >
              <Plus size={16} />
            </Button>
          </div>

          {/* Suggested tags */}
          {suggestedTags.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    className="h-7"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Compact inline tag display component
interface TagsDisplayProps {
  tags?: string[]
  maxDisplay?: number
}

export function TagsDisplay({ tags = [], maxDisplay = 3 }: TagsDisplayProps) {
  if (tags.length === 0) return null

  const displayTags = tags.slice(0, maxDisplay)
  const remainingCount = tags.length - maxDisplay

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {displayTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground">
          +{remainingCount}
        </span>
      )}
    </div>
  )
}
