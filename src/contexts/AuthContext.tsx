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
import { auth, githubProvider } from '../lib/firebase'

interface AuthError {
  message: string
  code?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGitHub: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (error) {
      const firebaseError = error as FirebaseAuthError
      return { 
        error: { 
          message: firebaseError.message,
          code: firebaseError.code
        } 
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (error) {
      const firebaseError = error as FirebaseAuthError
      return { 
        error: { 
          message: firebaseError.message,
          code: firebaseError.code
        } 
      }
    }
  }

  const signInWithGitHub = async () => {
    try {
      await signInWithPopup(auth, githubProvider)
      return { error: null }
    } catch (error) {
      const firebaseError = error as FirebaseAuthError
      return { 
        error: { 
          message: firebaseError.message,
          code: firebaseError.code
        } 
      }
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGitHub, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
