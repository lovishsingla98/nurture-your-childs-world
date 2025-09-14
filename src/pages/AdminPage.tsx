import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DashboardHeader from '@/components/site/DashboardHeader';
import {
  Target,
  Sparkles,
  ArrowLeft,
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
  dateOfBirth: { seconds: number; nanoseconds: number };
  parentId: string;
  imageURL?: string;
  isOnboarded?: boolean;
}

const AdminPage: React.FC = () => {
  const { user, getValidToken } = useAuth();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      await getValidToken();
      const response = await apiClient.getUserProfile();
      
      if (response.success && response.data) {
        setProfile(response.data);
        
        // Set the first onboarded child as default selection if available
        if (response.data.children && response.data.children.length > 0 && !selectedChildId) {
          const firstOnboardedChild = response.data.children.find(child => child.isOnboarded);
          if (firstOnboardedChild) {
            setSelectedChildId(firstOnboardedChild.id);
          }
        }
      } else {
        setError('Failed to load profile data');
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      setError(error.message || 'Failed to load your profile');
      toast.error('Failed to load your profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const getSelectedChild = () => {
    if (!profile?.children || !selectedChildId) return null;
    return profile.children.find(child => child.id === selectedChildId);
  };

  const getOnboardedChildren = () => {
    if (!profile?.children) return [];
    return profile.children.filter(child => child.isOnboarded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading admin dashboard...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile || !profile.children || profile.children.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No children found</h2>
            <p className="text-gray-600 mb-6">You need to add children before accessing the admin dashboard.</p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onboardedChildren = getOnboardedChildren();
  
  if (onboardedChildren.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No onboarded children</h2>
            <p className="text-gray-600 mb-6">You need to complete the onboarding process for at least one child before accessing the admin dashboard.</p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/dashboard'}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage career insights and spark interests for your children</p>
          </div>
        </div>

        {/* Child Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Select Child</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Choose a child to manage:</span>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a child" />
                </SelectTrigger>
                <SelectContent>
                  {onboardedChildren.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.displayName} ({child.age} years old)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Admin Cards */}
        {getSelectedChild() && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Career Insights Card */}
            <Card className="border-2 border-transparent hover:border-blue-200 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Career Insights</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Explore future career possibilities for {getSelectedChild()?.displayName}
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.location.href = `/child/${selectedChildId}/career-insights`}
                    >
                      View Insights
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spark Interest Card */}
            <Card className="border-2 border-transparent hover:border-purple-200 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Spark Interest</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Nurture specific talents and interests for {getSelectedChild()?.displayName}
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => window.location.href = `/child/${selectedChildId}/spark-interest`}
                    >
                      Explore Interests
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
