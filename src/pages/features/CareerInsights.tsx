import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardHeader from '@/components/site/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp,
  Star,
  Brain,
  Heart,
  Lightbulb,
  Users,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface CareerMatch {
  name: string;
  matchPercentage: number;
  category: string;
  description: string;
  keyStrengths: string[];
  developmentAreas: string[];
  nextSteps: string[];
}

interface CareerInsightsData {
  insightId: string;
  date: string;
  childId: string;
  parentId: string;
  generatedAt: string;
  childAge: number;
  topMatches: CareerMatch[];
  overallProfile: {
    dominantInterests: string[];
    strongestSkills: string[];
    learningStyle: string;
    personalityTraits: string[];
  };
  recommendations: string[];
  status: 'loading' | 'available' | 'error';
  refreshAvailable?: boolean;
  nextRefreshAvailableOn?: number;
  createdAt?: string;
  updatedAt?: string;
}

const CareerInsights: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getValidToken } = useAuth();
  const [insightsData, setInsightsData] = useState<CareerInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  const [showInsufficientDataBanner, setShowInsufficientDataBanner] = useState(false);

  const fetchActivityData = async () => {
    try {
      await getValidToken();
      const response = await apiClient.getChildDashboardData(childId!);
      
      if (response.success && response.data) {
        setActivityData(response.data);
        checkActivityRequirements(response.data);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const checkActivityRequirements = (data: any) => {
    const activities = data.activities;
    
    // Check requirements:
    // 1. 7 daily tasks (we'll assume if daily task streak is >= 7)
    // 2. 1 weekly interest questionnaire
    // 3. 1 weekly potential questionnaire  
    // 4. 1 weekly quiz
    
    const dailyTasksCompleted = activities.dailyTask.streak >= 7;
    const weeklyInterestCompleted = activities.weeklyInterest.lastCompleted !== undefined;
    const weeklyPotentialCompleted = activities.weeklyPotential.lastCompleted !== undefined;
    const weeklyQuizCompleted = activities.weeklyQuiz.lastCompleted !== undefined;
    
    const hasInsufficientData = !(dailyTasksCompleted && weeklyInterestCompleted && weeklyPotentialCompleted && weeklyQuizCompleted);
    setShowInsufficientDataBanner(hasInsufficientData);
  };

  const fetchCareerInsights = async () => {
    try {
      setLoading(true);
      await getValidToken();
      
      const response = await apiClient.getCareerInsights(childId!);
      
      if (response.success) {
        if (response.data) {
          // Backend returns top-level metadata and nested `data` payload
          const raw = response.data as any;
          const payload = raw?.data || {};

          const data: CareerInsightsData = {
            insightId: raw?.insightId || '',
            date: raw?.date || new Date().toISOString(),
            childId: raw?.childId || '',
            parentId: raw?.parentId || '',
            generatedAt: raw?.generatedAt || new Date().toISOString(),
            childAge: payload?.childAge ?? 0,
            topMatches: payload?.topMatches || [],
            overallProfile: {
              dominantInterests: payload?.overallProfile?.dominantInterests || [],
              strongestSkills: payload?.overallProfile?.strongestSkills || [],
              learningStyle: payload?.overallProfile?.learningStyle || '',
              personalityTraits: payload?.overallProfile?.personalityTraits || []
            },
            recommendations: payload?.recommendations || [],
            status: payload?.status || 'loading',
            refreshAvailable: payload?.refreshAvailable ?? true,
            nextRefreshAvailableOn: payload?.nextRefreshAvailableOn ?? Date.now(),
            createdAt: raw?.createdAt,
            updatedAt: raw?.updatedAt
          };
          setInsightsData(data);
        } else {
          // No career insights document exists yet - set empty state
          setInsightsData({
            insightId: `insight_${Date.now()}`,
            date: new Date().toISOString(),
            childId: childId || '',
            parentId: '',
            generatedAt: new Date().toISOString(),
            childAge: 0,
            topMatches: [],
            overallProfile: {
              dominantInterests: [],
              strongestSkills: [],
              learningStyle: '',
              personalityTraits: []
            },
            recommendations: [],
            status: 'loading',
            refreshAvailable: true,
            nextRefreshAvailableOn: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        toast.error(response.error || 'Failed to load career insights');
        setInsightsData(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch career insights:', error);
      toast.error('Failed to load career insights');
      setInsightsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateInsights = async () => {
    try {
      setRegenerating(true);
      await getValidToken();
      
      const response = await apiClient.regenerateCareerInsights(childId!);
      
      if (response.success) {
        toast.success('Insights updated with latest data!');
        fetchCareerInsights(); // Refresh the data
      } else {
        toast.error(response.error || 'Failed to update insights');
      }
    } catch (error: any) {
      console.error('Failed to regenerate insights:', error);
      toast.error('Failed to update insights');
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchCareerInsights();
      fetchActivityData();
    }
  }, [childId]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'STEM & Technology': 'bg-blue-100 text-blue-700 border-blue-200',
      'Design & Construction': 'bg-purple-100 text-purple-700 border-purple-200',
      'Research & Discovery': 'bg-green-100 text-green-700 border-green-200',
      'Arts & Creativity': 'bg-pink-100 text-pink-700 border-pink-200',
      'Leadership & Management': 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Analyzing career insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!insightsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </div>

          {/* Error State */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Career Insights</h4>
              <p className="text-slate-600 mb-4">
                There was an error loading career insights. Please try again or contact support if the problem persists.
              </p>
              <Button 
                onClick={fetchCareerInsights}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>

        {/* Insufficient Data Banner */}
        {showInsufficientDataBanner && activityData && (
          <Card className="border-orange-200 bg-orange-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-800 mb-1">More Data Needed for Sharper Insights</h3>
                  <p className="text-orange-700 text-sm">
                    We’ve generated early career insights for {activityData.child.displayName} based on the tasks completed so far. While these are helpful, completing more daily action items will make the results much more accurate and reliable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {insightsData && (
          <>
            {/* Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-slate-600">Career Insights & Potential</span>
                    </div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">Future Possibilities</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      {insightsData.status === 'loading' || !insightsData.topMatches || insightsData.topMatches.length === 0
                        ? 'Career insights are being prepared. Generate insights to discover potential career paths.'
                        : 'Based on interests, strengths, and learning patterns, here are potential career paths that might suit your child.'
                      }
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">
                      Age {insightsData.childAge || 'N/A'}
                    </Badge>
                    <p className="text-xs text-slate-500">
                      Last updated: {new Date(insightsData.generatedAt).toLocaleDateString()}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRegenerateInsights}
                      disabled={regenerating || !insightsData.refreshAvailable}
                      className="mt-2"
                    >
                      {regenerating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-2" />
                          {!insightsData.topMatches || insightsData.topMatches.length === 0 ? 'Generate Insights' : 'Update'}
                        </>
                      )}
                    </Button>
                    {!insightsData.refreshAvailable && insightsData.nextRefreshAvailableOn && (
                      <p className="text-xs text-slate-500 mt-1">
                        Next update: {new Date(insightsData.nextRefreshAvailableOn).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Top Career Matches */}
            <div className="grid gap-6 mb-8">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Top Career Matches
              </h3>
              
              {!insightsData.topMatches || insightsData.topMatches.length === 0 ? (
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-amber-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">No Career Insights Yet</h4>
                    <p className="text-slate-600 mb-4">
                      Career insights haven't been generated yet. Click "Generate Insights" to discover potential career paths based on your child's learning patterns.
                    </p>
                    <Button 
                      onClick={handleRegenerateInsights}
                      disabled={regenerating}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {regenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Generate Insights
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                insightsData.topMatches.map((career, index) => (
                <Card key={index} className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-600">{career.matchPercentage}%</div>
                          <div className="text-xs text-slate-500">Match</div>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-900 mb-1">{career.name}</CardTitle>
                          <Badge variant="outline" className={getCategoryColor(career.category)}>
                            {career.category}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={career.matchPercentage} className="w-24" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-700">{career.description}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Key Strengths
                        </h5>
                        <ul className="space-y-1">
                          {career.keyStrengths.map((strength, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                          <Brain className="w-4 h-4" />
                          Development Areas
                        </h5>
                        <ul className="space-y-1">
                          {career.developmentAreas.map((area, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-purple-700 mb-2 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          Next Steps
                        </h5>
                        <ul className="space-y-1">
                          {career.nextSteps.map((step, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>

            {/* Overall Profile */}
            {insightsData.topMatches && insightsData.topMatches.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    Learning Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-slate-900 mb-2">Dominant Interests</h5>
                      <div className="flex flex-wrap gap-2">
                        {insightsData.overallProfile.dominantInterests && insightsData.overallProfile.dominantInterests.length > 0 ? (
                          insightsData.overallProfile.dominantInterests.map((interest, i) => (
                            <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-700">
                              {interest}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No interests identified yet</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-slate-900 mb-2">Strongest Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {insightsData.overallProfile.strongestSkills && insightsData.overallProfile.strongestSkills.length > 0 ? (
                          insightsData.overallProfile.strongestSkills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="bg-green-100 text-green-700">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No skills identified yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-slate-900 mb-2">Learning Style</h5>
                      <p className="text-slate-700 p-3 bg-blue-50 rounded-lg text-sm">
                        {insightsData.overallProfile.learningStyle || 'Learning style analysis pending'}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-slate-900 mb-2">Personality Traits</h5>
                      <div className="flex flex-wrap gap-2">
                        {insightsData.overallProfile.personalityTraits && insightsData.overallProfile.personalityTraits.length > 0 ? (
                          insightsData.overallProfile.personalityTraits.map((trait, i) => (
                            <Badge key={i} variant="secondary" className="bg-purple-100 text-purple-700">
                              {trait}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No traits identified yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {insightsData.topMatches && insightsData.topMatches.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>
                    Ways to nurture your child's potential and interests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insightsData.recommendations && insightsData.recommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {insightsData.recommendations.map((recommendation, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-slate-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No recommendations available yet</p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default CareerInsights;
