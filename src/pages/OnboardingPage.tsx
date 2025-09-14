import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, CheckCircle, ArrowLeft, User, Calendar, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { 
  OnboardingQuestionnaire, 
  OnboardingQuestion, 
  OnboardingResponse,
  OnboardingAnswerData,
  NextQuestionResponse 
} from '@/lib/types';
import OnboardingLoadingScreen from '@/components/forms/OnboardingLoadingScreen';

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

  useEffect(() => {
    if (childId && user) {
      fetchQuestionnaire();
    }
  }, [childId, user]);

  const fetchQuestionnaire = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await getValidToken();
      const response = await apiClient.getOnboardingQuestionnaire(childId!);
      
      if (response.success && response.data) {
        console.log('📊 Received questionnaire data:', response.data);
        console.log('📊 Child object:', response.data.child);
        setQuestionnaire(response.data);
        
        // Check if questionnaire is completed
        if (response.data.status === 'completed') {
          // Questionnaire is completed, show completion screen
          setCurrentQuestionIndex(-1); // Special index for completion screen
        } else {
          // Find the first unanswered question
          const firstUnansweredIndex = response.data.questions.findIndex(
            (q: OnboardingQuestion) => !response.data.responses.find(
              (r: OnboardingResponse) => r.questionId === q.questionId
            )
          );
          
          setCurrentQuestionIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
        }
      } else {
        setError('Failed to load questionnaire');
        toast.error('Failed to load questionnaire');
      }
    } catch (error: any) {
      console.error('Error fetching questionnaire:', error);
      setError(error.message || 'Failed to load questionnaire');
      toast.error('Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestion = (): OnboardingQuestion | null => {
    if (!questionnaire || !questionnaire.questions[currentQuestionIndex]) {
      return null;
    }
    return questionnaire.questions[currentQuestionIndex];
  };

  const getProgressPercentage = (): number => {
    if (!questionnaire) return 0;
    const totalQuestions = 10; // Hardcoded total questions
    return Math.round((questionnaire.responses.length / totalQuestions) * 100);
  };

  const handleAnswerSubmit = async () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !childId) return;

    // Validate answer
    if (currentQuestion.required && !currentAnswer && !selectedOption) {
      toast.error('Please provide an answer to continue');
      return;
    }

    try {
      setSubmitting(true);
      
      await getValidToken();
      
      const answerData = {
        questionId: currentQuestion.questionId,
        answer: currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'rating' 
          ? selectedOption 
          : currentAnswer,
        optionId: currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'rating' 
          ? selectedOption 
          : undefined
      };

      const response = await apiClient.submitOnboardingAnswer(childId, answerData);
      
      if (response.success) {
        // Clear current answer
        setCurrentAnswer('');
        setSelectedOption('');

        // Check completion status
        if (response.data?.questionnaireCompleted) {
          console.log('🎉 Questionnaire completed and child onboarded!');
          toast.success('Onboarding completed successfully! Your child is now ready to explore.');
        } else if (response.data?.nextQuestion) {
          console.log('🎉 Next question auto-generated:', response.data.nextQuestion);
          toast.success('Answer submitted successfully! Next question generated.');
        } else {
          toast.success('Answer submitted successfully!');
        }

        // Fetch updated questionnaire to check status
        await fetchQuestionnaire();
      } else {
        throw new Error(response.message || 'Failed to submit answer');
      }
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast.error(error.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setCurrentAnswer('');
      setSelectedOption('');
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < (questionnaire?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      setSelectedOption('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading onboarding questionnaire...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-red-500 mb-4">
              <Heart className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Loading Questionnaire...</h3>
            <p className="text-gray-600 mb-4">Please wait while we load your child's onboarding questions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-gray-500 mb-4">
              <User className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Questionnaire not found</h3>
            <p className="text-gray-600 mb-4">The onboarding questionnaire could not be loaded.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const isLastQuestion = currentQuestionIndex === questionnaire.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isCompleted = currentQuestionIndex === -1;
  
  // Check if this is truly the last question (reached 10 questions or questionnaire completed)
  const isTrulyLastQuestion = questionnaire.responses.length >= 9 || questionnaire.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Loading Screen - shows when generating next question */}
      <OnboardingLoadingScreen 
        isLoading={submitting}
        currentQuestionNumber={currentQuestionIndex + 1}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Onboarding for {questionnaire.child?.displayName || 'Child'}
                </h1>
                <p className="text-sm text-gray-600">
                  {questionnaire.child?.age || 'Unknown'} years old • {questionnaire.child?.gender || 'Unknown'}
                </p>
              </div>
            </div>
            <Badge variant={questionnaire.status === 'completed' ? 'default' : 'secondary'}>
              {questionnaire.status === 'completed' ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {questionnaire.responses.length} of 10 questions
            </span>
            <span className="text-sm text-gray-500">{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {isCompleted ? (
            <Card className="shadow-lg">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Onboarding Completed! 🎉
                </h2>
                <p className="text-gray-600 mb-6">
                  Congratulations! You've successfully completed the onboarding questionnaire for {questionnaire.child?.displayName || 'your child'}. 
                  We now have a better understanding of your child's interests and learning preferences.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Access personalized learning activities</li>
                    <li>• Track your child's progress</li>
                    <li>• Discover new interests and strengths</li>
                    <li>• Get tailored recommendations</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => {
                    // Small delay to ensure any pending state updates are complete
                    setTimeout(() => {
                      navigate(`/child/${childId}`);
                    }, 100);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Go to Child Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : currentQuestion && (
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Question {currentQuestionIndex + 1} of 10
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {currentQuestion.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {currentQuestion.learningDomain.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Question */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {currentQuestion.text}
                  </h3>
                  
                  {/* Answer Input */}
                  {currentQuestion.type === 'text' && (
                    <Textarea
                      placeholder="Type your answer here..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="min-h-[120px] resize-none"
                      disabled={submitting}
                    />
                  )}
                  
                  {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                    <RadioGroup
                      value={selectedOption}
                      onValueChange={setSelectedOption}
                      disabled={submitting}
                    >
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="text-base cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {currentQuestion.type === 'rating' && currentQuestion.options && (
                    <RadioGroup
                      value={selectedOption}
                      onValueChange={setSelectedOption}
                      disabled={submitting}
                    >
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="text-base cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    {!isFirstQuestion && (
                      <Button
                        variant="outline"
                        onClick={handlePreviousQuestion}
                        disabled={submitting}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    
                    {!currentQuestion.required && !isLastQuestion && (
                      <Button
                        variant="ghost"
                        onClick={handleSkipQuestion}
                        disabled={submitting}
                      >
                        Skip
                      </Button>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={
                      submitting || 
                      (currentQuestion.required && !currentAnswer && !selectedOption)
                    }
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : isTrulyLastQuestion ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Onboarding
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
