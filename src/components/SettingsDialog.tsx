import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper function to safely get from localStorage
function getStoredSettings() {
  if (typeof window === 'undefined') {
    return {
      streamingEnabled: true,
      toolsEnabled: true,
      systemMessage: '',
      temperature: 1.0,
      maxTokens: 4096,
      contextWindow: 10,
    }
  }
  try {
    const stored = localStorage.getItem('app-settings')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading settings:', e)
  }
  return {
    streamingEnabled: true,
    toolsEnabled: true,
    systemMessage: '',
    temperature: 1.0,
    maxTokens: 4096,
    contextWindow: 10,
  }
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [streamingEnabled, setStreamingEnabled] = useState(true)
  const [toolsEnabled, setToolsEnabled] = useState(true)
  const [systemMessage, setSystemMessage] = useState('')
  const [temperature, setTemperature] = useState(1.0)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [contextWindow, setContextWindow] = useState(10)

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = getStoredSettings()
    setStreamingEnabled(settings.streamingEnabled ?? true)
    setToolsEnabled(settings.toolsEnabled ?? true)
    setSystemMessage(settings.systemMessage ?? '')
    setTemperature(settings.temperature ?? 1.0)
    setMaxTokens(settings.maxTokens ?? 4096)
    setContextWindow(settings.contextWindow ?? 10)
  }, [])

  const handleSave = () => {
    try {
      const settings = {
        streamingEnabled,
        toolsEnabled,
        systemMessage,
        temperature,
        maxTokens,
        contextWindow,
      }
      localStorage.setItem('app-settings', JSON.stringify(settings))
      toast.success('Settings saved')
      onOpenChange(false)
    } catch (e) {
      console.error('Error saving settings:', e)
      toast.error('Failed to save settings')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your AI chat experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Theme</Label>
                  <div className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </div>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="streaming">Enable Streaming</Label>
                  <div className="text-sm text-muted-foreground">
                    Stream responses in real-time
                  </div>
                </div>
                <Switch
                  id="streaming"
                  checked={streamingEnabled}
                  onCheckedChange={setStreamingEnabled}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tools">Enable AI Tools</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow AI to use built-in tools and functions
                  </div>
                </div>
                <Switch
                  id="tools"
                  checked={toolsEnabled}
                  onCheckedChange={setToolsEnabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-message">System Message</Label>
                <Textarea
                  id="system-message"
                  placeholder="You are a helpful assistant..."
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  rows={4}
                />
                <div className="text-sm text-muted-foreground">
                  Set a custom system message to guide the AI's behavior
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Temperature</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{temperature.toFixed(1)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Controls randomness: Lower is more focused, higher is more creative
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  placeholder="4096"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                />
                <div className="text-sm text-muted-foreground">
                  Maximum length of the response
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="context-window">Context Window</Label>
                <Input
                  id="context-window"
                  type="number"
                  placeholder="10"
                  value={contextWindow}
                  onChange={(e) => setContextWindow(parseInt(e.target.value) || 10)}
                />
                <div className="text-sm text-muted-foreground">
                  Number of previous messages to include in context
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
