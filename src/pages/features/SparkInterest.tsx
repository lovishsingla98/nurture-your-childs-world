import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardHeader from '@/components/site/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Sparkles, 
  Target,
  Play,
  CheckCircle,
  Save,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface CareerPath {
  id: string;
  name: string;
  category: string;
  description: string;
  skills: string[];
  activities: string[];
}

interface SparkInterestData {
  id: string;
  selectedCareer?: CareerPath;
  customGoal?: string;
  currentFocus: string;
  tailoredActivities: {
    id: string;
    title: string;
    description: string;
    duration: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    completed: boolean;
  }[];
  progressMetrics: {
    activitiesCompleted: number;
    skillsIntroduced: number;
    engagementLevel: number;
  };
  status: 'setup' | 'active' | 'completed';
}

const popularCareers: CareerPath[] = [
  {
    id: 'engineer',
    name: 'Engineer',
    category: 'STEM & Technology',
    description: 'Design and build solutions to solve problems using science and technology',
    skills: ['Problem-solving', 'Math', 'Design thinking', 'Critical analysis'],
    activities: ['Building challenges', 'Math games', 'Science experiments', 'Design projects']
  },
  {
    id: 'doctor',
    name: 'Doctor',
    category: 'Healthcare & Medicine',
    description: 'Help people stay healthy and treat illnesses',
    skills: ['Empathy', 'Science knowledge', 'Problem-solving', 'Communication'],
    activities: ['Body system learning', 'First aid basics', 'Helping activities', 'Science experiments']
  },
  {
    id: 'teacher',
    name: 'Teacher',
    category: 'Education & Learning',
    description: 'Help others learn new things and grow their knowledge',
    skills: ['Communication', 'Patience', 'Creativity', 'Leadership'],
    activities: ['Teaching games', 'Presentation skills', 'Story creation', 'Helping others']
  },
  {
    id: 'artist',
    name: 'Artist',
    category: 'Arts & Creativity',
    description: 'Create beautiful artwork that expresses ideas and emotions',
    skills: ['Creativity', 'Visual design', 'Color theory', 'Self-expression'],
    activities: ['Drawing challenges', 'Color mixing', 'Art history', 'Creative projects']
  },
  {
    id: 'scientist',
    name: 'Scientist',
    category: 'Research & Discovery',
    description: 'Discover new things about how the world works through experiments',
    skills: ['Curiosity', 'Observation', 'Analysis', 'Experimentation'],
    activities: ['Science experiments', 'Nature observation', 'Data collection', 'Hypothesis testing']
  },
  {
    id: 'chef',
    name: 'Chef',
    category: 'Food & Hospitality',
    description: 'Create delicious meals and bring joy to people through food',
    skills: ['Creativity', 'Following instructions', 'Taste development', 'Organization'],
    activities: ['Cooking basics', 'Recipe reading', 'Nutrition learning', 'Cultural food exploration']
  }
];

