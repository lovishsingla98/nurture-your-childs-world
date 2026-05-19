import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Target, TrendingUp, Star, Brain, Heart, Lightbulb, Users, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

interface CareerMatch { name: string; matchPercentage: number; category: string; description: string; keyStrengths: string[]; developmentAreas: string[]; nextSteps: string[]; }
interface CareerInsightsData { insightId: string; date: string; childId: string; parentId: string; generatedAt: string; childAge: number; topMatches: CareerMatch[]; overallProfile: { dominantInterests: string[]; strongestSkills: string[]; learningStyle: string; personalityTraits: string[]; }; recommendations: string[]; status: string; refreshAvailable?: boolean; nextRefreshAvailableOn?: number; }

const CareerInsights: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { getValidToken } = useAuth();
  const [insightsData, setInsightsData] = useState<CareerInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [childName, setChildName] = useState('');

  const fetchCareerInsights = async () => {
    try { setLoading(true); await getValidToken();
      const r = await apiClient.getCareerInsights(childId!);
      if (r.success && r.data) { const raw = r.data as any; const p = raw?.data || {};
        setInsightsData({ insightId: raw?.insightId||'', date: raw?.date||'', childId: raw?.childId||'', parentId: raw?.parentId||'', generatedAt: raw?.generatedAt||new Date().toISOString(), childAge: p?.childAge??0, topMatches: p?.topMatches||[], overallProfile: { dominantInterests: p?.overallProfile?.dominantInterests||[], strongestSkills: p?.overallProfile?.strongestSkills||[], learningStyle: p?.overallProfile?.learningStyle||'', personalityTraits: p?.overallProfile?.personalityTraits||[] }, recommendations: p?.recommendations||[], status: p?.status||'loading', refreshAvailable: p?.refreshAvailable??true, nextRefreshAvailableOn: p?.nextRefreshAvailableOn });
      } else if (r.success) { setInsightsData({ insightId:'', date:'', childId:childId||'', parentId:'', generatedAt:new Date().toISOString(), childAge:0, topMatches:[], overallProfile:{dominantInterests:[],strongestSkills:[],learningStyle:'',personalityTraits:[]}, recommendations:[], status:'loading', refreshAvailable:true }); }
      else toast.error('Failed to load career insights');
      // Check activity data for banner
      const ad = await apiClient.getChildDashboardData(childId!);
      if (ad.success && ad.data) { setChildName(ad.data.child?.displayName||''); const a=ad.data.activities; setShowBanner(!(a.dailyTask.streak>=7 && a.weeklyInterest.lastCompleted && a.weeklyPotential.lastCompleted && a.weeklyQuiz.lastCompleted)); }
    } catch(e:any) { toast.error('Failed to load insights'); } finally { setLoading(false); }
  };

  const handleRegenerate = async () => {
    try { setRegenerating(true); await getValidToken(); const r = await apiClient.regenerateCareerInsights(childId!);
      if (r.success) { toast.success('Insights updated!'); fetchCareerInsights(); } else toast.error('Failed to update');
    } catch(e) { toast.error('Failed to update'); } finally { setRegenerating(false); }
  };

  useEffect(() => { if (childId) fetchCareerInsights(); }, [childId]);

  const catColor = (c:string) => ({ 'STEM & Technology':'bg-blue-50 text-blue-700', 'Design & Construction':'bg-purple-50 text-purple-700', 'Research & Discovery':'bg-green-50 text-green-700', 'Arts & Creativity':'bg-pink-50 text-pink-700', 'Leadership & Management':'bg-orange-50 text-orange-700' }[c] || 'bg-slate-50 text-slate-700');

  return (
    <MobileSimulatorLayout title="Career Insights" subtitle="Patterns, strengths & next steps" backUrl={`/child/${childId}`} onRefresh={fetchCareerInsights}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" /><p className="text-[#607060] text-[10px] font-semibold">Analyzing insights...</p></div>
      ) : !insightsData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center"><Target className="w-10 h-10 text-slate-300 mb-3" /><h3 className="text-xs font-bold text-slate-700 mb-1">Unable to Load</h3><Button onClick={fetchCareerInsights} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-4 py-1.5 rounded-full text-[10px]"><RefreshCw className="w-3 h-3 mr-1" />Try Again</Button></div>
      ) : (
        <div className="space-y-3">
          {showBanner && <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3"><div className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-none" /><div><h3 className="text-[9px] font-bold text-orange-800 mb-0.5">More Data Needed</h3><p className="text-[8px] text-orange-700">Complete more tasks for sharper insights{childName ? ` for ${childName}` : ''}.</p></div></div></div>}

          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2"><div className="flex items-center gap-1.5"><div className="p-1.5 bg-amber-50 rounded-lg flex-none"><Target className="w-3.5 h-3.5 text-amber-600" /></div><span className="text-[9px] font-semibold text-[#607060]">Career Insights</span></div><Badge className="bg-slate-100 text-slate-600 border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full">Age {insightsData.childAge||'N/A'}</Badge></div>
            <h2 className="text-sm font-extrabold text-[#18211A] mb-1 leading-tight">Future Possibilities</h2>
            <p className="text-[9px] text-[#607060] leading-relaxed font-semibold mb-2">{!insightsData.topMatches?.length ? 'Generate insights to discover career paths.' : 'Based on interests, strengths, and patterns.'}</p>
            <div className="flex items-center justify-between"><span className="text-[7px] text-[#607060]">Updated: {new Date(insightsData.generatedAt).toLocaleDateString()}</span><Button onClick={handleRegenerate} disabled={regenerating||!insightsData.refreshAvailable} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white text-[8px] px-2.5 py-1 rounded-full h-auto font-bold">{regenerating?<Loader2 className="w-3 h-3 animate-spin mr-1"/>:<RefreshCw className="w-3 h-3 mr-1"/>}{regenerating?'Updating...':!insightsData.topMatches?.length?'Generate':'Update'}</Button></div>
          </div>

          {!insightsData.topMatches?.length ? (
            <div className="bg-[#EAF0E6] border border-[#D5DFD0] rounded-2xl p-4 text-center"><Target className="w-8 h-8 text-amber-500 mx-auto mb-2" /><h3 className="text-xs font-bold text-[#18211A] mb-1">No Insights Yet</h3><p className="text-[8px] text-[#607060] max-w-[200px] mx-auto mb-3">Click Generate above to discover career paths.</p></div>
          ) : (<>
            <h3 className="text-[10px] font-bold text-[#607060] uppercase tracking-wider flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />Top Career Matches</h3>
            {insightsData.topMatches.map((c,i)=>(
              <div key={i} className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center gap-2 mb-2"><div className="text-center flex-none"><div className="text-sm font-extrabold text-amber-600">{c.matchPercentage}%</div><div className="text-[7px] text-slate-400">Match</div></div><div className="flex-1 min-w-0"><h4 className="text-[11px] font-bold text-[#18211A] truncate">{c.name}</h4><Badge className={`${catColor(c.category)} border-transparent text-[7px] font-bold px-1.5 py-0 rounded-full`}>{c.category}</Badge></div><Progress value={c.matchPercentage} className="w-12 h-1.5"/></div>
                <p className="text-[8px] text-[#607060] leading-relaxed mb-2">{c.description}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><h5 className="text-[7px] font-bold text-emerald-700 mb-1"><TrendingUp className="w-2.5 h-2.5 inline mr-0.5"/>Strengths</h5>{c.keyStrengths.map((s,j)=><p key={j} className="text-[7px] text-slate-600">• {s}</p>)}</div>
                  <div><h5 className="text-[7px] font-bold text-blue-700 mb-1"><Brain className="w-2.5 h-2.5 inline mr-0.5"/>Develop</h5>{c.developmentAreas.map((a,j)=><p key={j} className="text-[7px] text-slate-600">• {a}</p>)}</div>
                  <div><h5 className="text-[7px] font-bold text-purple-700 mb-1"><Lightbulb className="w-2.5 h-2.5 inline mr-0.5"/>Next</h5>{c.nextSteps.map((s,j)=><p key={j} className="text-[7px] text-slate-600">• {s}</p>)}</div>
                </div>
              </div>
            ))}
            {/* Profile */}
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-[10px] font-bold text-[#18211A] mb-2 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-600"/>Learning Profile</h3>
              <div className="space-y-2">
                {insightsData.overallProfile.dominantInterests.length>0&&<div><span className="text-[7px] font-bold text-slate-500 uppercase">Interests</span><div className="flex flex-wrap gap-1 mt-0.5">{insightsData.overallProfile.dominantInterests.map((v,j)=><Badge key={j} className="bg-amber-50 text-amber-700 border-transparent text-[7px] px-1.5 py-0 rounded-full">{v}</Badge>)}</div></div>}
                {insightsData.overallProfile.strongestSkills.length>0&&<div><span className="text-[7px] font-bold text-slate-500 uppercase">Skills</span><div className="flex flex-wrap gap-1 mt-0.5">{insightsData.overallProfile.strongestSkills.map((v,j)=><Badge key={j} className="bg-emerald-50 text-emerald-700 border-transparent text-[7px] px-1.5 py-0 rounded-full">{v}</Badge>)}</div></div>}
                {insightsData.overallProfile.learningStyle&&<div><span className="text-[7px] font-bold text-slate-500 uppercase">Learning Style</span><p className="text-[8px] text-[#607060] bg-blue-50 rounded-lg p-1.5 mt-0.5">{insightsData.overallProfile.learningStyle}</p></div>}
              </div>
            </div>
            {/* Recommendations */}
            {insightsData.recommendations.length>0&&<div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm"><h3 className="text-[10px] font-bold text-[#18211A] mb-2 flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-500"/>Recommendations</h3><div className="space-y-1.5">{insightsData.recommendations.map((r,i)=><div key={i} className="flex items-start gap-2 p-2 bg-[#F5F7F2] rounded-xl"><span className="flex-none w-4 h-4 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-[7px] font-extrabold">{i+1}</span><span className="text-[8px] text-[#607060] leading-relaxed">{r}</span></div>)}</div></div>}
          </>)}
        </div>
      )}
    </MobileSimulatorLayout>
  );
};
export default CareerInsights;
