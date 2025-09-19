import React, { useState } from 'react';
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
import { popularCareers, getCareerById } from '@/lib/careerOptions';
import {
  ArrowLeft,
  Sparkles,
  Target,
  Save
} from 'lucide-react';

const InitialInterestPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getValidToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('');

  const handleSaveInterest = async () => {
    if (!selectedCareerPath && !customGoal.trim()) {
      toast.error('Please select a profession or enter a custom interest');
      return;
    }

    if (customGoal.trim() && customGoal.trim().length < 10) {
      toast.error('Custom interest must be at least 10 characters long');
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

      console.log('Saving initial interest:', requestData);
      const response = await apiClient.submitSparkInterest(childId!, requestData);

      if (response.success && response.data) {
        toast.success('Interest saved successfully!');
        // Navigate to pre-onboarding page
        navigate(`/pre-onboarding/${childId}`);
      } else {
        toast.error(response.error || 'Failed to save interest');
      }
    } catch (error: any) {
      console.error('Failed to save interest:', error);
      toast.error('Failed to save interest');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Navigate to pre-onboarding page without saving anything
    navigate(`/pre-onboarding/${childId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-100">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  <span className="text-sm font-medium text-slate-600">Getting Started</span>
                </div>
                <CardTitle className="text-2xl text-slate-900 mb-2">Do you have a profession or interest in mind for your child?</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  This helps us create more personalized activities.
                </CardDescription>
              </div>
              <Badge
                variant="default"
                className="bg-green-100 text-green-700 border-green-200"
              >
                Optional
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Interest Selection */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
          <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-600" />
                  What interests you for your child?
                </CardTitle>
                <CardDescription>
                  Choose from the list below or write something custom
                </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select from popular careers</label>
              <Select value={selectedCareerPath} onValueChange={setSelectedCareerPath}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a career..." />
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
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Or write something custom</label>
                  <Textarea
                    placeholder="Write about any profession or interest you have in mind for your child..."
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

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={saving}
                className="flex-1"
              >
                Skip for now
              </Button>
              <Button
                onClick={handleSaveInterest}
                disabled={saving || (!selectedCareerPath && !customGoal.trim())}
                className="bg-pink-600 hover:bg-pink-700 flex-1"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Continue to Onboarding
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InitialInterestPage;
