import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import DashboardHeader from '@/components/site/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle, 
  Play, 
  Send,
  Lightbulb
} from 'lucide-react';

interface DailyTaskData {
  id: string;
  title: string;
  description: string;
  domain: string;
  activityType: string;
  duration: number;
  instructions: string[];
  materials?: string[];
  status: 'pending' | 'in_progress' | 'completed';
  response?: string;
  completedAt?: string;
}

const DailyTask: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getValidToken } = useAuth();
  const [taskData, setTaskData] = useState<DailyTaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState('');

  const fetchDailyTask = async () => {
    try {
      setLoading(true);
      await getValidToken();
      
      const response = await apiClient.getDailyTask(childId!);
      
      if (response.success && response.data) {
        setTaskData(response.data);
        console.log('Daily task loaded successfully:', response.data);
      } else {
        toast.error(response.message || 'Failed to load today\'s task');
      }
    } catch (error: any) {
      console.error('Failed to fetch daily task:', error);
      toast.error('Failed to load today\'s task');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    if (!taskData || !childId) return;
    
    try {
      const response = await apiClient.startDailyTask(childId, taskData.id);
      
      if (response.success && response.data) {
        setTaskData(response.data);
        toast.success('Task started! Have fun learning!');
      } else {
        toast.error(response.message || 'Failed to start task');
      }
    } catch (error: any) {
      console.error('Failed to start task:', error);
      toast.error('Failed to start task');
    }
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast.error('Please share how the task went!');
      return;
    }

    if (response.trim().length < 50) {
      toast.error('Please provide a more detailed response (at least 50 characters)');
      return;
    }

    if (!taskData || !childId) return;

    try {
      setSubmitting(true);
      await getValidToken();
      
      const result = await apiClient.completeDailyTask(childId, taskData.id, response.trim());
      
      if (result.success && result.data) {
        setTaskData(result.data);
        toast.success('Great job! Task completed successfully!');
        setResponse('');
      } else {
        toast.error(result.message || 'Failed to submit response');
      }
    } catch (error: any) {
      console.error('Failed to submit response:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchDailyTask();
    }
  }, [childId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading today's task...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/child/${childId}`)} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Child Dashboard
          </Button>
        </div>

        {taskData && (
          <>
            {/* Task Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-slate-600">Today's Daily Task</span>
                    </div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">{taskData.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      {taskData.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      taskData.status === 'completed' ? 'default' :
                      taskData.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                    className={
                      taskData.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      taskData.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }
                  >
                    {taskData.status === 'completed' ? 'Completed' :
                     taskData.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">{taskData.domain}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{taskData.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-sm capitalize">{taskData.activityType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Instructions */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-3">
                  {taskData.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-slate-700">{instruction}</span>
                    </li>
                  ))}
                </ol>

                {taskData.materials && taskData.materials.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Materials needed:</h4>
                      <ul className="space-y-1">
                        {taskData.materials.map((material, index) => (
                          <li key={index} className="flex items-center gap-2 text-slate-600">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {taskData.status === 'pending' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to start?</h3>
                    <p className="text-slate-600 mb-4">Click below when you're ready to begin this fun activity!</p>
                    <Button onClick={handleStartTask} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Response Section */}
            {taskData.status === 'in_progress' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg">How did it go?</CardTitle>
                  <CardDescription>
                    Tell us about your experience! What did you learn? What was fun or challenging?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="I built my rainbow tower using... The most challenging part was... I learned that..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmitResponse}
                      disabled={submitting || !response.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Complete Task
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Status */}
            {taskData.status === 'completed' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-900 mb-2">Task Completed! 🎉</h3>
                    <p className="text-green-700 mb-4">
                      Great job on completing today's task! 
                      {taskData.completedAt && (
                        <span className="block text-sm mt-2">
                          Completed at {new Date(taskData.completedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </p>
                    {taskData.response && (
                      <div className="bg-white/70 p-4 rounded-lg text-left max-w-2xl mx-auto">
                        <h4 className="font-medium text-slate-900 mb-2">Your Response:</h4>
                        <p className="text-slate-700">{taskData.response}</p>
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

export default DailyTask;