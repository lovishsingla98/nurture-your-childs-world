// API utility for making authenticated requests to the backend
import {
  OnboardingQuestionnaire,
  OnboardingAnswerData,
  NextQuestionResponse,
  OnboardingAnswerResponse,
  Child,
  DailyTaskResponse,
  WeeklyInterestData,
  SparkInterest,
} from './types';

const API_BASE_URL = 'https://us-central1-nurture-466617.cloudfunctions.net/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    let token = this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration (401 Unauthorized)
      if (response.status === 401 && retryCount === 0) {
        console.log('Token expired, attempting to refresh...');

        // Try to refresh the token by triggering a new auth state
        // This will be handled by the AuthContext
        const authEvent = new CustomEvent('tokenExpired');
        window.dispatchEvent(authEvent);

        // Wait a bit for the token to be refreshed
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try the request again with the new token
        token = this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          return this.makeRequest(endpoint, { ...options, headers }, retryCount + 1);
        } else {
          throw new Error('Authentication required. Please sign in again.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);

      // If it's an authentication error and we haven't retried yet
      if (error instanceof Error && error.message.includes('Authentication required') && retryCount === 0) {
        // Redirect to login or show login modal
        window.location.href = '/';
        return { success: false, error: 'Authentication required' };
      }

      throw error;
    }
  }

  // Waitlist APIs
  async addWaitlistEntry(data: {
    name: string;
    email: string;
    age?: string;
    interests?: string;
  }): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest('/waitlist/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWaitlistEntries(limit?: number): Promise<ApiResponse<any[]>> {
    const url = limit ? `/waitlist/entries?limit=${limit}` : '/waitlist/entries';
    return this.makeRequest(url);
  }

  async getWaitlistCount(): Promise<ApiResponse<{ count: number }>> {
    return this.makeRequest('/waitlist/count');
  }

  // Feedback APIs
  async addFeedbackEntry(data: {
    message: string;
    name?: string;
    email?: string;
  }): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest('/feedback/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeedbackEntries(limit?: number): Promise<ApiResponse<any[]>> {
    const url = limit ? `/feedback/entries?limit=${limit}` : '/feedback/entries';
    return this.makeRequest(url);
  }

  async getFeedbackCount(): Promise<ApiResponse<{ count: number }>> {
    return this.makeRequest('/feedback/count');
  }

  // User profile APIs (authenticated)
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/parent/profile');
  }

  async updateParentProfile(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/parent/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async addChild(data: { displayName: string; dateOfBirth: string; gender: string }): Promise<ApiResponse<{ child: Child; totalChildren: number; firstQuestion?: NextQuestionResponse }>> {
    return this.makeRequest('/parent/add-child', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getChildren(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/children');
  }

  // Daily Task APIs
  async getDailyTask(childId: string): Promise<ApiResponse<DailyTaskResponse>> {
    return this.makeRequest(`/daily-task/child/${childId}/daily-task`);
  }

  async startDailyTask(childId: string, taskId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/daily-task/child/${childId}/daily-task/${taskId}/start`, {
      method: 'PATCH'
    });
  }

  async completeDailyTask(childId: string, taskId: string, response: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/daily-task/child/${childId}/daily-task/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ response })
    });
  }

  // Weekly Interest APIs
  async getWeeklyInterest(childId: string): Promise<ApiResponse<WeeklyInterestData>> {
    return this.makeRequest(`/weekly-interest/child/${childId}/weekly-interest`);
  }

  async startWeeklyInterest(childId: string, interestId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-interest/child/${childId}/weekly-interest/${interestId}/start`, {
      method: 'PATCH'
    });
  }

  async completeWeeklyInterest(childId: string, interestId: string, responses: Array<{ questionId: string; selectedAnswer: string; selectedIndex: number }>): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-interest/child/${childId}/weekly-interest/${interestId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ responses })
    });
  }

  // Weekly Potential APIs
  async getWeeklyPotential(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-potential/child/${childId}/weekly-potential`);
  }

  async startWeeklyPotential(childId: string, potentialId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-potential/child/${childId}/weekly-potential/${potentialId}/start`, {
      method: 'PATCH'
    });
  }

  async completeWeeklyPotential(childId: string, potentialId: string, responses: Array<{ questionId: string; selectedAnswer: string; selectedIndex: number }>): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-potential/child/${childId}/weekly-potential/${potentialId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ responses })
    });
  }

  // Career Insights APIs
  async getCareerInsights(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/career-insights/child/${childId}/career-insights`);
  }

  async regenerateCareerInsights(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/career-insights/child/${childId}/career-insights/regenerate`, {
      method: 'POST'
    });
  }

  // Spark Interest APIs
  async getSparkInterest(childId: string): Promise<ApiResponse<SparkInterest>> {
    return this.makeRequest(`/spark-interest/child/${childId}/spark-interest`);
  }

  async createSparkInterest(childId: string, data: { selectedCareerId?: string; customGoal?: string }): Promise<ApiResponse<SparkInterest>> {
    return this.makeRequest(`/spark-interest/child/${childId}/spark-interest/update`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }



  // Weekly Quiz APIs
  async getWeeklyQuiz(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/current/${childId}`);
  }

  async getWeeklyQuizByWeek(childId: string, weekStartDate: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/week/${weekStartDate}/${childId}`);
  }

  async createWeeklyQuiz(childId: string, quizId: string, data: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/child/${childId}/weekly-quiz/${quizId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async startWeeklyQuiz(childId: string, quizId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/child/${childId}/weekly-quiz/${quizId}/start`, {
      method: 'PATCH'
    });
  }

  async submitWeeklyQuiz(childId: string, quizId: string, responses: Array<{ questionId: string; selectedAnswer: string; selectedIndex: number }>): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/child/${childId}/weekly-quiz/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ responses })
    });
  }

  async completeWeeklyQuiz(childId: string, quizId: string, responses: Array<{ questionId: string; selectedAnswer: string; selectedIndex: number }>): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/child/${childId}/weekly-quiz/${quizId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ responses })
    });
  }

  async getWeeklyQuizHistory(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/${childId}/history`);
  }

  async getWeeklyQuizAnalytics(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/${childId}/analytics`);
  }

  async getAllWeeklyQuizzes(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-quiz/${childId}/all`);
  }

  // Moral Story APIs
  async getMoralStory(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/moral-story/child/${childId}/moral-story`);
  }

  async startMoralStory(childId: string, storyId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/moral-story/child/${childId}/moral-story/${storyId}/start`, {
      method: 'PATCH'
    });
  }

  async completeMoralStory(childId: string, storyId: string, reflections: { [key: string]: string }): Promise<ApiResponse<any>> {
    return this.makeRequest(`/moral-story/child/${childId}/moral-story/${storyId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ reflections })
    });
  }

  // Onboarding Questionnaire APIs
  async getOnboardingQuestionnaire(childId: string): Promise<ApiResponse<OnboardingQuestionnaire>> {
    return this.makeRequest(`/onboarding-questionnaire/child/${childId}`);
  }

  async submitOnboardingAnswer(childId: string, data: OnboardingAnswerData): Promise<ApiResponse<OnboardingAnswerResponse>> {
    return this.makeRequest(`/onboarding-questionnaire/child/${childId}/answer`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }


}

export const apiClient = new ApiClient();
