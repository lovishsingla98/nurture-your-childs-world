import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from '@/components/site/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { DashboardData, ActivityStatus } from '@/lib/types';
import {
  Calendar,
  HelpCircle,
  TrendingUp,
  Brain,
  BookOpen,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface FeatureStatus {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'pending' | 'available' | 'coming-soon';
  priority: 'high' | 'medium' | 'low';
  lastCompleted?: string;
  streak?: number;
}

const ChildDashboard: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user, getValidToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format relative time
  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Helper function to calculate weekly progress based on daily tasks
  const calculateWeeklyProgress = (): number => {
    if (!dashboardData) return 0;
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate the start of the current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate the end of the current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // For now, we'll use the daily task streak as a proxy for weekly progress
    // In a real implementation, you'd need to fetch daily task completion data for the week
    const currentStreak = dashboardData.child.streak.current;
    const daysInWeek = 7;
    
    // Calculate progress based on streak, but cap it at the number of days passed in the current week
    const daysPassedInWeek = Math.min(currentDay + 1, daysInWeek); // +1 because getDay() is 0-indexed
    const weeklyProgress = Math.min(currentStreak, daysPassedInWeek);
    
    return Math.round((weeklyProgress / daysInWeek) * 100);
  };

  // Create features array from dashboard data
  const getFeatures = (): FeatureStatus[] => {
    if (!dashboardData) return [];

    const { activities } = dashboardData;
    const hasRealData = activities.dailyTask.streak !== undefined || 
                       activities.weeklyInterest.lastCompleted !== undefined ||
                       activities.weeklyPotential.lastCompleted !== undefined ||
                       activities.weeklyQuiz.lastCompleted !== undefined;

    return [
      {
        id: 'daily-task',
        name: 'Daily Task',
        description: 'Complete today\'s personalized learning activity',
        icon: <Calendar className="w-5 h-5" />,
        status: activities.dailyTask.status,
        priority: activities.dailyTask.priority,
        streak: activities.dailyTask.streak,
        lastCompleted: activities.dailyTask.lastCompleted ? formatRelativeTime(activities.dailyTask.lastCompleted) : (hasRealData ? 'Not completed yet' : '')
      },
      {
        id: 'weekly-interest',
        name: 'Weekly Interest',
        description: 'Discover what sparks curiosity this week',
        icon: <HelpCircle className="w-5 h-5" />,
        status: activities.weeklyInterest.status,
        priority: activities.weeklyInterest.priority,
        lastCompleted: activities.weeklyInterest.lastCompleted ? formatRelativeTime(activities.weeklyInterest.lastCompleted) : (hasRealData ? 'Not completed yet' : '')
      },
      {
        id: 'weekly-potential',
        name: 'Weekly Potential',
        description: 'Assess natural strengths and abilities',
        icon: <TrendingUp className="w-5 h-5" />,
        status: activities.weeklyPotential.status,
        priority: activities.weeklyPotential.priority,
        lastCompleted: activities.weeklyPotential.lastCompleted ? formatRelativeTime(activities.weeklyPotential.lastCompleted) : (hasRealData ? 'Not completed yet' : '')
      },
      {
        id: 'weekly-quiz',
        name: 'Weekly Quiz',
        description: 'Review and reinforce learning',
        icon: <Brain className="w-5 h-5" />,
        status: activities.weeklyQuiz.status,
        priority: activities.weeklyQuiz.priority,
        lastCompleted: activities.weeklyQuiz.lastCompleted ? formatRelativeTime(activities.weeklyQuiz.lastCompleted) : (hasRealData ? 'Not completed yet' : '')
      },
      {
        id: 'moral-story',
        name: 'Moral Story',
        description: 'Values-building stories for bedtime',
        icon: <BookOpen className="w-5 h-5" />,
        status: 'coming-soon',
        priority: 'medium'
      }
    ];
  };

  const features = getFeatures();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      await getValidToken();
      
      // Try to get dashboard data first
      const dashboardResponse = await apiClient.getChildDashboardData(childId!);
      
      if (dashboardResponse.success && dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
        return;
      }

      // If dashboard data fails, fallback to basic child data
      console.log('Dashboard data not available, falling back to basic child data');
      const profileResponse = await apiClient.getUserProfile();
      
      if (profileResponse.success && profileResponse.data?.children) {
        const foundChild = profileResponse.data.children.find((c: any) => c.id === childId);
        if (foundChild) {
          // Create a minimal dashboard data structure with basic child info
          const fallbackData: DashboardData = {
            child: {
              id: foundChild.id,
              displayName: foundChild.displayName,
              age: foundChild.age,
              gender: foundChild.gender || 'unknown',
              imageURL: foundChild.imageURL,
              streak: {
                current: 0,
                longest: 0,
                lastActivityDate: undefined
              }
            },
            activities: {
              dailyTask: { status: 'available', priority: 'high' },
              weeklyInterest: { status: 'available', priority: 'medium' },
              weeklyPotential: { status: 'available', priority: 'medium' },
              weeklyQuiz: { status: 'available', priority: 'medium' },
              careerInsights: { status: 'available', priority: 'low' },
              sparkInterest: { status: 'available', priority: 'low' }
            }
          };
          setDashboardData(fallbackData);
          return;
        }
      }

      // If both fail, show error
      setError('Unable to load child data');
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      
      // Try fallback even if dashboard API fails
      try {
        const profileResponse = await apiClient.getUserProfile();
        if (profileResponse.success && profileResponse.data?.children) {
          const foundChild = profileResponse.data.children.find((c: any) => c.id === childId);
          if (foundChild) {
            const fallbackData: DashboardData = {
              child: {
                id: foundChild.id,
                displayName: foundChild.displayName,
                age: foundChild.age,
                gender: foundChild.gender || 'unknown',
                imageURL: foundChild.imageURL,
                streak: {
                  current: 0,
                  longest: 0,
                  lastActivityDate: undefined
                }
              },
              activities: {
                dailyTask: { status: 'available', priority: 'high' },
                weeklyInterest: { status: 'available', priority: 'medium' },
                weeklyPotential: { status: 'available', priority: 'medium' },
                weeklyQuiz: { status: 'available', priority: 'medium' },
                careerInsights: { status: 'available', priority: 'low' },
                sparkInterest: { status: 'available', priority: 'low' }
              }
            };
            setDashboardData(fallbackData);
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      setError('Unable to load child data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && childId) {
      fetchDashboardData();
    }
  }, [user, childId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'coming-soon': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'coming-soon': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading child dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Child Data</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <Button onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading child dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchDashboardData} 
            disabled={loading}
            className="text-slate-600 hover:text-slate-900"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <div className="w-4 h-4 mr-2">↻</div>
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Child Profile Header */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-md mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-indigo-200 shadow-lg">
                <AvatarImage src={dashboardData.child.imageURL} alt={dashboardData.child.displayName} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-bold">
                  {dashboardData.child.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{dashboardData.child.displayName}</h1>
                <div className="flex items-center gap-4 text-slate-600 mb-4">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {dashboardData.child.age} years old
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="capitalize">{dashboardData.child.gender}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-slate-500">Weekly Progress</span>
                    <Progress value={calculateWeeklyProgress()} className="w-32 mt-1" />
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Current Streak</span>
                    <div className="text-lg font-bold text-indigo-600">
                      {dashboardData.child.streak.current > 0 ? `${dashboardData.child.streak.current} days` : 'No streak yet'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-2">
                  {dashboardData.child.streak.current > 0 ? 'Active Learner' : 'New Learner'}
                </Badge>
                <p className="text-sm text-slate-500">
                  Last activity: {dashboardData.child.streak.lastActivityDate ? formatRelativeTime(dashboardData.child.streak.lastActivityDate) : 'No activity yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className={`group transition-all duration-300 border-0 bg-white/70 backdrop-blur-md ${
                feature.status === 'pending' ? 'ring-2 ring-orange-200 shadow-lg' : ''
              } ${
                feature.status === 'coming-soon' 
                  ? 'cursor-not-allowed opacity-60' 
                  : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {feature.status === 'coming-soon' ? (
                <div className="block h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                          {feature.icon}
                        </div>
                        <div className="relative">
                          <div className={`absolute -top-1 -left-1 w-2 h-2 rounded-full ${getPriorityDot(feature.priority)}`} />
                          <CardTitle className="text-lg font-semibold text-slate-900">
                            {feature.name}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(feature.status)} text-xs`}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(feature.status)}
                          coming soon
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 mb-4">
                      {feature.description}
                    </CardDescription>
                    <p className="text-xs text-gray-500 mt-2">
                      Coming Soon
                    </p>
                  </CardContent>
                </div>
              ) : (
                <Link to={`/child/${childId}/${feature.id}`} className="block h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          feature.status === 'completed' ? 'bg-green-100 text-green-600' :
                          feature.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          {feature.icon}
                        </div>
                        <div className="relative">
                          <div className={`absolute -top-1 -left-1 w-2 h-2 rounded-full ${getPriorityDot(feature.priority)}`} />
                          <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {feature.name}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(feature.status)} text-xs`}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(feature.status)}
                          {feature.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 mb-4">
                      {feature.description}
                    </CardDescription>
                    {feature.lastCompleted && (
                      <p className="text-xs text-slate-500">
                        Last completed: {feature.lastCompleted}
                      </p>
                    )}
                    {feature.streak && feature.status === 'pending' && (
                      <p className="text-xs text-orange-600 font-medium">
                        🔥 Current streak: {feature.streak} days
                      </p>
                    )}
                  </CardContent>
                </Link>
              )}
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ChildDashboard;
