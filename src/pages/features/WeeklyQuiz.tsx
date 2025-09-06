import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import DashboardHeader from '@/components/site/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Brain, 
  CheckCircle, 
  Send,
  Trophy,
  ArrowRight,
  X,
  Timer,
  Star
} from 'lucide-react';
import { QuizQuestion, WeeklyQuizData } from '@/lib/types';

const WeeklyQuiz: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
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
        // Transform API data to match our component interface
        const apiData = response.data;
        
        console.log('📋 Weekly Quiz API Response:', apiData);
        
        const transformedData: WeeklyQuizData = {
          quizId: apiData.quizId || `quiz_${Date.now()}`,
          week: apiData.week || 'Current Week',
          title: 'Weekly Learning Review',
          description: 'Let\'s review what you\'ve learned this week through fun questions!',
          timeLimit: 15,
          childId: apiData.childId || childId || '',
          parentId: apiData.parentId || '',
          questions: apiData.questions?.map((q: any, index: number) => {
            console.log(`🔍 Question ${index + 1}:`, q);
            return {
              id: q.id || `q${index + 1}`,
              question: q.question,
              options: q.options,
              answer: {
                value: q.answer.value,
                index: q.answer.index
              },
              selectedAnswer: q.selectedAnswer,
              topic: q.topic || 'General Knowledge',
              explanation: q.explanation || 'Great job on this question!'
            };
          }) || [],
          status: apiData.status || 'pending',
          score: apiData.score,
          completedAt: apiData.completedAt
        };
        
        console.log('✅ Transformed Quiz Data:', transformedData);
        setQuizData(transformedData);
      } else {
        toast.error(response.error || 'Failed to load this week\'s quiz');
      }
    } catch (error: any) {
      console.error('Failed to fetch weekly quiz:', error);
      toast.error('Failed to load this week\'s quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (!quizData) return;
    
    setQuizData(prev => prev ? { ...prev, status: 'in_progress' } : null);
    setTimeRemaining(quizData.timeLimit * 60); // Convert to seconds
    
    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    toast.info('Time\'s up! Let\'s see how you did.');
    handleSubmitQuiz();
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!quizData) return;
    
    const updatedQuestions = quizData.questions.map(q => 
      q.id === questionId ? { ...q, selectedAnswer: answer } : q
    );
    
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;

    const unansweredQuestions = quizData.questions.filter(q => !q.selectedAnswer);
    if (unansweredQuestions.length > 0) {
      toast.error('Please answer all questions before submitting!');
      return;
    }

    try {
      setSubmitting(true);
      await getValidToken();
      
      // Calculate score
      const correctAnswers = quizData.questions.filter(q => 
        q.selectedAnswer === q.answer.value
      ).length;
      const score = Math.round((correctAnswers / quizData.questions.length) * 100);
      
      // Prepare responses for API with questionId, selectedAnswer, and selectedIndex
      const responses = quizData.questions.map((q, index) => ({
        questionId: q.id,
        selectedAnswer: q.selectedAnswer || '',
        selectedIndex: index
      }));
      
      console.log('📤 Submitting quiz responses:', responses);
      
      // Submit to API using the quiz ID (week timestamp)
      const result = await apiClient.completeWeeklyQuiz(childId!, quizData.quizId, responses);
      
      console.log('📥 Quiz submission result:', result);
      
      if (result.success) {
        setQuizData(prev => prev ? {
          ...prev,
          status: 'completed',
          score,
          completedAt: new Date().toISOString()
        } : null);
        
        setShowResults(true);
        setTimeRemaining(null);
        
        toast.success(`Quiz completed! You scored ${score}%`);
      } else {
        toast.error(result.error || 'Failed to submit quiz');
      }
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchWeeklyQuiz();
    }
  }, [childId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (quizData?.questions?.length || 0) - 1;
  const allQuestionsAnswered = quizData?.questions?.every(q => q.selectedAnswer) || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading this week's quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate(`/child/${childId}`)} className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Child Dashboard
            </Button>
          </div>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Quiz Available</h3>
                <p className="text-slate-600 mb-4">
                  There's no quiz available for this week. Please check back later or contact support.
                </p>
                <Button onClick={() => fetchWeeklyQuiz()} className="bg-indigo-600 hover:bg-indigo-700">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/child/${childId}`)} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Child Dashboard
          </Button>
        </div>

        {/* Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-slate-600">{quizData.week}</span>
                    </div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">{quizData.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      {quizData.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        quizData.status === 'completed' ? 'default' :
                        quizData.status === 'in_progress' ? 'secondary' : 'outline'
                      }
                      className={
                        quizData.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                        quizData.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }
                    >
                      {quizData.status === 'completed' ? 'Completed' :
                       quizData.status === 'in_progress' ? 'In Progress' : 'Ready to Start'}
                    </Badge>
                    {timeRemaining !== null && quizData.status === 'in_progress' && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Timer className="w-4 h-4 text-orange-600" />
                        <span className={timeRemaining < 60 ? 'text-red-600 font-bold' : 'text-slate-600'}>
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              {quizData.status === 'in_progress' && (
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Question {currentQuestionIndex + 1} of {quizData.questions.length}
                    </span>
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Quiz Start */}
            {quizData.status === 'pending' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Trophy className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready for Your Weekly Quiz?</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      You'll have {quizData.timeLimit} minutes to answer {quizData.questions.length} questions about what you've learned this week.
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-6 text-sm text-slate-500">
                      <span>⏱️ {quizData.timeLimit} minutes</span>
                      <span>❓ {quizData.questions.length} questions</span>
                      <span>🎯 Mixed topics</span>
                    </div>
                    <Button onClick={startQuiz} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                      <Brain className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz Question */}
            {quizData.status === 'in_progress' && currentQuestion && !showResults && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">
                        {currentQuestion.topic}
                      </Badge>
                      <CardTitle className="text-lg text-slate-900">{currentQuestion.question}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={currentQuestion.selectedAnswer || ''} 
                    onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="flex-1 cursor-pointer text-slate-700 leading-relaxed"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            {quizData.status === 'in_progress' && !showResults && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {quizData.questions.map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
                            index === currentQuestionIndex ? 'bg-indigo-600' :
                            quizData.questions[index].selectedAnswer ? 'bg-green-500' :
                            'bg-slate-300'
                          }`}
                          onClick={() => setCurrentQuestionIndex(index)}
                        />
                      ))}
                    </div>

                    {isLastQuestion ? (
                      <Button 
                        onClick={handleSubmitQuiz}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Quiz
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleNextQuestion}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {(quizData.status === 'completed' || showResults) && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-green-900 mb-2">Quiz Complete! 🎉</h3>
                    <div className="text-4xl font-bold text-green-600 mb-2">{quizData.score}%</div>
                    <p className="text-green-700">
                      You got {quizData.questions.filter(q => q.selectedAnswer === q.answer.value).length} out of {quizData.questions.length} questions correct!
                    </p>
                  </div>

                  {/* Question Review */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Review Your Answers</h4>
                    {quizData.questions.map((question, index) => {
                      const isCorrect = question.selectedAnswer === question.answer.value;
                      return (
                        <div key={question.id} className="bg-white/70 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 mb-2">{question.question}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-slate-600">Your answer: </span>
                                  <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700'}>
                                    {question.selectedAnswer || 'No answer'}
                                  </span>
                                </div>
                                {!isCorrect && (
                                  <div>
                                    <span className="text-slate-600">Correct answer: </span>
                                    <span className="text-green-700 font-medium">{question.answer.value}</span>
                                  </div>
                                )}
                              </div>
                              {question.explanation && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                                  💡 {question.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      );
    };

export default WeeklyQuiz;