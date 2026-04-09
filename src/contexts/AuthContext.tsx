import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';
import { analytics } from '../lib/analytics';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      const token = await user.getIdToken(true);
      localStorage.setItem('authToken', token);
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
      return null;
    }
  }, [user]);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      const token = await user.getIdToken();
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decodedToken.exp - currentTime;
      if (timeUntilExpiry < 300) {
        return await refreshToken();
      }
      localStorage.setItem('authToken', token);
      return token;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return await refreshToken();
    }
  }, [user, refreshToken]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Lazily load Firebase Auth — this defers the 447KB Firebase bundle
    getFirebaseAuth().then(({ auth }) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser);
          if (firebaseUser) {
            try {
              const token = await firebaseUser.getIdToken();
              localStorage.setItem('authToken', token);
            } catch (error) {
              console.error('Error getting initial token:', error);
            }
          } else {
            localStorage.removeItem('authToken');
          }
          setLoading(false);
        });
      });
    });

    return () => unsubscribe?.();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { auth, googleProvider } = await getFirebaseAuth();
      const { signInWithPopup } = await import('firebase/auth');
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      localStorage.setItem('authToken', idToken);
      analytics.identifyUser(result.user.uid, result.user.email ?? undefined);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const { auth } = await getFirebaseAuth();
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
    refreshToken,
    getValidToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
