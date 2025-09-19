import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, CheckCircle, Sparkles, Brain, Target, BookOpen, Users, ArrowRight, Lightbulb, Heart, Star } from 'lucide-react';
import { apiClient } from '../lib/api';

interface OnboardingTransitionProps {
  childId: string;
  childName: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

interface ProgressState {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  icon: React.ReactNode;
}

const OnboardingTransition: React.FC<OnboardingTransitionProps> = ({
  childId,
  childName,
  onComplete,
  onError
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTimeoutBanner, setShowTimeoutBanner] = useState(false);
  const [startTime] = useState(Date.now());
  const [isPolling, setIsPolling] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('Analyzing your responses to understand your child...');
  const [hasRoadmap, setHasRoadmap] = useState(false);
  const [hasDailyTask, setHasDailyTask] = useState(false);
  const [actualProgress, setActualProgress] = useState(0);
  const [initialDelayComplete, setInitialDelayComplete] = useState(false);

  const steps = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "Personalized Learning Path",
      description: `Based on ${childName}'s answers, we're creating a unique 30-day roadmap tailored to their interests and learning style.`
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: "Daily Activities",
      description: "Each day, you'll receive a carefully crafted activity designed to be both fun and educational for your child."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: "Weekly Assessments",
      description: "Regular questionnaires help us understand what your child enjoys most and track their progress over time."
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: "Continuous Growth",
      description: "As your child completes activities, we learn more about their preferences and adapt the learning journey accordingly."
    }
  ];

  const statusMessages = [
    'Analyzing your responses to understand your child...',
    'Creating a personalized learning roadmap...',
    'Preparing daily activities tailored for your child...',
    'Setting up your smart agent...',
    'Almost ready! Your smart agent is being finalized...'
  ];

  // Initial delay to move to 50% after 7-10 seconds
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setInitialDelayComplete(true);
      setActualProgress(50);
      setCurrentStatus('Creating a personalized learning roadmap...');
      setHasRoadmap(true);
    }, 8000); // 8 seconds delay

    return () => clearTimeout(initialTimer);
  }, []);

  // Step progression animation
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000); // Change step every 3 seconds

    return () => clearInterval(stepInterval);
  }, [steps.length]);

  // Status message updates
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setCurrentStatus(prev => {
        const currentIndex = statusMessages.indexOf(prev);
        if (currentIndex < statusMessages.length - 1) {
          return statusMessages[currentIndex + 1];
        }
        return prev;
      });
    }, 4000); // Change status every 4 seconds

    return () => clearInterval(statusInterval);
  }, []);

  // Check for timeout
  useEffect(() => {
    const timeoutCheck = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 120000) { // 2 minutes
        setShowTimeoutBanner(true);
        setIsPolling(false);
      }
    }, 1000);

    return () => clearInterval(timeoutCheck);
  }, [startTime]);

  // Polling logic to check if roadmap and daily task are created
  useEffect(() => {
    if (!isPolling) return;

    const pollForCompletion = async () => {
      try {
        console.log('🔍 Polling for setup completion...');
        
        // Check if daily task exists by trying to get today's task
        const dailyTaskResponse = await apiClient.getDailyTask(childId);
        
        console.log('📅 Daily task check:', { 
          success: dailyTaskResponse.success, 
          hasTask: !!dailyTaskResponse.data,
          taskData: dailyTaskResponse.data 
        });
        
        // For now, assume roadmap exists if we have a daily task (since roadmap is created first)
        // In the future, we could add a separate API call to check roadmap status
        const taskExists = dailyTaskResponse.success && dailyTaskResponse.data;
        const roadmapExists = taskExists; // Roadmap is created before daily task
        
        setHasRoadmap(!!roadmapExists);
        setHasDailyTask(!!taskExists);
        
        // Only update progress after initial delay is complete
        if (initialDelayComplete) {
          // Calculate actual progress
          let progress = 50; // Start at 50% after initial delay
          if (taskExists) progress = 100; // Daily task is the remaining 50%
          
          setActualProgress(progress);
          
          // Update status based on progress
          if (progress === 50) {
            setCurrentStatus('Creating a personalized learning roadmap...');
          } else if (progress === 100) {
            setCurrentStatus('Almost ready! Your smart agent is being finalized...');
            console.log('✅ Setup complete! Both roadmap and daily task are ready.');
            
            // Wait a moment to show completion, then proceed
            setTimeout(() => {
              onComplete();
            }, 2000);
          }
        }
        
      } catch (error) {
        console.error('Error polling for completion:', error);
        // Continue polling even if there's an error
      }
    };

    // Start polling after a short delay to allow backend processing
    const initialDelay = setTimeout(pollForCompletion, 2000);

    // Poll every 5 seconds
    const pollInterval = setInterval(pollForCompletion, 5000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(pollInterval);
    };
  }, [childId, onComplete, isPolling]);


  const handleRefresh = () => {
    setShowTimeoutBanner(false);
    setIsPolling(true);
    // Reset the start time by re-initializing the component
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Information Steps */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Creating {childName}'s Smart Agent
              </h1>
              <p className="text-gray-600 text-lg">
                We're building a personalized learning companion designed specifically for your child
              </p>
            </div>

            {/* Information Steps */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`transition-all duration-1000 transform ${
                    index <= currentStep
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-30 translate-x-4'
                  }`}
                >
                  <div className="flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex-shrink-0">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    {index <= currentStep && (
                      <div className="ml-auto">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Status and Progress */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Current Status
                  </h3>
                  <p className="text-gray-600">
                    {currentStatus}
                  </p>
                </div>

                {/* Time Estimate */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-blue-700 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">Creating Your Smart Agent</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      This will take about 1-2 minutes. By the end, you'll have your own smart agent designed specifically for {childName}!
                    </p>
                  </div>
                </div>

                {/* Data Status Indicators */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${hasRoadmap ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={hasRoadmap ? 'text-green-700' : 'text-gray-500'}>
                      Roadmap {hasRoadmap ? 'Ready' : 'Creating...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${hasDailyTask ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={hasDailyTask ? 'text-green-700' : 'text-gray-500'}>
                      Daily Task {hasDailyTask ? 'Ready' : 'Creating...'}
                    </span>
                  </div>
                </div>

                {/* Loading Animation */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="ml-2 text-sm font-medium">Setting up your experience...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeout Banner */}
            {showTimeoutBanner && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-800 mb-1">
                        Taking Longer Than Expected
                      </h4>
                      <p className="text-orange-700 text-sm mb-3">
                        It seems our servers are taking a bit longer than usual. This usually resolves quickly.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleRefresh}
                          size="sm" 
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onError('Setup is taking longer than expected. Please try refreshing or contact support.')}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          Contact Support
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTransition;
