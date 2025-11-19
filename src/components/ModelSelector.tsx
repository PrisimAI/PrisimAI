import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadModels() {
      setLoading(true)
      try {
        if (mode === 'chat') {
          const models = await getTextModels()
          setTextModels(models)
        } else {
          const models = await getImageModels()
          setImageModels(models)
        }
      } catch (error) {
        console.error('Failed to load models:', error)
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [mode])

  const models = mode === 'chat' ? textModels : imageModels
  const displayModels = models.slice(0, 10)

  return (
    <div className="border-b bg-background px-6 py-3">
      <Select value={selectedModel} onValueChange={onModelChange} disabled={loading}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={loading ? 'Loading models...' : 'Select model'} />
        </SelectTrigger>
        <SelectContent>
          {displayModels.map((model) => (
            <SelectItem key={model.name} value={model.name}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