const SparkInterest: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getValidToken } = useAuth();
  const [sparkData, setSparkData] = useState<SparkInterestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('');

  const fetchSparkInterest = async () => {
    try {
      setLoading(true);
      await getValidToken();
      
      // TODO: Replace with actual API call
      // const response = await apiClient.getSparkInterest(childId);
      
      // Mock data for now
      const mockData: SparkInterestData = {
        id: 'spark_child_' + childId,
        selectedCareer: popularCareers[0], // Pre-selected engineer
        currentFocus: 'Building foundational engineering skills through hands-on activities',
        tailoredActivities: [
          {
            id: 'activity_1',
            title: 'Bridge Building Challenge',
            description: 'Build a bridge using paper and tape that can hold a toy car',
            duration: 25,
            difficulty: 'Beginner',
            completed: true
          },
          {
            id: 'activity_2',
            title: 'Simple Machine Discovery',
            description: 'Find and identify 5 simple machines around your house',
            duration: 15,
            difficulty: 'Beginner',
            completed: true
          },
          {
            id: 'activity_3',
            title: 'Balloon-Powered Car',
            description: 'Design and build a car that moves using balloon power',
            duration: 30,
            difficulty: 'Intermediate',
            completed: false
          },
          {
            id: 'activity_4',
            title: 'Tower Stability Test',
            description: 'Build the tallest tower possible with limited materials',
            duration: 20,
            difficulty: 'Intermediate',
            completed: false
          }
        ],
        progressMetrics: {
          activitiesCompleted: 2,
          skillsIntroduced: 4,
          engagementLevel: 85
        },
        status: 'active'
      };
      
      setSparkData(mockData);
      if (mockData.selectedCareer) {
        setSelectedCareerPath(mockData.selectedCareer.id);
      }
      if (mockData.customGoal) {
        setCustomGoal(mockData.customGoal);
      }
    } catch (error: any) {
      console.error('Failed to fetch spark interest:', error);
      toast.error('Failed to load career focus');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCareerPath = async () => {
    if (!selectedCareerPath && !customGoal.trim()) {
      toast.error('Please select a career path or enter a custom goal');
      return;
    }

    try {
      setSaving(true);
      await getValidToken();
      
      const selectedCareer = popularCareers.find(c => c.id === selectedCareerPath);
      
      // TODO: Replace with actual API call
      // const result = await apiClient.updateSparkInterest(childId, { selectedCareer, customGoal });
      
      // Mock success
      setSparkData(prev => prev ? {
        ...prev,
        selectedCareer,
        customGoal: customGoal.trim(),
        currentFocus: selectedCareer ? 
          `Building foundational ${selectedCareer.name.toLowerCase()} skills through hands-on activities` : 
          customGoal.trim(),
        status: 'active'
      } : null);
      
      toast.success('Career focus updated successfully!');
    } catch (error: any) {
      console.error('Failed to save career path:', error);
      toast.error('Failed to save career focus');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateNewActivities = async () => {
    try {
      await getValidToken();
      
      // TODO: Replace with actual API call
      // const result = await apiClient.generateNewActivities(childId, sparkData.selectedCareer);
      
      toast.success('New activities generated based on your progress!');
      fetchSparkInterest(); // Refresh data
    } catch (error: any) {
      console.error('Failed to generate new activities:', error);
      toast.error('Failed to generate new activities');
    }
  };

  useEffect(() => {
    if (childId) {
      fetchSparkInterest();
    }
  }, [childId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading career focus...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/child/${childId}`)} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Child Dashboard
          </Button>
        </div>

        {sparkData && (
          <>
            {/* Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                      <span className="text-sm font-medium text-slate-600">Career Focus & Interest Development</span>
                    </div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">Spark an Interest</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Choose a career path to focus on, or set a custom learning goal for personalized activities.
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={sparkData.status === 'active' ? 'default' : 'secondary'}
                    className={sparkData.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                  >
                    {sparkData.status === 'active' ? 'Active' : 'Setup Required'}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Career Path Selection */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-600" />
                  Choose Career Focus
                </CardTitle>
                <CardDescription>
                  Select a career path to explore, or create a custom learning goal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Popular Career Paths</label>
                  <Select value={selectedCareerPath} onValueChange={setSelectedCareerPath}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a career to explore..." />
                    </SelectTrigger>
                    <SelectContent>
                      {popularCareers.map((career) => (
                        <SelectItem key={career.id} value={career.id}>
                          <div className="flex items-center gap-2">
                            <span>{career.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {career.category}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCareerPath && (
                    <div className="mt-3 p-3 bg-pink-50 rounded-lg">
                      {(() => {
                        const career = popularCareers.find(c => c.id === selectedCareerPath);
                        return career ? (
                          <div>
                            <p className="text-sm text-slate-700 mb-2">{career.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {career.skills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Custom Learning Goal</label>
                  <Textarea
                    placeholder="Describe what specific skills or interests you'd like to develop... (e.g., 'Learn about space and astronomy', 'Develop cooking and nutrition skills')"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSaveCareerPath} 
                  disabled={saving || (!selectedCareerPath && !customGoal.trim())}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Set Focus
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Focus & Progress */}
            {sparkData.status === 'active' && (
              <>
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Current Focus</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleGenerateNewActivities}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        New Activities
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-slate-900 mb-2">Learning Goal</h4>
                        <p className="text-slate-700 p-3 bg-pink-50 rounded-lg">
                          {sparkData.currentFocus}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{sparkData.progressMetrics.activitiesCompleted}</div>
                          <div className="text-sm text-slate-600">Activities Completed</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{sparkData.progressMetrics.skillsIntroduced}</div>
                          <div className="text-sm text-slate-600">Skills Introduced</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{sparkData.progressMetrics.engagementLevel}%</div>
                          <div className="text-sm text-slate-600">Engagement Level</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tailored Activities */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      Personalized Activities
                    </CardTitle>
                    <CardDescription>
                      Activities designed specifically for your chosen career focus
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {sparkData.tailoredActivities.map((activity) => (
                        <div 
                          key={activity.id}
                          className={`p-4 rounded-lg border transition-all ${
                            activity.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-slate-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {activity.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                  <Play className="w-5 h-5 text-pink-600 flex-shrink-0" />
                                )}
                                <h4 className={`font-medium ${activity.completed ? 'text-green-900' : 'text-slate-900'}`}>
                                  {activity.title}
                                </h4>
                                <Badge variant="outline" className={getDifficultyColor(activity.difficulty)}>
                                  {activity.difficulty}
                                </Badge>
                              </div>
                              <p className={`text-sm mb-2 ${activity.completed ? 'text-green-700' : 'text-slate-600'}`}>
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>⏱️ {activity.duration} minutes</span>
                                {activity.completed && <span>✅ Completed</span>}
                              </div>
                            </div>
                            {!activity.completed && (
                              <Button size="sm" variant="outline" className="hover:bg-pink-50">
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SparkInterest;