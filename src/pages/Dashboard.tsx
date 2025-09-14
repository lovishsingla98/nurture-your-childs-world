import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChildForm from '@/components/forms/ChildForm';
import DashboardHeader from '@/components/site/DashboardHeader';
import {
  Plus,
  Settings,
  Loader2,
  User
} from 'lucide-react';

interface ParentProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  isOnboarded: boolean;
  children: Child[];
  createdAt: string;
  updatedAt: string;
}

interface Child {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  dateOfBirth: { seconds: number; nanoseconds: number }; // Firestore Timestamp
  parentId: string;
  imageURL?: string; // Optional image URL for child profile
  isOnboarded?: boolean; // Whether the child has completed onboarding
}

const Dashboard: React.FC = () => {
  const { user, getValidToken } = useAuth();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure we have a valid token before making the request
      await getValidToken();

      const response = await apiClient.getUserProfile();
      console.log('Profile response:', response);
      console.log('Children data:', response.data?.children);
      if (response.success && response.data) {
        setProfile(response.data);
        console.log('Profile set successfully:', response.data);
      } else {
        setError('Failed to load profile data');
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);

      // Handle specific authentication errors
      if (error.message?.includes('Authentication required') || error.message?.includes('token')) {
        setError('Your session has expired. Please sign in again.');
        toast.error('Session expired. Please sign in again.');
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(error.message || 'Failed to load your profile');
        toast.error('Failed to load your profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = async () => {
      console.log('Token expired event received, refreshing profile...');
      if (user) {
        await fetchProfile();
      }
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [user]);

  const handleChildAdded = () => {
    fetchProfile(); // Refresh the profile data
    setShowAddChild(false);
  };

  const handleChildSelect = (child: Child) => {
    if (child.isOnboarded) {
      window.location.href = `/child/${child.id}`;
    } else {
      window.location.href = `/onboarding/${child.id}`;
    }
  };

  const getChildAvatarColor = (index: number) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error.includes('session') || error.includes('expired') ? 'Session Expired' : 'Something went wrong'}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {error.includes('session') || error.includes('expired') ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
              <Button onClick={() => window.location.href = '/'} className="bg-red-600 hover:bg-red-700">
                Go to Login
              </Button>
            </div>
          ) : (
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600 mb-6">We couldn't load your profile information</p>
          <Button onClick={() => window.location.reload()} className="bg-gray-600 hover:bg-gray-700">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-4">
            Choose Your Child
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a child to continue their learning journey
          </p>
        </div>

        {/* Profile Cards */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 max-w-4xl">
          {profile?.children && Array.isArray(profile.children) && profile.children.length > 0 ? (
            profile.children.map((child, index) => (
              <div
                key={child.id}
                onClick={() => handleChildSelect(child)}
                className="group cursor-pointer transition-transform hover:scale-105"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden mb-3 border-2 border-transparent group-hover:border-blue-500 transition-colors shadow-lg">
                  {child.imageURL ? (
                    <img
                      src={child.imageURL}
                      alt={child.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full ${getChildAvatarColor(index)} flex items-center justify-center`}>
                      <span className="text-white text-4xl md:text-5xl font-bold">
                        {child.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-900 text-lg font-medium">{child.displayName}</p>
                  <p className="text-gray-600 text-sm">
                    {child.age} years old
                    {!child.isOnboarded && (
                      <span className="block text-orange-500 text-xs mt-1">Setup Required</span>
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No children yet</p>
            </div>
          )}
        </div>

        {/* Add Child Button */}
        {profile?.children && profile.children.length < 5 && (
          <Button
            onClick={() => setShowAddChild(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </Button>
        )}

        {/* Manage Profiles Button */}
        {profile?.children && profile.children.length > 0 && (
          <Button
            variant="outline"
            className="text-gray-600 hover:text-gray-900 mt-6"
          >
            Manage Profiles
          </Button>
        )}
      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Child</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddChild(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>
            <ChildForm 
              onChildAdded={handleChildAdded}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
