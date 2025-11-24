import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocalStorage } from './hooks/use-local-storage'
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts'
import { useAuth } from './contexts/AuthContext'
import { Toaster, toast } from 'sonner'
import { Sidebar } from './components/Sidebar'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { EmptyState } from './components/EmptyState'
import { ImageGeneration } from './components/ImageGeneration'
import { ModelSelector } from './components/ModelSelector'
import { AuthPage } from './components/AuthPage'
import { RoleplayPage } from './components/RoleplayPage'
import { RoleplayChat } from './components/RoleplayChat'
import { GroupChatRoleplay } from './components/GroupChatRoleplay'
import { ScrollArea } from './components/ui/scroll-area'
import { Skeleton } from './components/ui/skeleton'
import { MemoryManager } from './components/MemoryManager'
import { PersonaManager } from './components/PersonaManager'
import { FavoritesDialog } from './components/FavoritesDialog'
import { KeyboardShortcutsDialog } from './components/KeyboardShortcutsDialog'
import { OfflineModeDialog } from './components/OfflineModeDialog'
import { LiquidMetalBackground } from './components/LiquidMetalBackground'
import { generateText, generateImage, type Message, setOfflineMode } from './lib/pollinations-api'
import { AI_TOOLS } from './lib/ai-tools'
import { ROLEPLAY_MODEL, PREMADE_PERSONAS, CHARACTER_PERSONAS, ROLEPLAY_ENFORCEMENT_RULES } from './lib/personas-config'
import type { Conversation, ChatMessage as ChatMessageType, GeneratedImage, AppMode, OfflineSettings, FileAttachment } from './lib/types'
import type { MemoryEntry, AIPersona, GroupChatParticipant } from './lib/memory-types'

