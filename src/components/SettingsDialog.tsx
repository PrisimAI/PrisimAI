import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
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
import { languages, type Language } from '@/i18n'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Default settings values - shared between localStorage loading and state initialization
const DEFAULT_SETTINGS = {
  streamingEnabled: true,
  toolsEnabled: true,
  systemMessage: '',
  temperature: 1.0,
  maxTokens: 4096,
  contextWindow: 10,
  experimentalSearchEnabled: false,
}

// Helper function to safely get from localStorage
function getStoredSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }
  try {
    const stored = localStorage.getItem('app-settings')
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Error loading settings:', e)
  }
  return DEFAULT_SETTINGS
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const [streamingEnabled, setStreamingEnabled] = useState(DEFAULT_SETTINGS.streamingEnabled)
  const [toolsEnabled, setToolsEnabled] = useState(DEFAULT_SETTINGS.toolsEnabled)
  const [systemMessage, setSystemMessage] = useState(DEFAULT_SETTINGS.systemMessage)
  const [temperature, setTemperature] = useState(DEFAULT_SETTINGS.temperature)
  const [maxTokens, setMaxTokens] = useState(DEFAULT_SETTINGS.maxTokens)
  const [contextWindow, setContextWindow] = useState(DEFAULT_SETTINGS.contextWindow)
  const [experimentalSearchEnabled, setExperimentalSearchEnabled] = useState(DEFAULT_SETTINGS.experimentalSearchEnabled)

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = getStoredSettings()
    setStreamingEnabled(settings.streamingEnabled ?? true)
    setToolsEnabled(settings.toolsEnabled ?? true)
    setSystemMessage(settings.systemMessage ?? '')
    setTemperature(settings.temperature ?? 1.0)
    setMaxTokens(settings.maxTokens ?? 4096)
    setContextWindow(settings.contextWindow ?? 10)
    setExperimentalSearchEnabled(settings.experimentalSearchEnabled ?? false)
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
        experimentalSearchEnabled,
      }
      localStorage.setItem('app-settings', JSON.stringify(settings))
      toast.success(t('settings.settingsSaved'))
      onOpenChange(false)
    } catch (e) {
      console.error('Error saving settings:', e)
      toast.error(t('settings.failedToSave'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
          <DialogDescription>
            {t('settings.description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
            <TabsTrigger value="chat">{t('settings.chat')}</TabsTrigger>
            <TabsTrigger value="advanced">{t('settings.advanced')}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">{t('settings.theme')}</Label>
                  <div className="text-sm text-muted-foreground">
                    {t('settings.themeDescription')}
                  </div>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('settings.light')}</SelectItem>
                    <SelectItem value="dark">{t('settings.dark')}</SelectItem>
                    <SelectItem value="system">{t('settings.system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="language">{t('settings.language')}</Label>
                  <div className="text-sm text-muted-foreground">
                    {t('settings.languageDescription')}
                  </div>
                </div>
                <Select value={i18n.language as Language} onValueChange={(value: Language) => i18n.changeLanguage(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([code, { nativeName }]) => (
                      <SelectItem key={code} value={code}>
                        {nativeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="streaming">{t('settings.enableStreaming')}</Label>
                  <div className="text-sm text-muted-foreground">
                    {t('settings.streamingDescription')}
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
                  <Label htmlFor="tools">{t('settings.enableTools')}</Label>
                  <div className="text-sm text-muted-foreground">
                    {t('settings.toolsDescription')}
                  </div>
                </div>
                <Switch
                  id="tools"
                  checked={toolsEnabled}
                  onCheckedChange={setToolsEnabled}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="experimental-search">{t('settings.experimentalSearch')}</Label>
                  <div className="text-sm text-muted-foreground">
                    {t('settings.experimentalSearchDescription')}
                  </div>
                </div>
                <Switch
                  id="experimental-search"
                  checked={experimentalSearchEnabled}
                  onCheckedChange={setExperimentalSearchEnabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-message">{t('settings.systemMessage')}</Label>
                <Textarea
                  id="system-message"
                  placeholder={t('settings.systemMessagePlaceholder')}
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  rows={4}
                />
                <div className="text-sm text-muted-foreground">
                  {t('settings.systemMessageDescription')}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>{t('settings.temperature')}</Label>
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
                  {t('settings.temperatureDescription')}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-tokens">{t('settings.maxTokens')}</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  placeholder="4096"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                />
                <div className="text-sm text-muted-foreground">
                  {t('settings.maxTokensDescription')}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="context-window">{t('settings.contextWindow')}</Label>
                <Input
                  id="context-window"
                  type="number"
                  placeholder="10"
                  value={contextWindow}
                  onChange={(e) => setContextWindow(parseInt(e.target.value) || 10)}
                />
                <div className="text-sm text-muted-foreground">
                  {t('settings.contextWindowDescription')}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('settings.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('settings.saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
