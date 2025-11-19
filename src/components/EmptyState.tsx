import { ChatCircle, Image, Lightbulb, Code } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import type { AppMode } from '@/lib/types'

interface EmptyStateProps {
  mode: AppMode
  onExampleClick: (prompt: string) => void
}

const chatExamples = [
  {
    icon: Lightbulb,
    title: 'Get ideas',
    prompt: 'Give me 5 creative ideas for a weekend project',
  },
  {
    icon: Code,
    title: 'Write code',
    prompt: 'Write a Python function to calculate fibonacci numbers',
  },
  {
    icon: ChatCircle,
    title: 'Explain concepts',
    prompt: 'Explain quantum computing like I\'m five years old',
  },
]

const imageExamples = [
  {
    icon: Image,
    title: 'Create art',
    prompt: 'A serene Japanese garden with cherry blossoms at sunset, digital art',
  },
  {
    icon: Lightbulb,
    title: 'Design concepts',
    prompt: 'Modern minimalist logo for a tech startup, geometric shapes',
  },
  {
    icon: Image,
    title: 'Generate scenes',
    prompt: 'Futuristic city skyline with flying cars, cyberpunk style, neon lights',
  },
]

export function EmptyState({ mode, onExampleClick }: EmptyStateProps) {
  const examples = mode === 'chat' ? chatExamples : imageExamples

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            {mode === 'chat' ? 'What are you working on?' : 'What would you like to create?'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {mode === 'chat'
              ? 'Ask questions, get creative help, or just have a conversation'
              : 'Describe an image and watch AI bring it to life'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {examples.map((example, index) => {
            const Icon = example.icon
            return (
              <Card
                key={index}
                className="cursor-pointer p-4 transition-all hover:scale-[1.02] hover:border-accent hover:shadow-md"
                onClick={() => onExampleClick(example.prompt)}
              >
                <div className="flex flex-col gap-2">
                  <Icon size={24} className="text-accent" weight="duotone" />
                  <h3 className="font-medium">{example.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{example.prompt}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
