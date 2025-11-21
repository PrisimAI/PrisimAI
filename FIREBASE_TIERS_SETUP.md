# Firebase User Tiers Setup Guide

This guide explains how to implement a three-tier subscription system (Free, Pro, and Deluxe) for PrisimAI using Firebase Authentication custom claims and Firestore.

## Overview

The tier system will control:
- **Model Access**: Which AI models users can use
- **Rate Limits**: Message limits and speed restrictions
- **Features**: Premium features available per tier

### Tier Breakdown

| Tier | Available Models | Chat Limits | Speed |
|------|-----------------|-------------|-------|
| **Free** | mistral-fast, mistral, gemini, gemini-search, openai, openai-fast | Lowest | Slowest |
| **Pro** | All models EXCEPT: openai-large, midijourney, claude-large, openai-reasoning, deepseek, perplexity-reasoning, gemini-large, openai-audio | Limited | Limited |
| **Deluxe** | ALL models | Unlimited | Unlimited |

## Implementation Methods

There are two approaches to implement user tiers in Firebase:

### Method 1: Custom Claims (Recommended)
Best for authentication-level checks and simple tier management.

### Method 2: Firestore Database
Best for complex tier features, usage tracking, and subscription management.

**Recommendation**: Use **both methods together** - Custom Claims for quick tier checks and Firestore for detailed tier data and usage tracking.

---

## Part 1: Adding Custom Claims to Firebase Authentication

Custom claims allow you to add tier information directly to the user's authentication token.

### Step 1: Set Up Firebase Admin SDK

You'll need Firebase Admin SDK to set custom claims. This must be done server-side.

#### Option A: Using Firebase Cloud Functions (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase Functions** in your project:
   ```bash
   cd /path/to/your/PrisimAI/project
   firebase init functions
   ```
   - Choose JavaScript or TypeScript (TypeScript recommended)
   - Choose to install dependencies

3. **Install Firebase Admin SDK** in the functions directory:
   ```bash
   cd functions
   npm install firebase-admin
   ```

4. **Create a function to set user tier** (`functions/index.js` or `functions/index.ts`):

   ```javascript
   const functions = require('firebase-functions');
   const admin = require('firebase-admin');
   admin.initializeApp();

   // Function to set user tier (callable from client)
   exports.setUserTier = functions.https.onCall(async (data, context) => {
     // Check if request is made by authenticated user
     if (!context.auth) {
       throw new functions.https.HttpsError(
         'unauthenticated',
         'User must be authenticated to set tier.'
       );
     }

     const { userId, tier } = data;
     const validTiers = ['free', 'pro', 'deluxe'];

     // Validate tier
     if (!validTiers.includes(tier)) {
       throw new functions.https.HttpsError(
         'invalid-argument',
         'Invalid tier specified. Must be: free, pro, or deluxe'
       );
     }

     // TODO: Add authorization check here
     // Only admins or payment webhook should be able to set tiers
     // For now, we'll allow any authenticated user (CHANGE THIS IN PRODUCTION)

     try {
       // Set custom claim
       await admin.auth().setCustomUserClaims(userId, { tier });

       // Also store in Firestore for easier querying
       await admin.firestore().collection('users').doc(userId).set({
         tier,
         updatedAt: admin.firestore.FieldValue.serverTimestamp()
       }, { merge: true });

       return { 
         success: true, 
         message: `User tier set to ${tier}` 
       };
     } catch (error) {
       throw new functions.https.HttpsError(
         'internal',
         'Failed to set user tier: ' + error.message
       );
     }
   });

   // Function to automatically set tier to 'free' when new user signs up
   exports.setDefaultTierOnSignup = functions.auth.user().onCreate(async (user) => {
     try {
       // Set default tier to 'free'
       await admin.auth().setCustomUserClaims(user.uid, { tier: 'free' });

       // Also create Firestore document
       await admin.firestore().collection('users').doc(user.uid).set({
         tier: 'free',
         email: user.email,
         createdAt: admin.firestore.FieldValue.serverTimestamp(),
         messagesUsed: 0,
         messagesLimit: 20, // Free tier limit
         lastResetDate: admin.firestore.FieldValue.serverTimestamp()
       });

       console.log(`Set default tier 'free' for new user: ${user.uid}`);
     } catch (error) {
       console.error('Error setting default tier:', error);
     }
   });

   // Function to get user tier (callable from client)
   exports.getUserTier = functions.https.onCall(async (data, context) => {
     if (!context.auth) {
       throw new functions.https.HttpsError(
         'unauthenticated',
         'User must be authenticated.'
       );
     }

     try {
       const userRecord = await admin.auth().getUser(context.auth.uid);
       const tier = userRecord.customClaims?.tier || 'free';
       
       return { tier: tier };
     } catch (error) {
       throw new functions.https.HttpsError(
         'internal',
         'Failed to get user tier: ' + error.message
       );
     }
   });
   ```

5. **Deploy the functions**:
   ```bash
   firebase deploy --only functions
   ```

