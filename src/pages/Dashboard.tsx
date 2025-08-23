import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ChildForm from '@/components/forms/ChildForm';
import DashboardHeader from '@/components/site/DashboardHeader';
import { 
  User, 
  Mail, 
  Shield, 
  Plus, 
  Calendar, 
  Heart,
  Star,
  TrendingUp,
  Loader2
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
  dateOfBirth: string;
  parentId: string;
  imageURL?: string; // Optional image URL for child profile
  isOnboarded?: boolean; // Whether the child has completed onboarding
}

const Dashboard: React.FC = () => {
  const { user, getValidToken } = useAuth();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-800 mb-2">
                  {error.includes('session') || error.includes('expired') ? 'Session Expired' : 'Something went wrong'}
                </h2>
                <p className="text-red-600 mb-6">{error}</p>
                {error.includes('session') || error.includes('expired') ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Redirecting to login page...</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile not found</h2>
                <p className="text-gray-600 mb-6">We couldn't load your profile information</p>
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader />
      
      {/* Child Image Section */}
      <div className="w-full bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop&crop=face" 
              alt="Happy child learning" 
              className="w-64 h-48 object-cover rounded-lg shadow-lg"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-12 max-w-6xl">
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user?.displayName?.split(' ')[0] || 'Parent'}
              </span>
              !
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your children's development journey and create meaningful learning experiences together.
            </p>
          </div>

          {/* Children Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Your Children</CardTitle>
                    <CardDescription>
                      Manage your children's profiles and development tracking
                      {profile?.children && (
                        <span className="text-purple-600 font-medium"> ({profile.children.length}/5)</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <ChildForm onChildAdded={handleChildAdded} />
              </div>
            </CardHeader>
            <CardContent>
              {profile?.children && Array.isArray(profile.children) && profile.children.length > 0 ? (
                <div>
                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{profile.children.length}</div>
                      <div className="text-sm text-gray-600">Total Children</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(profile.children.reduce((sum, child) => sum + child.age, 0) / profile.children.length)}
                      </div>
                      <div className="text-sm text-gray-600">Average Age</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.max(...profile.children.map(c => c.age))}
                      </div>
                      <div className="text-sm text-gray-600">Oldest</div>
                    </div>
                  </div>
                  
                  {/* Children List */}
                  <div className="space-y-3">
                    {profile.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Avatar className="h-12 w-12 border-2 border-purple-200">
                          <AvatarImage src={child.imageURL} alt={child.displayName} />
                          <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                            {child.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{child.displayName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">{child.age} years old</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 capitalize">{child.gender}</span>
                            <span className="text-gray-400">•</span>
                            <Badge 
                              variant={child.isOnboarded ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {child.isOnboarded ? "Onboarded" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {child.isOnboarded ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = `/child/${child.id}`}
                              className="hover:bg-purple-50 hover:border-purple-200"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              View Dashboard
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => window.location.href = `/onboarding/${child.id}`}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              Complete Onboarding
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {profile?.children === undefined 
                      ? 'Loading children data...' 
                      : 'Start by adding your first child to track their development journey. You can add up to 5 children.'
                    }
                  </p>
                  <ChildForm 
                    onChildAdded={handleChildAdded}
                    trigger={
                      <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Child
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
};

export default Dashboard;
