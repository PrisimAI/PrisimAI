import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthError as FirebaseAuthError
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '../lib/firebase'

// Types
interface AuthError {
  message: string
  code?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithGitHub: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Auth listener
  useEffect(() => {
    // Only enable mock user fallback in development mode (Bug #27)
    const isDevelopment = import.meta.env.DEV
    
    const devTimeout = isDevelopment ? setTimeout(() => {
      if (loading) {
        console.warn('Firebase auth timeout - using development mock user')
        const mockUser = {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          displayName: 'Development User',
          phoneNumber: null,
          photoURL: null,
          providerId: 'firebase',
        } as User

        setUser(mockUser)
        setLoading(false)
      }
    }, 3000) : null

    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      if (devTimeout) clearTimeout(devTimeout)
      setUser(usr)
      setLoading(false)
    })

    return () => {
      if (devTimeout) clearTimeout(devTimeout)
      unsubscribe()
    }
  }, [])

  // Auth actions
  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (error) {
      const firebaseError = error as FirebaseAuthError
      return { error: { message: firebaseError.message, code: firebaseError.code }}
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (error) {
      const firebaseError = error as FirebaseAuthError
      return { error: { message: firebaseError.message, code: firebaseError.code }}
    }
  }

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      return { error: null }
    } catch (error) {
      const firebaseError = error as FirebaseAuthError
      return { error: { message: firebaseError.message, code: firebaseError.code }}
    }
  }

  const signInWithGitHub = async () => {
    try {
      await signInWithPopup(auth, githubProvider)
      return { error: null }
    } catch (error) {
      const firebaseError = error as FirebaseAuthError
      return { error: { message: firebaseError.message, code: firebaseError.code }}
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      // Still clear the local user state even if Firebase sign out fails
      setUser(null)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithGitHub,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
