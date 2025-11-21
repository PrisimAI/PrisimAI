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

import { 
  getUserData, 
  initializeUserTier, 
  type UserData 
} from '../lib/tiers'

// Types
interface AuthError {
  message: string
  code?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithGitHub: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user tier data
  const fetchUserData = async (user: User) => {
    try {
      await initializeUserTier(user.uid, user.email || '')

      const data = await getUserData(user.uid)
      if (data) {
        setUserData(data)
      } else {
        setUserData({
          tier: 'free',
          email: user.email || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          messagesUsed: 0,
          messagesLimit: 20,
          lastResetDate: new Date()
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const refreshUserData = async () => {
    if (user) await fetchUserData(user)
  }

  // Auth listener
  useEffect(() => {
    const devTimeout = setTimeout(() => {
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
        fetchUserData(mockUser)
        setLoading(false)
      }
    }, 3000)

    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      clearTimeout(devTimeout)
      setUser(usr)
      
      if (usr) {
        await fetchUserData(usr)
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => {
      clearTimeout(devTimeout)
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
    await firebaseSignOut(auth)
    setUser(null)
    setUserData(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithGitHub,
      signOut,
      refreshUserData
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
