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
