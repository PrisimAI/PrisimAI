import { useState } from 'react'
import { MaskHappy, Plus, Robot, UsersThree, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateGroupChatDialog } from '@/components/CreateGroupChatDialog'
import type { AIPersona, GroupChatParticipant } from '@/lib/memory-types'
import { PREMADE_PERSONAS, CHARACTER_PERSONAS } from '@/lib/personas-config'

interface RoleplayPageProps {
  personas: AIPersona[]
  onOpenPersonaManager: () => void
  onCreateGroupChat: (title: string, participants: GroupChatParticipant[]) => void
}

export function RoleplayPage({
  personas,
  onOpenPersonaManager,
  onCreateGroupChat,
}: RoleplayPageProps) {
  const [groupChatDialogOpen, setGroupChatDialogOpen] = useState(false)

  // Combine all personas for group chat creation
  const allPersonas: AIPersona[] = [
    ...PREMADE_PERSONAS.map((p, idx) => ({ ...p, id: `premade_${idx}` })),
    ...CHARACTER_PERSONAS.map((p, idx) => ({ ...p, id: `character_${idx}` })),
    ...personas.filter(p => p.enabled),
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="prism-gradient rounded-lg p-2">
              <MaskHappy size={24} weight="fill" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">AI Roleplay</h1>
              <p className="text-sm text-muted-foreground">
                Chat with AI personas or create group conversations
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onOpenPersonaManager} variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              Create Persona
            </Button>
            <Button onClick={() => setGroupChatDialogOpen(true)} size="sm">
              <UsersThree size={16} className="mr-2" />
              New Group Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto max-w-6xl p-6">
          {/* Premade Personas Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkle size={20} weight="fill" className="text-primary" />
              <h2 className="text-xl font-semibold">Premade Personas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PREMADE_PERSONAS.map((persona, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: persona.color }}
                      >
                        <Robot size={20} weight="fill" className="text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{persona.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {persona.systemPrompt}
                    </CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        Temp: {persona.temperature}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Character Personas Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MaskHappy size={20} weight="fill" className="text-primary" />
              <h2 className="text-xl font-semibold">Character Personas</h2>
              <Badge variant="secondary" className="text-xs">Roleplay</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHARACTER_PERSONAS.map((persona, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: persona.color }}
                      >
                        <MaskHappy size={20} weight="fill" className="text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{persona.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {persona.systemPrompt}
                    </CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        Temp: {persona.temperature}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Personas Section */}
          {personas.filter(p => p.enabled).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Robot size={20} weight="fill" className="text-primary" />
                <h2 className="text-xl font-semibold">Your Custom Personas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.filter(p => p.enabled).map((persona) => (
                  <Card key={persona.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: persona.color }}
                        >
                          <Robot size={20} weight="fill" className="text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{persona.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {persona.systemPrompt}
                      </CardDescription>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          Temp: {persona.temperature}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if no custom personas */}
          {personas.filter(p => p.enabled).length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Robot size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Custom Personas Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your own AI personas to add unique characters to your roleplay sessions
              </p>
              <Button onClick={onOpenPersonaManager} variant="outline">
                <Plus size={16} className="mr-2" />
                Create Your First Persona
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Group Chat Dialog */}
      <CreateGroupChatDialog
        open={groupChatDialogOpen}
        onOpenChange={setGroupChatDialogOpen}
        personas={allPersonas}
        currentUserId="user_1"
        currentUserName="You"
        onCreateGroupChat={onCreateGroupChat}
      />
    </div>
  )
}
