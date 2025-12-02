import { useState, useMemo } from 'react'
import { MaskHappy, Plus, Robot, UsersThree, Sparkle, ChatCircle, MagnifyingGlass, IdentificationCard } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateGroupChatDialog } from '@/components/CreateGroupChatDialog'
import { CharacterCardDialog } from '@/components/CharacterCardDialog'
import { useAuth } from '@/contexts/AuthContext'
import type { AIPersona, GroupChatParticipant } from '@/lib/memory-types'
import { PREMADE_PERSONAS, CHARACTER_PERSONAS } from '@/lib/personas-config'

interface PersonaAvatarProps {
  persona: AIPersona
  icon: React.ComponentType<{ size: number; weight: string; className: string }>
}

function PersonaAvatar({ persona, icon: Icon }: PersonaAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const showFallback = !persona.avatar || imageError

  return (
    <>
      {persona.avatar && !imageError && (
        <img
          src={persona.avatar}
          alt={persona.name}
          className="w-10 h-10 rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
      {showFallback && (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: persona.color }}
        >
          <Icon size={20} weight="fill" className="text-white" />
        </div>
      )}
    </>
  )
}

interface RoleplayPageProps {
  personas: AIPersona[]
  onOpenPersonaManager: () => void
  onCreateGroupChat: (title: string, participants: GroupChatParticipant[]) => void
  onStartPersonaChat: (persona: AIPersona) => void
}


export function RoleplayPage({
  personas,
  onOpenPersonaManager,
  onCreateGroupChat,
  onStartPersonaChat,
}: RoleplayPageProps) {
  const { user } = useAuth()
  const [groupChatDialogOpen, setGroupChatDialogOpen] = useState(false)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'premade' | 'character' | 'custom'>('all')
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'temp-asc' | 'temp-desc'>('name-asc')

  // Combine all personas for group chat creation
  const allPersonas: AIPersona[] = [
    ...PREMADE_PERSONAS.map((p, idx) => ({ ...p, id: `premade_${idx}` })),
    ...CHARACTER_PERSONAS.map((p, idx) => ({ ...p, id: `character_${idx}` })),
    ...personas.filter(p => p.enabled),
  ]

  // Filter and sort personas
  const filteredPersonas = useMemo(() => {
    const premade = PREMADE_PERSONAS.map((p, idx) => ({ ...p, id: `premade_${idx}`, category: 'premade' as const }))
    const character = CHARACTER_PERSONAS.map((p, idx) => ({ ...p, id: `character_${idx}`, category: 'character' as const }))
    const custom = personas.filter(p => p.enabled).map(p => ({ ...p, category: 'custom' as const }))

    // Apply category filter
    let filtered = categoryFilter === 'all' 
      ? [...premade, ...character, ...custom]
      : categoryFilter === 'premade' 
        ? premade
        : categoryFilter === 'character'
          ? character
          : custom

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.systemPrompt.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'temp-asc':
          return a.temperature - b.temperature
        case 'temp-desc':
          return b.temperature - a.temperature
        default:
          return 0
      }
    })

    return {
      premade: filtered.filter(p => p.category === 'premade'),
      character: filtered.filter(p => p.category === 'character'),
      custom: filtered.filter(p => p.category === 'custom'),
    }
  }, [personas, searchQuery, categoryFilter, sortBy])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
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

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search personas by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as typeof categoryFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="premade">Premade</SelectItem>
                <SelectItem value="character">Character</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="temp-asc">Temp Low-High</SelectItem>
                <SelectItem value="temp-desc">Temp High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content with proper height constraint for scrolling */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="container mx-auto max-w-6xl p-6">
            {/* Show message if no results */}
            {filteredPersonas.premade.length === 0 && 
             filteredPersonas.character.length === 0 && 
             filteredPersonas.custom.length === 0 && (
              <div className="text-center py-12">
                <MagnifyingGlass size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No personas found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Premade Personas Section */}
            {filteredPersonas.premade.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkle size={20} weight="fill" className="text-primary" />
                  <h2 className="text-xl font-semibold">Premade Personas</h2>
                  <Badge variant="secondary" className="text-xs">{filteredPersonas.premade.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPersonas.premade.map((persona) => (
                    <Card key={persona.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <PersonaAvatar persona={persona} icon={Robot} />
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
                        <div className="flex gap-2 mt-3">
                          <Button 
                            onClick={() => onStartPersonaChat(persona)} 
                            className="flex-1"
                            size="sm"
                          >
                            <ChatCircle size={16} className="mr-2" />
                            Start Chat
                          </Button>
                          <Button 
                            onClick={() => {
                              setSelectedPersona(persona)
                              setCardDialogOpen(true)
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <IdentificationCard size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Character Personas Section */}
            {filteredPersonas.character.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <MaskHappy size={20} weight="fill" className="text-primary" />
                  <h2 className="text-xl font-semibold">Character Personas</h2>
                  <Badge variant="secondary" className="text-xs">Roleplay</Badge>
                  <Badge variant="secondary" className="text-xs">{filteredPersonas.character.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPersonas.character.map((persona) => (
                    <Card key={persona.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <PersonaAvatar persona={persona} icon={MaskHappy} />
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
                          {persona.scenario && (
                            <Badge variant="outline" className="text-xs">
                              Scenario
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            onClick={() => onStartPersonaChat(persona)} 
                            className="flex-1"
                            size="sm"
                          >
                            <ChatCircle size={16} className="mr-2" />
                            Start Chat
                          </Button>
                          <Button 
                            onClick={() => {
                              setSelectedPersona(persona)
                              setCardDialogOpen(true)
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <IdentificationCard size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Personas Section */}
            {filteredPersonas.custom.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Robot size={20} weight="fill" className="text-primary" />
                  <h2 className="text-xl font-semibold">Your Custom Personas</h2>
                  <Badge variant="secondary" className="text-xs">{filteredPersonas.custom.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPersonas.custom.map((persona) => (
                  <Card key={persona.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <PersonaAvatar persona={persona} icon={Robot} />
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
                      <Button 
                        onClick={() => onStartPersonaChat(persona)} 
                        className="w-full mt-3"
                        size="sm"
                      >
                        <ChatCircle size={16} className="mr-2" />
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if no custom personas and not filtered */}
          {personas.filter(p => p.enabled).length === 0 && 
           categoryFilter === 'all' && 
           !searchQuery.trim() && (
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
      </div>

      {/* Group Chat Dialog */}
      <CreateGroupChatDialog
        open={groupChatDialogOpen}
        onOpenChange={setGroupChatDialogOpen}
        personas={allPersonas}
        currentUserId={user?.uid || 'user_1'}
        currentUserName={user?.displayName || user?.email || 'You'}
        onCreateGroupChat={onCreateGroupChat}
      />

      {/* Character Card Dialog */}
      {selectedPersona && (
        <CharacterCardDialog
          open={cardDialogOpen}
          onOpenChange={setCardDialogOpen}
          persona={selectedPersona}
        />
      )}
    </div>
  )
}
