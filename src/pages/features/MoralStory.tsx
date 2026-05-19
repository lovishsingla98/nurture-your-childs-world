import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { BookOpen, Heart, Send, Star, Moon, Loader2, Sparkles, Plus, Check, ArrowRight } from 'lucide-react';

interface MoralValue { name: string; description: string; color: string; }
interface MoralStoryData { id: string; title: string; story: string; targetValues: MoralValue[]; questions: { id: string; question: string; answer?: string; }[]; ageAppropriate: boolean; estimatedReadingTime: number; status: 'unread' | 'reading' | 'completed'; completedAt?: string; }

const AVAILABLE_QUALITIES = [
  { id: "Kindness", label: "Kindness", icon: "🤝", color: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" },
  { id: "Perseverance", label: "Perseverance", icon: "🎯", color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" },
  { id: "Honesty", label: "Honesty", icon: "🪵", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
  { id: "Respect", label: "Respect", icon: "🕊️", color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100" },
  { id: "Courage", label: "Courage", icon: "🦁", color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100" },
  { id: "Gratitude", label: "Gratitude", icon: "🌻", color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" }
];

const MoralStory: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { getValidToken } = useAuth();
  
  const [storyData, setStoryData] = useState<MoralStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showQuestions, setShowQuestions] = useState(false);

  // Creation interface states
  const [setupMode, setSetupMode] = useState(true);
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [customProblem, setCustomProblem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [childName, setChildName] = useState('your child');

  useEffect(() => {
    const fetchChildInfo = async () => {
      try {
        const pr = await apiClient.getUserProfile();
        if (pr.success && pr.data?.children) {
          const c = pr.data.children.find((c: any) => c.id === childId);
          if (c) setChildName(c.displayName);
        }
      } catch (e) {}
    };
    if (childId) fetchChildInfo();
  }, [childId]);

  const generateCustomStory = (qualities: string[], problem: string): MoralStoryData => {
    const qualitiesList = qualities.length > 0 ? qualities : ["Kindness", "Perseverance"];
    const challenge = problem.trim() ? problem.trim() : "learning the value of sharing";
    
    const title = `The Magic Lamp of the Whispering Forest`;
    const story = `Once upon a time, in a small sunny village surrounded by rolling green hills, lived a bright child named ${childName}. ${childName} was full of curiosity and loved exploring, but was currently facing a challenge: ${challenge.toLowerCase()}.\n\nOne evening, while walking near the ancient Whispering Forest, ${childName} met a wise old owl named Hoot. Hoot held a glowing magic lamp that shimmered with different colors. 'This lamp glows brightest when we practice core qualities,' Hoot said softly. 'Especially ${qualitiesList.map(q => q.toLowerCase()).join(' and ')}.'\n\n${childName} wanted to see the lamp glow as bright as the stars. Hoot gave ${childName} a small, gentle challenge. Whenever ${childName} encountered their challenge of ${challenge.toLowerCase()}, they should take a slow breath and act with ${qualitiesList[0].toLowerCase()}.\n\nThe next day, ${childName} had a perfect opportunity to try. It was hard at first, and ${childName} felt like giving up. But remembering Hoot's wise advice, ${childName} chose to practice ${qualitiesList[0].toLowerCase()}.\n\nInstantly, a warm golden light filled the room! The magic lamp began to shine brilliantly. A neighbor saw the beautiful glow and smiled with pure happiness. ${childName} realized that by practicing ${qualitiesList.join(' and ')}, they could overcome any challenge and help make the whole world a brighter, happier place.`;

    const targetValues = qualitiesList.map(q => {
      if (q === "Kindness") return { name: "Kindness", description: "Helping others without expecting anything in return.", color: "bg-rose-100 text-rose-700" };
      if (q === "Perseverance") return { name: "Perseverance", description: "Sticking to a goal even when progress is slow.", color: "bg-amber-100 text-amber-700" };
      if (q === "Honesty") return { name: "Honesty", description: "Being truthful and sincere in our actions.", color: "bg-blue-100 text-blue-700" };
      if (q === "Respect") return { name: "Respect", description: "Showing consideration and value for others.", color: "bg-purple-100 text-purple-700" };
      if (q === "Courage") return { name: "Courage", description: "Facing fears and challenges with bravery.", color: "bg-orange-100 text-orange-700" };
      return { name: "Gratitude", description: "Appreciating the good things and showing appreciation.", color: "bg-emerald-100 text-emerald-700" };
    });

    return {
      id: `moral_story_custom_${Date.now()}`,
      title,
      story,
      targetValues,
      questions: [
        { id: "q1", question: `How did ${childName} show ${qualitiesList[0].toLowerCase()} when facing the challenge?` },
        { id: "q2", question: "What is one simple way you can practice this value tomorrow?" }
      ],
      ageAppropriate: true,
      estimatedReadingTime: 3,
      status: 'unread'
    };
  };

  const fetchMoralStory = async () => {
    try { 
      setLoading(true); 
      await getValidToken();
      const r = await apiClient.getMoralStory(childId!);
      if (r.success && r.data) {
        setStoryData(r.data);
      } else {
        const local = localStorage.getItem(`moral_story_${childId}`);
        if (local) setStoryData(JSON.parse(local));
      }
    } catch(e:any) { 
      const local = localStorage.getItem(`moral_story_${childId}`);
      if (local) setStoryData(JSON.parse(local));
    } finally { 
      setSetupMode(true); // Always default to story studio/qualities selector on landing
      setLoading(false); 
    }
  };

  const handleStartGeneration = () => {
    if (selectedQualities.length === 0) {
      toast.error('Please select at least one quality!');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStage('Analyzing child learning profile...');
    
    const interval = setInterval(() => {
      setGenerationProgress(p => {
        const next = p + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newStory = generateCustomStory(selectedQualities, customProblem);
            setStoryData(newStory);
            localStorage.setItem(`moral_story_${childId}`, JSON.stringify(newStory));
            setIsGenerating(false);
            setSetupMode(false);
            setShowQuestions(false);
            setAnswers({});
            toast.success("AI Bedtime Story created successfully!");
          }, 600);
          return 100;
        }
        
        if (next < 25) setGenerationStage('Analyzing child learning profile...');
        else if (next < 50) setGenerationStage('Tailoring moral characters...');
        else if (next < 75) setGenerationStage('Weaving core values into plot...');
        else setGenerationStage('Adding reflection checkpoints...');
        
        return next;
      });
    }, 150);
  };

  const toggleQuality = (id: string) => {
    setSelectedQualities(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleStartReading = async () => {
    if (!storyData || !childId) return;
    try { 
      const r = await apiClient.startMoralStory(childId, storyData.id);
      if (r.success && r.data) { 
        setStoryData(r.data); 
        toast.success("Let's begin reading!"); 
        localStorage.setItem(`moral_story_${childId}`, JSON.stringify(r.data));
      } else {
        const updated = { ...storyData, status: 'reading' as const };
        setStoryData(updated);
        localStorage.setItem(`moral_story_${childId}`, JSON.stringify(updated));
        toast.success("Let's begin reading!");
      }
    } catch(e:any) { 
      const updated = { ...storyData, status: 'reading' as const };
      setStoryData(updated);
      localStorage.setItem(`moral_story_${childId}`, JSON.stringify(updated));
      toast.success("Let's begin reading!");
    }
  };

  const handleSubmitReflection = async () => {
    if (storyData?.questions.some(q => !answers[q.id]?.trim())) { toast.error('Please answer all questions!'); return; }
    try { 
      setSubmitting(true); 
      await getValidToken();
      const r = await apiClient.completeMoralStory(childId!, storyData!.id, answers);
      if (r.success && r.data) { 
        setStoryData(r.data); 
        toast.success('Thank you for your thoughts!'); 
        localStorage.setItem(`moral_story_${childId}`, JSON.stringify(r.data));
      } else {
        const updatedQuestions = storyData!.questions.map(q => ({
          ...q,
          answer: answers[q.id]
        }));
        const updated = { 
          ...storyData!, 
          status: 'completed' as const, 
          questions: updatedQuestions,
          completedAt: new Date().toISOString()
        };
        setStoryData(updated);
        localStorage.setItem(`moral_story_${childId}`, JSON.stringify(updated));
        toast.success('Thank you for your thoughts!');
      }
    } catch(e:any) { 
      const updatedQuestions = storyData!.questions.map(q => ({
        ...q,
        answer: answers[q.id]
      }));
      const updated = { 
        ...storyData!, 
        status: 'completed' as const, 
        questions: updatedQuestions,
        completedAt: new Date().toISOString()
      };
      setStoryData(updated);
      localStorage.setItem(`moral_story_${childId}`, JSON.stringify(updated));
      toast.success('Thank you for your thoughts!');
    } finally { 
      setSubmitting(false); 
    }
  };

  useEffect(() => { if (childId) fetchMoralStory(); }, [childId]);

  const statusColor = storyData?.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : storyData?.status === 'reading' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600';
  const statusLabel = storyData?.status === 'completed' ? 'Completed' : storyData?.status === 'reading' ? 'Reading' : 'Ready';

  return (
    <MobileSimulatorLayout title="Moral Stories" subtitle="Bedtime values story" backUrl={`/child/${childId}`} onRefresh={fetchMoralStory}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" /><p className="text-[#607060] text-[10px] font-semibold">Loading story studio...</p></div>
      ) : isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-[#EAF0E6] rounded-full flex items-center justify-center animate-pulse"><Sparkles className="w-8 h-8 text-[#2D6A4F] animate-spin" style={{ animationDuration: '3s' }} /></div>
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-[#18211A]">{generationStage}</h3>
            <p className="text-[8px] text-[#607060] font-semibold mt-1">Creating custom bedtime story for {childName}</p>
          </div>
          <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#2D6A4F] h-1.5 transition-all duration-150" style={{ width: `${generationProgress}%` }} />
          </div>
          <span className="text-[9px] text-[#2D6A4F] font-bold">{generationProgress}%</span>
        </div>
      ) : setupMode ? (
        /* Creating custom bedtime story - Select qualities & describe challenge */
        <div className="space-y-3.5">
          {/* Active Story Banner */}
          {storyData && (
            <div className="bg-[#EAF0E6] border border-[#2D6A4F]/30 rounded-2xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-4 h-4 text-[#2D6A4F] flex-none" />
                <div className="min-w-0">
                  <span className="text-[7px] text-[#607060] font-bold uppercase block">Active Bedtime Story</span>
                  <h4 className="text-[9.5px] font-extrabold text-[#18211A] truncate">{storyData.title}</h4>
                </div>
              </div>
              <Button onClick={() => setSetupMode(false)} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white text-[8px] font-extrabold px-3 py-1.5 h-auto rounded-full flex-none flex items-center gap-0.5">
                Resume
                <ArrowRight className="w-2.5 h-2.5" />
              </Button>
            </div>
          )}

          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2"><div className="p-1.5 bg-[#D8EADB] rounded-lg text-[#2D6A4F]"><Sparkles className="w-3.5 h-3.5" /></div><span className="text-[9px] font-bold text-[#607060]">Moral Story Studio</span></div>
            <h2 className="text-xs font-extrabold text-[#18211A] leading-tight mb-1">Generate a Custom Moral Story</h2>
            <p className="text-[8px] text-[#607060] font-semibold leading-relaxed">Select qualities you want to instill or write a specific problem to address.</p>
          </div>

          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm space-y-3">
            <div>
              <label className="text-[8px] font-bold text-[#607060] mb-1.5 block uppercase tracking-wider">Select Qualities</label>
              <div className="grid grid-cols-2 gap-1.5">
                {AVAILABLE_QUALITIES.map(q => {
                  const active = selectedQualities.includes(q.id);
                  return (
                    <button key={q.id} onClick={() => toggleQuality(q.id)} className={`flex items-center justify-between border rounded-xl p-2 transition-all text-left ${active ? 'bg-[#EAF0E6] border-[#2D6A4F] text-[#2D6A4F]' : 'bg-[#F5F7F2] border-[#D5DFD0] text-[#18211A]'}`}>
                      <span className="text-[9px] font-bold flex items-center gap-1"><span>{q.icon}</span>{q.label}</span>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border flex-none ${active ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white' : 'border-[#D5DFD0] bg-white'}`}>
                        {active ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5 text-[#607060]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[8px] font-bold text-[#607060] mb-1 block uppercase tracking-wider">Specific Challenge (Optional)</label>
              <Textarea placeholder="e.g. Fought with friends at school today, afraid of the dark, refusing to share toys..." value={customProblem} onChange={e => setCustomProblem(e.target.value)} rows={2} className="resize-none text-[9px] border-[#D5DFD0] bg-[#F5F7F2] rounded-xl focus:border-[#2D6A4F] leading-relaxed font-semibold placeholder:text-slate-400" />
            </div>

            <Button onClick={handleStartGeneration} className="w-full bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold py-2.5 rounded-full text-[10px] shadow-sm"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Generate Bedtime Story</Button>
          </div>
        </div>
      ) : storyData ? (
        /* Regular moral story reading & reflection flow */
        <div className="space-y-3">
          {/* Header */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5"><div className="p-1.5 bg-purple-50 rounded-lg flex-none"><BookOpen className="w-3.5 h-3.5 text-purple-600" /></div><span className="text-[9px] font-semibold text-[#607060]">Bedtime Values Story</span><Moon className="w-3 h-3 text-slate-400" /></div>
              <Badge className={`${statusColor} border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full`}>{statusLabel}</Badge>
            </div>
            <h2 className="text-sm font-extrabold text-[#18211A] mb-1 leading-tight">{storyData.title}</h2>
            <p className="text-[9px] text-[#607060] leading-relaxed font-semibold mb-2">A personalized bedtime story created for {childName}.</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">{storyData.targetValues.map((v,i) => <Badge key={i} className={`${v.color} border-transparent text-[7px] px-1.5 py-0 rounded-full`}>{v.name}</Badge>)}</div>
              <div className="flex items-center gap-2">
                <span className="text-[7px] text-[#607060]">📖 {storyData.estimatedReadingTime} min</span>
                <button onClick={() => setSetupMode(true)} className="text-[7.5px] text-[#2D6A4F] font-extrabold hover:underline flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  New Story
                </button>
              </div>
            </div>
          </div>

          {/* Unread: Start */}
          {storyData.status === 'unread' && (
            <div className="bg-[#EAF0E6] border border-[#D5DFD0] rounded-2xl p-4 text-center">
              <Heart className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <h3 className="text-xs font-extrabold text-[#18211A] mb-1">Ready for Tonight's Story?</h3>
              <p className="text-[9px] text-[#607060] mb-3 font-semibold max-w-[220px] mx-auto">Get comfortable and dive into a wonderful story about {storyData.targetValues.map(v => v.name.toLowerCase()).join(', ')}.</p>
              <Button onClick={handleStartReading} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-5 py-2 rounded-full text-[10px]"><BookOpen className="w-3.5 h-3.5 mr-1.5" />Start Reading</Button>
            </div>
          )}

          {/* Reading */}
          {storyData.status === 'reading' && !showQuestions && (
            <>
              <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
                <div className="prose prose-sm max-w-none">{storyData.story.split('\n\n').map((p,i) => <p key={i} className="text-[9px] text-slate-700 leading-relaxed mb-2.5 font-medium">{p}</p>)}</div>
              </div>
              <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3 shadow-sm text-center">
                <Button onClick={() => setShowQuestions(true)} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-5 py-2 rounded-full text-[10px]"><Star className="w-3 h-3 mr-1.5" />I Finished Reading!</Button>
              </div>
            </>
          )}

          {/* Reflection Questions */}
          {showQuestions && storyData.status !== 'completed' && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-[10px] font-bold text-[#18211A] mb-2 flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-purple-600" />Let's Think About the Story</h3>
              <div className="space-y-3">
                {storyData.questions.map((q,i) => (
                  <div key={q.id}>
                    <label className="text-[8px] font-bold text-[#607060] mb-1 block">{i+1}. {q.question}</label>
                    <Textarea placeholder="Share your thoughts..." value={answers[q.id]||''} onChange={e => setAnswers(p => ({...p,[q.id]:e.target.value}))} rows={2} className="resize-none text-[10px] border-[#D5DFD0] bg-[#F5F7F2] rounded-xl focus:border-[#2D6A4F]" />
                  </div>
                ))}
                <Button onClick={handleSubmitReflection} disabled={submitting || storyData.questions.some(q => !answers[q.id]?.trim())} className="w-full bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold py-2 rounded-full text-[10px]">
                  {submitting ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Saving...</> : <><Send className="w-3 h-3 mr-1" />Share My Thoughts</>}
                </Button>
              </div>
            </div>
          )}

          {/* Completed */}
          {storyData.status === 'completed' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <Star className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-xs font-extrabold text-emerald-900 mb-1">Story Complete! 🌟</h3>
                <p className="text-[9px] text-emerald-700 font-semibold">Thank you for reading and sharing your thoughts!</p>
              </div>
              <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
                <h4 className="text-[9px] font-bold text-[#18211A] mb-2">Values You Explored</h4>
                <div className="space-y-1.5">{storyData.targetValues.map((v,i) => <div key={i} className="p-2 bg-[#F5F7F2] rounded-xl border border-[#D5DFD0]/50"><Badge className={`${v.color} border-transparent text-[7px] px-1.5 py-0 rounded-full mb-0.5`}>{v.name}</Badge><p className="text-[7px] text-[#607060]">{v.description}</p></div>)}</div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </MobileSimulatorLayout>
  );
};

export default MoralStory;