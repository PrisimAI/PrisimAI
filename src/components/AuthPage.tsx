import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthForm } from '@/components/AuthForm'
import { LiquidMetalBackground } from '@/components/LiquidMetalBackground'
import { LanguageSelector } from '@/components/LanguageSelector'

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <LiquidMetalBackground opacity={0.4} />
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>
      <div className="flex flex-col items-center gap-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">{t('app.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('app.subtitle')}
          </p>
        </div>
        <AuthForm mode={mode} onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} />
      </div>
    </div>
  )
}
