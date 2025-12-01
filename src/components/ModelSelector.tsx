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
import { Sparkle, CloudSlash, Crown } from '@phosphor-icons/react'
import {
  getTextModels,
  getImageModels,
  getVideoModels,
  type TextModel,
  type ImageModel,
  type VideoModel,
  isOfflineMode,
  onOfflineModeChange,
  filterRestrictedTextModels,
  filterRestrictedImageModels,
  hasPremiumAccess,
} from '@/lib/pollinations-api'
import { useAuth } from '@/contexts/AuthContext'
import type { AppMode } from '@/lib/types'

interface ModelSelectorProps {
  mode: AppMode
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ mode, selectedModel, onModelChange }: ModelSelectorProps) {
  const { user } = useAuth()
  const [textModels, setTextModels] = useState<TextModel[]>([])
  const [imageModels, setImageModels] = useState<ImageModel[]>([])
  const [videoModels, setVideoModels] = useState<VideoModel[]>([])
  const [loading, setLoading] = useState(true)
  const [offlineMode, setOfflineMode] = useState(isOfflineMode())

  const userEmail = user?.email
  const isPremium = hasPremiumAccess(userEmail)

  // Subscribe to offline mode changes
  useEffect(() => {
    const unsubscribe = onOfflineModeChange((enabled) => {
      setOfflineMode(enabled)
    })
    
    return unsubscribe
  }, [])

  // Load models
  useEffect(() => {
    async function loadModels() {
      setLoading(true)
      try {
        if (mode === 'chat') {
          const models = await getTextModels()
          const filteredModels = filterRestrictedTextModels(Array.isArray(models) ? models : [], userEmail)
          setTextModels(filteredModels)
        } else if (mode === 'image') {
          const models = await getImageModels()
          const filteredModels = filterRestrictedImageModels(Array.isArray(models) ? models : [], userEmail)
          setImageModels(filteredModels)
        } else if (mode === 'video') {
          const models = await getVideoModels()
          setVideoModels(Array.isArray(models) ? models : [])
        }
      } catch (error) {
        console.error('Failed to load models:', error)
        if (mode === 'chat') setTextModels([])
        else if (mode === 'image') setImageModels([])
        else if (mode === 'video') setVideoModels([])
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [mode, userEmail])

  // Pick correct model list
  const models = mode === 'chat' ? textModels : mode === 'image' ? imageModels : videoModels
  const displayModels = Array.isArray(models) ? models : []

  const currentModel = displayModels.find(
    m => (m as any).id === selectedModel || (m as any).name === selectedModel
  )

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

      {isPremium && (
        <Badge variant="default" className="gap-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
          <Crown size={14} weight="fill" />
          Premium
        </Badge>
      )}

      {offlineMode && (
        <Badge variant="secondary" className="gap-1">
          <CloudSlash size={14} />
          Offline Mode
        </Badge>
      )}

      {!offlineMode && (
        <>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>

            <SelectContent>
              {displayModels.length > 0 ? (
                displayModels.map((model) => {
                  const modelId = (model as any).id || (model as any).name
                  const modelDescription = model.description || modelId

                  return (
                    <SelectItem key={modelId} value={modelId}>
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span>{modelDescription}</span>
                        {(model as any).tools && (
                          <Badge variant="secondary" className="ml-2 text-xs shrink-0">
                            Tools
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  )
                })
              ) : (
                <SelectItem value="default" disabled>
                  No models available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {currentModel && mode === 'chat' && (currentModel as any).tools && (
            <Badge variant="outline" className="text-xs">
              <Sparkle size={12} className="mr-1" weight="fill" />
              Tools Enabled
            </Badge>
          )}
        </>
      )}
    </div>
  )
}
