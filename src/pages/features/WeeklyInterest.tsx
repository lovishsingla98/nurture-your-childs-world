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
import { WeeklyInterestData, WeeklyInterestQuestion } from '@/lib/types';
import {
  HelpCircle,
  CheckCircle,
  Send,
  Heart,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const WeeklyInterest: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { getValidToken } = useAuth();
  const [interestData, setInterestData] = useState<WeeklyInterestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const fetchWeeklyInterest = async () => {
    try {
      setLoading(true);
      await getValidToken();
      const response = await apiClient.getWeeklyInterest(childId!);
      if (response.success && response.data) {
        setInterestData(response.data);
      } else {
        toast.error(response.error || "Failed to load this week's questions");
      }
    } catch (error: any) {
      console.error('Failed to fetch weekly interest:', error);
      toast.error("Failed to load this week's questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (questionId: string, answer: string, selectedIndex: number) => {
    if (!interestData) return;
    const updatedQuestions = interestData.questions.map(q =>
      q.id === questionId ? { ...q, selectedAnswer: answer, selectedIndex } : q
    );
    if (interestData.status === 'pending') {
      try {
        await getValidToken();
        const startResponse = await apiClient.startWeeklyInterest(childId!, interestData.interestId);
        if (startResponse.success) {
          setInterestData({ ...interestData, questions: updatedQuestions, status: 'in_progress' });
        } else {
          toast.error('Failed to start questionnaire');
          return;
        }
      } catch (error: any) {
        toast.error('Failed to start questionnaire');
        return;
      }
    } else {
      setInterestData({ ...interestData, questions: updatedQuestions });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interestData!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAnswers = async () => {
    if (!interestData) return;
    const unansweredQuestions = interestData.questions.filter(q => !q.selectedAnswer);
    if (unansweredQuestions.length > 0) {
      toast.error('Please answer all questions before submitting!');
      return;
    }
    try {
      setSubmitting(true);
      await getValidToken();
      const responses = interestData.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: q.selectedAnswer!,
        selectedIndex: q.selectedIndex!
      }));
      const result = await apiClient.completeWeeklyInterest(childId!, interestData.interestId, responses);
      if (result.success) {
        setInterestData(prev => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString() } : null);
        toast.success('Thank you! Your interests have been recorded.');
      } else {
        toast.error(result.error || 'Failed to submit answers');
      }
    } catch (error: any) {
      toast.error('Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (childId) fetchWeeklyInterest();
  }, [childId]);

  const currentQuestion = interestData?.questions[currentQuestionIndex];
  const isLastQuestion = interestData ? currentQuestionIndex === interestData.questions.length - 1 : false;
  const allQuestionsAnswered = interestData?.questions.every(q => q.selectedAnswer);

  return (
    <MobileSimulatorLayout
      title="Weekly Interest"
      subtitle="Discover what pulls your child this week"
      backUrl={`/child/${childId}`}
      onRefresh={fetchWeeklyInterest}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" />
          <p className="text-[#607060] text-[10px] font-semibold">Loading this week's questions...</p>
        </div>
      ) : !interestData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-xs font-bold text-slate-700 mb-1">No Questions Available</h3>
          <p className="text-[9px] text-[#607060] max-w-[200px]">Check back later for new interest questions!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Info */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-purple-50 rounded-lg flex-none">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="text-[9px] font-semibold text-[#607060]">{interestData.week}</span>
              </div>
              <Badge className={`border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full ${
                interestData.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                interestData.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {interestData.status === 'completed' ? 'Completed' : interestData.status === 'in_progress' ? 'In Progress' : 'Not Started'}
              </Badge>
            </div>
            <h2 className="text-sm font-extrabold text-[#18211A] mb-1 leading-tight">{interestData.title}</h2>
            <p className="text-[9px] text-[#607060] leading-relaxed font-semibold mb-2">{interestData.description}</p>
            {/* Progress */}
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-[#607060] font-semibold">Q{currentQuestionIndex + 1} of {interestData.questions.length}</span>
              <div className="w-24 bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / interestData.questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          {interestData.status !== 'completed' && currentQuestion && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-[11px] font-bold text-[#18211A] mb-1">{currentQuestion.question}</h3>
              <p className="text-[8px] text-[#607060] mb-3 font-semibold">Choose the option that best describes you!</p>
              <RadioGroup
                value={currentQuestion.selectedAnswer || ''}
                onValueChange={(value) => {
                  const selectedIndex = currentQuestion.options.findIndex(option => option === value);
                  handleAnswerSelect(currentQuestion.id, value, selectedIndex);
                }}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-[#EAF0E6] transition-colors border border-transparent hover:border-[#D5DFD0]">
                    <RadioGroupItem value={option} id={`option-${index}`} className="border-[#2D6A4F] text-[#2D6A4F]" />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-[9px] text-[#18211A] font-semibold leading-relaxed">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Navigation */}
          {interestData.status !== 'completed' && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="text-[9px] px-3 py-1.5 rounded-full border-[#D5DFD0] h-auto"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Prev
                </Button>
                <div className="flex items-center gap-1">
                  {interestData.questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentQuestionIndex ? 'bg-purple-600' :
                        interestData.questions[index].selectedAnswer ? 'bg-emerald-500' :
                        'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmitAnswers}
                    disabled={submitting || !allQuestionsAnswered}
                    className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white text-[9px] px-3 py-1.5 rounded-full h-auto font-bold"
                  >
                    {submitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!currentQuestion?.selectedAnswer}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] px-3 py-1.5 rounded-full h-auto font-bold"
                  >
                    Next
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Completed */}
          {interestData.status === 'completed' && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-xs font-extrabold text-emerald-900 mb-1">All Done! 🎉</h3>
              <p className="text-[9px] text-emerald-700 font-semibold mb-3">
                Thank you for sharing your interests!
                {interestData.completedAt && (
                  <span className="block text-[8px] mt-1">Completed at {new Date(interestData.completedAt).toLocaleTimeString()}</span>
                )}
              </p>
              <div className="bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Heart className="w-3.5 h-3.5 text-purple-600" />
                  <h4 className="text-[9px] font-bold text-slate-800">Your Answers Help Us Understand You Better!</h4>
                </div>
                <p className="text-[8px] text-slate-600 leading-relaxed">
                  We'll use these insights to create more personalized activities. Check back next week for new questions!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </MobileSimulatorLayout>
  );
};

export default WeeklyInterest;