#### Option B: Using Node.js Backend

If you have a separate backend server:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setUserTier(userId, tier) {
  await admin.auth().setCustomUserClaims(userId, { tier: tier });
  console.log(`User ${userId} tier set to ${tier}`);
}

// Usage
setUserTier('user-uid-here', 'pro');
```

---

## Part 2: Setting Up Firestore for Tier Management

### Step 1: Create Firestore Database

1. **Go to Firebase Console** → **Firestore Database**
2. **Click "Create database"**
3. **Choose "Start in production mode"** (we'll set custom rules)
4. **Select a location** and click "Enable"

### Step 2: Define Firestore Structure

Create the following collections:

#### Users Collection (`users/{userId}`)

```javascript
{
  tier: 'free',                    // 'free', 'pro', or 'deluxe'
  email: 'user@example.com',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Usage tracking
  messagesUsed: 0,                 // Messages used in current period
  messagesLimit: 20,               // Message limit based on tier
  lastResetDate: Timestamp,        // When usage counter was last reset
  
  // Speed limiting
  requestsInLastMinute: 0,
  lastRequestTime: Timestamp
}
```

#### Tiers Collection (`tiers/{tierName}`)

Create this collection to define tier configurations:

```javascript
// Document: tiers/free
{
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
}

// Document: tiers/pro
{
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
    // NOTE: Pro tier excludes these premium models:
    // 'openai-large', 'midijourney', 'claude-large', 'openai-reasoning',
    // 'deepseek', 'perplexity-reasoning', 'gemini-large', 'openai-audio'
  ],
  messagesPerDay: 100,
  requestsPerMinute: 10,
  features: {
    imageGeneration: true,
    advancedModels: true,
    prioritySupport: false
  }
}

// Document: tiers/deluxe
{
  name: 'deluxe',
  displayName: 'Deluxe',
  allowedModels: ['*'],  // All models
  messagesPerDay: -1,    // Unlimited (-1)
  requestsPerMinute: -1, // Unlimited (-1)
  features: {
    imageGeneration: true,
    advancedModels: true,
    prioritySupport: true,
    customModels: true
  }
}
```

### Step 3: Set Firestore Security Rules

Update your Firestore security rules to protect tier data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own tier data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Anyone can read tier configurations
    match /tiers/{tierName} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins via Cloud Functions
    }
  }
}
```

---

## Part 3: Client-Side Implementation

### Step 1: Update AuthContext to Include Tier

Modify `/src/contexts/AuthContext.tsx`:

```typescript
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
import { doc, getDoc } from 'firebase/firestore'
import { auth, googleProvider, githubProvider, db } from '../lib/firebase'

export type UserTier = 'free' | 'pro' | 'deluxe'

interface AuthError {
  message: string
  code?: string
}

interface UserData {
  tier: UserTier
  messagesUsed: number
  messagesLimit: number
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserData({
          tier: data.tier || 'free',
          messagesUsed: data.messagesUsed || 0,
          messagesLimit: data.messagesLimit || 20
        })
      } else {
        // Default to free tier if no Firestore document
        setUserData({
          tier: 'free',
          messagesUsed: 0,
          messagesLimit: 20
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserData({
        tier: 'free',
        messagesUsed: 0,
        messagesLimit: 20
      })
    }
  }

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await fetchUserData(user.uid)
      } else {
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ... rest of the auth methods remain the same ...

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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Step 2: Update Firebase Config

Modify `/src/lib/firebase.ts` to include Firestore:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your existing firebase config...
const firebaseConfig = {
  // ... your config
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)  // Add this line

export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

export default app
```

### Step 3: Create Tier Utilities

Create a new file `/src/lib/tiers.ts`:

```typescript
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { UserTier } from '@/contexts/AuthContext'

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

// Cache for tier configs
const tierConfigCache: Map<UserTier, TierConfig> = new Map()

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

export function isModelAllowed(modelId: string, tier: UserTier, tierConfig: TierConfig): boolean {
  // Deluxe has access to all models
  if (tierConfig.allowedModels.includes('*')) {
    return true
  }

  // Check if model is in allowed list
  return tierConfig.allowedModels.includes(modelId)
}

export function canSendMessage(messagesUsed: number, messagesLimit: number): boolean {
  // Unlimited (-1) means always allowed
  if (messagesLimit === -1) {
    return true
  }

  return messagesUsed < messagesLimit
}
```

### Step 4: Update ModelSelector to Respect Tiers

