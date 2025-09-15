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
  const [showTyping, setShowTyping] = useState(false);
  const facts = [
    '🧠 Did you know? Children ask an average of 73 questions per day!',
    '✨ Short, consistent routines build stronger long‑term habits.',
    '💡 Open‑ended questions spark curiosity better than yes/no questions.',
    '🎯 Tiny progress daily > giant leaps rarely. Keep it playful!',
    '🌟 Short breaks can improve focus and memory in kids.',
  ];
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFactIndex((i) => (i + 1) % facts.length);
    }, 12000);
    return () => clearInterval(id);
  }, []);

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

  const handleAnswerSubmit = async (clickedOptionId?: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !childId) return;

    // Determine effective answer based on click or current state
    const effectiveOptionId = clickedOptionId || selectedOption;
    const effectiveText = currentAnswer;

    // Validate answer
    if (currentQuestion.required && !effectiveText && !effectiveOptionId) {
      toast.error('Please provide an answer to continue');
      return;
    }

    try {
      setSubmitting(true);
      setShowTyping(true);
      
      await getValidToken();
      
      const answerData = {
        questionId: currentQuestion.questionId,
        answer: currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'rating'
          ? (effectiveOptionId || '')
          : effectiveText,
        optionId: currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'rating'
          ? (effectiveOptionId || '')
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
      // Keep typing for a brief moment to mimic chat typing effect
      setTimeout(() => setShowTyping(false), 400);
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
      {/* Replace full-screen loader with inline typing indicator UI */}
      
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
        <div className="max-w-3xl mx-auto">
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
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 relative">
              {/* Chat header meta */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of 10</div>
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

              {/* Chat body */}
              <div className="space-y-4">
                {/* Question bubble (left) */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-semibold">Q</div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                    {currentQuestion.text}
                  </div>
                </div>

                {/* (typing indicator moved to bottom of chat body) */}

                {/* Options bubble (right) */}
                <div className="flex justify-end">
                  <div className="max-w-[85%]">
                    {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                      <div className="rounded-2xl rounded-tr-sm bg-purple-50 p-3 sm:p-4">
                        <div className="flex flex-col gap-2">
                          {currentQuestion.options.map((option) => (
                            <Button
                              key={option.id}
                              variant={selectedOption === option.id ? 'default' : 'outline'}
                              className={`justify-start text-left w-full whitespace-pre-wrap break-words leading-normal ${selectedOption === option.id ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
                              disabled={submitting}
                              onClick={async () => {
                                setSelectedOption(option.id);
                                await handleAnswerSubmit(option.id);
                              }}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentQuestion.type === 'rating' && currentQuestion.options && (
                      <div className="rounded-2xl rounded-tr-sm bg-purple-50 p-4">
                        <RadioGroup
                          value={selectedOption}
                          onValueChange={(v) => setSelectedOption(v)}
                          disabled={submitting}
                        >
                          <div className="flex flex-col gap-2">
                            {currentQuestion.options.map((option) => (
                              <Button
                                key={option.id}
                                variant={selectedOption === option.id ? 'default' : 'outline'}
                                className={`w-full justify-start text-left whitespace-pre-wrap break-words leading-normal ${selectedOption === option.id ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
                                onClick={async () => {
                                  setSelectedOption(option.id);
                                  await handleAnswerSubmit(option.id);
                                }}
                              >
                                {option.text}
                              </Button>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {currentQuestion.type === 'text' && (
                      <div className="rounded-2xl rounded-tr-sm bg-purple-50 p-3 sm:p-4">
                        <div className="flex items-end gap-2">
                          <Textarea
                            placeholder="Type your answer..."
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            className="min-h-[80px] resize-none"
                            disabled={submitting}
                          />
                          <Button
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={submitting || (currentQuestion.required && !currentAnswer)}
                            onClick={handleAnswerSubmit}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* (typing indicator now rendered above under the question) */}
                  </div>
                </div>

                {/* Typing indicator at the bottom, left-aligned */}
                {showTyping && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-semibold">Q</div>
                    <div className="rounded-full bg-purple-600/90 text-white px-3 py-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{animationDelay: '120ms'}}></span>
                        <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{animationDelay: '240ms'}}></span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Back/Skip minimal controls */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    {!isFirstQuestion && (
                      <Button variant="ghost" size="sm" onClick={handlePreviousQuestion} disabled={submitting}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                    )}
                    {!currentQuestion.required && !isLastQuestion && (
                      <Button variant="ghost" size="sm" onClick={handleSkipQuestion} disabled={submitting}>
                        Skip
                      </Button>
                    )}
                  </div>
                  {isTrulyLastQuestion && (
                    <Badge variant="default">Last question</Badge>
                  )}
                </div>
              </div>

              {/* Semi-transparent scrolling fact bar while thinking */}
              {showTyping && (
                <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 sm:px-6">
                  <div className="relative w-full overflow-hidden">
                    {/* Moving band (background travels with text) */}
                    <div
                      className="inline-flex items-center bg-white/65 backdrop-blur-[2px] rounded-full shadow px-4 sm:px-6 py-2 whitespace-nowrap text-purple-900 text-sm sm:text-base font-medium"
                      style={{animation: 'marquee 8s linear infinite'}}
                    >
                      {facts[factIndex]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Local keyframes for marquee animation
const styleEl = document.createElement('style');
styleEl.innerHTML = `@keyframes marquee { from { transform: translateX(100%); } to { transform: translateX(-100%); } }`;
if (typeof document !== 'undefined' && !document.getElementById('onboarding-marquee-kf')) {
  styleEl.id = 'onboarding-marquee-kf';
  document.head.appendChild(styleEl);
}

export default OnboardingPage;
