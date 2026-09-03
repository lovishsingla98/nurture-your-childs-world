import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { DailyLearningResponse } from '@/lib/types';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle, 
  Lightbulb, 
  Loader2, 
  TrendingUp,
  Star,
  Brain,
  HelpCircle
} from 'lucide-react';

const DailyLearning: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { getValidToken } = useAuth();
  const [learningData, setLearningData] = useState<DailyLearningResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([-1, -1, -1]);
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const fetchDailyLearning = async () => {
    try {
      setLoading(true);
      await getValidToken();
      const res = await apiClient.getDailyLearning(childId!);
      if (res.success && res.data) {
        setLearningData(res.data);
        if (res.data.quizAnswers) {
          setSelectedAnswers(res.data.quizAnswers);
          setSubmittedQuiz(true);
        }
      } else {
        toast.error(res.message || "Failed to load today's learning");
      }
    } catch (error: any) {
      console.error('Failed to fetch daily learning:', error);
      toast.error("Failed to load today's learning");
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = async () => {
    if (!learningData || !childId) return;
    try {
      const res = await apiClient.startDailyLearning(childId, learningData.learningId);
      if (res.success && res.data) {
        setLearningData(res.data);
        toast.success('Started today\'s concept lesson!');
      }
    } catch (error: any) {
      console.error('Failed to start learning:', error);
    }
  };

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    if (submittedQuiz) return;
    const next = [...selectedAnswers];
    next[qIdx] = oIdx;
    setSelectedAnswers(next);
  };

  const handleSubmitQuiz = async () => {
    if (selectedAnswers.includes(-1)) {
      toast.error('Please answer all quiz questions before submitting!');
      return;
    }
    if (!learningData || !childId) return;
    try {
      setSubmitting(true);
      await getValidToken();
      const res = await apiClient.completeDailyLearning(childId, learningData.learningId, selectedAnswers);
      if (res.success && res.data) {
        setLearningData(res.data);
        setSubmittedQuiz(true);
        toast.success('Comprehension quiz submitted successfully!');
      } else {
        toast.error(res.message || 'Failed to submit quiz');
      }
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (childId) fetchDailyLearning();
  }, [childId]);

  const statusColor = learningData?.status === 'completed' ? 'bg-[#EAF0E6] text-[#2D6A4F]' :
                      learningData?.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-800';
  const statusLabel = learningData?.status === 'completed' ? 'Completed' :
                      learningData?.status === 'in_progress' ? 'In Progress' : 'Available';

  return (
    <MobileSimulatorLayout
      title="Daily Learning"
      subtitle="Concept lesson & comprehension quiz"
      backUrl={`/child/${childId}`}
      onRefresh={fetchDailyLearning}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" />
          <p className="text-[#607060] text-[10px] font-semibold">Loading today's concept lesson...</p>
        </div>
      ) : !learningData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-xs font-bold text-slate-700 mb-1">No Lesson Available</h3>
          <p className="text-[9px] text-[#607060] max-w-[200px]">There's no concept lesson available right now. Check back shortly!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Learning Header Card */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-[#EAF0E6] rounded-lg flex-none">
                  <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
                </div>
                <span className="text-[9px] font-semibold text-[#607060]">Today's Daily Learning</span>
              </div>
              <Badge className={`${statusColor} border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full`}>
                {statusLabel}
              </Badge>
            </div>
            <h2 className="text-sm font-extrabold text-[#18211A] mb-1 leading-tight">{learningData.data.topic}</h2>
            <p className="text-[9px] text-[#607060] leading-relaxed font-semibold mb-3">{learningData.data.summary}</p>

            <div className="flex flex-wrap gap-1.5 mb-2">
              <div className="flex items-center gap-1 bg-[#F5F7F2] border border-[#D5DFD0]/50 rounded-lg px-2 py-1">
                <Target className="w-3 h-3 text-[#607060]" />
                <span className="text-[8px] font-semibold text-[#607060]">{learningData.data.domain}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F5F7F2] border border-[#D5DFD0]/50 rounded-lg px-2 py-1">
                <Clock className="w-3 h-3 text-[#607060]" />
                <span className="text-[8px] font-semibold text-[#607060]">{learningData.data.readingTime || 10} min read</span>
              </div>
            </div>
          </div>

          {/* Lesson Content Card */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <h3 className="text-[10px] font-bold text-[#18211A] mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>The Lesson</span>
            </h3>
            <p className="text-[9.5px] text-[#4A5D4E] leading-relaxed font-medium whitespace-pre-line mb-3">
              {learningData.data.lesson}
            </p>

            {learningData.status === 'pending' && (
              <Button
                onClick={handleStartLearning}
                className="w-full bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-extrabold text-[10px] py-2 rounded-full shadow-xs"
              >
                Start Learning & Take Quiz
              </Button>
            )}
          </div>

          {/* Key Takeaways */}
          {learningData.data.keyTakeaways?.length > 0 && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-[10px] font-bold text-[#18211A] mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Key Takeaways</span>
              </h3>
              <ul className="space-y-1.5">
                {learningData.data.keyTakeaways.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[9px] text-[#4A5D4E] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] mt-1 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fun Facts */}
          {learningData.data.funFacts?.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-[10px] font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>Fun Facts</span>
              </h3>
              <ul className="space-y-1.5">
                {learningData.data.funFacts.map((fact, idx) => (
                  <li key={idx} className="text-[9px] text-amber-800 font-semibold leading-relaxed">
                    ✨ {fact}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Real World Connection */}
          {learningData.data.realWorldConnection && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-[10px] font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                <span>Real World Connection</span>
              </h3>
              <p className="text-[9px] text-purple-800 font-medium leading-relaxed">
                {learningData.data.realWorldConnection}
              </p>
            </div>
          )}

          {/* Quiz Section */}
          {learningData.status !== 'pending' && learningData.data.quiz?.length > 0 && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold text-[#18211A] flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Comprehension Quiz</span>
                </h3>
                {submittedQuiz && (
                  <Badge className="bg-[#EAF0E6] text-[#2D6A4F] border-transparent text-[8px] font-bold">
                    Score: {learningData.quizScore !== undefined ? learningData.quizScore : '3/3'}
                  </Badge>
                )}
              </div>

              {learningData.data.quiz.map((q, qIdx) => (
                <div key={qIdx} className="bg-[#FAFBF9] border border-[#EAF0E6] rounded-xl p-3 space-y-2">
                  <p className="text-[9.5px] font-bold text-[#18211A]">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[qIdx] === oIdx;
                      const isCorrect = q.correctIndex === oIdx;

                      let btnStyle = 'border-[#D5DFD0] bg-white text-[#18211A]';
                      if (submittedQuiz) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'border-red-400 bg-red-50 text-red-700 font-bold';
                        }
                      } else if (isSelected) {
                        btnStyle = 'border-[#2D6A4F] bg-[#EAF0E6] text-[#2D6A4F] font-bold';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={submittedQuiz}
                          onClick={() => handleSelectOption(qIdx, oIdx)}
                          className={`w-full text-left p-2 rounded-lg border text-[8.5px] transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {submittedQuiz && isCorrect && <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {submittedQuiz && q.explanation && (
                    <p className="text-[8px] text-[#607060] bg-white p-2 rounded-lg border border-slate-100 font-medium">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}

              {!submittedQuiz && (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="w-full bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-extrabold text-[10px] py-2 rounded-full shadow-xs mt-2"
                >
                  {submitting ? 'Submitting Quiz...' : 'Submit Quiz Answers'}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </MobileSimulatorLayout>
  );
};

export default DailyLearning;
