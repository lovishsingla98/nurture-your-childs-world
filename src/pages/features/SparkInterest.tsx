import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import type { SparkInterest as SparkInterestType } from '@/lib/types';
import { popularCareers, getCareerById } from '@/lib/careerOptions';
import { Sparkles, Target, Save, Loader2 } from 'lucide-react';

const SparkInterest: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { getValidToken } = useAuth();
  const [sparkData, setSparkData] = useState<SparkInterestType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('');

  const fetchSparkInterest = async () => {
    try { setLoading(true); await getValidToken();
      const r = await apiClient.getSparkInterest(childId!);
      if (r.success && r.data) {
        setSparkData(r.data);
        if (r.data.data.selectedCareer) setSelectedCareerPath(r.data.data.selectedCareer.id);
        if (r.data.data.customGoal) setCustomGoal(r.data.data.customGoal);
      }
    } catch(e:any) { toast.error('Failed to load career focus'); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!selectedCareerPath && !customGoal.trim()) { toast.error('Please select a career or enter a custom goal'); return; }
    if (customGoal.trim() && customGoal.trim().length < 10) { toast.error('Custom goal must be at least 10 characters'); return; }
    try { setSaving(true); await getValidToken();
      const data: { selectedCareerId?: string; customGoal?: string } = {};
      if (selectedCareerPath) data.selectedCareerId = selectedCareerPath;
      if (customGoal.trim() && customGoal.trim().length >= 10) data.customGoal = customGoal.trim();
      const r = await apiClient.createSparkInterest(childId!, data);
      if (r.success && r.data) {
        setSparkData(r.data);
        if (r.data.data.selectedCareer) setSelectedCareerPath(r.data.data.selectedCareer.id);
        if (r.data.data.customGoal) setCustomGoal(r.data.data.customGoal);
        toast.success('Career focus updated!');
      } else toast.error(r.error || 'Failed to save');
    } catch(e:any) { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  useEffect(() => { if (childId) fetchSparkInterest(); }, [childId]);

  return (
    <MobileSimulatorLayout title="Spark Interest" subtitle="Set a career direction or goal" backUrl={`/child/${childId}`} onRefresh={fetchSparkInterest}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" /><p className="text-[#607060] text-[10px] font-semibold">Loading career focus...</p></div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5"><div className="p-1.5 bg-purple-50 rounded-lg flex-none"><Sparkles className="w-3.5 h-3.5 text-purple-600" /></div><span className="text-[9px] font-semibold text-[#607060]">Career Focus</span></div>
              <Badge className="bg-emerald-100 text-emerald-700 border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full">Active</Badge>
            </div>
            <h2 className="text-sm font-extrabold text-[#18211A] mb-1 leading-tight">Spark an Interest</h2>
            <p className="text-[9px] text-[#607060] leading-relaxed font-semibold">Choose a career path to focus on, or set a custom learning goal.</p>
          </div>

          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <h3 className="text-[10px] font-bold text-[#18211A] mb-2 flex items-center gap-1"><Target className="w-3.5 h-3.5 text-purple-600" />Choose Career Focus</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[8px] font-bold text-[#607060] mb-1 block uppercase">Popular Career Paths</label>
                <Select value={selectedCareerPath} onValueChange={setSelectedCareerPath}>
                  <SelectTrigger className="text-[10px] border-[#D5DFD0] rounded-xl h-auto py-2"><SelectValue placeholder="Select a career..." /></SelectTrigger>
                  <SelectContent>{popularCareers.map(c => <SelectItem key={c.id} value={c.id}><div className="flex items-center gap-1"><span className="text-[10px]">{c.name}</span><Badge className="text-[6px] bg-slate-100 text-slate-600 border-transparent px-1 py-0 rounded">{c.category}</Badge></div></SelectItem>)}</SelectContent>
                </Select>
                {selectedCareerPath && (() => { const c = getCareerById(selectedCareerPath); return c ? (
                  <div className="mt-2 p-2.5 bg-purple-50 border border-purple-100 rounded-xl">
                    <p className="text-[8px] text-slate-700 mb-1.5">{c.description}</p>
                    <div className="flex flex-wrap gap-1">{c.skills.map((s,i) => <Badge key={i} className="bg-white text-purple-700 border-transparent text-[7px] px-1.5 py-0 rounded-full">{s}</Badge>)}</div>
                  </div>
                ) : null; })()}
              </div>

              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#D5DFD0]" /></div><div className="relative flex justify-center text-[8px]"><span className="bg-white px-2 text-slate-400 font-bold">OR</span></div></div>

              <div>
                <label className="text-[8px] font-bold text-[#607060] mb-1 block uppercase">Custom Learning Goal</label>
                <Textarea placeholder="Describe skills or interests to develop..." value={customGoal} onChange={e => setCustomGoal(e.target.value)} rows={2} className="resize-none text-[10px] border-[#D5DFD0] bg-[#F5F7F2] rounded-xl focus:border-[#2D6A4F]" />
                {customGoal && <p className="text-[7px] text-slate-400 mt-0.5">{customGoal.length}/10 min {customGoal.length < 10 && <span className="text-red-500">(need {10-customGoal.length} more)</span>}</p>}
              </div>

              <Button onClick={handleSave} disabled={saving || (!selectedCareerPath && !customGoal.trim())} className="w-full bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold py-2 rounded-full text-[10px]">
                {saving ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Saving...</> : <><Save className="w-3 h-3 mr-1" />Set Focus</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileSimulatorLayout>
  );
};

export default SparkInterest;
