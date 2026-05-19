import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { ArrowRight, Users, Heart, Lightbulb } from 'lucide-react';

const PreOnboardingPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();

  return (
    <MobileSimulatorLayout title="Getting Started" subtitle="Prepare for onboarding" backUrl="/dashboard">
      <div className="space-y-3">
        {/* Hero */}
        <div className="bg-white border border-[#D5DFD0] rounded-2xl p-4 shadow-sm text-center">
          <div className="relative inline-block mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-[#2D6A4F] to-[#1F513C] rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Heart className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-sm font-extrabold text-[#18211A] mb-1">Let's Get to Know Your Child</h2>
          <p className="text-[9px] text-[#607060] leading-relaxed font-semibold max-w-[250px] mx-auto">
            Next we'll ask a couple of questions. Your child can answer themselves or you can answer for them.
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-none">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-[9px] font-bold text-emerald-800 mb-0.5">No Right or Wrong Answers</h3>
                <p className="text-[8px] text-emerald-700 leading-relaxed">There is no right or wrong answer in these questions.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-none">
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-[9px] font-bold text-blue-800 mb-0.5">Every Child is Unique</h3>
                <p className="text-[8px] text-blue-700 leading-relaxed">Each child requires different directions to achieve their goals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-[#EAF0E6] border border-[#D5DFD0] rounded-2xl p-3">
          <p className="text-[8px] text-[#607060] text-center leading-relaxed font-semibold">
            These questions help us understand your child and create personalized directions.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <Button onClick={() => navigate(`/onboarding/${childId}`)} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-6 py-2.5 rounded-full text-[10px] shadow-lg">
            Start Questions
            <ArrowRight className="w-3 h-3 ml-1.5" />
          </Button>
        </div>
      </div>
    </MobileSimulatorLayout>
  );
};

export default PreOnboardingPage;
