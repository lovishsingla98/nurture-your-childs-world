import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ChildDashboard from "./pages/ChildDashboard";
import OnboardingPage from "./pages/OnboardingPage";
import AdminPage from "./pages/AdminPage";
import DailyTask from "./pages/features/DailyTask";
import WeeklyInterest from "./pages/features/WeeklyInterest";
import WeeklyPotential from "./pages/features/WeeklyPotential";
import CareerInsights from "./pages/features/CareerInsights";
import SparkInterest from "./pages/features/SparkInterest";
import WeeklyQuiz from "./pages/features/WeeklyQuiz";
import MoralStory from "./pages/features/MoralStory";
import ParentsChatbot from "./pages/features/ParentsChatbot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route wrapper that allows both authenticated and unauthenticated users to access public content
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // Allow both authenticated and unauthenticated users to access the homepage
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId" 
              element={
                <ProtectedRoute>
                  <ChildDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding/:childId" 
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId/daily-task" 
              element={
                <ProtectedRoute>
                  <DailyTask />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId/weekly-interest" 
              element={
                <ProtectedRoute>
                  <WeeklyInterest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId/weekly-potential" 
              element={
                <ProtectedRoute>
                  <WeeklyPotential />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId/career-insights" 
              element={
                <ProtectedRoute>
                  <CareerInsights />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId/spark-interest" 
              element={
                <ProtectedRoute>
                  <SparkInterest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId/weekly-quiz" 
              element={
                <ProtectedRoute>
                  <WeeklyQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId/moral-story" 
              element={
                <ProtectedRoute>
                  <MoralStory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child/:childId/parents-chatbot" 
              element={
                <ProtectedRoute>
                  <ParentsChatbot />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
