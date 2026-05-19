import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { DashboardData } from '@/lib/types';
import { Calendar, HelpCircle, TrendingUp, Brain, BookOpen, CheckCircle, AlertCircle, Clock, Star, Loader2 } from 'lucide-react';

interface FeatureStatus { id: string; name: string; description: string; icon: React.ReactNode; status: string; priority: string; lastCompleted?: string; streak?: number; }

const ChildDashboard: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user, getValidToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';
    const diffH = Math.floor((Date.now() - new Date(dateString).getTime()) / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    if (diffH < 48) return 'Yesterday';
    return `${Math.floor(diffH / 24)}d ago`;
  };

  const calculateWeeklyProgress = (): number => {
    if (!dashboardData) return 0;
    const currentStreak = dashboardData.child.streak.current || 0;
    const daysPassedInWeek = Math.min(new Date().getDay() + 1, 7);
    return Math.round((Math.min(currentStreak, daysPassedInWeek) / 7) * 100);
  };

  const getFeatures = (): FeatureStatus[] => {
    if (!dashboardData) return [];
    const { activities } = dashboardData;
    const hasReal = activities.dailyTask.streak !== undefined || activities.weeklyInterest.lastCompleted !== undefined;
    return [
      { id: 'daily-task', name: 'Daily Task', description: "Today's personalized activity", icon: <Calendar className="w-4 h-4" />, status: activities.dailyTask.status, priority: activities.dailyTask.priority, streak: activities.dailyTask.streak, lastCompleted: activities.dailyTask.lastCompleted ? formatRelativeTime(activities.dailyTask.lastCompleted) : (hasReal ? 'Not yet' : '') },
      { id: 'weekly-interest', name: 'Weekly Interest', description: 'Discover curiosity areas', icon: <HelpCircle className="w-4 h-4" />, status: activities.weeklyInterest.status, priority: activities.weeklyInterest.priority, lastCompleted: activities.weeklyInterest.lastCompleted ? formatRelativeTime(activities.weeklyInterest.lastCompleted) : (hasReal ? 'Not yet' : '') },
      { id: 'weekly-potential', name: 'Weekly Potential', description: 'Assess natural strengths', icon: <TrendingUp className="w-4 h-4" />, status: activities.weeklyPotential.status, priority: activities.weeklyPotential.priority, lastCompleted: activities.weeklyPotential.lastCompleted ? formatRelativeTime(activities.weeklyPotential.lastCompleted) : (hasReal ? 'Not yet' : '') },
      { id: 'weekly-quiz', name: 'Weekly Quiz', description: 'Review & reinforce learning', icon: <Brain className="w-4 h-4" />, status: activities.weeklyQuiz.status, priority: activities.weeklyQuiz.priority, lastCompleted: activities.weeklyQuiz.lastCompleted ? formatRelativeTime(activities.weeklyQuiz.lastCompleted) : (hasReal ? 'Not yet' : '') },
      { id: 'moral-story', name: 'Moral Story', description: 'Values-building stories', icon: <BookOpen className="w-4 h-4" />, status: (activities as any).moralStory?.status || 'available', priority: 'medium', lastCompleted: (activities as any).moralStory?.lastCompleted ? formatRelativeTime((activities as any).moralStory.lastCompleted) : (hasReal ? 'Not yet' : '') }
    ];
  };

  const fetchDashboardData = async () => {
    try { setLoading(true); setError(null); await getValidToken();
      const r = await apiClient.getChildDashboardData(childId!);
      if (r.success && r.data) { setDashboardData(r.data); return; }
      const pr = await apiClient.getUserProfile();
      if (pr.success && pr.data?.children) {
        const c = pr.data.children.find((c:any) => c.id === childId);
        if (c) { setDashboardData({ child: { id:c.id, displayName:c.displayName, age:c.age, gender:c.gender||'unknown', imageURL:c.imageURL, streak:{current:0,longest:0,lastActivityDate:undefined} }, activities:{ dailyTask:{status:'available',priority:'high'}, weeklyInterest:{status:'available',priority:'medium'}, weeklyPotential:{status:'available',priority:'medium'}, weeklyQuiz:{status:'available',priority:'medium'}, careerInsights:{status:'available',priority:'low'}, sparkInterest:{status:'available',priority:'low'} } }); return; }
      }
      setError('Unable to load child data');
    } catch(e:any) {
      try { const pr = await apiClient.getUserProfile();
        if (pr.success && pr.data?.children) { const c = pr.data.children.find((c:any) => c.id === childId);
          if (c) { setDashboardData({ child: { id:c.id, displayName:c.displayName, age:c.age, gender:c.gender||'unknown', imageURL:c.imageURL, streak:{current:0,longest:0,lastActivityDate:undefined} }, activities:{ dailyTask:{status:'available',priority:'high'}, weeklyInterest:{status:'available',priority:'medium'}, weeklyPotential:{status:'available',priority:'medium'}, weeklyQuiz:{status:'available',priority:'medium'}, careerInsights:{status:'available',priority:'low'}, sparkInterest:{status:'available',priority:'low'} } }); return; }
        }
      } catch(fe) {}
      setError('Unable to load child data');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user && childId) fetchDashboardData(); }, [user, childId]);

  const statusColor = (s:string) => s==='completed'?'bg-emerald-100 text-emerald-700':s==='pending'?'bg-orange-100 text-orange-700':s==='coming-soon'?'bg-slate-100 text-slate-500':'bg-blue-100 text-blue-700';
  const statusIcon = (s:string) => s==='completed'?<CheckCircle className="w-2.5 h-2.5"/>:s==='pending'?<AlertCircle className="w-2.5 h-2.5"/>:<Clock className="w-2.5 h-2.5"/>;
  const features = getFeatures();

  return (
    <MobileSimulatorLayout title={dashboardData?.child.displayName || 'Child Dashboard'} subtitle="Activities & progress" backUrl="/dashboard" onRefresh={fetchDashboardData}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" /><p className="text-[#607060] text-[10px] font-semibold">Loading dashboard...</p></div>
      ) : error && !dashboardData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center"><AlertCircle className="w-10 h-10 text-red-300 mb-3" /><h3 className="text-xs font-bold text-red-700 mb-1">Unable to Load</h3><p className="text-[9px] text-[#607060] mb-3">{error}</p><Button onClick={() => navigate('/dashboard')} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-4 py-1.5 rounded-full text-[10px]">Back to Dashboard</Button></div>
      ) : dashboardData ? (
        <div className="space-y-3">
          {/* Profile Card */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12 border-2 border-[#D5DFD0]"><AvatarImage src={dashboardData.child.imageURL} /><AvatarFallback className="bg-[#D8EADB] text-[#2D6A4F] text-sm font-extrabold">{dashboardData.child.displayName.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-extrabold text-[#18211A] truncate">{dashboardData.child.displayName}</h2>
                <div className="flex items-center gap-2 text-[8px] text-[#607060] font-semibold"><span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />{dashboardData.child.age} years</span><span className="capitalize">{dashboardData.child.gender}</span></div>
              </div>
              <Badge className="bg-[#EAF0E6] text-[#2D6A4F] border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full">{dashboardData.child.streak.current > 0 ? 'Active' : 'New'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1"><span className="text-[7px] text-[#607060] font-semibold block mb-0.5">Weekly Progress</span><Progress value={calculateWeeklyProgress()} className="h-1.5" /></div>
              <div className="ml-4 text-right"><span className="text-[7px] text-[#607060] font-semibold block">Streak</span><span className="text-sm font-extrabold text-[#2D6A4F]">{dashboardData.child.streak.current > 0 ? `${dashboardData.child.streak.current}d` : '—'}</span></div>
            </div>
          </div>

          {/* Features */}
          <h3 className="text-[10px] font-bold text-[#607060] uppercase tracking-wider">Activities</h3>
          <div className="space-y-2">
            {features.map(f => (
              f.status === 'coming-soon' ? (
                <div key={f.id} className="bg-white/60 border border-[#D5DFD0] rounded-2xl p-3 opacity-60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-400 flex-none">{f.icon}</div>
                    <div className="flex-1 min-w-0"><h4 className="text-[10px] font-bold text-slate-500 truncate">{f.name}</h4><p className="text-[8px] text-slate-400">{f.description}</p></div>
                    <Badge className="bg-slate-100 text-slate-400 border-transparent text-[6px] font-bold px-1.5 py-0 rounded-full">SOON</Badge>
                  </div>
                </div>
              ) : (
                <Link key={f.id} to={`/child/${childId}/${f.id}`} className="block">
                  <div className={`bg-white border border-[#D5DFD0] rounded-2xl p-3 shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${f.status === 'pending' ? 'ring-1 ring-orange-200' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl flex-none ${f.status==='completed'?'bg-emerald-50 text-emerald-600':f.status==='pending'?'bg-orange-50 text-orange-600':'bg-[#D8EADB] text-[#2D6A4F]'}`}>{f.icon}</div>
                      <div className="flex-1 min-w-0"><h4 className="text-[10px] font-bold text-[#18211A] truncate">{f.name}</h4><p className="text-[8px] text-[#607060] font-semibold">{f.description}</p>{f.lastCompleted && <p className="text-[7px] text-slate-400 mt-0.5">{f.lastCompleted}</p>}{f.streak && f.status === 'pending' && <p className="text-[7px] text-orange-600 font-bold">🔥 {f.streak}d streak</p>}</div>
                      <Badge className={`${statusColor(f.status)} border-transparent text-[6px] font-extrabold px-1.5 py-0 rounded-full flex items-center gap-0.5`}>{statusIcon(f.status)}{f.status}</Badge>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      ) : null}
    </MobileSimulatorLayout>
  );
};

export default ChildDashboard;
