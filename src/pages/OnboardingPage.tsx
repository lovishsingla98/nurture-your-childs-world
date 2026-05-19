import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { Loader2, ArrowRight, CheckCircle, ArrowLeft, Calendar, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { OnboardingQuestionnaire, OnboardingQuestion } from '@/lib/types';
import OnboardingTransition from '@/components/OnboardingTransition';

const OnboardingPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user, getValidToken } = useAuth();

  const [questionnaire, setQuestionnaire] = useState<OnboardingQuestionnaire | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const facts = [
    '🧠 Children ask ~73 questions per day!',
    '✨ Short, consistent routines build habits.',
    '💡 Open-ended questions spark curiosity.',
    '🎯 Tiny daily progress > big leaps rarely.',
    '🌟 Breaks improve focus and memory.',
    '📚 15 min reading daily boosts vocabulary.',
  ];
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const timeoutId = setTimeout(() => { intervalId = setInterval(() => { setFactIndex(i => (i + 1) % facts.length); }, 8000); }, 1000);
    return () => { clearTimeout(timeoutId); if (intervalId) clearInterval(intervalId); };
  }, []);

  useEffect(() => { if (childId && user) fetchQuestionnaire(); }, [childId, user]);

  const fetchQuestionnaire = async () => {
    try { setLoading(true); setError(null); await getValidToken();
      const r = await apiClient.getOnboardingQuestionnaire(childId!);
      if (r.success && r.data) {
        setQuestionnaire(r.data);
        if (r.data.status === 'completed' || r.data.responses.length >= 10) { setShowTransition(true); }
        else { const idx = findFirstUnanswered(r.data); setCurrentQuestionIndex(idx !== -1 ? idx : r.data.questions.length); }
      } else { setError('Failed to load questionnaire'); }
    } catch (e: any) { setError(e.message || 'Failed to load'); } finally { setLoading(false); }
  };

  const fetchSilently = async () => {
    try { await getValidToken(); const r = await apiClient.getOnboardingQuestionnaire(childId!);
      if (r.success && r.data) { setQuestionnaire(r.data); if (r.data.status === 'completed' || r.data.responses.length >= 10) setShowTransition(true); return r.data; }
      throw new Error('Failed');
    } catch (e: any) { throw e; }
  };

  const getCurrentQuestion = (): OnboardingQuestion | null => questionnaire?.questions[currentQuestionIndex] || null;
  const getProgress = (): number => questionnaire ? Math.round((questionnaire.responses.length / 10) * 100) : 0;
  const findFirstUnanswered = (q: any): number => {
    const answered = new Set(q.responses.map((r: any) => r.questionId));
    for (let i = 0; i < q.questions.length; i++) { if (!answered.has(q.questions[i].questionId)) return i; }
    return -1;
  };

  const pollForNext = async (): Promise<void> => {
    let lastQCount = questionnaire?.questions.length || 0;
    let lastRCount = questionnaire?.responses.length || 0;
    for (let attempt = 0; attempt < 12; attempt++) {
      try {
        const fresh = await fetchSilently();
        if (!fresh) throw new Error('Not found');
        if (fresh.responses.length >= 10) { setShowTyping(false); toast.success('Onboarding completed!'); return; }
        if (fresh.questions.length > lastQCount) { const ni = fresh.questions.length - 1; setCurrentQuestionIndex(ni); setForceUpdate(p => p + 1); setShowTyping(false); return; }
        const nui = findFirstUnanswered(fresh);
        if (nui !== -1 && nui !== currentQuestionIndex) { setCurrentQuestionIndex(nui); setForceUpdate(p => p + 1); setShowTyping(false); return; }
        if (fresh.responses.length > lastRCount) lastRCount = fresh.responses.length;
        if (attempt < 11) { await new Promise(r => setTimeout(r, Math.min(2000 * Math.pow(1.3, attempt), 8000))); }
        else { setShowTyping(false); toast.error('No new question. Please try again.'); }
      } catch (e) { if (attempt === 11) { setShowTyping(false); toast.error('Failed. Please refresh.'); } }
    }
  };

  const handleAnswerSubmit = async (clickedOptionId?: string) => {
    const cq = getCurrentQuestion(); if (!cq || !childId) return;
    const eff = clickedOptionId || selectedOption;
    if (cq.required && !currentAnswer && !eff) { toast.error('Please provide an answer'); return; }
    try { setSubmitting(true); setShowTyping(true); await getValidToken();
      const ad = { questionId: cq.questionId, answer: (cq.type === 'multiple_choice' || cq.type === 'rating') ? (eff || '') : currentAnswer, optionId: (cq.type === 'multiple_choice' || cq.type === 'rating') ? (eff || '') : undefined };
      apiClient.submitOnboardingAnswer(childId, ad).catch(e => { setShowTyping(false); toast.error('Failed to submit'); });
      toast.success('Answer submitted!'); setCurrentAnswer(''); setSelectedOption('');
      await pollForNext();
    } catch (e: any) { setShowTyping(false); toast.error(e.message || 'Failed'); } finally { setSubmitting(false); }
  };

  const handlePrev = () => { if (currentQuestionIndex > 0) { setCurrentQuestionIndex(p => p - 1); setCurrentAnswer(''); setSelectedOption(''); } };
  const handleSkip = () => { if (currentQuestionIndex < (questionnaire?.questions.length || 0) - 1) { setCurrentQuestionIndex(p => p + 1); setCurrentAnswer(''); setSelectedOption(''); } };

  if (showTransition && questionnaire) {
    return <OnboardingTransition childId={childId!} childName={questionnaire.child?.displayName || 'your child'} onComplete={() => navigate('/dashboard')} onError={(e) => { setError(e); setShowTransition(false); }} />;
  }

  const currentQuestion = getCurrentQuestion();
  const isFirst = currentQuestionIndex === 0;
  const isCompleted = currentQuestionIndex === -1;
  const isTrulyLast = (questionnaire?.responses.length || 0) >= 9 || questionnaire?.status === 'completed';
  const isWaiting = currentQuestionIndex === (questionnaire?.questions.length || 0) && !isCompleted;

  return (
    <MobileSimulatorLayout title={`Onboarding ${questionnaire?.child?.displayName || ''}`} subtitle={questionnaire ? `${questionnaire.child?.age || '?'} yrs • ${questionnaire.child?.gender || ''}` : 'Loading...'} backUrl="/dashboard"
      headerRight={questionnaire ? <Badge className={`text-[7px] px-1.5 py-0 rounded-full border-transparent ${questionnaire.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>{questionnaire.status === 'completed' ? 'Done' : 'In Progress'}</Badge> : undefined}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" /><p className="text-[#607060] text-[10px] font-semibold">Loading questionnaire...</p></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center"><Heart className="w-10 h-10 text-red-300 mb-3" /><h3 className="text-xs font-bold text-red-700 mb-1">Something went wrong</h3><p className="text-[9px] text-[#607060] mb-3">{error}</p><Button onClick={() => window.location.reload()} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-4 py-1.5 rounded-full text-[10px]">Try Again</Button></div>
      ) : !questionnaire ? (
        <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-[9px] text-[#607060] mb-3">Questionnaire not found.</p><Button onClick={() => navigate('/dashboard')} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-4 py-1.5 rounded-full text-[10px]">Back to Dashboard</Button></div>
      ) : (
        <div className="space-y-3">
          {/* Progress */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5"><span className="text-[8px] text-[#607060] font-semibold">Progress: {questionnaire.responses.length} / 10</span><span className="text-[8px] text-[#607060] font-semibold">{getProgress()}%</span></div>
            <Progress value={getProgress()} className="h-1.5" />
          </div>

          {isCompleted ? (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-xs font-extrabold text-emerald-900 mb-1">Onboarding Completed! 🎉</h3>
              <p className="text-[9px] text-emerald-700 font-semibold mb-3">We now understand {questionnaire.child?.displayName}'s interests and learning style.</p>
              <Button onClick={() => navigate(`/child/${childId}`)} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-5 py-2 rounded-full text-[10px]"><Calendar className="w-3 h-3 mr-1.5" />Go to Dashboard</Button>
            </div>
          ) : currentQuestion && (
            <div className="relative">
              {/* Chat: Question bubble */}
              <div className="flex items-start gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-full bg-[#D8EADB] flex items-center justify-center text-[#2D6A4F] text-[8px] font-extrabold flex-none">Q</div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white border border-[#D5DFD0] px-3 py-2 text-[9px] text-[#18211A] leading-relaxed font-semibold shadow-sm">{currentQuestion.text}</div>
              </div>

              {/* Meta badges */}
              <div className="flex items-center gap-1 mb-2.5 ml-8">
                <span className="text-[7px] text-[#607060]">Q{currentQuestionIndex + 1}/10</span>
                <Badge className="bg-[#EAF0E6] text-[#607060] border-transparent text-[6px] px-1 py-0 rounded">{currentQuestion.category.replace('_', ' ')}</Badge>
                <Badge className="bg-[#EAF0E6] text-[#607060] border-transparent text-[6px] px-1 py-0 rounded">{currentQuestion.learningDomain.replace('_', ' ')}</Badge>
              </div>

              {/* Options: right-aligned */}
              <div className="flex justify-end mb-2">
                <div className="max-w-[85%]">
                  {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'rating') && currentQuestion.options && (
                    <div className="bg-[#EAF0E6] border border-[#D5DFD0] rounded-2xl rounded-tr-sm p-2.5">
                      <div className="flex flex-col gap-1.5">
                        {currentQuestion.options.map(o => (
                          <Button key={o.id} variant={selectedOption === o.id ? 'default' : 'outline'} className={`justify-start text-left w-full whitespace-pre-wrap break-words text-[9px] font-semibold leading-normal px-3 py-2 h-auto rounded-xl ${selectedOption === o.id ? 'bg-[#2D6A4F] hover:bg-[#1F513C] text-white' : 'bg-white border-[#D5DFD0] text-[#18211A]'}`} disabled={submitting} onClick={async () => { setSelectedOption(o.id); await handleAnswerSubmit(o.id); }}>{o.text}</Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentQuestion.type === 'text' && (
                    <div className="bg-[#EAF0E6] border border-[#D5DFD0] rounded-2xl rounded-tr-sm p-2.5">
                      <div className="flex items-end gap-1.5">
                        <Textarea placeholder="Type your answer..." value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)} className="min-h-[50px] resize-none text-[10px] border-[#D5DFD0] bg-white rounded-xl" disabled={submitting} />
                        <Button className="bg-[#2D6A4F] hover:bg-[#1F513C] rounded-full h-8 w-8 p-0 flex-none" disabled={submitting || (currentQuestion.required && !currentAnswer)} onClick={() => handleAnswerSubmit()}><ArrowRight className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Typing indicator */}
              {(showTyping || isWaiting) && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#D8EADB] flex items-center justify-center text-[#2D6A4F] text-[8px] font-extrabold flex-none">Q</div>
                  <div className="rounded-full bg-[#2D6A4F] text-white px-3 py-1.5">
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/><span className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce" style={{animationDelay:'120ms'}}/><span className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce" style={{animationDelay:'240ms'}}/></span>
                  </div>
                </div>
              )}

              {/* Nav */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1.5">
                  {!isFirst && <Button variant="ghost" size="sm" onClick={handlePrev} disabled={submitting} className="text-[8px] px-2 py-1 h-auto rounded-full"><ArrowLeft className="w-2.5 h-2.5 mr-0.5" />Back</Button>}
                  {currentQuestion && !currentQuestion.required && !isTrulyLast && <Button variant="ghost" size="sm" onClick={handleSkip} disabled={submitting} className="text-[8px] px-2 py-1 h-auto rounded-full">Skip</Button>}
                </div>
                {isTrulyLast && <Badge className="bg-amber-100 text-amber-700 border-transparent text-[7px] px-1.5 py-0 rounded-full">Last question</Badge>}
              </div>

              {/* Scrolling fact */}
              {(showTyping || isWaiting) && (
                <div className="mt-3 overflow-hidden rounded-xl bg-white/60 border border-[#D5DFD0] px-3 py-1.5">
                  <p key={factIndex} className="text-[8px] text-[#607060] font-semibold whitespace-nowrap" style={{animation:'marquee 8s linear infinite'}}>{facts[factIndex]}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </MobileSimulatorLayout>
  );
};

// Marquee keyframes
const styleEl = document.createElement('style');
styleEl.innerHTML = `@keyframes marquee { from { transform: translateX(100%); } to { transform: translateX(-100%); } }`;
if (typeof document !== 'undefined' && !document.getElementById('onboarding-marquee-kf')) {
  styleEl.id = 'onboarding-marquee-kf';
  document.head.appendChild(styleEl);
}

export default OnboardingPage;
