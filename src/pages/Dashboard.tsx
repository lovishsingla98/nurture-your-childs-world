import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import ChildForm from '@/components/forms/ChildForm';
import ChildManagement from '@/components/forms/ChildManagement';
import {
  Plus,
  Settings,
  Loader2,
  User,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  Brain,
  BookOpen,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Calendar,
  Compass,
  BarChart,
  Grid,
  ChevronDown,
  Home,
  LogOut
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid
} from 'recharts';

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
  countryCode?: string; // Stored user's preference
}

interface Child {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  dateOfBirth: { seconds: number; nanoseconds: number } | string; // Firestore Timestamp or ISO
  parentId: string;
  imageURL?: string; // Optional image URL for child profile
  isOnboarded?: boolean; // Whether the child has completed onboarding
}

interface ActivityStatus {
  status: 'completed' | 'pending' | 'available' | 'coming-soon';
  lastCompleted?: string;
  streak?: number;
  priority: 'high' | 'medium' | 'low';
}

interface DashboardData {
  child: {
    id: string;
    displayName: string;
    age: number;
    gender: string;
    imageURL?: string;
    streak: {
      current: number;
      longest: number;
      lastActivityDate?: string;
    };
  };
  activities: {
    dailyTask: ActivityStatus;
    weeklyInterest: ActivityStatus;
    weeklyPotential: ActivityStatus;
    weeklyQuiz: ActivityStatus;
    careerInsights: ActivityStatus;
    sparkInterest: ActivityStatus;
  };
  insights?: {
    sparks: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      earnedAt: string;
    }>;
    interestProfile: Array<{
      label: string;
      score: number;
    }>;
    engagementTimeline: Array<{
      dayIndex: number;
      score: number;
    }>;
  };
}

