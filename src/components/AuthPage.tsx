import { useState } from 'react'
import { AuthForm } from '@/components/AuthForm'
import { LiquidMetalBackground } from '@/components/LiquidMetalBackground'

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <LiquidMetalBackground opacity={0.4} />
      <div className="flex flex-col items-center gap-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">PrisimAI</h1>
          <p className="mt-2 text-muted-foreground">
            Your AI-powered assistant for chat and image generation
          </p>
        </div>
        <AuthForm mode={mode} onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} />
      </div>
    </div>
  )
}
