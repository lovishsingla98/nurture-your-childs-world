import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { WeeklyPotentialQuestion, WeeklyPotentialData } from '@/lib/types';
import {
  TrendingUp,
  CheckCircle,
  Send,
  Target,
  ArrowRight,
  ArrowLeft,
  Star,
  Loader2
} from 'lucide-react';

const WeeklyPotential: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { getValidToken } = useAuth();
  const [potentialData, setPotentialData] = useState<WeeklyPotentialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const fetchWeeklyPotential = async () => {
    try {
      setLoading(true);
      await getValidToken();
      const response = await apiClient.getWeeklyPotential(childId!);
      if (response.success) {
        setPotentialData(response.data);
      } else {
        toast.error(response.error || 'Failed to load weekly potential assessment');
      }
    } catch (error: any) {
      toast.error("Failed to load this week's assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (questionId: string, answer: string, selectedIndex: number) => {
    if (!potentialData) return;
    const updatedQuestions = potentialData.questions.map(q =>
      q.id === questionId ? { ...q, selectedAnswer: answer, selectedIndex } : q
    );
    setPotentialData({ ...potentialData, questions: updatedQuestions, status: 'in_progress' });
    if (potentialData.status === 'pending') {
      try {
        await apiClient.startWeeklyPotential(childId!, potentialData.potentialId);
      } catch (error) {
        console.error('Failed to start weekly potential:', error);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < potentialData!.questions.length - 1) setCurrentQuestionIndex(i => i + 1);
  };
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(i => i - 1);
  };

  const handleSubmitAnswers = async () => {
    if (!potentialData) return;
    if (potentialData.questions.some(q => !q.selectedAnswer)) {
      toast.error('Please answer all questions before submitting!');
      return;
    }
    try {
      setSubmitting(true);
      await getValidToken();
      const responses = potentialData.questions.map(q => ({
        questionId: q.id, selectedAnswer: q.selectedAnswer!, selectedIndex: q.selectedIndex!
      }));
      const result = await apiClient.completeWeeklyPotential(childId!, potentialData.potentialId, responses);
      if (result.success) {
        setPotentialData(prev => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString() } : null);
        toast.success("Assessment completed! We're analyzing the strengths.");
      } else {
        toast.error(result.error || 'Failed to submit assessment');
      }
    } catch (error: any) {
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { if (childId) fetchWeeklyPotential(); }, [childId]);

  const currentQuestion = potentialData?.questions[currentQuestionIndex];
  const isLastQuestion = potentialData ? currentQuestionIndex === potentialData.questions.length - 1 : false;
  const allQuestionsAnswered = potentialData?.questions.every(q => q.selectedAnswer);

  return (
    <MobileSimulatorLayout title="Weekly Potential" subtitle="Assess strengths & momentum" backUrl={`/child/${childId}`} onRefresh={fetchWeeklyPotential}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" />
          <p className="text-[#607060] text-[10px] font-semibold">Loading potential assessment...</p>
        </div>
      ) : !potentialData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <TrendingUp className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-xs font-bold text-slate-700 mb-1">No Assessment Available</h3>
          <p className="text-[9px] text-[#607060] max-w-[200px]">Check back later for new potential assessments!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-emerald-50 rounded-lg flex-none">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-[9px] font-semibold text-[#607060]">{potentialData.week}</span>
              </div>
              <Badge className={`border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full ${
                potentialData.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                potentialData.status === 'in_progress' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {potentialData.status === 'completed' ? 'Completed' : potentialData.status === 'in_progress' ? 'In Progress' : 'Not Started'}
              </Badge>
            </div>
            <h2 className="text-sm font-extrabold text-[#18211A] mb-1 leading-tight">{potentialData.title}</h2>
            <p className="text-[9px] text-[#607060] leading-relaxed font-semibold mb-2">{potentialData.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-[#607060] font-semibold">Q{currentQuestionIndex + 1} of {potentialData.questions.length}</span>
              <div className="w-24 bg-slate-200 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / potentialData.questions.length) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Question Card */}
          {potentialData.status !== 'completed' && currentQuestion && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-start gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-none" />
                <div>
                  <h3 className="text-[11px] font-bold text-[#18211A] mb-0.5">{currentQuestion.question}</h3>
                  {currentQuestion.context && (
                    <p className="text-[8px] text-emerald-700 font-semibold">💡 {currentQuestion.context}</p>
                  )}
                </div>
              </div>
              <RadioGroup
                value={currentQuestion.selectedAnswer || ''}
                onValueChange={(value) => {
                  const selectedIndex = currentQuestion.options.findIndex(o => o === value);
                  handleAnswerSelect(currentQuestion.id, value, selectedIndex);
                }}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-[#EAF0E6] transition-colors border border-transparent hover:border-[#D5DFD0]">
                    <RadioGroupItem value={option} id={`pot-${index}`} className="border-[#2D6A4F] text-[#2D6A4F]" />
                    <Label htmlFor={`pot-${index}`} className="flex-1 cursor-pointer text-[9px] text-[#18211A] font-semibold leading-relaxed">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Navigation */}
          {potentialData.status !== 'completed' && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="text-[9px] px-3 py-1.5 rounded-full border-[#D5DFD0] h-auto">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Prev
                </Button>
                <div className="flex items-center gap-1">
                  {potentialData.questions.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentQuestionIndex ? 'bg-emerald-600' : potentialData.questions[i].selectedAnswer ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                  ))}
                </div>
                {isLastQuestion ? (
                  <Button onClick={handleSubmitAnswers} disabled={submitting || !allQuestionsAnswered} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white text-[9px] px-3 py-1.5 rounded-full h-auto font-bold">
                    {submitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} disabled={!currentQuestion?.selectedAnswer} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] px-3 py-1.5 rounded-full h-auto font-bold">
                    Next <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Completed */}
          {potentialData.status === 'completed' && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-xs font-extrabold text-emerald-900 mb-1">Assessment Complete! 🌟</h3>
              <p className="text-[9px] text-emerald-700 font-semibold mb-3">Thank you for completing the potential assessment!</p>
              <div className="bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Star className="w-3.5 h-3.5 text-emerald-600" />
                  <h4 className="text-[9px] font-bold text-slate-800">Analyzing Strengths & Potential</h4>
                </div>
                <p className="text-[8px] text-slate-600 leading-relaxed">We're analyzing these responses to better understand your child's natural strengths.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </MobileSimulatorLayout>
  );
};

export default WeeklyPotential;