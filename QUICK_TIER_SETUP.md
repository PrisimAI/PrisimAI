# Quick Tier Setup Reference (Client-Side Only)

This is a condensed guide for setting up Firebase tiers **without any server-side code**. For detailed explanations, see [FIREBASE_TIERS_SETUP.md](./FIREBASE_TIERS_SETUP.md).

## Quick Start Checklist

- [ ] Enable Firestore database
- [ ] Create tier configuration documents
- [ ] Set Firestore security rules
- [ ] Add Firestore to firebase.ts
- [ ] Create tiers.ts utility file
- [ ] Update AuthContext with tier support
- [ ] Update ModelSelector to filter by tier
- [ ] Test with a new user

---

## 1. Enable Firestore

**Firebase Console** → **Firestore Database** → **Create database** → **Production mode** → **Enable**

---

## 2. Create Tier Documents

In Firestore Console, create collection `tiers` with three documents:

### Document ID: `free`
```
name (string): "free"
displayName (string): "Free"
allowedModels (array): ["mistral-fast", "mistral", "gemini", "gemini-search", "openai", "openai-fast"]
messagesPerDay (number): 20
requestsPerMinute (number): 3
features (map):
  - imageGeneration (boolean): false
  - advancedModels (boolean): false
  - prioritySupport (boolean): false
```

### Document ID: `pro`
```
name (string): "pro"
displayName (string): "Pro"
allowedModels (array): ["mistral-fast", "mistral", "gemini", "gemini-search", "openai", "openai-fast", "llama", "claude", "gpt4"]
messagesPerDay (number): 100
requestsPerMinute (number): 10
features (map):
  - imageGeneration (boolean): true
  - advancedModels (boolean): true
  - prioritySupport (boolean): false
```

**Pro tier EXCLUDES**: openai-large, midijourney, claude-large, openai-reasoning, deepseek, perplexity-reasoning, gemini-large, openai-audio

### Document ID: `deluxe`
```
name (string): "deluxe"
displayName (string): "Deluxe"
allowedModels (array): ["*"]
messagesPerDay (number): -1
requestsPerMinute (number): -1
features (map):
  - imageGeneration (boolean): true
  - advancedModels (boolean): true
  - prioritySupport (boolean): true
  - customModels (boolean): true
```

---

## 3. Set Firestore Security Rules

**Firestore Console** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if false;
      allow delete: if false;
    }
    
    match /tiers/{tierName} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

Click **"Publish"**

---

## 4. Update firebase.ts

Add Firestore to `/src/lib/firebase.ts`:

```typescript
import { getFirestore } from 'firebase/firestore'

// ... existing config ...

export const db = getFirestore(app)  // Add this line
```

---

## 5. Create tiers.ts

Create `/src/lib/tiers.ts`:

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

const tierConfigCache: Map<UserTier, TierConfig> = new Map()

export async function getTierConfig(tier: UserTier): Promise<TierConfig> {
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

  return getDefaultTierConfig(tier)
}

function getDefaultTierConfig(tier: UserTier): TierConfig {
  const configs: Record<UserTier, TierConfig> = {
    free: {
      name: 'free',
      displayName: 'Free',
      allowedModels: ['mistral-fast', 'mistral', 'gemini', 'gemini-search', 'openai', 'openai-fast'],
      messagesPerDay: 20,
      requestsPerMinute: 3,
      features: { imageGeneration: false, advancedModels: false, prioritySupport: false }
    },
    pro: {
      name: 'pro',
      displayName: 'Pro',
      allowedModels: ['mistral-fast', 'mistral', 'gemini', 'gemini-search', 'openai', 'openai-fast', 'llama', 'claude', 'gpt4'],
      messagesPerDay: 100,
      requestsPerMinute: 10,
      features: { imageGeneration: true, advancedModels: true, prioritySupport: false }
    },
    deluxe: {
      name: 'deluxe',
      displayName: 'Deluxe',
      allowedModels: ['*'],
      messagesPerDay: -1,
      requestsPerMinute: -1,
      features: { imageGeneration: true, advancedModels: true, prioritySupport: true, customModels: true }
    }
  }
  return configs[tier]
}

