# Quick Tier Setup Reference

This is a condensed guide for setting up Firebase tiers. For detailed explanations, see [FIREBASE_TIERS_SETUP.md](./FIREBASE_TIERS_SETUP.md).

## Quick Start Checklist

- [ ] Set up Firestore database
- [ ] Deploy Cloud Functions for tier management
- [ ] Update security rules
- [ ] Add Firestore to firebase.ts
- [ ] Update AuthContext with tier support
- [ ] Create tier utilities
- [ ] Update ModelSelector to filter by tier

---

## 1. Enable Firestore

**Firebase Console** → **Firestore Database** → **Create database** → **Production mode**

---

## 2. Create Tier Documents

In Firestore Console, create collection `tiers` with three documents:

### Document: `free`
```json
{
  "name": "free",
  "displayName": "Free",
  "allowedModels": [
    "mistral-fast",
    "mistral",
    "gemini",
    "gemini-search",
    "openai",
    "openai-fast"
  ],
  "messagesPerDay": 20,
  "requestsPerMinute": 3,
  "features": {
    "imageGeneration": false,
    "advancedModels": false,
    "prioritySupport": false
  }
}
```

### Document: `pro`
```json
{
  "name": "pro",
  "displayName": "Pro",
  "allowedModels": [
    "mistral-fast",
    "mistral",
    "gemini",
    "gemini-search",
    "openai",
    "openai-fast",
    "llama",
    "claude",
    "gpt4"
  ],
  "messagesPerDay": 100,
  "requestsPerMinute": 10,
  "features": {
    "imageGeneration": true,
    "advancedModels": true,
    "prioritySupport": false
  }
}
```

### Document: `deluxe`
```json
{
  "name": "deluxe",
  "displayName": "Deluxe",
  "allowedModels": ["*"],
  "messagesPerDay": -1,
  "requestsPerMinute": -1,
  "features": {
    "imageGeneration": true,
    "advancedModels": true,
    "prioritySupport": true,
    "customModels": true
  }
}
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
      allow write: if false;
    }
    
    match /tiers/{tierName} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## 4. Add Custom Field in Firebase Authentication

You'll add a custom claim called `tier` to each user. This requires Firebase Cloud Functions.

### Initialize Firebase Functions:

```bash
npm install -g firebase-tools
firebase login
firebase init functions
cd functions
npm install firebase-admin
```

### Create Function (functions/index.js):

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Auto-assign 'free' tier to new users
exports.setDefaultTierOnSignup = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.auth().setCustomUserClaims(user.uid, { tier: 'free' });
    await admin.firestore().collection('users').doc(user.uid).set({
      tier: 'free',
      email: user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      messagesUsed: 0,
      messagesLimit: 20
    });
    console.log(`Set default tier 'free' for user: ${user.uid}`);
  } catch (error) {
    console.error('Error:', error);
  }
});

// Function to manually update user tier
exports.setUserTier = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { userId, tier } = data;
  const validTiers = ['free', 'pro', 'deluxe'];

  if (!validTiers.includes(tier)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid tier');
  }

  try {
    await admin.auth().setCustomUserClaims(userId, { tier });
    await admin.firestore().collection('users').doc(userId).set({
      tier,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, message: `User tier set to ${tier}` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Deploy:

```bash
firebase deploy --only functions
```

---

## 5. Update Client Code

### Add Firestore to firebase.ts:

```typescript
import { getFirestore } from 'firebase/firestore'

// ... existing config ...

export const db = getFirestore(app)
```

### Update AuthContext.tsx:

Add tier data fetching:

```typescript
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type UserTier = 'free' | 'pro' | 'deluxe'

interface UserData {
  tier: UserTier
  messagesUsed: number
  messagesLimit: number
}

// Add to AuthContextType:
userData: UserData | null

// In AuthProvider, fetch user data on auth:
const fetchUserData = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (userDoc.exists()) {
    const data = userDoc.data()
    setUserData({
      tier: data.tier || 'free',
      messagesUsed: data.messagesUsed || 0,
      messagesLimit: data.messagesLimit || 20
    })
  }
}
```

---

## 6. Manually Set User Tiers

### Option A: Firebase Console
1. **Firestore Database** → **users** collection
2. Click user document → Edit `tier` field

### Option B: Script

Create `set-tier.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function setTier(email, tier) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { tier });
  await admin.firestore().collection('users').doc(user.uid)
    .set({ tier, updatedAt: new Date() }, { merge: true });
  console.log(`✓ ${email} → ${tier}`);
}

setTier(process.argv[2], process.argv[3]).then(() => process.exit(0));
```

Run:
```bash
node set-tier.js user@example.com pro
```

---

## 7. Filter Models by Tier

In `ModelSelector.tsx`:

```typescript
import { useAuth } from '@/contexts/AuthContext'

const { userData } = useAuth()

// Filter models based on tier
const allowedModelIds = {
  free: ['mistral-fast', 'mistral', 'gemini', 'gemini-search', 'openai', 'openai-fast'],
  pro: ['mistral-fast', 'mistral', 'gemini', 'gemini-search', 'openai', 'openai-fast', 
        'llama', 'claude', 'gpt4'], // exclude premium models
  deluxe: ['*'] // all models
}

const userTier = userData?.tier || 'free'
const allowed = allowedModelIds[userTier]

const filteredModels = displayModels.filter(model => {
  const modelId = model.id || model.name
  return allowed.includes('*') || allowed.includes(modelId)
})
```

---

## Model Restrictions Reference

### Free Tier - Only These 6 Models:
- mistral-fast
- mistral
- gemini
- gemini-search
- openai
- openai-fast

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
- All models ✓

---

## Testing Checklist

1. [ ] Create test user - should get 'free' tier automatically
2. [ ] Verify Firestore document created in `users` collection
3. [ ] Change tier manually and test model filtering
4. [ ] Sign out and back in - tier should persist
5. [ ] Test each tier's model access

---

## Common Issues

**Custom claims not updating?**
- Sign out and back in, or force token refresh:
  ```typescript
  await user.getIdToken(true)
  ```

**Firestore permission denied?**
- Check security rules are deployed
- Verify user is authenticated

**Function not found?**
- Run `firebase deploy --only functions`
- Check function name matches in code

---

## File Locations Summary

| What | Where |
|------|-------|
| Add Firestore | `/src/lib/firebase.ts` |
| Add tier to auth | `/src/contexts/AuthContext.tsx` |
| Filter models | `/src/components/ModelSelector.tsx` |
| Cloud Functions | `/functions/index.js` |
| Firestore rules | Firebase Console → Firestore → Rules |
| Tier configs | Firebase Console → Firestore → `tiers` collection |

---

For detailed implementation with code examples, see [FIREBASE_TIERS_SETUP.md](./FIREBASE_TIERS_SETUP.md)