function App() {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', [])
  const [memories, setMemories] = useLocalStorage<MemoryEntry[]>('memories', [])
  const [personas, setPersonas] = useLocalStorage<AIPersona[]>('personas', [])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<AppMode>('chat')
  const [textModel, setTextModel] = useState('openai')
  const [imageModel, setImageModel] = useState('flux')
  const [isGenerating, setIsGenerating] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [memoryDialogOpen, setMemoryDialogOpen] = useState(false)
  const [personaDialogOpen, setPersonaDialogOpen] = useState(false)
  const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false)
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false)
  const [offlineModeDialogOpen, setOfflineModeDialogOpen] = useState(false)
  const [offlineSettings, setOfflineSettings] = useLocalStorage<OfflineSettings>('offline-settings', {
    enabled: false,
    selectedModel: null,
    modelLoaded: false,
  })
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const conversationsList = conversations || []
  const currentConversation = conversationsList.find((c) => c.id === currentConversationId)

  // Sync offline mode state
  useEffect(() => {
    setOfflineMode(offlineSettings.enabled)
  }, [offlineSettings.enabled])

  // Sync mode with current conversation's mode
  useEffect(() => {
    if (currentConversation) {
      setMode(currentConversation.mode)
    }
  }, [currentConversationId, currentConversation?.mode])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [currentConversation?.messages])

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: mode === 'chat' ? 'New Chat' : 'New Image Generation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode,
    }

    setConversations((current = []) => [newConversation, ...current])
    setCurrentConversationId(newConversation.id)
  }, [mode, setConversations])

  const createNewGroupChat = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: 'New Group Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: 'chat',
      isGroupChat: true,
    }

    setConversations((current = []) => [newConversation, ...current])
    setCurrentConversationId(newConversation.id)
  }, [setConversations])

  const handleStartPersonaChat = useCallback((persona: AIPersona) => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: `Chat with ${persona.name}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: 'roleplay',
      isGroupChat: false,
      participants: [persona.id],
    }

    setConversations((current = []) => [newConversation, ...current])
    setCurrentConversationId(newConversation.id)
    setMode('roleplay')
    toast.success(`Started chat with ${persona.name}`)
  }, [setConversations])

  const handleCreateGroupChatWithPersonas = useCallback((title: string, participants: GroupChatParticipant[]) => {
    // Extract persona IDs from participants
    const personaIds = participants
      .filter(p => p.type === 'ai' && p.personaId)
      .map(p => p.personaId!)

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: 'roleplay',
      isGroupChat: true,
      participants: personaIds,
    }

    setConversations((current = []) => [newConversation, ...current])
    setCurrentConversationId(newConversation.id)
    setMode('roleplay')
    toast.success(`Group chat "${title}" created with ${personaIds.length} AI personas`)
  }, [setConversations])

  const updateConversationTitle = useCallback((conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
    setConversations((current = []) =>
      current.map((c) =>
        c.id === conversationId ? { ...c, title, updatedAt: Date.now() } : c
      )
    )
  }, [setConversations])

  const addMessage = useCallback((conversationId: string, message: ChatMessageType) => {
    setConversations((current = []) =>
      current.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
          : c
      )
    )
  }, [setConversations])

  const updateLastMessage = useCallback((conversationId: string, content: string, isStreaming: boolean = false) => {
    setConversations((current = []) =>
      current.map((c) => {
        if (c.id !== conversationId) return c
        const messages = [...c.messages]
        const lastMessage = messages[messages.length - 1]
        if (lastMessage) {
          messages[messages.length - 1] = { ...lastMessage, content, isStreaming }
        }
        return { ...c, messages }
      })
    )
  }, [setConversations])

  const handleSendMessage = useCallback(async (content: string, attachments?: FileAttachment[]) => {
    if (!currentConversationId) {
      createNewConversation()
      setPendingMessage(content)
      return
    }

    if (isGenerating) return

    // Get the current conversation messages before adding new ones
    let conversationMessages: ChatMessageType[] = []
    let conversationExists = false
    setConversations((current = []) => {
      const conversation = current.find((c) => c.id === currentConversationId)
      if (conversation) {
        conversationMessages = conversation.messages
        conversationExists = true
      }
      return current
    })

    if (!conversationExists) {
      console.warn('Conversation not found:', currentConversationId)
      return
    }

    if (conversationMessages.length === 0) {
      updateConversationTitle(currentConversationId, content)
    }

    if (mode === 'chat' || mode === 'roleplay') {
      const userMessage: ChatMessageType = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments,
      }

      addMessage(currentConversationId, userMessage)

      const assistantMessage: ChatMessageType = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      }

      addMessage(currentConversationId, assistantMessage)
      setIsGenerating(true)

      try {
        // Build message history from the conversation messages before we added the new ones
        const messages: Message[] = []
        
        // Add system prompt for persona chats
        if (mode === 'roleplay' && currentConversation?.participants && currentConversation.participants.length === 1) {
          const personaId = currentConversation.participants[0]
          const allPersonas: AIPersona[] = [
            ...PREMADE_PERSONAS.map((p, idx) => ({ ...p, id: `premade_${idx}` })),
            ...CHARACTER_PERSONAS.map((p, idx) => ({ ...p, id: `character_${idx}` })),
            ...(personas || []),
          ]
          const persona = allPersonas.find(p => p.id === personaId)
          if (persona) {
            // Combine character-specific prompt with roleplay enforcement rules
            const enhancedSystemPrompt = `${persona.systemPrompt}\n\n${ROLEPLAY_ENFORCEMENT_RULES}`
            
            messages.push({
              role: 'system' as const,
              content: enhancedSystemPrompt,
            })
          }
        }
        
        messages.push(
          ...conversationMessages.map((m) => {
            let messageContent = m.content
            
            // Include file content for messages with attachments
            if (m.attachments && m.attachments.length > 0) {
              const fileContexts = m.attachments.map(file => {
                if (file.content && (file.type.startsWith('text/') || file.type === 'application/json')) {
                  return `\n\n[File: ${file.name}]\n${file.content}`
                } else if (file.type.startsWith('image/')) {
                  return `\n\n[Attached image: ${file.name}]`
                } else {
                  return `\n\n[Attached file: ${file.name}]`
                }
              }).join('')
              
              messageContent = messageContent + fileContexts
            }
            
            return {
              role: m.role as 'user' | 'assistant',
              content: messageContent,
            }
          }),
          { 
            role: 'user' as const, 
            content: (() => {
              let finalContent = content
              
              // Add file content to the current message
              if (attachments && attachments.length > 0) {
                const fileContexts = attachments.map(file => {
                  if (file.content && (file.type.startsWith('text/') || file.type === 'application/json')) {
                    return `\n\n[File: ${file.name}]\n${file.content}`
                  } else if (file.type.startsWith('image/')) {
                    return `\n\n[Attached image: ${file.name}]`
                  } else {
                    return `\n\n[Attached file: ${file.name}]`
                  }
                }).join('')
                
                finalContent = finalContent + fileContexts
              }
              
              return finalContent
            })()
          }
        )

        // Use Mistral for roleplay mode, otherwise use selected model
        const modelToUse = mode === 'roleplay' || currentConversation?.isGroupChat ? ROLEPLAY_MODEL : textModel

        await generateText(messages, modelToUse, (chunk) => {
          updateLastMessage(
            currentConversationId,
            assistantMessage.content + chunk,
            true
          )
          assistantMessage.content += chunk
        }, {
          tools: mode === 'roleplay' || currentConversation?.isGroupChat ? undefined : AI_TOOLS,
          tool_choice: mode === 'roleplay' || currentConversation?.isGroupChat ? undefined : 'auto',
        })

        updateLastMessage(currentConversationId, assistantMessage.content, false)
      } catch (error) {
        console.error('Error generating text:', error)
        toast.error('Failed to generate response. Please try again.')
        setConversations((current = []) =>
          current.map((c) =>
            c.id === currentConversationId
              ? { ...c, messages: c.messages.slice(0, -1) }
              : c
          )
        )
      } finally {
        setIsGenerating(false)
      }
    } else {
      setIsGenerating(true)
      try {
        const imageUrl = await generateImage(content, imageModel)
        const generatedImage: GeneratedImage = {
          id: `img_${Date.now()}`,
          prompt: content,
          url: imageUrl,
          timestamp: Date.now(),
          model: imageModel,
        }

        const imageMessage: ChatMessageType = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: JSON.stringify(generatedImage),
          timestamp: Date.now(),
        }

        addMessage(currentConversationId, imageMessage)
        toast.success('Image generated successfully!')
      } catch (error) {
        console.error('Error generating image:', error)
        toast.error('Failed to generate image. Please try again.')
      } finally {
        setIsGenerating(false)
      }
    }
  }, [currentConversationId, isGenerating, mode, textModel, imageModel, createNewConversation, setConversations, updateConversationTitle, addMessage, updateLastMessage])

  useEffect(() => {
    if (pendingMessage && currentConversationId) {
      const messageToSend = pendingMessage
      setPendingMessage(null)
      // Small delay to ensure conversation state has updated
      setTimeout(() => {
        handleSendMessage(messageToSend)
      }, 0)
    }
  }, [currentConversationId, pendingMessage, handleSendMessage])

  const handleDeleteConversation = (id: string) => {
    setConversations((current = []) => current.filter((c) => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
    }
  }

  const handlePinConversation = (id: string) => {
    setConversations((current = []) =>
      current.map((c) =>
        c.id === id ? { ...c, isPinned: !c.isPinned, updatedAt: Date.now() } : c
      )
    )
  }

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((current = []) =>
      current.map((c) =>
        c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
      )
    )
    toast.success('Conversation renamed')
  }

  const handleClearAllConversations = () => {
    setConversations((current = []) => current.filter((c) => c.mode !== mode))
    setCurrentConversationId(null)
    toast.success('All conversations cleared')
  }

  const handleToggleFavorite = (messageId: string) => {
    if (!currentConversationId) return
    setConversations((current = []) =>
      current.map((c) => {
        if (c.id !== currentConversationId) return c
        const messages = c.messages.map((m) =>
          m.id === messageId ? { ...m, isFavorite: !m.isFavorite } : m
        )
        return { ...c, messages, updatedAt: Date.now() }
      })
    )
  }

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!currentConversationId) return
    setConversations((current = []) =>
      current.map((c) => {
        if (c.id !== currentConversationId) return c
        const messages = c.messages.map((m) =>
          m.id === messageId ? { ...m, content: newContent } : m
        )
        return { ...c, messages, updatedAt: Date.now() }
      })
    )
    // Regenerate response after edit
    handleSendMessage(newContent)
  }

  const handleUnfavoriteMessage = (conversationId: string, messageId: string) => {
    setConversations((current = []) =>
      current.map((c) => {
        if (c.id !== conversationId) return c
        const messages = c.messages.map((m) =>
          m.id === messageId ? { ...m, isFavorite: false } : m
        )
        return { ...c, messages }
      })
    )
  }

  // Memory handlers
  const handleAddMemory = (memory: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMemory: MemoryEntry = {
      ...memory,
      id: `mem_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setMemories((current = []) => [...current, newMemory])
  }

  const handleUpdateMemory = (id: string, updates: Partial<MemoryEntry>) => {
    setMemories((current = []) =>
      current.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m
      )
    )
  }

  const handleDeleteMemory = (id: string) => {
    setMemories((current = []) => current.filter((m) => m.id !== id))
  }

  // Persona handlers
  const handleAddPersona = (persona: Omit<AIPersona, 'id'>) => {
    const newPersona: AIPersona = {
      ...persona,
      id: `persona_${Date.now()}`,
    }
    setPersonas((current = []) => [...current, newPersona])
  }

  const handleUpdatePersona = (id: string, updates: Partial<AIPersona>) => {
    setPersonas((current = []) =>
      current.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const handleDeletePersona = (id: string) => {
    setPersonas((current = []) => current.filter((p) => p.id !== id))
  }

  // Offline mode handlers
  const handleOfflineToggle = (enabled: boolean) => {
    setOfflineSettings((current) => ({
      ...current,
      enabled,
      modelLoaded: enabled,
    }))
  }

  const handleOfflineModelSelect = (modelId: string) => {
    setOfflineSettings((current) => ({
      ...current,
      selectedModel: modelId,
    }))
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: createNewConversation },
    { key: 'k', ctrl: true, handler: () => document.getElementById('search-input')?.focus() },
    { key: 'f', ctrl: true, handler: () => setFavoritesDialogOpen(true) },
    { key: '/', ctrl: true, handler: () => setShortcutsDialogOpen(true) },
    { key: '1', ctrl: true, handler: () => handleModeChange('chat') },
    { key: '2', ctrl: true, handler: () => handleModeChange('image') },
  ], !memoryDialogOpen && !personaDialogOpen && !favoritesDialogOpen && !shortcutsDialogOpen && !offlineModeDialogOpen)

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    setCurrentConversationId(null)
  }

  const handleExampleClick = (prompt: string) => {
    if (!currentConversationId) {
      createNewConversation()
      setPendingMessage(prompt)
    } else {
      handleSendMessage(prompt)
    }
  }

  const handleRegenerateMessage = useCallback((messageIndex: number) => {
    if (!currentConversation) return
    
    // Find the user message that corresponds to this assistant message
    // Look backwards from the current message
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (currentConversation.messages[i].role === 'user') {
        handleSendMessage(currentConversation.messages[i].content)
        break
      }
    }
  }, [currentConversation, handleSendMessage])

  const handleRegenerate = (prompt: string) => {
    handleSendMessage(prompt)
  }

  const currentImages: GeneratedImage[] =
    currentConversation?.messages
      .filter((m) => m.role === 'assistant')
      .map((m) => {
        try {
          return JSON.parse(m.content) as GeneratedImage
        } catch {
          return null
        }
      })
      .filter((img): img is GeneratedImage => img !== null) || []

  const showEmpty = !currentConversation || currentConversation.messages.length === 0

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    )
  }

  // Development mode: bypass auth for testing
  const isDevelopment = import.meta.env.DEV
  const bypassAuth = isDevelopment && !user

  // Show auth page if not logged in (unless in dev mode bypass)
  if (!user && !bypassAuth) {
    return (
      <>
        <AuthPage />
        <Toaster position="top-center" />
      </>
    )
  }

  // Check if we're in a single persona roleplay chat (not group chat)
  const isSinglePersonaRoleplay = mode === 'roleplay' && currentConversation && !currentConversation.isGroupChat && currentConversation.participants?.length === 1
  
  // Check if we're in a group roleplay chat
  const isGroupRoleplay = mode === 'roleplay' && currentConversation && currentConversation.isGroupChat && currentConversation.participants && currentConversation.participants.length > 0

  // Get current persona for single persona chats
  const getCurrentPersona = (): AIPersona | undefined => {
    if (!isSinglePersonaRoleplay || !currentConversation?.participants?.[0]) return undefined
    
    const allPersonas: AIPersona[] = [
      ...PREMADE_PERSONAS.map((p, idx) => ({ ...p, id: `premade_${idx}` })),
      ...CHARACTER_PERSONAS.map((p, idx) => ({ ...p, id: `character_${idx}` })),
      ...(personas || []),
    ]
    
    return allPersonas.find(p => p.id === currentConversation.participants![0])
  }

  // Get personas for group chat
  const getGroupPersonas = (): AIPersona[] => {
    if (!isGroupRoleplay || !currentConversation?.participants) return []
    
    const allPersonas: AIPersona[] = [
      ...PREMADE_PERSONAS.map((p, idx) => ({ ...p, id: `premade_${idx}` })),
      ...CHARACTER_PERSONAS.map((p, idx) => ({ ...p, id: `character_${idx}` })),
      ...(personas || []),
    ]
    
    return allPersonas.filter(p => currentConversation.participants!.includes(p.id))
  }

  const currentPersona = getCurrentPersona()
  const groupPersonas = getGroupPersonas()

  // If we're in a group roleplay chat, render the dedicated GroupChatRoleplay component
  if (isGroupRoleplay && groupPersonas.length > 0) {
    return (
      <div className="flex h-screen overflow-hidden">
        <GroupChatRoleplay
          conversation={currentConversation}
          personas={groupPersonas}
          onSendMessage={handleSendMessage}
          onBack={() => setCurrentConversationId(null)}
          isGenerating={isGenerating}
        />
        <Toaster position="top-center" />
      </div>
    )
  }

  // If we're in a single persona roleplay chat, render the dedicated RoleplayChat component
  if (isSinglePersonaRoleplay && currentPersona) {
    return (
      <div className="flex h-screen overflow-hidden">
        <RoleplayChat
          conversation={currentConversation}
          persona={currentPersona}
          onSendMessage={handleSendMessage}
          onBack={() => setCurrentConversationId(null)}
          isGenerating={isGenerating}
        />
        <Toaster position="top-center" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      <LiquidMetalBackground opacity={0.25} />
      <Sidebar
        conversations={conversationsList}
        currentConversationId={currentConversationId}
        mode={mode}
        onNewChat={createNewConversation}
        onNewGroupChat={createNewGroupChat}
        onSelectConversation={setCurrentConversationId}
        onDeleteConversation={handleDeleteConversation}
        onModeChange={handleModeChange}
        onPinConversation={handlePinConversation}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAllConversations}
        onOpenMemory={() => setMemoryDialogOpen(true)}
        onOpenPersonas={() => setPersonaDialogOpen(true)}
        onOpenFavorites={() => setFavoritesDialogOpen(true)}
        onOpenOfflineMode={() => setOfflineModeDialogOpen(true)}
      />

      <div className="flex flex-1 flex-col">
        {mode !== 'roleplay' && (
          <ModelSelector
            mode={mode}
            selectedModel={mode === 'chat' ? textModel : imageModel}
            onModelChange={mode === 'chat' ? setTextModel : setImageModel}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {mode === 'roleplay' && !currentConversationId ? (
            <RoleplayPage
              personas={personas || []}
              onOpenPersonaManager={() => setPersonaDialogOpen(true)}
              onCreateGroupChat={handleCreateGroupChatWithPersonas}
              onStartPersonaChat={handleStartPersonaChat}
            />
          ) : showEmpty ? (
            <EmptyState mode={mode} onExampleClick={handleExampleClick} />
          ) : mode === 'chat' ? (
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="mx-auto max-w-3xl">
                {currentConversation.messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message}
                    onRegenerate={message.role === 'assistant' ? () => handleRegenerateMessage(index) : undefined}
                    onToggleFavorite={() => handleToggleFavorite(message.id)}
                    onEdit={message.role === 'user' ? (newContent) => handleEditMessage(message.id, newContent) : undefined}
                  />
                ))}
                {isGenerating && currentConversation.messages[currentConversation.messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-4 bg-muted/50 px-6 py-4">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full">
              <div className="mx-auto max-w-4xl">
                {isGenerating && (
                  <div className="p-6">
                    <div className="overflow-hidden rounded-lg border">
                      <Skeleton className="aspect-square w-full" />
                    </div>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Generating your image...
                    </p>
                  </div>
                )}
                <ImageGeneration images={currentImages} onRegenerate={handleRegenerate} />
              </div>
            </ScrollArea>
          )}
        </div>

        {mode !== 'roleplay' && !currentConversation?.isGroupChat && (
          <ChatInput
            onSend={handleSendMessage}
            disabled={isGenerating}
            placeholder={mode === 'chat' ? 'Ask anything' : 'Describe the image you want to create'}
          />
        )}
      </div>

      <MemoryManager
        open={memoryDialogOpen}
        onOpenChange={setMemoryDialogOpen}
        memories={memories || []}
        onAddMemory={handleAddMemory}
        onUpdateMemory={handleUpdateMemory}
        onDeleteMemory={handleDeleteMemory}
      />

      <PersonaManager
        open={personaDialogOpen}
        onOpenChange={setPersonaDialogOpen}
        personas={personas || []}
        onAddPersona={handleAddPersona}
        onUpdatePersona={handleUpdatePersona}
        onDeletePersona={handleDeletePersona}
      />

      <FavoritesDialog
        open={favoritesDialogOpen}
        onOpenChange={setFavoritesDialogOpen}
        conversations={conversationsList}
        onUnfavorite={handleUnfavoriteMessage}
      />

      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onOpenChange={setShortcutsDialogOpen}
      />

      <OfflineModeDialog
        open={offlineModeDialogOpen}
        onOpenChange={setOfflineModeDialogOpen}
        offlineEnabled={offlineSettings.enabled}
        selectedModel={offlineSettings.selectedModel}
        onOfflineToggle={handleOfflineToggle}
        onModelSelect={handleOfflineModelSelect}
      />

      <Toaster position="top-center" />
    </div>
  )
}

export default App