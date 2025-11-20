# Firebase Setup Guide

This guide explains how to set up Firebase authentication for PrisimAI with **hardcoded credentials**.

## Prerequisites

You need a Firebase account and project. If you don't have one:
1. Go to [https://firebase.google.com](https://firebase.google.com)
2. Sign in with your Google account
3. Click **Go to console** in the top right
4. Create a new Firebase project

## Getting Your Firebase Credentials

### Step 1: Create a Firebase Project

1. **Go to the Firebase Console**: [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Click "Add project"** (or select an existing project)
3. **Enter a project name** (e.g., "PrisimAI")
4. **Optional**: Enable Google Analytics (recommended)
5. **Click "Create project"**

### Step 2: Register Your Web App

1. **In your Firebase project dashboard**, click the **web icon** (</>) to add a web app
2. **Enter an app nickname** (e.g., "PrisimAI Web")
3. **Optional**: Check "Also set up Firebase Hosting" if you want to deploy with Firebase
4. **Click "Register app"**
5. **Copy the Firebase configuration object** - you'll need these values to paste into your code

The configuration object looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 3: Get Your Credentials

You can find your Firebase configuration at any time:
1. **Go to Project Settings** (click the gear icon next to "Project Overview")
2. **Scroll down to "Your apps"**
3. **Select your web app**
4. **Copy the configuration values**

## Where to Put Your Credentials

### 📁 Location: `/src/lib/firebase.ts`

This is the **ONLY file** where you need to add your Firebase credentials.

**Open this file and replace the placeholder values** with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",                    // ← Replace this
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // ← Replace this
  projectId: "YOUR_PROJECT_ID",                    // ← Replace this
  storageBucket: "YOUR_PROJECT_ID.appspot.com",   // ← Replace this
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // ← Replace this
  appId: "YOUR_APP_ID",                            // ← Replace this
}
```

**Example with real values:**
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "prisim-ai-12345.firebaseapp.com",
  projectId: "prisim-ai-12345",
  storageBucket: "prisim-ai-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
}
```

### Step-by-Step Instructions:

1. **Open the file** `/src/lib/firebase.ts` in your code editor
2. **Find the `firebaseConfig` object** (around line 6)
3. **Replace each placeholder value** with your actual Firebase credentials:
   - Copy `apiKey` from Firebase Console → paste into `apiKey: "..."`
   - Copy `authDomain` → paste into `authDomain: "..."`
   - Copy `projectId` → paste into `projectId: "..."`
   - Copy `storageBucket` → paste into `storageBucket: "..."`
   - Copy `messagingSenderId` → paste into `messagingSenderId: "..."`
   - Copy `appId` → paste into `appId: "..."`
4. **Save the file**
5. **Restart your development server** if it's running

## Configuring Firebase Authentication

### Step 1: Enable Authentication

1. **In the Firebase Console**, go to **Build** → **Authentication**
2. **Click "Get started"**
3. **Go to the "Sign-in method" tab**

### Step 2: Enable Email/Password Authentication

1. **Click on "Email/Password"** in the Sign-in providers list
2. **Toggle "Enable"** to ON
3. **Optional**: Toggle "Email link (passwordless sign-in)" if you want magic link login
4. **Click "Save"**

### Step 3: Set Up GitHub OAuth (Optional)

To enable GitHub sign-in:

#### Part A: Create a GitHub OAuth App

1. **Go to GitHub Developer Settings**: [https://github.com/settings/developers](https://github.com/settings/developers)
2. **Click "OAuth Apps"** → **"New OAuth App"**
3. **Fill in the application details**:
   - **Application name**: PrisimAI (or your preferred name)
   - **Homepage URL**: `http://localhost:5173` (for development) or your production URL
   - **Authorization callback URL**: You'll get this from Firebase in the next step (temporarily use `http://localhost:5173`)
4. **Click "Register application"**
5. **Copy the "Client ID"**
6. **Click "Generate a new client secret"** and copy the **"Client Secret"**
7. **Keep this page open** - you'll need to update the callback URL

#### Part B: Configure GitHub Provider in Firebase

1. **In the Firebase Console**, go to **Authentication** → **Sign-in method**
2. **Click "Add new provider"** and select **GitHub**
3. **Toggle "Enable"** to ON
4. **Copy the "Callback URL"** shown (format: `https://your-project.firebaseapp.com/__/auth/handler`)
5. **Go back to your GitHub OAuth App settings** and update the **"Authorization callback URL"** with the Firebase callback URL
6. **Return to Firebase** and paste your GitHub **Client ID** and **Client Secret**
7. **Click "Save"**

#### Part C: Update GitHub OAuth App (Final Step)

1. **Go back to your GitHub OAuth App settings**
2. **Update the "Authorization callback URL"** with the Firebase callback URL from step B.4
3. **Click "Update application"**

**For Production:**
- Create a separate GitHub OAuth App for production
- Use your production URL as the Homepage URL (e.g., `https://yourdomain.com` or `https://yourname.github.io/PrisimAI/`)
- Use the same Firebase callback URL


### Step 4: Configure Authorized Domains

1. **In the Firebase Console**, go to **Authentication** → **Settings** → **Authorized domains**
2. **Add your domains**:
   - For local development: `localhost` (should already be there)
   - For production: Add your production domain (e.g., `yourdomain.com` or `yourname.github.io`)
3. **Click "Add domain"**


## Where Your Credentials Are Used

Your Firebase credentials that you paste into `/src/lib/firebase.ts` are used throughout the application:

- **Authentication**: The `auth` object exported from this file is used to sign users in/out
- **Auth Context**: The `/src/contexts/AuthContext.tsx` imports and uses the `auth` object
- **Components**: Various components use the auth context to check if users are logged in

**You only need to edit `/src/lib/firebase.ts`** - all other files will automatically use your credentials.



## Security Notes

⚠️ **Important Security Information**:

- **The `VITE_FIREBASE_API_KEY` is safe to expose in your frontend code** - it's not a secret
  - Firebase API keys are simply identifiers for your Firebase project
  - They work in conjunction with Firebase Security Rules to protect your data
  - Even though it's hardcoded in your source code, this is a standard practice for Firebase web apps
- **Always configure Firebase Security Rules** to protect your Firestore/Realtime Database
- **Never share or commit sensitive credentials** like service account keys (different from the API key)
- For backend operations, use Firebase Admin SDK with service account credentials (stored securely server-side)

### Why Hardcoded Credentials Are Safe

Firebase web credentials are **designed to be public**:
- The API key only identifies your Firebase project
- Firebase Security Rules control who can access what data
- The key works only with your authorized domains (configured in Firebase Console)
- Authentication is still secure - users must sign in to access protected resources

### Firebase Security Rules

Since the Firebase API key is public, you must use Firebase Security Rules to protect your data:

1. **Go to Firestore Database** or **Realtime Database** in Firebase Console
2. **Click on "Rules"**
3. **Set up appropriate security rules**

Example Firestore rules for authenticated users:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing Your Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser (usually `http://localhost:5173`)

3. **Try signing up** with a test email address

4. **Check the Firebase Console**:
   - Go to **Authentication** → **Users**
   - You should see the newly created user

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Double-check that you copied the correct API key from your Firebase console
- Make sure there are no extra spaces when pasting into `/src/lib/firebase.ts`
- Ensure the API key is wrapped in quotes: `apiKey: "YOUR_KEY_HERE"`
- Ensure the API key restriction settings in Google Cloud Console (if any) allow your domain
- Restart your development server after modifying the file

### Environment variables not loading
- **Not applicable** - this app uses hardcoded credentials, not environment variables
- If you see errors about missing environment variables, check that you've replaced all placeholder values in `/src/lib/firebase.ts`

### GitHub OAuth not working
- Verify the callback URL in your GitHub OAuth App matches the Firebase callback URL exactly
- Check that the Client ID and Client Secret are correct in Firebase settings
- Ensure your domain is added to Firebase's Authorized domains list
- Clear browser cache and try again

### "Firebase: Error (auth/popup-blocked)"
- The browser blocked the OAuth popup
- Allow popups for your site in browser settings
- Try using a different browser

### Users can sign up but can't access data
- This is a Firebase Security Rules issue, not an authentication issue
- Check your Firestore/Realtime Database security rules
- Make sure rules allow authenticated users to read/write their data

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Firebase Console](https://console.firebase.google.com)
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
