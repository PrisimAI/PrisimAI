import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, CloudSlash, Cpu, Check, X, Info } from '@phosphor-icons/react'
import {
  checkWebGPUSupport,
  webLLMService,
  OFFLINE_MODELS,
  type WebGPUCapability,
  type ModelLoadProgress,
  type OfflineModelId,
} from '@/lib/webllm-service'
import { toast } from 'sonner'

interface OfflineModeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offlineEnabled: boolean
  selectedModel: string | null
  onOfflineToggle: (enabled: boolean) => void
  onModelSelect: (modelId: string) => void
}

export function OfflineModeDialog({
  open,
  onOpenChange,
  offlineEnabled,
  selectedModel,
  onOfflineToggle,
  onModelSelect,
}: OfflineModeDialogProps) {
  const [webGPUCapable, setWebGPUCapable] = useState<WebGPUCapability | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState<ModelLoadProgress | null>(null)
  const [modelLoaded, setModelLoaded] = useState(false)

  // Check WebGPU support when dialog opens
  useEffect(() => {
    if (open) {
      checkWebGPUSupport().then(setWebGPUCapable)
      setModelLoaded(webLLMService.isModelLoaded())
    }
  }, [open])

  const handleOfflineToggle = async (enabled: boolean) => {
    if (!webGPUCapable?.supported) {
      toast.error('WebGPU is not supported in your browser')
      return
    }

    if (enabled && !selectedModel) {
      toast.error('Please select a model first')
      return
    }

    if (enabled && selectedModel) {
      // Load the model
      setLoading(true)
      setLoadProgress({ progress: 0, text: 'Initializing...', timeElapsed: 0 })
      
      try {
        await webLLMService.initModel(selectedModel, (progress) => {
          setLoadProgress(progress)
        })
        
        setModelLoaded(true)
        onOfflineToggle(true)
        toast.success('Offline mode enabled! Model loaded successfully.')
      } catch (error) {
        console.error('Failed to load model:', error)
        toast.error('Failed to load model. Please try again.')
        setModelLoaded(false)
      } finally {
        setLoading(false)
        setLoadProgress(null)
      }
    } else {
      // Disable offline mode
      await webLLMService.unload()
      setModelLoaded(false)
      onOfflineToggle(false)
      toast.success('Offline mode disabled')
    }
  }

  const handleModelChange = async (modelId: string) => {
    onModelSelect(modelId)
    
    // If offline mode is already enabled, reload with new model
    if (offlineEnabled) {
      setLoading(true)
      setLoadProgress({ progress: 0, text: 'Loading new model...', timeElapsed: 0 })
      
      try {
        await webLLMService.initModel(modelId, (progress) => {
          setLoadProgress(progress)
        })
        
        setModelLoaded(true)
        toast.success('Model changed successfully!')
      } catch (error) {
        console.error('Failed to load model:', error)
        toast.error('Failed to load model. Please try again.')
        setModelLoaded(false)
        onOfflineToggle(false)
      } finally {
        setLoading(false)
        setLoadProgress(null)
      }
    }
  }

  const currentModelInfo = OFFLINE_MODELS.find(m => m.id === selectedModel)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudSlash size={24} weight="fill" />
            Offline Mode Settings
            <Badge variant="secondary" className="ml-2">Experimental</Badge>
          </DialogTitle>
          <DialogDescription>
            Use AI models directly in your browser without an internet connection.
            Powered by WebLLM and WebGPU.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* WebGPU Status */}
          <Alert variant={webGPUCapable?.supported ? 'default' : 'destructive'}>
            <div className="flex items-start gap-3">
              <Cpu size={20} className="mt-0.5" />
              <div className="flex-1">
                <div className="font-medium mb-1">
                  {webGPUCapable?.supported ? 'WebGPU Supported' : 'WebGPU Not Available'}
                </div>
                <AlertDescription>
                  {webGPUCapable?.supported
                    ? 'Your browser supports WebGPU and can run AI models offline.'
                    : webGPUCapable?.error || 'Checking WebGPU support...'}
                </AlertDescription>
              </div>
              {webGPUCapable?.supported ? (
                <Check size={20} className="text-green-600 shrink-0" />
              ) : (
                <X size={20} className="text-destructive shrink-0" />
              )}
            </div>
          </Alert>

          {/* Offline Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="offline-mode" className="text-base">
                Enable Offline Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Use local AI models when internet is unavailable
              </p>
            </div>
            <Switch
              id="offline-mode"
              checked={offlineEnabled}
              onCheckedChange={handleOfflineToggle}
              disabled={!webGPUCapable?.supported || loading}
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Select Offline Model</Label>
            <Select 
              value={selectedModel || undefined} 
              onValueChange={handleModelChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a model to download" />
              </SelectTrigger>
              <SelectContent>
                {OFFLINE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col items-start py-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {model.description} • {model.size}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Info */}
          {currentModelInfo && (
            <Alert>
              <Info size={20} />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">{currentModelInfo.name}</div>
                  <div className="text-sm">{currentModelInfo.description}</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Download size: {currentModelInfo.size}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading Progress */}
          {loading && loadProgress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{loadProgress.text}</span>
                <span className="font-medium">{Math.round(loadProgress.progress * 100)}%</span>
              </div>
              <Progress value={loadProgress.progress * 100} />
              <div className="text-xs text-muted-foreground text-center">
                Time elapsed: {Math.round(loadProgress.timeElapsed / 1000)}s
              </div>
            </div>
          )}

          {/* Status */}
          {modelLoaded && !loading && (
            <Alert>
              <Check size={20} className="text-green-600" />
              <AlertDescription>
                <div className="font-medium">Model Ready</div>
                <div className="text-sm text-muted-foreground">
                  {currentModelInfo?.name} is loaded and ready to use offline.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Box */}
          <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
            <div className="font-medium">Important Notes:</div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Models are downloaded to your browser cache (1-5 GB)</li>
              <li>First download may take several minutes</li>
              <li>Offline mode only works in Chromium-based browsers</li>
              <li>Performance depends on your GPU capabilities</li>
              <li>Responses may be slower than online models</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
