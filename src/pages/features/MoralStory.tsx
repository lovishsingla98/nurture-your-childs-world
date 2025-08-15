import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import DashboardHeader from '@/components/site/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  BookOpen, 
  Heart,
  Play,
  Pause,
  RotateCcw,
  Send,
  Star,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';

interface MoralValue {
  name: string;
  description: string;
  color: string;
}

interface MoralStoryData {
  id: string;
  title: string;
  story: string;
  targetValues: MoralValue[];
  questions: {
    id: string;
    question: string;
    answer?: string;
  }[];
  ageAppropriate: boolean;
  estimatedReadingTime: number;
  audioUrl?: string;
  illustration?: string;
  status: 'unread' | 'reading' | 'completed';
  completedAt?: string;
}

const MoralStory: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getValidToken } = useAuth();
  const [storyData, setStoryData] = useState<MoralStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showQuestions, setShowQuestions] = useState(false);

  const fetchMoralStory = async () => {
    try {
      setLoading(true);
      await getValidToken();
      
      // TODO: Replace with actual API call
      // const response = await apiClient.getMoralStory(childId, new Date().toISOString().split('T')[0]);
      
      // Mock data for now
      const mockData: MoralStoryData = {
        id: 'story_20250115',
        title: 'The Little Engineer Who Could',
        story: `Once upon a time, in a colorful town filled with curious children, there lived a little girl named Maya who loved to build things. Every day, Maya would collect boxes, tubes, and bottle caps to create amazing inventions in her room.

One day, Maya's school announced a special contest: "Build something that helps your community!" Maya was so excited, but when she looked around, she saw her classmates had fancy building sets with perfect pieces. Maya only had her collection of recycled materials.

"I can't win with just old boxes and tubes," Maya thought sadly. She almost decided not to enter the contest.

But then Maya remembered her grandfather's words: "The best inventions come from creative hearts, not expensive parts." So Maya took a deep breath and started building.

She worked for hours, carefully designing a special bird feeder that could be made from things anyone could find at home. When other birds ate, it would ring a little bell made from a bottle cap to call more hungry birds.

On contest day, Maya nervously presented her creation. The judges were amazed! "This is brilliant!" said one judge. "You've shown that creativity and kindness matter more than having the fanciest materials."

Maya won first place, but more importantly, she learned that believing in yourself and using what you have with a generous heart can create wonderful things.

The whole town started making Maya's bird feeders, and soon every neighborhood was filled with happy, well-fed birds and the gentle sound of ringing bottle cap bells.`,
        targetValues: [
          {
            name: 'Perseverance',
            description: 'Not giving up when things seem difficult',
            color: 'bg-blue-100 text-blue-700'
          },
          {
            name: 'Creativity',
            description: 'Using imagination to solve problems',
            color: 'bg-purple-100 text-purple-700'
          },
          {
            name: 'Self-Confidence',
            description: 'Believing in your own abilities',
            color: 'bg-green-100 text-green-700'
          },
          {
            name: 'Resourcefulness',
            description: 'Making the best use of what you have',
            color: 'bg-orange-100 text-orange-700'
          }
        ],
        questions: [
          {
            id: 'q1',
            question: 'What did Maya want to do when she saw other kids had fancy building sets?'
          },
          {
            id: 'q2',
            question: 'What wise words did Maya\'s grandfather tell her?'
          },
          {
            id: 'q3',
            question: 'How did Maya\'s bird feeder help the community?'
          },
          {
            id: 'q4',
            question: 'What is one thing you learned from Maya\'s story that you can use in your own life?'
          }
        ],
        ageAppropriate: true,
        estimatedReadingTime: 5,
        status: 'unread'
      };
      
      setStoryData(mockData);
    } catch (error: any) {
      console.error('Failed to fetch moral story:', error);
      toast.error('Failed to load today\'s story');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReading = () => {
    if (storyData) {
      setStoryData({ ...storyData, status: 'reading' });
    }
  };

  const handleFinishReading = () => {
    setShowQuestions(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitReflection = async () => {
    const unansweredQuestions = storyData?.questions.filter(q => !answers[q.id]?.trim());
    if (unansweredQuestions && unansweredQuestions.length > 0) {
      toast.error('Please answer all reflection questions!');
      return;
    }

    try {
      setSubmitting(true);
      await getValidToken();
      
      // TODO: Replace with actual API call
      // const result = await apiClient.submitStoryReflection(childId, storyData.id, answers);
      
      // Mock success
      setStoryData(prev => prev ? {
        ...prev,
        status: 'completed',
        completedAt: new Date().toISOString(),
        questions: prev.questions.map(q => ({
          ...q,
          answer: answers[q.id]
        }))
      } : null);
      
      toast.success('Thank you for sharing your thoughts about the story!');
    } catch (error: any) {
      console.error('Failed to submit reflection:', error);
      toast.error('Failed to submit reflection');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback
  };

  useEffect(() => {
    if (childId) {
      fetchMoralStory();
    }
  }, [childId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading today's bedtime story...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/child/${childId}`)} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Child Dashboard
          </Button>
        </div>

        {storyData && (
          <>
            {/* Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-slate-600">Bedtime Values Story</span>
                      <Moon className="w-4 h-4 text-slate-400" />
                    </div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">{storyData.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      A story designed to nurture important values and character development.
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        storyData.status === 'completed' ? 'default' :
                        storyData.status === 'reading' ? 'secondary' : 'outline'
                      }
                      className={
                        storyData.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                        storyData.status === 'reading' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }
                    >
                      {storyData.status === 'completed' ? 'Completed' :
                       storyData.status === 'reading' ? 'Reading' : 'Ready to Read'}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      📖 {storyData.estimatedReadingTime} min read
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-slate-600 mb-2 block">Values this story teaches:</span>
                    <div className="flex flex-wrap gap-2">
                      {storyData.targetValues.map((value, index) => (
                        <Badge key={index} variant="secondary" className={value.color}>
                          {value.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={toggleAudio}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Story Content */}
            {storyData.status === 'unread' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready for Tonight's Story?</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      Get comfortable and let's dive into a wonderful story about {storyData.targetValues.map(v => v.name.toLowerCase()).join(', ')}.
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-6 text-sm text-slate-500">
                      <span>📚 Values-based story</span>
                      <span>⏱️ {storyData.estimatedReadingTime} minutes</span>
                      <span>🌟 Age appropriate</span>
                    </div>
                    <Button onClick={handleStartReading} size="lg" className="bg-purple-600 hover:bg-purple-700">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Start Reading
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Story Reading */}
            {storyData.status === 'reading' && !showQuestions && (
              <>
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                  <CardContent className="pt-6">
                    <div className="prose prose-lg max-w-none">
                      {storyData.story.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-slate-700 leading-relaxed mb-4 text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">How did you like the story?</h3>
                      <Button onClick={handleFinishReading} size="lg" className="bg-green-600 hover:bg-green-700">
                        <Star className="w-4 h-4 mr-2" />
                        I Finished Reading!
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Reflection Questions */}
            {showQuestions && storyData.status !== 'completed' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    Let's Think About the Story
                  </CardTitle>
                  <CardDescription>
                    Share your thoughts about Maya's adventure and what you learned!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {storyData.questions.map((question, index) => (
                    <div key={question.id}>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        {index + 1}. {question.question}
                      </label>
                      <Textarea
                        placeholder="Share your thoughts here..."
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  ))}
                  
                  <Separator className="my-6" />
                  
                  <div className="text-center">
                    <Button 
                      onClick={handleSubmitReflection}
                      disabled={submitting || storyData.questions.some(q => !answers[q.id]?.trim())}
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving thoughts...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Share My Thoughts
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Status */}
            {storyData.status === 'completed' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Star className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-900 mb-2">Story Complete! 🌟</h3>
                    <p className="text-green-700 mb-6">
                      Thank you for reading and sharing your thoughts about Maya's story!
                      {storyData.completedAt && (
                        <span className="block text-sm mt-2">
                          Completed at {new Date(storyData.completedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </p>
                    
                    {/* Values Learned */}
                    <div className="bg-white/70 p-4 rounded-lg mb-6">
                      <h4 className="font-medium text-slate-900 mb-3">Values You Explored Tonight:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {storyData.targetValues.map((value, index) => (
                          <div key={index} className="text-left p-3 bg-white rounded border border-slate-200">
                            <div className={`inline-block px-2 py-1 rounded text-sm font-medium mb-1 ${value.color}`}>
                              {value.name}
                            </div>
                            <p className="text-xs text-slate-600">{value.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* User's Reflection */}
                    {storyData.questions.some(q => q.answer) && (
                      <div className="bg-white/70 p-4 rounded-lg text-left">
                        <h4 className="font-medium text-slate-900 mb-3">Your Thoughtful Reflections:</h4>
                        <div className="space-y-3">
                          {storyData.questions.map((question, index) => (
                            question.answer && (
                              <div key={question.id} className="border-l-4 border-purple-200 pl-3">
                                <p className="text-sm font-medium text-slate-700 mb-1">{question.question}</p>
                                <p className="text-sm text-slate-600">{question.answer}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
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

export default MoralStory;