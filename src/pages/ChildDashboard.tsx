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
import EditChildForm from '@/components/forms/EditChildForm';
import {
  Calendar,
  HelpCircle,
  TrendingUp,
  Target,
  Sparkles,
  Brain,
  BookOpen,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Settings
} from 'lucide-react';

interface Child {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  dateOfBirth: { seconds: number; nanoseconds: number }; // Firestore Timestamp
  parentId: string;
  imageURL?: string;
  isOnboarded?: boolean;
}

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
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const features: FeatureStatus[] = [
    {
      id: 'daily-task',
      name: 'Daily Task',
      description: 'Complete today\'s personalized learning activity',
      icon: <Calendar className="w-5 h-5" />,
      status: 'pending', // TODO: Get from backend API
      priority: 'high',
      streak: dashboardData?.dailyTaskStreak || null // TODO: Get from backend API
    },
    {
      id: 'weekly-interest',
      name: 'Weekly Interest',
      description: 'Discover what sparks curiosity this week',
      icon: <HelpCircle className="w-5 h-5" />,
      status: 'available', // TODO: Get from backend API
      priority: 'medium',
      lastCompleted: dashboardData?.weeklyInterestLastCompleted || null // TODO: Get from backend API
    },
    {
      id: 'weekly-potential',
      name: 'Weekly Potential',
      description: 'Assess natural strengths and abilities',
      icon: <TrendingUp className="w-5 h-5" />,
      status: 'available', // TODO: Get from backend API
      priority: 'medium',
      lastCompleted: dashboardData?.weeklyPotentialLastCompleted || null // TODO: Get from backend API
    },
    {
      id: 'career-insights',
      name: 'Career Insights',
      description: 'Explore future career possibilities',
      icon: <Target className="w-5 h-5" />,
      status: 'available',
      priority: 'low'
    },
    {
      id: 'spark-interest',
      name: 'Spark Interest',
      description: 'Nurture specific talents and interests',
      icon: <Sparkles className="w-5 h-5" />,
      status: 'available',
      priority: 'low'
    },
    {
      id: 'weekly-quiz',
      name: 'Weekly Quiz',
      description: 'Review and reinforce learning',
      icon: <Brain className="w-5 h-5" />,
      status: dashboardData?.weeklyQuizStatus || 'available', // TODO: Get from backend API
      priority: 'medium',
      lastCompleted: dashboardData?.weeklyQuizLastCompleted || null // TODO: Get from backend API
    },
    {
      id: 'moral-story',
      name: 'Moral Story',
      description: 'Values-building stories for bedtime',
      icon: <BookOpen className="w-5 h-5" />,
      status: 'coming-soon',
      priority: 'medium'
    }
    // TODO: Uncomment when parent chatbot feature is ready
    // {
    //   id: 'parents-chatbot',
    //   name: 'Parents Chatbot',
    //   description: 'Get personalized parenting advice and guidance',
    //   icon: <HelpCircle className="w-5 h-5" />,
    //   status: 'available',
    //   priority: 'low'
    // }
  ];

  const fetchChild = async () => {
    try {
      setLoading(true);
      setError(null);

      await getValidToken();
      const response = await apiClient.getUserProfile();

      if (response.success && response.data?.children) {
        const foundChild = response.data.children.find((c: Child) => c.id === childId);
        if (foundChild) {
          setChild(foundChild);
          // TODO: Fetch dashboard-specific data from backend
          await fetchDashboardData(foundChild.id);
        } else {
          setError('Child not found');
        }
      } else {
        setError('Failed to load child data');
      }
    } catch (error: any) {
      console.error('Failed to fetch child:', error);
      setError(error.message || 'Failed to load child data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (childId: string) => {
    try {
      // TODO: Replace with actual API calls when backend endpoints are ready
      console.log('TODO: Fetch dashboard data for child:', childId);
      
      // Mock data structure - replace with actual API calls
      const mockData = {
        dailyTaskStreak: null, // TODO: await apiClient.getDailyTaskStreak(childId)
        weeklyInterestLastCompleted: null, // TODO: await apiClient.getWeeklyInterestStatus(childId)
        weeklyPotentialLastCompleted: null, // TODO: await apiClient.getWeeklyPotentialStatus(childId)
        weeklyQuizStatus: 'available', // TODO: await apiClient.getWeeklyQuizStatus(childId)
        weeklyQuizLastCompleted: null, // TODO: await apiClient.getWeeklyQuizStatus(childId)
        weeklyProgress: null, // TODO: await apiClient.getWeeklyProgress(childId)
        currentStreak: null, // TODO: await apiClient.getCurrentStreak(childId)
        tasksCompleted: null, // TODO: await apiClient.getTasksCompleted(childId)
        newInterests: null, // TODO: await apiClient.getNewInterests(childId)
        pendingItems: null, // TODO: await apiClient.getPendingItems(childId)
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Don't set error state for dashboard data - just log it
    }
  };

  useEffect(() => {
    if (user && childId) {
      fetchChild();
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

  if (error || !child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-800 mb-2">Child Not Found</h2>
                <p className="text-red-600 mb-6">{error || 'Unable to load child data'}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Child Profile Header */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-md mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-indigo-200 shadow-lg">
                <AvatarImage src={child.imageURL} alt={child.displayName} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-bold">
                  {child.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{child.displayName}</h1>
                <div className="flex items-center gap-4 text-slate-600 mb-4">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {child.age} years old
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="capitalize">{child.gender}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-slate-500">Weekly Progress</span>
                    {dashboardData?.weeklyProgress ? (
                      <Progress value={dashboardData.weeklyProgress} className="w-32 mt-1" />
                    ) : (
                      <div className="w-32 mt-1 text-xs text-gray-500 bg-gray-100 rounded p-1">
                        Backend API pending
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Current Streak</span>
                    {dashboardData?.currentStreak ? (
                      <div className="text-lg font-bold text-indigo-600">{dashboardData.currentStreak} days</div>
                    ) : (
                      <div className="text-xs text-gray-500 bg-gray-100 rounded p-1">
                        Backend API pending
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge variant="secondary" className="mb-2">
                  Active Learner
                </Badge>
                <p className="text-sm text-slate-500">Last activity: Today</p>
                <EditChildForm 
                  child={child} 
                  onChildUpdated={fetchChild}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  }
                />
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
                    {feature.lastCompleted ? (
                      <p className="text-xs text-slate-500">
                        Last completed: {feature.lastCompleted}
                      </p>
                    ) : (feature.id === 'weekly-interest' || feature.id === 'weekly-potential' || feature.id === 'weekly-quiz') && (
                      <p className="text-xs text-gray-500 bg-gray-100 rounded p-1 mt-2">
                        Backend API pending for completion status
                      </p>
                    )}
                    {feature.streak ? (
                      <p className="text-xs text-orange-600 font-medium">
                        🔥 Current streak: {feature.streak} days
                      </p>
                    ) : feature.id === 'daily-task' && (
                      <p className="text-xs text-gray-500 bg-gray-100 rounded p-1 mt-2">
                        Backend API pending for streak data
                      </p>
                    )}
                  </CardContent>
                </Link>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-md mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                {dashboardData?.tasksCompleted ? (
                  <div className="text-2xl font-bold text-green-600 mb-1">{dashboardData.tasksCompleted}</div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-100 rounded p-2 mb-1">API pending</div>
                )}
                <div className="text-sm text-slate-500">Tasks Completed</div>
              </div>
              <div className="text-center">
                {dashboardData?.currentStreak ? (
                  <div className="text-2xl font-bold text-indigo-600 mb-1">{dashboardData.currentStreak}</div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-100 rounded p-2 mb-1">API pending</div>
                )}
                <div className="text-sm text-slate-500">Day Streak</div>
              </div>
              <div className="text-center">
                {dashboardData?.newInterests ? (
                  <div className="text-2xl font-bold text-purple-600 mb-1">{dashboardData.newInterests}</div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-100 rounded p-2 mb-1">API pending</div>
                )}
                <div className="text-sm text-slate-500">New Interests</div>
              </div>
              <div className="text-center">
                {dashboardData?.pendingItems ? (
                  <div className="text-2xl font-bold text-orange-600 mb-1">{dashboardData.pendingItems}</div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-100 rounded p-2 mb-1">API pending</div>
                )}
                <div className="text-sm text-slate-500">Pending Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChildDashboard;
