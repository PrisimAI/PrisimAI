import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code, Copy, Check } from '@phosphor-icons/react'

interface APIDocsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function APIDocsDialog({ open, onOpenChange }: APIDocsDialogProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border border-b-0">
        <span className="text-xs font-medium">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="h-6 px-2"
        >
          {copiedCode === id ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </Button>
      </div>
      <pre className="bg-secondary p-4 rounded-b-lg border overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code size={24} />
            API Documentation
          </DialogTitle>
          <DialogDescription>
            Pollinations.AI API reference and examples
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text Generation</TabsTrigger>
            <TabsTrigger value="image">Image Generation</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Chat Completions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    OpenAI-compatible chat completions endpoint with streaming support.
                  </p>
                  <CodeBlock
                    id="text-1"
                    language="JavaScript"
                    code={`fetch('https://enter.pollinations.ai/api/generate/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'openai',
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    stream: true
  })
})`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">With Tools <Badge variant="secondary" className="ml-2">New</Badge></h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enable function calling and tool use in your chat.
                  </p>
                  <CodeBlock
                    id="text-2"
                    language="JavaScript"
                    code={`{
  model: 'openai',
  messages: [...],
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get current weather',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City name'
            }
          }
        }
      }
    }
  ],
  tool_choice: 'auto'
}`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Simple Text Endpoint</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Quick text generation without chat format.
                  </p>
                  <CodeBlock
                    id="text-3"
                    language="JavaScript"
                    code={`fetch('https://enter.pollinations.ai/api/generate/text/hello?key=YOUR_API_KEY')`}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Generate Image</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create images from text prompts using various models.
                  </p>
                  <CodeBlock
                    id="image-1"
                    language="JavaScript"
                    code={`fetch('https://enter.pollinations.ai/api/generate/image/a%20cat?model=flux', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(res => res.blob())
.then(blob => URL.createObjectURL(blob))`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Available Models</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Badge variant="outline">flux</Badge>
                    <Badge variant="outline">flux-realism</Badge>
                    <Badge variant="outline">flux-anime</Badge>
                    <Badge variant="outline">flux-3d</Badge>
                    <Badge variant="outline">turbo</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Get Text Models</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Retrieve list of available text generation models with capabilities.
                  </p>
                  <CodeBlock
                    id="models-1"
                    language="JavaScript"
                    code={`fetch('https://enter.pollinations.ai/api/generate/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Get Image Models</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Retrieve list of available image generation models with pricing.
                  </p>
                  <CodeBlock
                    id="models-2"
                    language="JavaScript"
                    code={`fetch('https://enter.pollinations.ai/api/generate/image/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})`}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Authentication</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Publishable Keys (pk_):</strong> Client-side safe, IP rate-limited</p>
                    <p><strong>Secret Keys (sk_):</strong> Server-side only, no rate limits</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <a
            href="https://enter.pollinations.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:underline"
          >
            Get your API key →
          </a>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
