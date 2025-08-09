import { collection, addDoc, serverTimestamp, DocumentReference } from 'firebase/firestore';
import { db } from './firebase';

export interface WaitlistEntry {
  name: string;
  email: string;
  age: string;
  interests: string;
  timestamp?: any; // Firestore Timestamp
}

export interface FeedbackEntry {
  name: string;
  email: string;
  message: string;
  timestamp?: any; // Firestore Timestamp
}

// Add waitlist entry to Firestore
export const addWaitlistEntry = async (data: Omit<WaitlistEntry, 'timestamp'>): Promise<DocumentReference> => {
  try {
    const docRef = await addDoc(collection(db, 'waitlist'), {
      ...data,
      timestamp: serverTimestamp()
    });
    console.log('Waitlist entry added with ID: ', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error adding waitlist entry: ', error);
    throw error;
  }
};

// Add feedback entry to Firestore
export const addFeedbackEntry = async (data: Omit<FeedbackEntry, 'timestamp'>): Promise<DocumentReference> => {
  try {
    const docRef = await addDoc(collection(db, 'feedback'), {
      ...data,
      timestamp: serverTimestamp()
    });
    console.log('Feedback entry added with ID: ', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error adding feedback entry: ', error);
    throw error;
  }
};

// Fallback to localStorage if Firestore fails
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ ...data, ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}; 