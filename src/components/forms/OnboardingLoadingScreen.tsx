import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Sparkles, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OnboardingLoadingScreenProps {
  isLoading: boolean;
  currentQuestionNumber: number;
  totalQuestions?: number; // Made optional since we'll hardcode to 10
}

const funFacts = [
  "Did you know? Children ask an average of 73 questions per day!",
  "Fun fact: Learning through play increases retention by 75%!",
  "Amazing! Your child's brain forms 1,000 new neural connections every second!",
  "Cool fact: Children learn best when they're having fun and engaged!",
  "Interesting! Every child has unique learning superpowers waiting to be discovered!",
  "Wow! Reading for just 20 minutes daily exposes children to 1.8 million words per year!",
  "Incredible! Music education can improve math and reading skills significantly!",
  "Fascinating! Children who ask lots of questions tend to be more creative thinkers!",
  "Amazing! Physical activity boosts brain function and learning capacity!",
  "Cool! Storytelling helps develop language skills and imagination!"
];

const OnboardingLoadingScreen: React.FC<OnboardingLoadingScreenProps> = ({
  isLoading,
  currentQuestionNumber,
  totalQuestions = 10 // Hardcoded to 10 questions
}) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [brainFillProgress, setBrainFillProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    // Rotate through fun facts every 3 seconds
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 3000);

    // Animate brain filling up
    setBrainFillProgress(0);
    const progressInterval = setInterval(() => {
      setBrainFillProgress((prev) => {
        if (prev >= 100) return 0; // Reset and loop
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(factInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          {/* Animated Brain */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto relative">
              {/* Brain background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-20"></div>
              
              {/* Brain icon with pulsing animation */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Brain className="w-16 h-16 text-purple-600 animate-pulse" />
              </div>
              
              {/* Floating sparkles */}
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
              <Star className="w-3 h-3 text-blue-400 absolute -bottom-1 -left-1 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Lightbulb className="w-4 h-4 text-orange-400 absolute top-1 -left-3 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* Brain filling animation */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Brain Processing...</span>
            </div>
            <Progress value={brainFillProgress} className="h-3 bg-purple-100">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out" 
                   style={{ width: `${brainFillProgress}%` }} />
            </Progress>
          </div>

          {/* Main message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Generating Your Next Question
          </h2>
          
          <p className="text-gray-600 mb-6">
            Our AI is carefully crafting a personalized question based on your answers...
          </p>

          {/* Fun fact carousel */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 min-h-[80px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">🧠✨</div>
              <p className="text-sm text-purple-800 font-medium animate-fade-in">
                {funFacts[currentFactIndex]}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-xs text-gray-500">
            Question {currentQuestionNumber} of {totalQuestions}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingLoadingScreen;