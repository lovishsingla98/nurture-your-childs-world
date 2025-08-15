import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  getIdToken
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

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

  // Function to refresh the user's ID token
  const refreshToken = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const token = await user.getIdToken(true); // Force refresh
      localStorage.setItem('authToken', token);
      console.log('Token refreshed successfully');
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If token refresh fails, user might need to re-authenticate
      await logout();
      return null;
    }
  };

  // Function to get a valid token (refresh if needed)
  const getValidToken = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Get current token and check if it's about to expire (within 5 minutes)
      const token = await user.getIdToken();
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decodedToken.exp - currentTime;
      
      // If token expires within 5 minutes, refresh it
      if (timeUntilExpiry < 300) {
        console.log('Token expiring soon, refreshing...');
        return await refreshToken();
      }
      
      localStorage.setItem('authToken', token);
      return token;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return await refreshToken();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // When user is authenticated, get a fresh token
        try {
          const token = await user.getIdToken();
          localStorage.setItem('authToken', token);
          console.log('User authenticated, token stored');
        } catch (error) {
          console.error('Error getting initial token:', error);
        }
      } else {
        // When user is not authenticated, clear the token
        localStorage.removeItem('authToken');
        console.log('User not authenticated, token cleared');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the user's ID token for backend authentication
      const idToken = await result.user.getIdToken();
      
      // Store the token in localStorage for API calls
      localStorage.setItem('authToken', idToken);
      
      console.log('Successfully signed in with Google:', result.user.email);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      localStorage.removeItem('authToken');
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
