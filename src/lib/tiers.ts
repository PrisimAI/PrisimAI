import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export type UserTier = 'free' | 'pro' | 'deluxe'

export interface TierConfig {
  name: string
  displayName: string
  allowedModels: string[]
  messagesPerDay: number
  requestsPerMinute: number
  features: {
    imageGeneration: boolean
    advancedModels: boolean
    prioritySupport: boolean
    customModels?: boolean
  }
}

export interface UserData {
  tier: UserTier
  email: string
  createdAt: any
  updatedAt: any
  messagesUsed: number
  messagesLimit: number
  lastResetDate: any
}

// Cache for tier configs
const tierConfigCache: Map<UserTier, TierConfig> = new Map()

/**
 * Get tier configuration from Firestore
 */
export async function getTierConfig(tier: UserTier): Promise<TierConfig> {
  // Check cache first
  if (tierConfigCache.has(tier)) {
    return tierConfigCache.get(tier)!
  }

  try {
    const tierDoc = await getDoc(doc(db, 'tiers', tier))
    if (tierDoc.exists()) {
      const config = tierDoc.data() as TierConfig
      tierConfigCache.set(tier, config)
      return config
    }
  } catch (error) {
    console.error('Error fetching tier config:', error)
  }

  // Fallback to hardcoded configs
  return getDefaultTierConfig(tier)
}

/**
 * Fallback tier configurations (in case Firestore is unavailable)
 */
function getDefaultTierConfig(tier: UserTier): TierConfig {
  const configs: Record<UserTier, TierConfig> = {
    free: {
      name: 'free',
      displayName: 'Free',
      allowedModels: [
        'mistral-fast',
        'mistral',
        'gemini',
        'gemini-search',
        'openai',
        'openai-fast'
      ],
      messagesPerDay: 20,
      requestsPerMinute: 3,
      features: {
        imageGeneration: false,
        advancedModels: false,
        prioritySupport: false
      }
    },
    pro: {
      name: 'pro',
      displayName: 'Pro',
      allowedModels: [
        'mistral-fast',
        'mistral',
        'gemini',
        'gemini-search',
        'openai',
        'openai-fast',
        'llama',
        'claude',
        'gpt4'
      ],
      messagesPerDay: 100,
      requestsPerMinute: 10,
      features: {
        imageGeneration: true,
        advancedModels: true,
        prioritySupport: false
      }
    },
    deluxe: {
      name: 'deluxe',
      displayName: 'Deluxe',
      allowedModels: ['*'], // All models
      messagesPerDay: -1, // Unlimited
      requestsPerMinute: -1, // Unlimited
      features: {
        imageGeneration: true,
        advancedModels: true,
        prioritySupport: true,
        customModels: true
      }
    }
  }

  return configs[tier]
}

/**
 * Check if a model is allowed for the given tier
 */
export function isModelAllowed(modelId: string, tierConfig: TierConfig): boolean {
  // Deluxe has access to all models
  if (tierConfig.allowedModels.includes('*')) {
    return true
  }

  // Check if model is in allowed list
  return tierConfig.allowedModels.includes(modelId)
}

/**
 * Check if user can send a message based on their limits
 */
export function canSendMessage(messagesUsed: number, messagesLimit: number): boolean {
  // Unlimited (-1) means always allowed
  if (messagesLimit === -1) {
    return true
  }

  return messagesUsed < messagesLimit
}

/**
 * Initialize user document in Firestore when they first sign up
 */
export async function initializeUserTier(userId: string, email: string): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    // Only create if doesn't exist
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', userId), {
        tier: 'free',
        email: email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messagesUsed: 0,
        messagesLimit: 20,
        lastResetDate: serverTimestamp()
      })
      console.log(`Initialized tier 'free' for user: ${userId}`)
    }
  } catch (error) {
    console.error('Error initializing user tier:', error)
  }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
  return null
}
