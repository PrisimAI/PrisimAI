import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'

// Firebase configuration
// REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE CREDENTIALS
// Get these values from your Firebase console: https://console.firebase.google.com
// Go to Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU5oNtSXp8VZYn_ow1cChrWPgXg9ccfyA",
  authDomain: "prisimai-9a06c.firebaseapp.com",
  projectId: "prisimai-9a06c",
  storageBucket: "prisimai-9a06c.firebasestorage.app",
  messagingSenderId: "172096388736",
  appId: "1:172096388736:web:8a74d6fe13d4ff17c03065",
  measurementId: "G-0BP67760MX"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize auth providers
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

export default app
