import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import MobileSimulatorLayout from '@/components/MobileSimulatorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { DailyTaskResponse } from '@/lib/types';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle, 
  Play, 
  Send,
  Lightbulb,
  Loader2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const DailyTask: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { getValidToken } = useAuth();
  const [taskData, setTaskData] = useState<DailyTaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState('');

  const fetchDailyTask = async () => {
    try {
      setLoading(true);
      await getValidToken();
      const res = await apiClient.getDailyTask(childId!);
      if (res.success && res.data) {
        setTaskData(res.data);
      } else {
        toast.error(res.message || "Failed to load today's task");
      }
    } catch (error: any) {
      console.error('Failed to fetch daily task:', error);
      toast.error("Failed to load today's task");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    if (!taskData || !childId) return;
    try {
      const res = await apiClient.startDailyTask(childId, taskData.taskId);
      if (res.success && res.data) {
        setTaskData(res.data);
        toast.success('Task started! Have fun learning!');
      } else {
        toast.error(res.message || 'Failed to start task');
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
      const result = await apiClient.completeDailyTask(childId, taskData.taskId, response.trim());
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
    if (childId) fetchDailyTask();
  }, [childId]);

  const statusColor = taskData?.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                       taskData?.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                       'bg-slate-100 text-slate-600';
  const statusLabel = taskData?.status === 'completed' ? 'Completed' :
                      taskData?.status === 'in_progress' ? 'In Progress' : 'Not Started';

  return (
    <MobileSimulatorLayout
      title="Daily Task"
      subtitle="Today's learning activity"
      backUrl={`/child/${childId}`}
      onRefresh={fetchDailyTask}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#2D6A4F] animate-spin mb-2" />
          <p className="text-[#607060] text-[10px] font-semibold">Loading today's task...</p>
        </div>
      ) : !taskData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-xs font-bold text-slate-700 mb-1">No Task Available</h3>
          <p className="text-[9px] text-[#607060] max-w-[200px]">There's no daily task available for today. Check back tomorrow!</p>
        </div>
      ) : (
        <div className="space-y-3">

          {/* Task Header Card */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-indigo-50 rounded-lg flex-none">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="text-[9px] font-semibold text-[#607060]">Today's Daily Task</span>
              </div>
              <Badge className={`${statusColor} border-transparent text-[7px] font-extrabold px-1.5 py-0 rounded-full`}>
                {statusLabel}
              </Badge>
            </div>
            <h2 className="text-sm font-extrabold text-[#18211A] mb-1 leading-tight">{taskData.data.title}</h2>
            <p className="text-[9px] text-[#607060] leading-relaxed font-semibold mb-3">{taskData.data.description}</p>

            {/* Details Grid */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <div className="flex items-center gap-1 bg-[#F5F7F2] border border-[#D5DFD0]/50 rounded-lg px-2 py-1">
                <Target className="w-3 h-3 text-[#607060]" />
                <span className="text-[8px] font-semibold text-[#607060]">{taskData.data.domain}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F5F7F2] border border-[#D5DFD0]/50 rounded-lg px-2 py-1">
                <Clock className="w-3 h-3 text-[#607060]" />
                <span className="text-[8px] font-semibold text-[#607060]">{taskData.data.duration} min</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F5F7F2] border border-[#D5DFD0]/50 rounded-lg px-2 py-1">
                <Lightbulb className="w-3 h-3 text-[#607060]" />
                <span className="text-[8px] font-semibold text-[#607060] capitalize">{taskData.data.activityType}</span>
              </div>
            </div>

            {/* Learning Objective */}
            {taskData.data.learningObjective && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 mt-2">
                <div className="flex items-start gap-1.5">
                  <Target className="w-3 h-3 text-blue-600 mt-0.5 flex-none" />
                  <div>
                    <span className="text-[8px] font-bold text-blue-800 block">Learning Objective</span>
                    <p className="text-[8px] text-blue-700 leading-relaxed mt-0.5">{taskData.data.learningObjective}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Long Term Pathway */}
            {taskData.data.longTermPathway && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5 mt-2">
                <div className="flex items-start gap-1.5">
                  <TrendingUp className="w-3 h-3 text-purple-600 mt-0.5 flex-none" />
                  <div>
                    <span className="text-[8px] font-bold text-purple-800 block">Long-term Pathway</span>
                    <p className="text-[8px] text-purple-700 leading-relaxed mt-0.5">{taskData.data.longTermPathway}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions Card */}
          <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
            <h3 className="text-[10px] font-bold text-[#18211A] mb-2.5">Instructions</h3>
            <ol className="space-y-2">
              {taskData.data.instructions?.map((instruction, index) => (
                <li key={index} className="flex gap-2">
                  <span className="flex-none w-5 h-5 bg-[#D8EADB] text-[#2D6A4F] rounded-full flex items-center justify-center text-[8px] font-extrabold">
                    {index + 1}
                  </span>
                  <span className="text-[9px] text-[#607060] leading-relaxed font-semibold flex-1">{instruction}</span>
                </li>
              ))}
            </ol>
            {taskData.data.materials && taskData.data.materials.length > 0 && (
              <>
                <div className="h-px bg-[#D5DFD0] my-3" />
                <h4 className="text-[9px] font-bold text-[#18211A] mb-1.5">Materials needed</h4>
                <ul className="space-y-1">
                  {taskData.data.materials.map((material, index) => (
                    <li key={index} className="flex items-center gap-1.5 text-[8px] text-[#607060] font-semibold">
                      <div className="w-1 h-1 bg-[#2D6A4F] rounded-full flex-none" />
                      {material}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Action: Pending */}
          {taskData.status === 'pending' && (
            <div className="bg-[#EAF0E6] border border-[#D5DFD0] rounded-2xl p-4 text-center">
              <h3 className="text-xs font-bold text-[#18211A] mb-1">Ready to start?</h3>
              <p className="text-[9px] text-[#607060] mb-3 font-semibold">Click below when you're ready to begin this fun activity!</p>
              <Button onClick={handleStartTask} className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-5 py-2 rounded-full text-[10px]">
                <Play className="w-3 h-3 mr-1.5" />
                Start Task
              </Button>
            </div>
          )}

          {/* Action: In Progress */}
          {taskData.status === 'in_progress' && (
            <div className="bg-white border border-[#D5DFD0] rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-[10px] font-bold text-[#18211A] mb-1">How did it go?</h3>
              <p className="text-[8px] text-[#607060] mb-2 font-semibold">Tell us about your experience! What did you learn?</p>
              <Textarea
                placeholder="I built my rainbow tower using... The most challenging part was..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={3}
                className="resize-none text-[10px] border-[#D5DFD0] bg-[#F5F7F2] rounded-xl mb-2 focus:border-[#2D6A4F]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitResponse}
                  disabled={submitting || !response.trim()}
                  className="bg-[#2D6A4F] hover:bg-[#1F513C] text-white font-bold px-4 py-1.5 rounded-full text-[10px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1.5" />
                      Complete Task
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Completed */}
          {taskData.status === 'completed' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-xs font-extrabold text-emerald-900 mb-1">Task Completed! 🎉</h3>
                <p className="text-[9px] text-emerald-700 font-semibold">
                  Great job on completing today's task!
                  {taskData.completedAt && (
                    <span className="block text-[8px] mt-1">
                      Completed at {new Date(taskData.completedAt).toLocaleTimeString()}
                    </span>
                  )}
                </p>
                {taskData.response && (
                  <div className="bg-white/70 p-2.5 rounded-xl text-left mt-3 border border-emerald-100">
                    <h4 className="text-[8px] font-bold text-slate-800 mb-1">Your Response:</h4>
                    <p className="text-[8px] text-slate-600 leading-relaxed">{taskData.response}</p>
                  </div>
                )}
              </div>

              {taskData.data.theory && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                    <h3 className="text-[10px] font-bold text-blue-900">What You Learned</h3>
                  </div>
                  <p className="text-[8px] text-blue-700 leading-relaxed">{taskData.data.theory}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </MobileSimulatorLayout>
  );
};

export default DailyTask;