import { useState } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Thermometer, Palette, Scroll, MapPin } from '@phosphor-icons/react'
import type { AIPersona } from '@/lib/memory-types'

interface CharacterCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  persona: AIPersona
}

export function CharacterCardDialog({
  open,
  onOpenChange,
  persona,
}: CharacterCardDialogProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        <div className="relative">
          {/* Character Header with Avatar */}
          <div 
            className="relative h-48 flex items-center justify-center overflow-hidden"
            style={{ 
              backgroundColor: persona.color,
              backgroundImage: `linear-gradient(135deg, ${persona.color}ee 0%, ${persona.color}99 100%)`
            }}
          >
            {persona.avatar && !imageError ? (
              <img
                src={persona.avatar}
                alt={persona.name}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
                onError={() => setImageError(true)}
              />
            ) : null}
            <div className="relative z-10 flex flex-col items-center gap-3">
              {persona.avatar && !imageError ? (
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl flex items-center justify-center"
                  style={{ backgroundColor: persona.color }}
                >
                  <span className="text-white text-4xl font-bold">
                    {persona.name.charAt(0)}
                  </span>
                </div>
              )}
              <h2 className="text-3xl font-bold text-white text-center drop-shadow-lg">
                {persona.name}
              </h2>
            </div>
          </div>

          {/* Character Details */}
          <ScrollArea className="max-h-[calc(90vh-12rem)]">
            <div className="p-6 space-y-6">
              {/* Scenario Section */}
              {persona.scenario && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin size={20} weight="fill" style={{ color: persona.color }} />
                    <span>Current Scenario</span>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm leading-relaxed">
                      {persona.scenario}
                    </p>
                  </div>
                </div>
              )}

              {persona.scenario && <Separator />}

              {/* Character Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Scroll size={20} weight="fill" style={{ color: persona.color }} />
                  <span>Character Description</span>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {persona.systemPrompt}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Character Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold mb-3">
                  <Thermometer size={20} weight="fill" style={{ color: persona.color }} />
                  <span>Character Attributes</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Temperature */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2">
                      <Thermometer size={18} weight="fill" className="text-muted-foreground" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <Badge variant="secondary">{persona.temperature.toFixed(2)}</Badge>
                  </div>

                  {/* Color Theme */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2">
                      <Palette size={18} weight="fill" className="text-muted-foreground" />
                      <span className="text-sm font-medium">Color Theme</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border-2 border-border"
                        style={{ backgroundColor: persona.color }}
                      />
                      <Badge variant="secondary" className="font-mono text-xs">
                        {persona.color}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Temperature Info */}
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Temperature</strong> controls randomness in responses. 
                    Lower values (0.0-0.5) make the character more focused and deterministic, 
                    while higher values (0.6-1.0) make them more creative and unpredictable.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
