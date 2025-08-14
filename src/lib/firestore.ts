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

// Add waitlist entry via production API
export const addWaitlistEntry = async (data: Omit<WaitlistEntry, 'timestamp'>): Promise<DocumentReference> => {
  try {
    // Use production Firebase Cloud Functions API
    const response = await fetch('https://us-central1-nurture-466617.cloudfunctions.net/api/waitlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Waitlist entry added with ID: ', result.data.id);
      return { id: result.data.id } as DocumentReference;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add waitlist entry');
    }
  } catch (error) {
    console.error('Error adding waitlist entry: ', error);
    throw error;
  }
};

// Add feedback entry via production API
export const addFeedbackEntry = async (data: Omit<FeedbackEntry, 'timestamp'>): Promise<DocumentReference> => {
  try {
    // Use production Firebase Cloud Functions API
    const response = await fetch('https://us-central1-nurture-466617.cloudfunctions.net/api/feedback/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Feedback entry added with ID: ', result.data.id);
      return { id: result.data.id } as DocumentReference;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add feedback entry');
    }
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

// Get waitlist entries from production API
export const getWaitlistEntries = async (limit?: number): Promise<WaitlistEntry[]> => {
  try {
    const url = limit 
      ? `https://us-central1-nurture-466617.cloudfunctions.net/api/waitlist/entries?limit=${limit}`
      : 'https://us-central1-nurture-466617.cloudfunctions.net/api/waitlist/entries';
    
    const response = await fetch(url);
    
    if (response.ok) {
      const result = await response.json();
      return result.data || [];
    } else {
      throw new Error('Failed to fetch waitlist entries');
    }
  } catch (error) {
    console.error('Error fetching waitlist entries: ', error);
    throw error;
  }
};

// Get waitlist count from production API
export const getWaitlistCount = async (): Promise<number> => {
  try {
    const response = await fetch('https://us-central1-nurture-466617.cloudfunctions.net/api/waitlist/count');
    
    if (response.ok) {
      const result = await response.json();
      return result.data.count || 0;
    } else {
      throw new Error('Failed to fetch waitlist count');
    }
  } catch (error) {
    console.error('Error fetching waitlist count: ', error);
    throw error;
  }
};

// Get feedback entries from production API
export const getFeedbackEntries = async (limit?: number): Promise<FeedbackEntry[]> => {
  try {
    const url = limit 
      ? `https://us-central1-nurture-466617.cloudfunctions.net/api/feedback/entries?limit=${limit}`
      : 'https://us-central1-nurture-466617.cloudfunctions.net/api/feedback/entries';
    
    const response = await fetch(url);
    
    if (response.ok) {
      const result = await response.json();
      return result.data || [];
    } else {
      throw new Error('Failed to fetch feedback entries');
    }
  } catch (error) {
    console.error('Error fetching feedback entries: ', error);
    throw error;
  }
};

// Get feedback count from production API
export const getFeedbackCount = async (): Promise<number> => {
  try {
    const response = await fetch('https://us-central1-nurture-466617.cloudfunctions.net/api/feedback/count');
    
    if (response.ok) {
      const result = await response.json();
      return result.data.count || 0;
    } else {
      throw new Error('Failed to fetch feedback count');
    }
  } catch (error) {
    console.error('Error fetching feedback count: ', error);
    throw error;
  }
}; 