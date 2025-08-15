import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginButton } from './LoginButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome to Nurture</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Sign in with your Google account to access personalized parenting insights and track your child's development.
          </p>
        </div>
        
        <div className="space-y-4">
          <LoginButton size="lg" className="w-full max-w-sm">
            Continue with Google
          </LoginButton>
          
          <p className="text-sm text-muted-foreground text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