const Dashboard: React.FC = () => {
  const { user, getValidToken, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard Overhaul States
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeChildOverview, setActiveChildOverview] = useState<DashboardData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'home' | 'planning' | 'insights'>('home');
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);

  // Country Selection State (matches NurtureCountryPicker)
  const [countryCode, setCountryCode] = useState<string>(() => {
    return localStorage.getItem('countryCode') || 'IN';
  });

  // Modal States
  const [showAddChild, setShowAddChild] = useState(false);
  const [showManageProfiles, setShowManageProfiles] = useState(false);

  const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 5) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        const delay = Math.min(500 * Math.pow(2, attempt), 2000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      await getValidToken();

      const response = await retryWithBackoff(async () => {
        return await apiClient.getUserProfile();
      });
      
      if (response.success && response.data) {
        setProfile(response.data);
        
        // Dynamically resolve country preference (mirroring platform dispatcher automatic detection)
        const savedCode = localStorage.getItem('countryCode');
        const backendCode = response.data.countryCode;
        if (savedCode) {
          setCountryCode(savedCode);
        } else if (backendCode) {
          setCountryCode(backendCode);
          localStorage.setItem('countryCode', backendCode);
        } else {
          // Fallback to browser's locale automatically and push to backend
          const browserLocale = navigator.language || 'en-IN';
          const codeParts = browserLocale.split('-');
          const defaultCode = codeParts.length > 1 ? codeParts[1].toUpperCase() : 'IN';
          setCountryCode(defaultCode);
          localStorage.setItem('countryCode', defaultCode);
          
          // Auto-sync country code to backend parent profile to ensure consistent state
          apiClient.updateParentProfile({ countryCode: defaultCode }).catch(err => {
            console.error('Failed to auto-sync country code to profile:', err);
          });
        }

        // Auto-select active child
        const childrenList = response.data.children || [];
        if (childrenList.length > 0) {
          const savedActiveId = localStorage.getItem('activeChildId');
          const exists = childrenList.some((c: any) => c.id === savedActiveId);
          const defaultId = exists ? savedActiveId : childrenList[0].id;
          setActiveChildId(defaultId);
          if (defaultId) {
            localStorage.setItem('activeChildId', defaultId);
          }
        }
      } else {
        setError('Failed to load profile data');
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      if (error.message?.includes('Authentication required') || error.message?.includes('token')) {
        setError('Your session has expired. Please sign in again.');
        toast.error('Session expired. Please sign in again.');
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

  const fetchChildOverview = async (childId: string) => {
    try {
      setOverviewLoading(true);
      setOverviewError(null);
      await getValidToken();
      
      const response = await apiClient.getChildDashboardData(childId);
      if (response.success && response.data) {
        setActiveChildOverview(response.data);
      } else {
        setOverviewError('Failed to load child dashboard data');
      }
    } catch (error: any) {
      console.error('Failed to fetch child overview:', error);
      setOverviewError(error.message || 'Failed to load dashboard insights');
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (activeChildId) {
      fetchChildOverview(activeChildId);
    }
  }, [activeChildId]);

  const handleChildAdded = () => {
    fetchProfile();
    setShowAddChild(false);
  };

  const handleChildUpdated = () => {
    fetchProfile();
  };

  const handleChildSelect = (childId: string) => {
    setActiveChildId(childId);
    localStorage.setItem('activeChildId', childId);
    setChildDropdownOpen(false);
  };

  // Switch tabs
  const handleTabChange = (tab: 'home' | 'planning' | 'insights') => {
    setSelectedTab(tab);
  };

  // Helper dynamic greetings
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getParentFirstName = () => {
    const name = profile?.displayName || user?.displayName;
    if (!name) return 'there';
    return name.split(' ')[0];
  };

  const activeChild = useMemo(() => {
    if (!profile?.children || !activeChildId) return null;
    return profile.children.find(c => c.id === activeChildId) || null;
  }, [profile, activeChildId]);

  // Compute Focus Card progress
  const overviewProgress = useMemo(() => {
    if (!activeChildOverview) return 0;
    const activities = activeChildOverview.activities;
    let completed = 0;
    if (activities.dailyTask?.status === 'completed') completed++;
    if (activities.weeklyInterest?.status === 'completed') completed++;
    if (activities.weeklyPotential?.status === 'completed') completed++;
    if (activities.weeklyQuiz?.status === 'completed') completed++;
    return Math.round((completed / 4) * 100);
  }, [activeChildOverview]);

  // Resolve Next Step Logic matching Flutter resolveNextStep
  const nextStep = useMemo(() => {
    if (!activeChild) return null;
    if (!activeChild.isOnboarded) {
      return {
        label: 'Continue onboarding',
        description: `Answer the remaining questions so Nurture can prepare a plan for ${activeChild.displayName}.`,
        icon: <ArrowRight className="w-3.5 h-3.5 text-[#2D6A4F]" />,
        url: `/onboarding/${activeChild.id}`
      };
    }

    const activities = activeChildOverview?.activities;
    if (!activities) {
      return {
        label: `Open ${activeChild.displayName}'s dashboard`,
        description: "Use the child dashboard to see this week's progress and available activities.",
        icon: <ArrowRight className="w-3.5 h-3.5 text-[#2D6A4F]" />,
        url: `/child/${activeChild.id}`
      };
    }

    if (activities.dailyTask?.status !== 'completed') {
      return {
        label: "Open today's task",
        description: `The daily task is the clearest next step for ${activeChild.displayName} right now.`,
        icon: <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" />,
        url: `/child/${activeChild.id}/daily-task`
      };
    }
    if (activities.weeklyInterest?.status !== 'completed') {
      return {
        label: 'Open weekly interest',
        description: `Capture what is pulling ${activeChild.displayName} in this week.`,
        icon: <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />,
        url: `/child/${activeChild.id}/weekly-interest`
      };
    }
    if (activities.weeklyPotential?.status !== 'completed') {
      return {
        label: 'Open weekly potential',
        description: `Review where ${activeChild.displayName} is showing strength and momentum.`,
        icon: <TrendingUp className="w-3.5 h-3.5 text-[#2D6A4F]" />,
        url: `/child/${activeChild.id}/weekly-potential`
      };
    }
    if (activities.weeklyQuiz?.status !== 'completed') {
      return {
        label: 'Open weekly quiz',
        description: "Close the loop on learning with this week's quiz.",
        icon: <Brain className="w-3.5 h-3.5 text-[#2D6A4F]" />,
        url: `/child/${activeChild.id}/weekly-quiz`
      };
    }

    return {
      label: 'View child dashboard',
      description: `${activeChild.displayName} is caught up! Open the dashboard for the full week at a glance.`,
      icon: <Grid className="w-3.5 h-3.5 text-[#2D6A4F]" />,
      url: `/child/${activeChild.id}`
    };
  }, [activeChild, activeChildOverview]);

  // Compute Radar Chart traits with automatic zoom and baseline fallbacks
  const radarData = useMemo(() => {
    const defaultTraits = [
      { label: 'Creativity', value: 0 },
      { label: 'Logic', value: 0 },
      { label: 'Physical', value: 0 },
      { label: 'Empathy', value: 0 },
      { label: 'Leadership', value: 0 }
    ];
    if (!activeChildOverview?.insights?.interestProfile?.length) {
      return defaultTraits;
    }
    return activeChildOverview.insights.interestProfile.map(p => ({
      label: p.label,
      value: Math.round((p.score || 0) * 10)
    }));
  }, [activeChildOverview]);

  // Compute Timeline completions
  const timelineData = useMemo(() => {
    if (!activeChildOverview?.insights?.engagementTimeline?.length) {
      return [];
    }
    return activeChildOverview.insights.engagementTimeline.map(t => {
      const daysAgo = 14 - t.dayIndex;
      const label = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
      return {
        label,
        completions: t.score
      };
    });
  }, [activeChildOverview]);

  // Badge Styles mapping matching nurture_spark_badge.dart
  const getBadgeStyle = (level: number) => {
    switch (level) {
      case 2:
        return {
          levelName: 'SILVER',
          gradient: 'from-slate-100 to-slate-200 border-slate-300',
          textColor: 'text-slate-700',
          pillBg: 'bg-slate-100 text-slate-600 border-slate-300/50'
        };
      case 3:
        return {
          levelName: 'GOLD',
          gradient: 'from-amber-50 to-amber-200 border-amber-300',
          textColor: 'text-amber-800',
          pillBg: 'bg-amber-100 text-amber-700 border-amber-300/50'
        };
      case 1:
      default:
        return {
          levelName: 'BRONZE',
          gradient: 'from-orange-50 to-orange-100 border-orange-200',
          textColor: 'text-orange-900',
          pillBg: 'bg-orange-100 text-orange-700 border-orange-200/50'
        };
    }
  };

  const getBadgeLevel = (spark: any) => {
    if (spark.id === 's1') return 3; // Storyteller is premium gold level
    if (spark.title.toLowerCase().includes('silver')) return 2;
    if (spark.title.toLowerCase().includes('gold')) return 3;
    return 1; // Bronze default
  };

  // Map Country Code to emoji flags (matches countryCodeToEmoji)
  const countryToFlag = (code: string) => {
    const flags: Record<string, string> = {
      IN: '🇮🇳',
      US: '🇺🇸',
      GB: '🇬🇧',
      CA: '🇨🇦',
      AU: '🇦🇺',
      AE: '🇦🇪',
      SG: '🇸🇬',
      DE: '🇩🇪',
      FR: '🇫🇷'
    };
    return flags[code] || '🇮🇳';
  };

  const handleCountryUpdate = async (code: string, name: string) => {
    setCountryCode(code);
    localStorage.setItem('countryCode', code);
    if (profile) {
      setProfile({ ...profile, countryCode: code });
    }
    try {
      // Sync update directly to parent profile on backend
      await apiClient.updateParentProfile({ countryCode: code });
      toast.success(`Region updated to ${name}`);
    } catch (err) {
      console.warn('Failed to sync country preference to backend, kept locally:', err);
      // Fallback: successfully update local preference and show toast
      toast.success(`Region updated to ${name}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F2] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#2D6A4F] animate-spin mx-auto mb-4" />
          <p className="text-[#607060] font-semibold text-xs">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7F2] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-[#18211A] mb-2">Something went wrong</h2>
          <p className="text-slate-600 text-xs mb-6 leading-relaxed">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white rounded-full px-6 py-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const hasChildren = profile?.children && profile.children.length > 0;

  return (
    <div className="h-screen w-screen bg-[#DCE8D7] flex flex-col items-center justify-center overflow-hidden p-0 sm:py-3 select-none text-[#18211A]">
      
      {/* Centered Device Simulator designed to perfectly fit 100% of the screen height without scrolling */}
      <div className="h-full max-h-[730px] w-full max-w-[365px] bg-[#F5F7F2] sm:rounded-[36px] sm:border-[8px] sm:border-slate-900 sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden aspect-[9/19.2]">
        
        {/* Device Status Bar Mockup */}
        <div className="hidden sm:flex items-center justify-between px-5 pt-2.5 pb-1 text-[10px] font-extrabold text-slate-800/80 z-30 select-none tracking-tight">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
            <span className="w-3 h-2 bg-slate-800/80 rounded-sm flex items-center justify-center text-[6px] text-white font-extrabold">5G</span>
            <span className="w-3.5 h-1.5 border border-slate-800/80 rounded-sm" />
          </div>
        </div>

        {/* Scrollable Phone Screen Viewport */}
        <div className="flex-1 overflow-y-auto px-4.5 pt-2 pb-24 scrollbar-none flex flex-col">
          
          {/* Empty State */}
          {!hasChildren ? (
            <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
              <div className="w-14 h-14 bg-[#EAF0E6] border border-[#D5DFD0] rounded-full flex items-center justify-center mb-5 shadow-sm">
                <User className="w-6 h-6 text-[#2D6A4F] animate-pulse" />
              </div>
              <h1 className="text-lg font-extrabold text-[#18211A] mb-1.5 tracking-tight">
                Start with your child profile
              </h1>
              <p className="text-[#607060] text-[10px] max-w-[220px] mb-6 leading-relaxed font-semibold">
                Add a child profile once, then Nurture guides you to the next step.
              </p>
              <Button
                onClick={() => setShowAddChild(true)}
                className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-6 py-2 rounded-full shadow-sm text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Child
              </Button>
            </div>
          ) : (
            <>
              {/* Top Greeting & Switch Active Child Header */}
              {activeChild && (
                <div className="flex items-center justify-between gap-2 mb-4 z-10">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base font-extrabold text-[#18211A] tracking-tight leading-none mb-0.5 truncate">
                      {selectedTab === 'planning' ? 'Planning Tools' : selectedTab === 'insights' ? 'Progress Insights' : `${getGreeting()}, ${getParentFirstName()}`}
                    </h1>
                    <p className="text-[#607060] text-[9px] font-semibold leading-none truncate">
                      {selectedTab === 'planning' ? 'Career insights in focus.' : selectedTab === 'insights' ? 'Visualizing growth & consistency.' : "Let's see what we can explore."}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-none">
                    {/* Country Selector Popover (NurtureCountryPicker) */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 bg-white border border-[#D5DFD0] rounded-full px-2 py-1 shadow-sm hover:bg-slate-50 transition-all">
                          <span className="text-xs leading-none">{countryToFlag(countryCode)}</span>
                          <span className="text-[9px] font-extrabold text-slate-800 tracking-wide">{countryCode}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-40 p-1.5 rounded-xl border border-[#D5DFD0] shadow-xl bg-white">
                        <p className="text-slate-400 text-[8px] font-bold px-2 py-1 uppercase tracking-wider">Select Region</p>
                        <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-none">
                          {[
                            { code: 'IN', name: 'India', flag: '🇮🇳' },
                            { code: 'US', name: 'United States', flag: '🇺🇸' },
                            { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
                            { code: 'CA', name: 'Canada', flag: '🇨🇦' },
                            { code: 'AU', name: 'Australia', flag: '🇦🇺' },
                            { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
                            { code: 'SG', name: 'Singapore', flag: '🇸🇬' }
                          ].map((c) => (
                            <button
                              key={c.code}
                              onClick={() => handleCountryUpdate(c.code, c.name)}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                                c.code === countryCode
                                  ? 'bg-[#EAF0E6] text-[#2D6A4F] font-bold'
                                  : 'hover:bg-slate-50 text-[#607060]'
                              }`}
                            >
                              <span className="text-xs">{c.flag}</span>
                              <span className="text-[10px] font-semibold">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Active Child Selector Popover */}
                    <Popover open={childDropdownOpen} onOpenChange={setChildDropdownOpen}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-0.5 bg-white border border-[#D5DFD0] rounded-full pl-1 pr-1.5 py-1 shadow-sm">
                          <Avatar className="h-5.5 w-5.5 border border-[#D5DFD0]">
                            {activeChild.imageURL ? (
                              <AvatarImage src={activeChild.imageURL} alt={activeChild.displayName} />
                            ) : (
                              <AvatarFallback className="bg-[#EAF0E6] text-[#2D6A4F] text-[9px] font-bold">
                                {activeChild.displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-1 rounded-xl border border-[#D5DFD0] shadow-xl bg-white">
                        <p className="text-slate-400 text-[9px] font-bold px-2 py-1 uppercase tracking-wider">Choose Child</p>
                        <div className="space-y-0.5">
                          {profile.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleChildSelect(child.id)}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-all ${
                                child.id === activeChildId
                                  ? 'bg-[#EAF0E6] text-[#2D6A4F] font-bold'
                                  : 'hover:bg-slate-50 text-[#607060]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5 border border-[#D5DFD0]">
                                  {child.imageURL ? (
                                    <AvatarImage src={child.imageURL} alt={child.displayName} />
                                  ) : (
                                    <AvatarFallback className="bg-[#EAF0E6] text-[#2D6A4F] text-[8px] font-bold">
                                      {child.displayName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <p className="text-[11px] font-semibold leading-none">{child.displayName}</p>
                                  <p className="text-slate-400 text-[8px] mt-0.5">{child.age} yrs</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          onClick={() => {
                            setChildDropdownOpen(false);
                            setShowAddChild(true);
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[#2D6A4F] hover:bg-[#EAF0E6] text-[10px] font-bold transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          Add child
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* TAB CONTENT PAGES */}

              {/* TAB 0: HOME */}
              {selectedTab === 'home' && activeChild && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Glowing Focus Card */}
                  <div className="bg-gradient-to-br from-[#1F513C] to-[#2D6A4F] text-white rounded-[24px] p-5 shadow-sm relative overflow-hidden transition-all duration-300">
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-xl" />
                    <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-white/10 blur-2xl" />

                    <div className="flex items-start gap-3 relative z-10">
                      <div className="flex flex-col items-center gap-1.5 flex-none">
                        <Avatar className="h-12 w-12 border border-white/20 shadow-md">
                          {activeChild.imageURL ? (
                            <AvatarImage src={activeChild.imageURL} alt={activeChild.displayName} />
                          ) : (
                            <AvatarFallback className="bg-white text-[#2D6A4F] text-sm font-extrabold">
                              {activeChild.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <Badge className="bg-white/20 border-transparent text-white font-extrabold tracking-wide px-1.5 py-0 rounded-full text-[8px]">
                          {activeChild.age} Yrs
                        </Badge>
                      </div>

                      <div className="flex-1">
                        <h2 className="text-sm font-extrabold tracking-tight mb-1 leading-tight">
                          Continue {activeChild.displayName}'s plan
                        </h2>
                        <p className="text-white/90 text-[10px] leading-normal font-medium max-w-prose">
                          {overviewLoading ? 'Tailoring recommendations...' : nextStep?.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
                      <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 backdrop-blur-sm">
                        <div className="flex items-center gap-1 text-white/80 text-[8px] font-bold mb-0.5">
                          <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                          Streak
                        </div>
                        <p className="text-xs font-extrabold text-white">
                          {activeChildOverview?.child?.streak?.current || 0} days
                        </p>
                      </div>
                      <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 backdrop-blur-sm">
                        <div className="flex items-center gap-1 text-white/80 text-[8px] font-bold mb-0.5">
                          <Award className="w-3 h-3 text-yellow-300" />
                          Progress
                        </div>
                        <p className="text-xs font-extrabold text-white">
                          {!activeChild.isOnboarded ? 'Setup' : `${overviewProgress}% done`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-4 relative z-10">
                      <Button
                        asChild
                        className="bg-white hover:bg-slate-50 text-[#2D6A4F] hover:text-[#1F513C] font-extrabold px-4 py-2 text-[10px] rounded-full shadow-sm"
                      >
                        <a href={nextStep?.url || '#'}>
                          <span>{nextStep?.label}</span>
                        </a>
                      </Button>
                      {activeChild.isOnboarded && (
                        <Button
                          asChild
                          variant="ghost"
                          className="border border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white font-bold px-4 py-2 text-[10px] rounded-full"
                        >
                          <a href={`/child/${activeChild.id}`}>
                            <Grid className="w-3 h-3 mr-1" />
                            Child Dashboard
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Bedtime stories card */}
                  <div className="bg-[#EAF0E6] border border-[#D5DFD0] rounded-[24px] p-4">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-[#D8EADB] rounded-lg text-[#2D6A4F] flex-none">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[12px] font-extrabold text-[#18211A] mb-0.5">Moral Stories</h3>
                        <p className="text-[#607060] text-[8px] font-bold tracking-wide uppercase mb-2">Teaching values bedtime story</p>
                        <p className="text-[#607060] text-[10px] leading-relaxed mb-3 font-semibold">
                          Describe a situation or pick values like empathy to generate a story for {activeChild.displayName}.
                        </p>
                        <Button
                          asChild
                          className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-4 py-1.5 rounded-full text-[10px]"
                        >
                          <a href={`/child/${activeChild.id}/moral-story`}>
                            Open stories
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* What Nurture Helps With Section */}
                  <div className="bg-white border border-[#D5DFD0] rounded-[24px] p-4 shadow-sm">
                    <h3 className="text-[10px] font-bold tracking-wider text-[#607060] uppercase mb-2">What Nurture helps with</h3>
                    <div className="space-y-1.5">
                      {[
                        { icon: <Brain className="w-3.5 h-3.5 text-[#2D6A4F]" />, label: 'AI-guided next steps' },
                        { icon: <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />, label: 'Interest discovery' },
                        { icon: <TrendingUp className="w-3.5 h-3.5 text-[#2D6A4F]" />, label: 'Progress that feels clear' }
                      ].map((feat, index) => (
                        <div key={index} className="flex items-center gap-2 p-1.5 bg-[#F5F7F2] rounded-lg border border-[#D5DFD0]/40">
                          <div className="p-1 bg-white rounded shadow-inner flex-none">{feat.icon}</div>
                          <span className="text-[#18211A] text-[10px] font-bold">{feat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 1: PLANNING (Exact Match with Flutter ParentToolsSection) */}
              {selectedTab === 'planning' && activeChild && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  
                  {/* Planning Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Badge className="bg-[#D8EADB] text-[#1F513C] hover:bg-[#D8EADB] border-transparent font-extrabold text-[8px] px-2 py-0.5 rounded-full">
                      Planning for {activeChild.displayName}
                    </Badge>
                    <Badge className={`border-transparent font-extrabold text-[8px] px-2 py-0.5 rounded-full ${
                      activeChild.isOnboarded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeChild.isOnboarded ? 'Unlocked' : 'Unlocks after setup'}
                    </Badge>
                  </div>

                  {!activeChild.isOnboarded ? (
                    <div className="border border-[#D5DFD0] bg-[#EAF0E6] rounded-[24px] p-5 text-center py-8">
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin mx-auto mb-2" />
                      <h3 className="text-xs font-bold text-slate-800 mb-1">Parent Planning Locked</h3>
                      <p className="text-[#607060] text-[9px] leading-relaxed max-w-[180px] mx-auto font-semibold">
                        Parent planning tools unlock here after {activeChild.displayName} finishes setup.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      
                      {/* 1. Career Insights */}
                      <a
                        href={`/child/${activeChild.id}/career-insights`}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D5DFD0] bg-white transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="p-2 bg-[#E3F2FD] text-blue-600 rounded-lg shadow-sm flex-none">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-slate-900 text-xs font-bold leading-tight mb-0.5">Career insights</h4>
                          <p className="text-slate-500 text-[9px] leading-relaxed font-semibold">
                            See patterns, likely strengths, and parent-readable next steps.
                          </p>
                        </div>
                      </a>

                      {/* 2. Spark Interest */}
                      <a
                        href={`/child/${activeChild.id}/spark-interest`}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-[#D5DFD0] bg-white transition-all duration-300 hover:shadow-sm"
                      >
                        <div className="p-2 bg-[#F3E5F5] text-purple-600 rounded-lg shadow-sm flex-none">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-slate-900 text-xs font-bold leading-tight mb-0.5">Spark interest</h4>
                          <p className="text-slate-500 text-[9px] leading-relaxed font-semibold">
                            Set a direction so future planning leans into one theme or goal.
                          </p>
                        </div>
                      </a>

                      {/* 3. Career Roadmap (Regional logic matching roadmapDescription & isRoadmapComingSoon) */}
                      <a
                        href={countryCode === 'IN' ? `/child/${activeChild.id}/roadmap` : undefined}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border border-[#D5DFD0] bg-white transition-all duration-300 ${
                          countryCode === 'IN' ? 'hover:shadow-sm cursor-pointer' : 'opacity-85 cursor-not-allowed'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shadow-sm flex-none ${
                          countryCode === 'IN' ? 'bg-[#E8F5E9] text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`text-xs font-bold leading-tight mb-0.5 ${
                              countryCode === 'IN' ? 'text-slate-900' : 'text-slate-400'
                            }`}>
                              Career roadmap
                            </h4>
                            {countryCode !== 'IN' && (
                              <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border border-slate-200 text-[7px] font-extrabold tracking-wide px-1.5 py-0 rounded">
                                COMING SOON
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-500 text-[9px] leading-relaxed font-semibold">
                            {countryCode === 'IN' 
                              ? `Open the class-wise roadmap for ${activeChild.displayName}'s chosen direction.` 
                              : 'This feature is currently available in limited regions.'}
                          </p>
                        </div>
                      </a>

                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INSIGHTS */}
              {selectedTab === 'insights' && activeChild && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  {overviewLoading ? (
                    <div className="py-16 text-center">
                      <Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mx-auto mb-2" />
                      <p className="text-[#607060] font-semibold text-[10px]">Crunching stats...</p>
                    </div>
                  ) : (
                    <>
                      {/* TROPHY CABINET */}
                      {activeChildOverview?.insights?.sparks && activeChildOverview.insights.sparks.length > 0 && (
                        <div className="bg-white border border-[#D5DFD0] rounded-[24px] p-4 shadow-sm">
                          <h3 className="text-[10px] font-bold tracking-wider text-[#607060] uppercase mb-3">Spark Trophy Cabinet</h3>
                          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                            {activeChildOverview.insights.sparks.map((spark) => {
                              const level = getBadgeLevel(spark);
                              const style = getBadgeStyle(level);
                              return (
                                <div
                                  key={spark.id}
                                  className={`flex-none w-24 p-2.5 border rounded-lg flex flex-col items-center text-center transition-all bg-gradient-to-br ${style.gradient} hover:scale-105`}
                                >
                                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-inner mb-1 border border-slate-200/50">
                                    <Award className={`w-4 h-4 ${style.textColor}`} />
                                  </div>
                                  <h4 className="text-slate-800 text-[8px] font-extrabold leading-tight mb-1 max-w-[80px] truncate-2-lines">
                                    {spark.title}
                                  </h4>
                                  <Badge className={`text-[6px] font-extrabold tracking-wider border rounded-full px-1 py-0 px-0.5 ${style.pillBg}`}>
                                    {style.levelName}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* INTEREST RADAR */}
                      <div className="bg-white border border-[#D5DFD0] rounded-[24px] p-4 shadow-sm">
                        <h3 className="text-[10px] font-bold tracking-wider text-[#607060] uppercase mb-2">Interest Profile</h3>
                        <div className="w-full flex items-center justify-center">
                          <ResponsiveContainer width="100%" height={150}>
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                              <PolarGrid stroke="#f1f5f9" />
                              <PolarAngleAxis dataKey="label" tick={{ fill: '#475569', fontSize: 8, fontWeight: 700 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={6} tick={{ fill: '#94a3b8', fontSize: 6 }} />
                              <Radar name="Discovery" dataKey="value" stroke="#2D6A4F" fill="#D8EADB" fillOpacity={0.4} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* ENGAGEMENT TIMELINE */}
                      <div className="bg-white border border-[#D5DFD0] rounded-[24px] p-4 shadow-sm">
                        <h3 className="text-[10px] font-bold tracking-wider text-[#607060] uppercase mb-2">Engagement</h3>
                        <div className="w-full">
                          {timelineData.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-[10px] font-semibold">
                              No completions recorded
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height={120}>
                              <AreaChart data={timelineData}>
                                <defs>
                                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 7 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 7 }} domain={[0, 'auto']} />
                                <ChartTooltip />
                                <Area type="monotone" dataKey="completions" stroke="#2D6A4F" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCompletions)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>

                    </>
                  )}
                </div>
              )}

            </>
          )}
        </div>

        {/* Floating Mobile Bottom Navigation Bar (pinned relative inside device simulator) */}
        {hasChildren && activeChild && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-[#D5DFD0] shadow-[0_6px_20px_rgb(0,0,0,0.05)] rounded-[20px] py-1.5 px-2 flex items-center justify-around">
            <button
              onClick={() => handleTabChange('home')}
              className={`flex flex-col items-center gap-0.5 flex-1 transition-all ${
                selectedTab === 'home' ? 'text-[#2D6A4F] scale-105' : 'text-[#607060]'
              }`}
            >
              <Home className="w-4.5 h-4.5" />
              <span className="text-[8px] font-extrabold tracking-tight">Home</span>
            </button>
            <button
              onClick={() => handleTabChange('planning')}
              className={`flex flex-col items-center gap-0.5 flex-1 transition-all ${
                selectedTab === 'planning' ? 'text-[#2D6A4F] scale-105' : 'text-[#607060]'
              }`}
            >
              <Compass className="w-4.5 h-4.5" />
              <span className="text-[8px] font-extrabold tracking-tight">Planning</span>
            </button>
            <button
              onClick={() => handleTabChange('insights')}
              className={`flex flex-col items-center gap-0.5 flex-1 transition-all ${
                selectedTab === 'insights' ? 'text-[#2D6A4F] scale-105' : 'text-[#607060]'
              }`}
            >
              <BarChart className="w-4.5 h-4.5" />
              <span className="text-[8px] font-extrabold tracking-tight">Insights</span>
            </button>
            <button
              onClick={() => setShowManageProfiles(true)}
              className="flex flex-col items-center gap-0.5 flex-1 text-[#607060] transition-all"
            >
              <User className="w-4.5 h-4.5" />
              <span className="text-[8px] font-extrabold tracking-tight">Profile</span>
            </button>
          </div>
        )}

        {/* Device Home Indicator mockup */}
        <div className="hidden sm:block absolute bottom-1.5 left-0 right-0 z-30 text-center">
          <div className="w-20 h-1 bg-slate-950/80 rounded-full mx-auto" />
        </div>

      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 leading-none">Add New Child</h2>
              <button
                onClick={() => setShowAddChild(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none focus:outline-none"
              >
                ×
              </button>
            </div>
            <ChildForm 
              onChildAdded={handleChildAdded}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Manage Profiles Modal */}
      {showManageProfiles && profile?.children && (
        <ChildManagement
          children={profile.children}
          onChildUpdated={handleChildUpdated}
          onClose={() => setShowManageProfiles(false)}
        />
      )}

      {/* Premium Outer Floating Sign Out Button */}
      <button 
        onClick={() => {
          logout().then(() => {
            toast.success("Signed out successfully");
            navigate("/");
          });
        }}
        className="hidden sm:flex absolute top-4 right-4 bg-[#2D6A4F] hover:bg-rose-700 hover:scale-105 border border-[#23533E] shadow-md hover:shadow-lg rounded-full px-4.5 py-2 items-center gap-1.5 transition-all text-white font-extrabold text-[10px] tracking-wider uppercase cursor-pointer z-50"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default Dashboard;
