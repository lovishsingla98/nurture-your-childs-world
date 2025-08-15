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
    const { apiClient } = await import('./api');
    const result = await apiClient.addWaitlistEntry(data);
    console.log('Waitlist entry added with ID: ', result.data?.id);
    return { id: result.data?.id || '' } as DocumentReference;
  } catch (error) {
    console.error('Error adding waitlist entry: ', error);
    throw error;
  }
};

// Add feedback entry via production API
export const addFeedbackEntry = async (data: Omit<FeedbackEntry, 'timestamp'>): Promise<DocumentReference> => {
  try {
    const { apiClient } = await import('./api');
    const result = await apiClient.addFeedbackEntry(data);
    console.log('Feedback entry added with ID: ', result.data?.id);
    return { id: result.data?.id || '' } as DocumentReference;
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
    const { apiClient } = await import('./api');
    const result = await apiClient.getWaitlistEntries(limit);
    return result.data || [];
  } catch (error) {
    console.error('Error fetching waitlist entries: ', error);
    throw error;
  }
};

// Get waitlist count from production API
export const getWaitlistCount = async (): Promise<number> => {
  try {
    const { apiClient } = await import('./api');
    const result = await apiClient.getWaitlistCount();
    return result.data?.count || 0;
  } catch (error) {
    console.error('Error fetching waitlist count: ', error);
    throw error;
  }
};

// Get feedback entries from production API
export const getFeedbackEntries = async (limit?: number): Promise<FeedbackEntry[]> => {
  try {
    const { apiClient } = await import('./api');
    const result = await apiClient.getFeedbackEntries(limit);
    return result.data || [];
  } catch (error) {
    console.error('Error fetching feedback entries: ', error);
    throw error;
  }
};

// Get feedback count from production API
export const getFeedbackCount = async (): Promise<number> => {
  try {
    const { apiClient } = await import('./api');
    const result = await apiClient.getFeedbackCount();
    return result.data?.count || 0;
  } catch (error) {
    console.error('Error fetching feedback count: ', error);
    throw error;
  }
}; 