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
import {
  Brain,
  CheckCircle,
  Send,
  Trophy,
  ArrowRight,
  ArrowLeft,
  X,
  Timer,
  Star,
  Loader2
} from 'lucide-react';
import { QuizQuestion, WeeklyQuizData } from '@/lib/types';

const WeeklyQuiz: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { getValidToken } = useAuth();
  const [quizData, setQuizData] = useState<WeeklyQuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const fetchWeeklyQuiz = async () => {
    try {
      setLoading(true);
      await getValidToken();
      const response = await apiClient.getWeeklyQuiz(childId!);
      if (response.success && response.data) {
        const apiData = response.data;
        const transformedData: WeeklyQuizData = {
          quizId: apiData.quizId || `quiz_${Date.now()}`,
          week: apiData.week || 'Current Week',
          title: 'Weekly Learning Review',
          description: "Let's review what you've learned this week through fun questions!",
          timeLimit: 15,
          childId: apiData.childId || childId || '',
          parentId: apiData.parentId || '',
          questions: apiData.questions?.map((q: any, index: number) => ({
            id: q.id || `q${index + 1}`,
            question: q.question,
            options: q.options,
            answer: { value: q.answer.value, index: q.answer.index },
            topic: q.topic || 'General Knowledge',
            explanation: q.explanation || 'Great job on this question!'
          })) || [],
          responses: apiData.responses || undefined,
          status: apiData.status || 'pending',
          score: apiData.score,
          completedAt: apiData.completedAt
        };
        setQuizData(transformedData);
      } else {
        toast.error(response.error || "Failed to load this week's quiz");
      }
    } catch (error: any) {
      toast.error("Failed to load this week's quiz");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (!quizData) return;
    setQuizData(prev => prev ? { ...prev, status: 'in_progress' } : null);
    setTimeRemaining(quizData.timeLimit * 60);
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) { clearInterval(timer); handleTimeUp(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => { toast.info("Time's up! Let's see how you did."); handleSubmitQuiz(); };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!quizData) return;
    const question = quizData.questions.find(q => q.id === questionId);
    if (!question) return;
    const selectedIndex = question.options.findIndex(option => option === answer);
    const existingResponses = quizData.responses || [];
    const updatedResponses = existingResponses.filter(r => r.questionId !== questionId);
    updatedResponses.push({ questionId, selectedAnswer: answer, selectedIndex });
    setQuizData({ ...quizData, responses: updatedResponses });
  };

  const handleNextQuestion = () => { if (currentQuestionIndex < quizData!.questions.length - 1) setCurrentQuestionIndex(i => i + 1); };
  const handlePreviousQuestion = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(i => i - 1); };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    const responses = quizData.responses || [];
    if (quizData.questions.some(q => !responses.find(r => r.questionId === q.id))) {
      toast.error('Please answer all questions before submitting!');
      return;
    }
    try {
      setSubmitting(true);
      await getValidToken();
      const result = await apiClient.completeWeeklyQuiz(childId!, quizData.quizId, responses);
      if (result.success) {
        let correctAnswers = 0;
        responses.forEach(response => {
          const question = quizData.questions.find(q => q.id === response.questionId);
          if (question) {
            const correctAnswerIndex = question.options.findIndex(option => option === question.answer.value);
            if (response.selectedIndex === correctAnswerIndex) correctAnswers++;
          }
        });
        const calculatedScore = Math.round((correctAnswers / responses.length) * 100);
        setQuizData(prev => prev ? { ...prev, status: 'completed', score: calculatedScore, completedAt: new Date().toISOString() } : null);
        setShowResults(true);
        setTimeRemaining(null);
        toast.success(`Quiz completed! You scored ${calculatedScore}%`);
      } else {
        toast.error(result.error || 'Failed to submit quiz');
      }
    } catch (error: any) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { if (childId) fetchWeeklyQuiz(); }, [childId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (quizData?.questions?.length || 0) - 1;
  const allQuestionsAnswered = quizData?.questions?.every(q => quizData?.responses?.find(r => r.questionId === q.id)) || false;

  return (
    <MobileSimulatorLayout title="Weekly Quiz" subtitle="Test your learning this week" backUrl={`/child/${childId}`} onRefresh={fetchWeeklyQuiz}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" />
          <p className="text-[#607060] text-[10px] font-semibold">Loading this week's quiz...</p>
        </div>
      ) : !quizData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <X className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-xs font-bold text-slate-700 mb-1">No Quiz Available</h3>
          <p className="text-[9px] text-[#607060] max-w-[200px] mb-3">There's no quiz available this week. Check back later!</p>
          <Button onClick={fetchWeeklyQuiz} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-4 py-1.5 rounded-full text-[10px]">Try Again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-indigo-50 rounded-lg flex-none"><Brain className="w-3.5 h-3.5 text-indigo-600" /></div>
                <span className="text-[9px] font-semibold text-[#607060]">{quizData.week}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {timeRemaining !== null && quizData.status === 'in_progress' && (
                  <div className="flex items-center gap-0.5">
                    <Timer className="w-3 h-3 text-orange-600" />
                    <span className={`text-[8px] font-extrabold ${timeRemaining < 60 ? 'text-red-600' : 'text-slate-600'}`}>{formatTime(timeRemaining)}</span>
                  </div>
                )}
                <Badge className={`border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full ${
                  quizData.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  quizData.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {quizData.status === 'completed' ? 'Completed' : quizData.status === 'in_progress' ? 'In Progress' : 'Ready'}
                </Badge>
              </div>
            </div>
            <h2 className="text-sm font-extrabold text-[#18211A] mb-1 leading-tight">{quizData.title}</h2>
            <p className="text-[9px] text-[#607060] leading-relaxed font-semibold mb-2">{quizData.description}</p>
            {quizData.status === 'in_progress' && (
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-[#607060] font-semibold">Q{currentQuestionIndex + 1} of {quizData.questions.length}</span>
                <div className="w-24 bg-slate-200 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Pending: Start */}
          {quizData.status === 'pending' && (
            <div className="bg-[#EAF0E6] border border-[#D5DFD0] rounded-2xl p-4 text-center">
              <Trophy className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
              <h3 className="text-xs font-extrabold text-[#18211A] mb-1">Ready for Your Weekly Quiz?</h3>
              <p className="text-[9px] text-[#607060] mb-3 font-semibold max-w-[220px] mx-auto">
                You'll have {quizData.timeLimit} minutes to answer {quizData.questions.length} questions.
              </p>
              <div className="flex items-center justify-center gap-3 mb-3 text-[8px] text-[#607060] font-semibold">
                <span>⏱️ {quizData.timeLimit} min</span>
                <span>❓ {quizData.questions.length} Qs</span>
                <span>🎯 Mixed</span>
              </div>
              <Button onClick={startQuiz} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-5 py-2 rounded-full text-[10px]">
                <Brain className="w-3 h-3 mr-1.5" /> Start Quiz
              </Button>
            </div>
          )}

          {/* In Progress: Question */}
          {quizData.status === 'in_progress' && currentQuestion && !showResults && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
              <Badge className="bg-indigo-50 text-indigo-700 border-transparent text-[7px] font-bold px-1.5 py-0 rounded-full mb-2">{currentQuestion.topic}</Badge>
              <h3 className="text-[11px] font-bold text-[#18211A] mb-2">{currentQuestion.question}</h3>
              <RadioGroup
                value={quizData.responses?.find(r => r.questionId === currentQuestion.id)?.selectedAnswer || ''}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-[#EAF0E6] transition-colors border border-transparent hover:border-[#D5DFD0]">
                    <RadioGroupItem value={option} id={`quiz-${index}`} className="border-[#2D6A4F] text-[#2D6A4F]" />
                    <Label htmlFor={`quiz-${index}`} className="flex-1 cursor-pointer text-[9px] text-[#18211A] font-semibold leading-relaxed">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Navigation */}
          {quizData.status === 'in_progress' && !showResults && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="text-[9px] px-3 py-1.5 rounded-full border-[#D5DFD0] h-auto">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Prev
                </Button>
                <div className="flex items-center gap-1">
                  {quizData.questions.map((_, i) => (
                    <div key={i} onClick={() => setCurrentQuestionIndex(i)} className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === currentQuestionIndex ? 'bg-indigo-600' : quizData.responses?.find(r => r.questionId === quizData.questions[i].id) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  ))}
                </div>
                {isLastQuestion ? (
                  <Button onClick={handleSubmitQuiz} disabled={submitting} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white text-[9px] px-3 py-1.5 rounded-full h-auto font-bold">
                    {submitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] px-3 py-1.5 rounded-full h-auto font-bold">
                    Next <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {(quizData.status === 'completed' || showResults) && (() => {
            const correctAnswers = quizData.responses?.filter(r => {
              const question = quizData.questions.find(q => q.id === r.questionId);
              if (!question) return false;
              const correctAnswerIndex = question.options.findIndex(option => option === question.answer.value);
              return r.selectedIndex === correctAnswerIndex;
            }).length || 0;
            const totalQuestions = quizData.questions.length;
            const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

            return (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <Trophy className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h3 className="text-xs font-extrabold text-emerald-900 mb-1">Quiz Complete! 🎉</h3>
                  <div className="text-2xl font-extrabold text-emerald-600 mb-1">{percentage}%</div>
                  <p className="text-[9px] text-emerald-700 font-semibold">You got {correctAnswers} out of {totalQuestions} correct!</p>
                </div>

                {/* Review */}
                <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
                  <h4 className="text-[10px] font-bold text-[#18211A] mb-2">Review Your Answers</h4>
                  <div className="space-y-2.5">
                    {quizData.questions.map((question) => {
                      const response = quizData.responses?.find(r => r.questionId === question.id);
                      const isCorrect = response ? response.selectedIndex === question.options.findIndex(o => o === question.answer.value) : false;
                      return (
                        <div key={question.id} className="bg-[#F5F7F2] border border-[#D5DFD0]/50 p-2.5 rounded-xl">
                          <div className="flex items-start gap-1.5">
                            {isCorrect ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-none" /> : <X className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-none" />}
                            <div className="flex-1">
                              <p className="text-[9px] font-bold text-[#18211A] mb-1">{question.question}</p>
                              <p className="text-[8px] text-[#607060]">Your answer: <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>{response?.selectedAnswer || 'No answer'}</span></p>
                              {!isCorrect && <p className="text-[8px] text-[#607060]">Correct: <span className="text-emerald-700 font-bold">{question.answer.value}</span></p>}
                              {question.explanation && <p className="text-[7px] text-blue-700 bg-blue-50 rounded-lg p-1.5 mt-1">💡 {question.explanation}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </MobileSimulatorLayout>
  );
};

export default WeeklyQuiz;