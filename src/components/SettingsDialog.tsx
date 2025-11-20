import { useState } from 'react'
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

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [streamingEnabled, setStreamingEnabled] = useState(true)
  const [toolsEnabled, setToolsEnabled] = useState(true)
  const [systemMessage, setSystemMessage] = useState('')

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
                  <Input type="range" min="0" max="2" step="0.1" defaultValue="1" className="flex-1" />
                  <span className="text-sm font-medium w-12 text-right">1.0</span>
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
                  defaultValue="4096"
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
                  defaultValue="10"
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
          <Button onClick={() => onOpenChange(false)}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
