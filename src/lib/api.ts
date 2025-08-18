// API utility for making authenticated requests to the backend

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

  async getChildren(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/children');
  }

  // Daily Task APIs
  async getDailyTask(childId: string): Promise<ApiResponse<any>> {
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
  async getWeeklyInterest(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-interest/child/${childId}/weekly-interest`);
  }

  async startWeeklyInterest(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-interest/child/${childId}/weekly-interest/start`, {
      method: 'PATCH'
    });
  }

  async completeWeeklyInterest(childId: string, responses: Array<{ questionId: string; selectedAnswer: string; selectedIndex: number }>): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-interest/child/${childId}/weekly-interest/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ responses })
    });
  }

  // Weekly Potential APIs
  async getWeeklyPotential(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-potential/child/${childId}/weekly-potential`);
  }

  async startWeeklyPotential(childId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-potential/child/${childId}/weekly-potential/start`, {
      method: 'PATCH'
    });
  }

  async completeWeeklyPotential(childId: string, responses: Array<{ questionId: string; selectedAnswer: string; selectedIndex: number }>): Promise<ApiResponse<any>> {
    return this.makeRequest(`/weekly-potential/child/${childId}/weekly-potential/complete`, {
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

  // Onboarding Questionnaire APIs
  async startOnboardingQuestionnaire(childData: {
    displayName: string;
    age: number;
    gender: string;
    dateOfBirth: string;
  }): Promise<ApiResponse<{ questionId: string; question: string; type: string; options?: string[] }>> {
    return this.makeRequest('/onboarding/start', {
      method: 'POST',
      body: JSON.stringify(childData)
    });
  }

  async getNextQuestion(data: {
    childData: {
      displayName: string;
      age: number;
      gender: string;
      dateOfBirth: string;
    };
    questionnaire: Array<{
      questionId: string;
      question: string;
      answer: string;
    }>;
  }): Promise<ApiResponse<{ questionId: string; question: string; type: string; options?: string[] }>> {
    return this.makeRequest('/onboarding/next-question', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const apiClient = new ApiClient();
