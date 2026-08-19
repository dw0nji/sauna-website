import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

let adminSignIn: Promise<unknown> | null = null

/**
 * Server-only. Firestore rules only allow writes from an admin uid, so API
 * routes sign in as the admin before writing. The promise is cached so
 * concurrent requests share one sign-in, and cleared on failure so the next
 * request retries rather than reusing a rejected promise.
 */
async function signInAsAdmin(): Promise<void> {
  if (auth.currentUser) return

  if (!adminSignIn) {
    adminSignIn = signInWithEmailAndPassword(
      auth,
      process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
      process.env.ADMIN_PASSWORD!
    ).catch((err) => {
      adminSignIn = null
      throw err
    })
  }

  await adminSignIn
}

export { db, auth, signInAsAdmin }
