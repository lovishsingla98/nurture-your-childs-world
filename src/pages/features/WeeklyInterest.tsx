import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import DashboardHeader from '@/components/site/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { WeeklyInterestData, WeeklyInterestQuestion } from '@/lib/types';
import { 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle, 
  Send,
  Heart,
  ArrowRight
} from 'lucide-react';

// Using types from @/lib/types instead of local interfaces

const WeeklyInterest: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getValidToken } = useAuth();
  const [interestData, setInterestData] = useState<WeeklyInterestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const fetchWeeklyInterest = async () => {
    try {
      setLoading(true);
      await getValidToken();
      
      console.log('Fetching weekly interest for childId:', childId);
      const response = await apiClient.getWeeklyInterest(childId!);
      
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        console.log('Setting interest data:', response.data);
        setInterestData(response.data);
      } else {
        console.error('API returned error:', response.error);
        toast.error(response.error || 'Failed to load this week\'s questions');
      }
    } catch (error: any) {
      console.error('Failed to fetch weekly interest:', error);
      toast.error('Failed to load this week\'s questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (questionId: string, answer: string, selectedIndex: number) => {
    if (!interestData) return;
    
    const updatedQuestions = interestData.questions.map(q => 
      q.id === questionId ? { ...q, selectedAnswer: answer, selectedIndex } : q
    );
    
    // If this is the first answer and status is still pending, start the questionnaire
    if (interestData.status === 'pending') {
      try {
        await getValidToken();
        const startResponse = await apiClient.startWeeklyInterest(childId!, interestData.id);
        
        if (startResponse.success) {
          setInterestData({
            ...interestData,
            questions: updatedQuestions,
            status: 'in_progress'
          });
        } else {
          toast.error('Failed to start questionnaire');
          return;
        }
      } catch (error: any) {
        console.error('Failed to start weekly interest:', error);
        toast.error('Failed to start questionnaire');
        return;
      }
    } else {
      setInterestData({
        ...interestData,
        questions: updatedQuestions
      });
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
      
      // Prepare responses array for API
      const responses = interestData.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: q.selectedAnswer!,
        selectedIndex: q.selectedIndex!
      }));
      
      const result = await apiClient.completeWeeklyInterest(childId!, interestData.id, responses);
      
      if (result.success) {
        setInterestData(prev => prev ? {
          ...prev,
          status: 'completed',
          completedAt: new Date().toISOString()
        } : null);
        
        toast.success('Thank you! Your interests have been recorded.');
      } else {
        toast.error(result.error || 'Failed to submit answers');
      }
    } catch (error: any) {
      console.error('Failed to submit answers:', error);
      toast.error('Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchWeeklyInterest();
    }
  }, [childId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading this week's questions...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = interestData?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === interestData!.questions.length - 1;
  const allQuestionsAnswered = interestData?.questions.every(q => q.selectedAnswer);

  // Debug logging
  console.log('Component state:', {
    loading,
    interestData: interestData ? {
      id: interestData.id,
      title: interestData.title,
      status: interestData.status,
      questionsCount: interestData.questions?.length,
      currentQuestionIndex,
      currentQuestion: currentQuestion ? {
        id: currentQuestion.id,
        question: currentQuestion.question,
        optionsCount: currentQuestion.options?.length
      } : null
    } : null
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/child/${childId}`)} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Child Dashboard
          </Button>
        </div>

        {interestData && (
          <>
            {/* Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-slate-600">{interestData.week}</span>
                    </div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">{interestData.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      {interestData.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      interestData.status === 'completed' ? 'default' :
                      interestData.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                    className={
                      interestData.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      interestData.status === 'in_progress' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }
                  >
                    {interestData.status === 'completed' ? 'Completed' :
                     interestData.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Question {currentQuestionIndex + 1} of {interestData.questions.length}
                  </span>
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / interestData.questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Card */}
            {interestData.status !== 'completed' && currentQuestion && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">{currentQuestion.question}</CardTitle>
                  <CardDescription>Choose the option that best describes you!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={currentQuestion.selectedAnswer || ''} 
                    onValueChange={(value) => {
                      const selectedIndex = currentQuestion.options.findIndex(option => option === value);
                      handleAnswerSelect(currentQuestion.id, value, selectedIndex);
                    }}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
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
            {interestData.status !== 'completed' && (
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
                      {interestData.questions.map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentQuestionIndex ? 'bg-purple-600' :
                            interestData.questions[index].selectedAnswer ? 'bg-green-500' :
                            'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    {isLastQuestion ? (
                      <Button 
                        onClick={handleSubmitAnswers}
                        disabled={submitting || !allQuestionsAnswered}
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
                            Submit Answers
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleNextQuestion}
                        disabled={!currentQuestion?.selectedAnswer}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Status */}
            {interestData.status === 'completed' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-900 mb-2">All Done! 🎉</h3>
                    <p className="text-green-700 mb-4">
                      Thank you for sharing your interests with us! 
                      {interestData.completedAt && (
                        <span className="block text-sm mt-2">
                          Completed at {new Date(interestData.completedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </p>
                    <div className="bg-white/70 p-4 rounded-lg max-w-2xl mx-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium text-slate-900">Your Answers Help Us Understand You Better!</h4>
                      </div>
                      <p className="text-slate-700 text-sm">
                        We'll use these insights to create more personalized activities and suggestions just for you.
                        Check back next week for new questions!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WeeklyInterest;