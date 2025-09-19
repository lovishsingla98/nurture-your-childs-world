import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/site/DashboardHeader';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Heart,
  Lightbulb
} from 'lucide-react';

const PreOnboardingPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate(`/onboarding/${childId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-100">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl text-slate-900 mb-4">
              Let's Get to Know Your Child
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 max-w-2xl mx-auto">
              Next we would ask a couple of questions for your child to answer. They can answer them themselves or you can ask them the questions and answer for them.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Key Points */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">No Right or Wrong Answers</h3>
                  <p className="text-green-700 text-sm">
                    Remember there is no right or wrong answer in these questions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Every Child is Unique</h3>
                  <p className="text-blue-700 text-sm">
                    Each child is unique and requires different set of directions to achieve their goals.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Message */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-8 border border-pink-200">
              <p className="text-slate-700 text-center leading-relaxed">
                These questions are to understand your child and create the directions accordingly.
              </p>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>Start Questions</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreOnboardingPage;
