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
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle, 
  Send,
  Target,
  ArrowRight,
  Star
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  context: string;
  options: string[];
  selectedAnswer?: string;
}

interface WeeklyPotentialData {
  id: string;
  week: string;
  title: string;
  description: string;
  questions: Question[];
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

const WeeklyPotential: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getValidToken } = useAuth();
  const [potentialData, setPotentialData] = useState<WeeklyPotentialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const fetchWeeklyPotential = async () => {
    try {
      setLoading(true);
      await getValidToken();
      
      // TODO: Replace with actual API call
      // const response = await apiClient.getWeeklyPotential(childId, getCurrentWeek());
      
      // Mock data for now
      const mockData: WeeklyPotentialData = {
        id: 'potential_week_3_2025',
        week: 'Week 3, 2025',
        title: 'Discovering Natural Strengths',
        description: 'These questions help us understand your child\'s natural abilities and talents.',
        questions: [
          {
            id: 'q1',
            question: 'When given a complex puzzle or building challenge, how does your child typically approach it?',
            context: 'Observing problem-solving approach and persistence',
            options: [
              'Jumps in immediately and learns by trial and error',
              'Studies it carefully first, then creates a systematic plan',
              'Asks for hints or guidance before starting',
              'Gets excited but needs encouragement to stick with it',
              'Breaks it down into smaller, manageable pieces'
            ]
          },
          {
            id: 'q2',
            question: 'How well can your child explain something they just learned to another person?',
            context: 'Assessing comprehension and communication skills',
            options: [
              'Explains clearly with good examples and details',
              'Gets the main points across but misses some details',
              'Struggles to put it into words but shows understanding',
              'Prefers to demonstrate rather than explain verbally',
              'Needs help organizing their thoughts first'
            ]
          },
          {
            id: 'q3',
            question: 'When playing with others, what role does your child naturally take?',
            context: 'Understanding social dynamics and leadership potential',
            options: [
              'Often becomes the leader and organizes activities',
              'Happily follows along and supports group decisions',
              'Suggests creative alternatives and new ideas',
              'Prefers one-on-one interactions over groups',
              'Takes on a peacemaker role when conflicts arise'
            ]
          },
          {
            id: 'q4',
            question: 'How does your child handle tasks that require sustained attention?',
            context: 'Evaluating focus and concentration abilities',
            options: [
              'Can focus intensely for long periods when interested',
              'Works well in short bursts with breaks',
              'Needs frequent reminders to stay on task',
              'Performs better with background music or movement',
              'Focuses best when working alongside someone'
            ]
          },
          {
            id: 'q5',
            question: 'When something doesn\'t work as expected, how does your child typically react?',
            context: 'Assessing resilience and growth mindset',
            options: [
              'Gets motivated to figure out what went wrong',
              'Takes a break and comes back to it later',
              'Asks for help or looks for alternative solutions',
              'Shows initial frustration but bounces back quickly',
              'Needs emotional support before trying again'
            ]
          }
        ],
        status: 'pending'
      };
      
      setPotentialData(mockData);
    } catch (error: any) {
      console.error('Failed to fetch weekly potential:', error);
      toast.error('Failed to load this week\'s assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!potentialData) return;
    
    const updatedQuestions = potentialData.questions.map(q => 
      q.id === questionId ? { ...q, selectedAnswer: answer } : q
    );
    
    setPotentialData({
      ...potentialData,
      questions: updatedQuestions,
      status: 'in_progress'
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < potentialData!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAnswers = async () => {
    if (!potentialData) return;
    
    const unansweredQuestions = potentialData.questions.filter(q => !q.selectedAnswer);
    if (unansweredQuestions.length > 0) {
      toast.error('Please answer all questions before submitting!');
      return;
    }

    try {
      setSubmitting(true);
      await getValidToken();
      
      // TODO: Replace with actual API call
      // const result = await apiClient.submitWeeklyPotential(childId, potentialData.id, potentialData.questions);
      
      // Mock success for now
      setPotentialData(prev => prev ? {
        ...prev,
        status: 'completed',
        completedAt: new Date().toISOString()
      } : null);
      
      toast.success('Assessment completed! We\'re analyzing the strengths.');
    } catch (error: any) {
      console.error('Failed to submit answers:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchWeeklyPotential();
    }
  }, [childId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading potential assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = potentialData?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === potentialData!.questions.length - 1;
  const allQuestionsAnswered = potentialData?.questions.every(q => q.selectedAnswer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/child/${childId}`)} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Child Dashboard
          </Button>
        </div>

        {potentialData && (
          <>
            {/* Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-600">{potentialData.week}</span>
                    </div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">{potentialData.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      {potentialData.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      potentialData.status === 'completed' ? 'default' :
                      potentialData.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                    className={
                      potentialData.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      potentialData.status === 'in_progress' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }
                  >
                    {potentialData.status === 'completed' ? 'Completed' :
                     potentialData.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Question {currentQuestionIndex + 1} of {potentialData.questions.length}
                  </span>
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / potentialData.questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Card */}
            {potentialData.status !== 'completed' && currentQuestion && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg text-slate-900 mb-2">{currentQuestion.question}</CardTitle>
                      <CardDescription className="text-emerald-700 font-medium">
                        💡 {currentQuestion.context}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={currentQuestion.selectedAnswer || ''} 
                    onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 transition-colors border border-slate-200">
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
            {potentialData.status !== 'completed' && (
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
                      {potentialData.questions.map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentQuestionIndex ? 'bg-emerald-600' :
                            potentialData.questions[index].selectedAnswer ? 'bg-green-500' :
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
                            Submit Assessment
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleNextQuestion}
                        disabled={!currentQuestion?.selectedAnswer}
                        className="bg-emerald-600 hover:bg-emerald-700"
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
            {potentialData.status === 'completed' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-900 mb-2">Assessment Complete! 🌟</h3>
                    <p className="text-green-700 mb-4">
                      Thank you for completing the potential assessment! 
                      {potentialData.completedAt && (
                        <span className="block text-sm mt-2">
                          Completed at {new Date(potentialData.completedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </p>
                    <div className="bg-white/70 p-4 rounded-lg max-w-2xl mx-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-medium text-slate-900">Analyzing Strengths & Potential</h4>
                      </div>
                      <p className="text-slate-700 text-sm">
                        We're now analyzing these responses to better understand your child's natural strengths and learning style.
                        This will help us create more targeted activities and recommendations.
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

export default WeeklyPotential;