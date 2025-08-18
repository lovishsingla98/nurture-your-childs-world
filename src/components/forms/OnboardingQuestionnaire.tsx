import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice';
  options?: string[];
}

interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

interface OnboardingQuestionnaireProps {
  childData: {
    displayName: string;
    age: number;
    gender: string;
    dateOfBirth: string;
  };
  onComplete: (questionnaire: QuestionAnswer[]) => void;
  onCancel: () => void;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({
  childData,
  onComplete,
  onCancel
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionnaire, setQuestionnaire] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const TOTAL_QUESTIONS = 25;

  // Dummy API call to get next question
  const getNextQuestion = useCallback(async (previousQAs: QuestionAnswer[] = []) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock question generation based on progress and previous answers
      const questionNum = previousQAs.length + 1;
      
      const mockQuestions = [
        "What activities make you feel most excited and energized?",
        "When you imagine your perfect day, what would you be doing?",
        "What subjects in school do you find most interesting?",
        "Do you prefer working alone or with others?",
        "What kind of problems do you enjoy solving?",
        "What would you like to learn more about?",
        "When you play, what types of games do you choose?",
        "What makes you feel proud of yourself?",
        "If you could teach someone something, what would it be?",
        "What do you do when you face a challenge?",
        "What kind of stories or movies do you like best?",
        "How do you like to spend your free time?",
        "What would you do if you had unlimited resources?",
        "What kind of environment do you work best in?",
        "What motivates you to keep trying when something is difficult?",
        "What kind of impact would you like to have on the world?",
        "What skills would you like to develop?",
        "How do you prefer to learn new things?",
        "What kind of projects excite you the most?",
        "What values are most important to you?",
        "What kind of leadership style resonates with you?",
        "How do you handle stress or pressure?",
        "What kind of feedback helps you improve?",
        "What would success look like for you?",
        "What legacy would you like to leave behind?"
      ];

      const mockQuestion: Question = {
        id: `q_${questionNum}`,
        text: mockQuestions[questionNum - 1] || `Question ${questionNum}: Tell us more about your interests.`,
        type: 'text'
      };

      return mockQuestion;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw new Error('Failed to fetch next question');
    } finally {
      setLoading(false);
    }
  }, []);

  // Start questionnaire by getting first question
  const startQuestionnaire = useCallback(async () => {
    try {
      const firstQuestion = await getNextQuestion();
      setCurrentQuestion(firstQuestion);
      setQuestionNumber(1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start questionnaire');
    }
  }, [getNextQuestion]);

  // Submit current answer and get next question
  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !currentAnswer.trim()) {
      toast.error('Please provide an answer before continuing');
      return;
    }

    const newQA: QuestionAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.text,
      answer: currentAnswer.trim()
    };

    const updatedQuestionnaire = [...questionnaire, newQA];
    setQuestionnaire(updatedQuestionnaire);

    if (updatedQuestionnaire.length >= TOTAL_QUESTIONS) {
      // Questionnaire completed
      setIsCompleted(true);
      toast.success('Questionnaire completed!');
      return;
    }

    try {
      const nextQuestion = await getNextQuestion(updatedQuestionnaire);
      setCurrentQuestion(nextQuestion);
      setCurrentAnswer('');
      setQuestionNumber(updatedQuestionnaire.length + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to get next question');
    }
  }, [currentQuestion, currentAnswer, questionnaire, getNextQuestion]);

  // Complete onboarding process
  const completeOnboarding = useCallback(() => {
    onComplete(questionnaire);
  }, [questionnaire, onComplete]);

  // Initialize questionnaire on mount
  React.useEffect(() => {
    startQuestionnaire();
  }, [startQuestionnaire]);

  const progress = (questionnaire.length / TOTAL_QUESTIONS) * 100;

  if (isCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Questionnaire Complete!</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for completing {childData.displayName}'s onboarding questionnaire.
            We'll use these insights to personalize their learning journey.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={completeOnboarding}>
              Complete Onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-lg">
              Onboarding for {childData.displayName}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {questionnaire.length} of {TOTAL_QUESTIONS}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Question {questionNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading next question...</span>
            </div>
          ) : (
            <>
              <p className="text-lg leading-relaxed">
                {currentQuestion?.text}
              </p>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts here..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel Onboarding
                  </Button>
                  
                  <Button
                    onClick={submitAnswer}
                    disabled={loading || !currentAnswer.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Previous Questions Summary */}
      {questionnaire.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Previous Responses ({questionnaire.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {questionnaire.slice(-3).map((qa, index) => (
                <div key={qa.questionId} className="text-sm">
                  <p className="font-medium">Q{questionnaire.length - 2 + index}: {qa.question}</p>
                  <p className="text-muted-foreground ml-4">"{qa.answer}"</p>
                </div>
              ))}
              {questionnaire.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ... and {questionnaire.length - 3} more responses
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnboardingQuestionnaire;