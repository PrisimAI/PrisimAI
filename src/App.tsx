import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { Sidebar } from './components/Sidebar'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { EmptyState } from './components/EmptyState'
import { ImageGeneration } from './components/ImageGeneration'
import { ModelSelector } from './components/ModelSelector'
import { ScrollArea } from './components/ui/scroll-area'
import { Skeleton } from './components/ui/skeleton'
import { generateText, generateImage, type Message } from './lib/pollinations-api'
import type { Conversation, ChatMessage as ChatMessageType, GeneratedImage, AppMode } from './lib/types'

function App() {
  const [conversations, setConversations] = useKV<Conversation[]>('conversations', [])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<AppMode>('chat')
  const [textModel, setTextModel] = useState('openai')
  const [imageModel, setImageModel] = useState('flux')
  const [isGenerating, setIsGenerating] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const conversationsList = conversations || []
  const currentConversation = conversationsList.find((c) => c.id === currentConversationId)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [currentConversation?.messages])

  const createNewConversation = () => {
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
  }

  const updateConversationTitle = (conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
    setConversations((current = []) =>
      current.map((c) =>
        c.id === conversationId ? { ...c, title, updatedAt: Date.now() } : c
      )
    )
  }

  const addMessage = (conversationId: string, message: ChatMessageType) => {
    setConversations((current = []) =>
      current.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
          : c
      )
    )
  }

  const updateLastMessage = (conversationId: string, content: string, isStreaming: boolean = false) => {
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
  }

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) {
      createNewConversation()
      setTimeout(() => handleSendMessage(content), 100)
      return
    }

    const conversation = conversationsList.find((c) => c.id === currentConversationId)
    if (!conversation) return

    if (conversation.messages.length === 0) {
      updateConversationTitle(currentConversationId, content)
    }

    if (mode === 'chat') {
      const userMessage: ChatMessageType = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
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
        const messages: Message[] = [
          ...conversation.messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content },
        ]

        await generateText(messages, textModel, (chunk) => {
          updateLastMessage(
            currentConversationId,
            assistantMessage.content + chunk,
            true
          )
          assistantMessage.content += chunk
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
  }

  const handleDeleteConversation = (id: string) => {
    setConversations((current = []) => current.filter((c) => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
    }
  }

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    setCurrentConversationId(null)
  }

  const handleExampleClick = (prompt: string) => {
    if (!currentConversationId) {
      createNewConversation()
      setTimeout(() => handleSendMessage(prompt), 100)
    } else {
      handleSendMessage(prompt)
    }
  }

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        conversations={conversationsList}
        currentConversationId={currentConversationId}
        mode={mode}
        onNewChat={createNewConversation}
        onSelectConversation={setCurrentConversationId}
        onDeleteConversation={handleDeleteConversation}
        onModeChange={handleModeChange}
      />

      <div className="flex flex-1 flex-col">
        {currentConversation && (
          <ModelSelector
            mode={mode}
            selectedModel={mode === 'chat' ? textModel : imageModel}
            onModelChange={mode === 'chat' ? setTextModel : setImageModel}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {showEmpty ? (
            <EmptyState mode={mode} onExampleClick={handleExampleClick} />
          ) : mode === 'chat' ? (
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="mx-auto max-w-3xl">
                {currentConversation.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
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

        <ChatInput
          onSend={handleSendMessage}
          disabled={isGenerating}
          placeholder={mode === 'chat' ? 'Ask anything' : 'Describe the image you want to create'}
        />
      </div>

      <Toaster position="top-center" />
    </div>
  )
}

export default App