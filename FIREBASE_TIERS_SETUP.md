# Firebase User Tiers Setup Guide (Client-Side Only)

This guide explains how to implement a three-tier subscription system (Free, Pro, and Deluxe) for PrisimAI using **only Firestore** and client-side code. **No server-side code or Cloud Functions required.**

## Overview

The tier system will control:
- **Model Access**: Which AI models users can use
- **Rate Limits**: Message limits and speed restrictions  
- **Features**: Premium features available per tier

### Tier Breakdown

| Tier | Available Models | Chat Limits | Speed |
|------|-----------------|-------------|-------|
| **Free** | mistral-fast, mistral, gemini, gemini-search, openai, openai-fast | Lowest (20/day) | Slowest (3/min) |
| **Pro** | All models EXCEPT: openai-large, midijourney, claude-large, openai-reasoning, deepseek, perplexity-reasoning, gemini-large, openai-audio | Limited (100/day) | Limited (10/min) |
| **Deluxe** | ALL models | Unlimited | Unlimited |

## Implementation Method

This guide uses **Firestore only** - all tier information is stored in Firestore and managed client-side. You'll manually set tiers through the Firebase Console, and the client app will read and enforce them.

---

## Part 1: Setting Up Firestore Database

### Step 1: Enable Firestore

1. **Go to Firebase Console**: [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Select your PrisimAI project**
3. **Click "Firestore Database"** in the left sidebar
4. **Click "Create database"**
5. **Choose "Start in production mode"** (we'll add custom rules next)
6. **Select a location** (choose closest to your users)
7. **Click "Enable"**

### Step 2: Create Tier Configuration Documents

In the Firestore Console, create a collection called `tiers` with three documents:

#### 1. Create Collection `tiers`

1. Click **"Start collection"**
2. Enter **Collection ID**: `tiers`
3. Click **"Next"**

#### 2. Add Document: `free`

- **Document ID**: `free` (type this manually)
- Add the following fields:

| Field Name | Type | Value |
|------------|------|-------|
| `name` | string | `free` |
| `displayName` | string | `Free` |
| `allowedModels` | array | `mistral-fast`, `mistral`, `gemini`, `gemini-search`, `openai`, `openai-fast` |
| `messagesPerDay` | number | `20` |
| `requestsPerMinute` | number | `3` |

Click "Add field" and create a **map** field called `features`:
- `features.imageGeneration` (boolean): `false`
- `features.advancedModels` (boolean): `false`
- `features.prioritySupport` (boolean): `false`

Click **"Save"**

#### 3. Add Document: `pro`

Click **"Add document"**:
- **Document ID**: `pro`
- Add the following fields:

| Field Name | Type | Value |
|------------|------|-------|
| `name` | string | `pro` |
| `displayName` | string | `Pro` |
| `allowedModels` | array | Add these items: `mistral-fast`, `mistral`, `gemini`, `gemini-search`, `openai`, `openai-fast`, `llama`, `claude`, `gpt4` |
| `messagesPerDay` | number | `100` |
| `requestsPerMinute` | number | `10` |

Add map field `features`:
- `features.imageGeneration` (boolean): `true`
- `features.advancedModels` (boolean): `true`
- `features.prioritySupport` (boolean): `false`

Click **"Save"**

**Note**: Pro tier does NOT include these 8 premium models: `openai-large`, `midijourney`, `claude-large`, `openai-reasoning`, `deepseek`, `perplexity-reasoning`, `gemini-large`, `openai-audio`

#### 4. Add Document: `deluxe`

Click **"Add document"**:
- **Document ID**: `deluxe`
- Add the following fields:

| Field Name | Type | Value |
|------------|------|-------|
| `name` | string | `deluxe` |
| `displayName` | string | `Deluxe` |
| `allowedModels` | array | `*` (single item: asterisk means all models) |
| `messagesPerDay` | number | `-1` (negative means unlimited) |
| `requestsPerMinute` | number | `-1` (negative means unlimited) |

Add map field `features`:
- `features.imageGeneration` (boolean): `true`
- `features.advancedModels` (boolean): `true`
- `features.prioritySupport` (boolean): `true`
- `features.customModels` (boolean): `true`

Click **"Save"**

### Step 3: Understand Users Collection Structure

When a user signs up, the client app will automatically create a document in the `users` collection.

The structure for each user document (`users/{userId}`):

| Field Name | Type | Description |
|------------|------|-------------|
| `tier` | string | `'free'`, `'pro'`, or `'deluxe'` |
| `email` | string | User's email address |
| `createdAt` | timestamp | When the user signed up |
| `updatedAt` | timestamp | Last tier update |
| `messagesUsed` | number | Messages used in current period |
| `messagesLimit` | number | Message limit based on tier |
| `lastResetDate` | timestamp | When usage counter was last reset |

### Step 4: Set Firestore Security Rules

1. In Firestore, click the **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      // Users can create their own document on signup
      allow create: if request.auth != null && request.auth.uid == userId;
      // Users cannot update their own tier (prevents cheating)
      allow update: if false;
      allow delete: if false;
    }
    
    // Anyone authenticated can read tier configurations
    match /tiers/{tierName} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

3. Click **"Publish"**

---

## Part 2: Client-Side Implementation

### Step 1: Update Firebase Configuration

Modify `/src/lib/firebase.ts` to include Firestore:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your existing firebase config...
const firebaseConfig = {
  apiKey: "AIzaSyCU5oNtSXp8VZYn_ow1cChrWPgXg9ccfyA",
  authDomain: "prisimai-9a06c.firebaseapp.com",
  projectId: "prisimai-9a06c",
  storageBucket: "prisimai-9a06c.firebasestorage.app",
  messagingSenderId: "172096388736",
  appId: "1:172096388736:web:8a74d6fe13d4ff17c03065",
  measurementId: "G-0BP67760MX"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)  // Add this line

export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

export default app
```

### Step 2: Create Tier Utilities File

Create a new file `/src/lib/tiers.ts`:

```typescript
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
```

### Step 3: Update AuthContext

Modify `/src/contexts/AuthContext.tsx` to include tier data. Add the `UserData` import and state:

```typescript
import { getUserData, initializeUserTier, type UserData } from '../lib/tiers'

// Add to AuthContextType interface:
userData: UserData | null
refreshUserData: () => Promise<void>

// Add state in AuthProvider:
const [userData, setUserData] = useState<UserData | null>(null)

// Add this function in AuthProvider:
const fetchUserData = async (user: User) => {
  try {
    // Initialize tier document if this is a new user
    await initializeUserTier(user.uid, user.email || '')
    
    // Fetch user data
    const data = await getUserData(user.uid)
    if (data) {
      setUserData(data)
    } else {
      // Fallback default
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
  if (user) {
    await fetchUserData(user)
  }
}

// Update the onAuthStateChanged callback:
onAuthStateChanged(auth, async (user) => {
  clearTimeout(devTimeout)
  setUser(user)
  if (user) {
    await fetchUserData(user)
  } else {
    setUserData(null)
  }
  setLoading(false)
})

// Add to the return value:
return (
  <AuthContext.Provider value={{ 
    user, 
    userData,  // Add this
    loading, 
    signUp, 
    signIn, 
    signInWithGoogle, 
    signInWithGitHub, 
    signOut,
    refreshUserData  // Add this
  }}>
    {children}
  </AuthContext.Provider>
)
```

### Step 4: Update ModelSelector to Filter by Tier

Modify `/src/components/ModelSelector.tsx` to filter models based on user tier:

```typescript
import { getTierConfig, isModelAllowed } from '@/lib/tiers'
import { useAuth } from '@/contexts/AuthContext'

// Add inside the component:
const { userData } = useAuth()
const [tierConfig, setTierConfig] = useState<any>(null)

// Load tier configuration
useEffect(() => {
  async function loadTierConfig() {
    if (userData?.tier) {
      const config = await getTierConfig(userData.tier)
      setTierConfig(config)
    }
  }
  loadTierConfig()
}, [userData?.tier])

// Filter models based on user tier (replace the displayModels line):
const displayModels = Array.isArray(models) ? models.slice(0, 19) : []

const filteredModels = displayModels.filter(model => {
  if (!tierConfig) return true // Show all if no tier config yet
  
  const modelId = (model as any).id || (model as any).name
  return isModelAllowed(modelId, tierConfig)
})

// Use filteredModels instead of displayModels in the rendering
```

---

## Part 3: Managing User Tiers

### How to Set a User's Tier

Since this is client-side only, you'll manually set tiers through the Firebase Console:

#### Using Firebase Console

1. **Go to Firebase Console** → **Firestore Database**
2. **Click on "users" collection**
3. **Find the user document** (search by email or UID)
4. **Click on the document** to open it
5. **Edit the `tier` field**:
   - Change value to `'free'`, `'pro'`, or `'deluxe'`
6. **Update the `messagesLimit` field** to match the tier:
   - Free: `20`
   - Pro: `100`
   - Deluxe: `-1` (unlimited)
7. **Click "Update"**

The user will see the change next time they refresh the page or sign in again.

---

## Part 4: Testing Your Implementation

### Test Checklist

1. **Test New User Signup**
   - [ ] Sign up with a test email
   - [ ] Check Firestore Console → `users` collection
   - [ ] Verify user document has `tier: 'free'`
   - [ ] Verify only 6 models appear in model selector

2. **Test Pro Tier**
   - [ ] Change user tier to `'pro'` in Firestore
   - [ ] Refresh the app
   - [ ] Verify more models available (but not premium 8)

3. **Test Deluxe Tier**
   - [ ] Change user tier to `'deluxe'`
   - [ ] Refresh the app
   - [ ] Verify all models are available

---

## Part 5: Optional Enhancements

### Display Tier Badge

Add a tier badge to show the current user's tier in the UI (already included in the ModelSelector code above).

### Show Usage Stats

Create a component to display usage information:

```typescript
// src/components/UsageStats.tsx
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'

export function UsageStats() {
  const { userData } = useAuth()
  
  if (!userData) return null
  
  const { messagesUsed, messagesLimit, tier } = userData
  const isUnlimited = messagesLimit === -1
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Your Plan</span>
        <Badge>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {isUnlimited ? 'Unlimited messages' : `${messagesUsed} / ${messagesLimit} messages used`}
      </p>
    </div>
  )
}
```

---

## Troubleshooting

### "Permission denied" when creating user document
- Check Firestore security rules allow `create` for authenticated users
- Verify user is signed in when document is created

### User tier not updating
- Refresh the page after changing tier in Console
- Check browser console for errors
- Sign out and sign back in

### Models not filtering correctly
- Check `allowedModels` array in tier documents
- Verify model IDs match exactly (case-sensitive)
- Check browser console for errors

---

## Security Considerations

### Important Notes

1. **Tier validation is client-side only** - Users could theoretically bypass restrictions by modifying client code
   - For production, validate tiers on a backend/API
   - For MVP/small projects, client-side is acceptable

2. **Firestore rules prevent tier tampering** - Users cannot change their own tier (rules block `update` and `delete`)

3. **For production, you should**:
   - Add a payment processor (Stripe, PayPal)
   - Create webhook to auto-update tiers on payment
   - Add backend API for tier validation
   - Implement proper usage tracking

---

## Summary

You now have:
- ✅ Three-tier system (Free, Pro, Deluxe)
- ✅ Firestore-based tier management
- ✅ Model access restrictions per tier
- ✅ Automatic tier initialization on signup
- ✅ Manual tier management via Firebase Console
- ✅ Client-side tier enforcement
- ✅ **No server-side code required**

Next steps:
- Test with real users
- Add payment integration when ready
- Implement usage tracking
- Create tier upgrade UI
