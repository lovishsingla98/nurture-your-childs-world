import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth, GoogleAuthProvider } from 'firebase/auth';
import type { FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'nurture-466617.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'nurture-466617',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'nurture-466617.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:demo'
};

// Lazy singletons — Firebase modules load on first use, not at page load
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _googleProvider: GoogleAuthProvider | null = null;
let _storage: FirebaseStorage | null = null;

export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (!_app) {
    const { initializeApp } = await import('firebase/app');
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

export async function getFirebaseDb(): Promise<Firestore> {
  if (!_db) {
    const app = await getFirebaseApp();
    const { getFirestore } = await import('firebase/firestore');
    _db = getFirestore(app);
  }
  return _db;
}

export async function getFirebaseAuth(): Promise<{ auth: Auth; googleProvider: GoogleAuthProvider }> {
  if (!_auth) {
    const app = await getFirebaseApp();
    const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
    _auth = getAuth(app);
    _googleProvider = new GoogleAuthProvider();
  }
  return { auth: _auth, googleProvider: _googleProvider! };
}

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
  if (!_storage) {
    const app = await getFirebaseApp();
    const { getStorage } = await import('firebase/storage');
    _storage = getStorage(app);
  }
  return _storage;
}
