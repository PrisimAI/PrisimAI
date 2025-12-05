import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthForm } from '@/components/AuthForm'

import { LanguageSelector } from '@/components/LanguageSelector'

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Glassmorphism gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>
      <div className="flex flex-col items-center gap-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('app.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('app.subtitle')}
          </p>
        </div>
        <AuthForm mode={mode} onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} />
      </div>
    </div>
  )
}