Modify `/src/components/ModelSelector.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getTierConfig, isModelAllowed } from '@/lib/tiers'
// ... other imports ...

export function ModelSelector({ mode, selectedModel, onModelChange }: ModelSelectorProps) {
  const { userData } = useAuth()
  const [textModels, setTextModels] = useState<TextModel[]>([])
  const [allowedModels, setAllowedModels] = useState<Set<string>>(new Set())
  // ... other state ...

  useEffect(() => {
    async function loadTierConfig() {
      if (userData?.tier) {
        const config = await getTierConfig(userData.tier)
        setAllowedModels(new Set(config.allowedModels))
      }
    }
    loadTierConfig()
  }, [userData?.tier])

  // ... existing loadModels code ...

  // Filter models based on tier
  const filteredModels = displayModels.filter(model => {
    const modelId = (model as any).id || (model as any).name
    return allowedModels.has('*') || allowedModels.has(modelId)
  })

  return (
    // ... render with filteredModels instead of displayModels
  )
}
```

---

## Part 4: Manual Tier Management (Admin Panel)

Since you'll need to manually set tiers initially, here are options:

### Option 1: Using Firebase Console

1. **Go to Firebase Console** → **Firestore Database**
2. **Click on "users" collection**
3. **Select a user document**
4. **Edit the `tier` field** to `'free'`, `'pro'`, or `'deluxe'`

### Option 2: Using Firebase CLI

Create a script `scripts/set-user-tier.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setUserTier(email, tier) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { tier });
    await admin.firestore().collection('users').doc(user.uid).set({
      tier,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`✓ Set ${email} to ${tier} tier`);
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
}

// Usage
const email = process.argv[2];
const tier = process.argv[3];

if (!email || !tier) {
  console.log('Usage: node set-user-tier.js <email> <tier>');
  console.log('Example: node set-user-tier.js user@example.com pro');
  process.exit(1);
}

setUserTier(email, tier).then(() => process.exit(0));
```

Run it:
```bash
node scripts/set-user-tier.js user@example.com pro
```

### Option 3: Simple Admin Component

Create a simple admin component in your app (secure this properly in production):

```typescript
// src/components/AdminPanel.tsx
import { useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'

export function AdminPanel() {
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<'free' | 'pro' | 'deluxe'>('free')
  const [loading, setLoading] = useState(false)

  const handleSetTier = async () => {
    setLoading(true)
    try {
      const functions = getFunctions()
      const setUserTier = httpsCallable(functions, 'setUserTier')
      await setUserTier({ email, tier })
      alert(`Successfully set ${email} to ${tier} tier`)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2>Admin: Set User Tier</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
      />
      <select value={tier} onChange={(e) => setTier(e.target.value as any)}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="deluxe">Deluxe</option>
      </select>
      <button onClick={handleSetTier} disabled={loading}>
        Set Tier
      </button>
    </div>
  )
}
```

---

## Part 5: Testing Your Implementation

### Step 1: Create Test Users

1. Sign up with a test email
2. Check Firebase Console → Authentication → Users
3. Verify the user has tier 'free' by default

### Step 2: Test Tier Changes

1. Use one of the methods above to change a user's tier
2. Sign out and sign back in
3. Check that the tier is reflected in the UI
4. Verify model restrictions work correctly

### Step 3: Test Each Tier

Create test accounts for each tier and verify:

- **Free**: Can only select the 6 allowed models
- **Pro**: Can select most models but not premium ones
- **Deluxe**: Can select all models

---

## Part 6: Next Steps

After basic tier implementation:

1. **Add Payment Integration**
   - Integrate Stripe or similar payment provider
   - Create webhook to automatically upgrade tiers on payment

2. **Add Usage Tracking**
   - Track messages sent per day
   - Implement rate limiting based on tier
   - Show usage stats in user profile

3. **Add Tier Upgrade UI**
   - Create pricing page
   - Add upgrade prompts when users hit limits
   - Show tier comparison

4. **Add Admin Dashboard**
   - View all users and their tiers
   - Manual tier management
   - Usage analytics

---

## Troubleshooting

### "Custom claims not showing immediately"
- Custom claims are added to the token on next sign-in
- Force user to sign out and sign in again, or refresh the token:
  ```typescript
  await user.getIdToken(true) // Force refresh
  ```

### "Firestore permission denied"
- Check your security rules
- Make sure user is authenticated
- Verify the document path is correct

### "Cloud Function not found"
- Make sure you deployed the functions: `firebase deploy --only functions`
- Check function name matches in client code
- Verify Firebase project is selected: `firebase use <project-id>`

---

## Security Considerations

1. **Never trust client-side tier checks alone**
   - Always verify tier on the backend/Cloud Functions
   - Firestore rules should enforce tier restrictions

2. **Protect tier-setting functions**
   - Only admins or payment webhooks should set tiers
   - Implement proper authorization checks

3. **Rate limiting**
   - Implement server-side rate limiting
   - Don't rely solely on client-side checks

4. **Audit logs**
   - Log all tier changes
   - Track who made changes and when

---

## Summary

This implementation gives you:
- ✅ Three-tier system (Free, Pro, Deluxe)
- ✅ Model access restrictions per tier
- ✅ Automatic tier assignment on signup
- ✅ Easy tier management
- ✅ Usage tracking foundation
- ✅ Scalable architecture for future features

Remember to secure your Cloud Functions and Firestore rules before deploying to production!
