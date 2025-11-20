import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Sparkle } from '@phosphor-icons/react'
import { getTextModels, getImageModels, type TextModel, type ImageModel } from '@/lib/pollinations-api'
import type { AppMode } from '@/lib/types'

interface ModelSelectorProps {
  mode: AppMode
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ mode, selectedModel, onModelChange }: ModelSelectorProps) {
  const [textModels, setTextModels] = useState<TextModel[]>([])
  const [imageModels, setImageModels] = useState<ImageModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadModels() {
      setLoading(true)
      try {
        if (mode === 'chat') {
          const models = await getTextModels()
          setTextModels(Array.isArray(models) ? models : [])
        } else {
          const models = await getImageModels()
          setImageModels(Array.isArray(models) ? models : [])
        }
      } catch (error) {
        console.error('Failed to load models:', error)
        if (mode === 'chat') {
          setTextModels([])
        } else {
          setImageModels([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [mode])

  const models = mode === 'chat' ? textModels : imageModels
  const displayModels = Array.isArray(models) ? models.slice(0, 15) : []
  
  const currentModel = displayModels.find(m => m.name === selectedModel)

  if (loading) {
    return (
      <div className="border-b bg-background px-6 py-3">
        <Skeleton className="h-9 w-[250px]" />
      </div>
    )
  }

  return (
    <div className="border-b bg-background px-6 py-3 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Sparkle size={18} className="text-primary" weight="fill" />
        <span className="text-sm font-medium">Model:</span>
      </div>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {displayModels.length > 0 ? (
            displayModels.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                <div className="flex items-center justify-between gap-2 w-full">
                  <span>{model.description || model.name}</span>
                  {(model as any).tools && (
                    <Badge variant="secondary" className="ml-2 text-xs shrink-0">Tools</Badge>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="default" disabled>
              No models available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {currentModel && (mode === 'chat') && (currentModel as any).tools && (
        <Badge variant="outline" className="text-xs">
          <Sparkle size={12} className="mr-1" weight="fill" />
          Tools Enabled
        </Badge>
      )}
    </div>
  )
}
