import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
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
  const displayModels = Array.isArray(models) ? models.slice(0, 10) : []

  if (loading) {
    return (
      <div className="border-b bg-background px-6 py-3">
        <Skeleton className="h-9 w-[200px]" />
      </div>
    )
  }

  return (
    <div className="border-b bg-background px-6 py-3">
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {displayModels.length > 0 ? (
            displayModels.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                {model.description || model.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="default" disabled>
              No models available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