export function isModelAllowed(modelId: string, tierConfig: TierConfig): boolean {
  if (tierConfig.allowedModels.includes('*')) return true
  return tierConfig.allowedModels.includes(modelId)
}

export function canSendMessage(messagesUsed: number, messagesLimit: number): boolean {
  if (messagesLimit === -1) return true
  return messagesUsed < messagesLimit
}

export async function initializeUserTier(userId: string, email: string): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', userId), {
        tier: 'free',
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messagesUsed: 0,
        messagesLimit: 20,
        lastResetDate: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error initializing user tier:', error)
  }
}

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) return userDoc.data() as UserData
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
  return null
}
```

---

## 6. Update AuthContext.tsx

Add tier support to `/src/contexts/AuthContext.tsx`:

```typescript
import { getUserData, initializeUserTier, type UserData } from '../lib/tiers'

// Add to interface:
userData: UserData | null
refreshUserData: () => Promise<void>

// Add state:
const [userData, setUserData] = useState<UserData | null>(null)

// Add function:
const fetchUserData = async (user: User) => {
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
}

const refreshUserData = async () => {
  if (user) await fetchUserData(user)
}

// Update onAuthStateChanged:
onAuthStateChanged(auth, async (user) => {
  setUser(user)
  if (user) {
    await fetchUserData(user)
  } else {
    setUserData(null)
  }
  setLoading(false)
})

// Add to provider value:
userData, refreshUserData
```

---

## 7. Update ModelSelector.tsx

Filter models based on user tier in `/src/components/ModelSelector.tsx`:

```typescript
import { getTierConfig, isModelAllowed } from '@/lib/tiers'
import { useAuth } from '@/contexts/AuthContext'

// Add inside component:
const { userData } = useAuth()
const [tierConfig, setTierConfig] = useState<any>(null)

// Load tier config:
useEffect(() => {
  async function loadTierConfig() {
    if (userData?.tier) {
      const config = await getTierConfig(userData.tier)
      setTierConfig(config)
    }
  }
  loadTierConfig()
}, [userData?.tier])

// Filter models:
const displayModels = Array.isArray(models) ? models.slice(0, 19) : []

const filteredModels = displayModels.filter(model => {
  if (!tierConfig) return true
  const modelId = (model as any).id || (model as any).name
  return isModelAllowed(modelId, tierConfig)
})

// Use filteredModels in render instead of displayModels
```

---

## 8. Manually Set User Tiers

**Firebase Console** → **Firestore** → **users** collection → Select user → Edit `tier` field:

| Tier | Set tier to | Set messagesLimit to |
|------|-------------|---------------------|
| Free | `'free'` | `20` |
| Pro | `'pro'` | `100` |
| Deluxe | `'deluxe'` | `-1` |

User will see changes after refreshing the app.

---

## Model Restrictions Reference

### Free Tier - Only These 6:
- mistral-fast ✓
- mistral ✓
- gemini ✓
- gemini-search ✓
- openai ✓
- openai-fast ✓

### Pro Tier - All Except These 8:
- openai-large ❌
- midijourney ❌
- claude-large ❌
- openai-reasoning ❌
- deepseek ❌
- perplexity-reasoning ❌
- gemini-large ❌
- openai-audio ❌

### Deluxe Tier:
- All models ✓ (unlimited)

---

## Testing

1. [ ] Sign up new user → Check Firestore for user document with `tier: 'free'`
2. [ ] Verify only 6 models show in selector
3. [ ] Change tier to `'pro'` in Firestore → Refresh app → More models available
4. [ ] Change tier to `'deluxe'` → Refresh → All models available

---

## Key Points

- ✅ **No server-side code needed** - Everything runs in the browser
- ✅ **Users get 'free' tier by default** when they sign up
- ✅ **Tier changes via Firebase Console** - Manual for now
- ✅ **Firestore rules prevent cheating** - Users can't change their own tier
- ⚠️ **Client-side validation only** - For production, add backend validation

---

For complete implementation details, see [FIREBASE_TIERS_SETUP.md](./FIREBASE_TIERS_SETUP.md)
