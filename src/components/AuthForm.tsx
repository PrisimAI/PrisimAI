import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GithubLogo, GoogleLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AuthFormProps {
  onToggleMode: () => void
  mode: 'signin' | 'signup'
}

export function AuthForm({ onToggleMode, mode }: AuthFormProps) {
  const { signIn, signUp, signInWithGoogle, signInWithGitHub } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Account created successfully! Please check your email to verify your account.')
          setEmail('')
          setPassword('')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Signed in successfully!')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message)
        setGoogleLoading(false)
      }
      // Don't set loading to false here as we're redirecting
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
      setGoogleLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setGithubLoading(true)
    try {
      const { error } = await signInWithGitHub()
      if (error) {
        toast.error(error.message)
        setGithubLoading(false)
      }
      // Don't set loading to false here as we're redirecting
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
      setGithubLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}</CardTitle>
        <CardDescription>
          {mode === 'signin'
            ? 'Enter your credentials to access your account'
            : 'Create a new account to get started'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading || githubLoading}
          >
            <GoogleLogo size={18} className="mr-2" />
            {googleLoading ? 'Redirecting...' : mode === 'signin' ? t('auth.signInWithGoogle') : t('auth.signUpWithGoogle')}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGitHubSignIn}
            disabled={loading || googleLoading || githubLoading}
          >
            <GithubLogo size={18} className="mr-2" />
            {githubLoading ? 'Redirecting...' : `Continue with GitHub`}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
            />
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters long
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {mode === 'signin' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {mode === 'signin' ? t('auth.signUpHere') : t('auth.signInHere')}
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
