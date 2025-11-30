import apiService from './api';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  // Add other profile fields as needed
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  // Add other updatable fields as needed
}

class ProfileService {
  /**
   * Get user profile - demonstrates transparent token refresh
   * If the access token is expired, the API service will automatically:
   * 1. Intercept the 401 response
   * 2. Use the refresh token to get new tokens
   * 3. Retry the original request with the new access token
   * 4. Return the successful response
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await apiService.get<UserProfile>('/identity/v1/user/profile');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get user profile:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error('Failed to load profile. Please try again.');
    }
  }

  /**
   * Update user profile - also demonstrates transparent token refresh
   */
  async updateUserProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>('/identity/v1/user/profile', updates);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update user profile:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid profile data.');
      }
      
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  /**
   * Get user preferences - another example API call
   */
  async getUserPreferences(): Promise<any> {
    try {
      const response = await apiService.get('/identity/v1/user/preferences');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get user preferences:', error);
      throw new Error('Failed to load preferences. Please try again.');
    }
  }

  /**
   * Example of making multiple API calls - all will benefit from automatic token refresh
   */
  async getUserData(): Promise<{ profile: UserProfile; preferences: any }> {
    try {
      // These calls will be made in parallel
      // If any fail due to expired token, they will be automatically retried after refresh
      const [profileResponse, preferencesResponse] = await Promise.all([
        apiService.get<UserProfile>('/identity/v1/user/profile'),
        apiService.get('/identity/v1/user/preferences'),
      ]);

      return {
        profile: profileResponse.data,
        preferences: preferencesResponse.data,
      };
    } catch (error: any) {
      console.error('Failed to get user data:', error);
      throw new Error('Failed to load user data. Please try again.');
    }
  }
}

// Export singleton instance
const profileService = new ProfileService();
export default profileService;
