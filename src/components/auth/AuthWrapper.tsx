import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginButton } from './LoginButton';
import { UserProfile } from './UserProfile';

interface AuthWrapperProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ 
  children, 
  requireAuth = false,
  fallback 
}) => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If authentication is required and user is not logged in
  if (requireAuth && !user) {
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h2 className="text-xl font-semibold">Sign in Required</h2>
        <p className="text-muted-foreground text-center">
          Please sign in to access this feature.
        </p>
        <LoginButton />
      </div>
    );
  }

  // If user is logged in and we don't want to show content for authenticated users
  if (user && !requireAuth && !children) {
    return null;
  }

  return <>{children}</>;
};

// Component for showing login/logout buttons
export const AuthButtons: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <UserProfile />;
  }

  return <LoginButton variant="outline" size="sm" />;
};
