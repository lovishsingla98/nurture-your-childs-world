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
import type { SparkInterest, SparkInterestData, CareerPath } from '@/lib/types';
import { popularCareers, getCareerById } from '@/lib/careerOptions';
import {
  ArrowLeft,
  Sparkles,
  Target,
  Save
} from 'lucide-react';

const SparkInterest: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getValidToken } = useAuth();
  const [sparkData, setSparkData] = useState<SparkInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('');

  const fetchSparkInterest = async () => {
    try {
      setLoading(true);
      await getValidToken();

      console.log('Fetching spark interest for childId:', childId);
      const response = await apiClient.getSparkInterest(childId!);

      console.log('API Response:', response);

      if (response.success && response.data) {
        console.log('Setting spark data:', response.data);
        setSparkData(response.data);

        // Pre-select the career path if it exists
        if (response.data.data.selectedCareer) {
          setSelectedCareerPath(response.data.data.selectedCareer.id);
        }

        // Pre-fill custom goal if it exists
        if (response.data.data.customGoal) {
          setCustomGoal(response.data.data.customGoal);
        }
      } else {
        console.log('No spark interest data found');
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

    if (customGoal.trim() && customGoal.trim().length < 10) {
      toast.error('Custom goal must be at least 10 characters long');
      return;
    }

    try {
      setSaving(true);
      await getValidToken();

      const requestData: { selectedCareerId?: string; customGoal?: string } = {};

      if (selectedCareerPath) {
        requestData.selectedCareerId = selectedCareerPath;
      }

      if (customGoal.trim() && customGoal.trim().length >= 10) {
        requestData.customGoal = customGoal.trim();
      }

      console.log('Saving career focus:', requestData);
      const response = await apiClient.createSparkInterest(childId!, requestData);

      if (response.success && response.data) {
        setSparkData(response.data);

        // Pre-select the career path if it exists
        if (response.data.data.selectedCareer) {
          setSelectedCareerPath(response.data.data.selectedCareer.id);
        }

        // Pre-fill custom goal if it exists
        if (response.data.data.customGoal) {
          setCustomGoal(response.data.data.customGoal);
        }

        toast.success('Career focus updated successfully!');
      } else {
        toast.error(response.error || 'Failed to save career focus');
      }
    } catch (error: any) {
      console.error('Failed to save career path:', error);
      toast.error('Failed to save career focus');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchSparkInterest();
    }
  }, [childId]);

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
                    variant="default"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    Active
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
                        const career = getCareerById(selectedCareerPath);
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
                  {customGoal && (
                    <p className="text-sm text-slate-500 mt-1">
                      {customGoal.length}/10 characters minimum
                      {customGoal.length < 10 && (
                        <span className="text-red-500 ml-2">(Minimum 10 characters required)</span>
                      )}
                    </p>
                  )}
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

          </>
        )}
      </div>
    </div>
  );
};

export default SparkInterest;
