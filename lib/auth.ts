import Cookies from 'js-cookie';
import api from './api';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  kyc_status?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY = 'billows_admin_token';
const REFRESH_TOKEN_KEY = 'billows_admin_refresh_token';
const USER_KEY = 'billows_admin_user';

export const authService = {
  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Verify user is admin
        if (user.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }
        
        // Store tokens and user data
        // Cookie settings for iPad Safari compatibility
        const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const cookieOptions = {
          expires: 1,
          secure: isProduction, // Only send over HTTPS in production
          sameSite: 'lax' as const, // Allow cookies in top-level navigations
        };
        
        Cookies.set(TOKEN_KEY, accessToken, cookieOptions);
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { ...cookieOptions, expires: 7 }); // 7 days
        Cookies.set(USER_KEY, JSON.stringify(user), cookieOptions);
        
        // Set default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        return { user, accessToken, refreshToken };
      }
      
      throw new Error(response.data.error || 'Login failed');
    } catch (error: any) {
      // Handle axios errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.message) {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  // Logout
  logout() {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser(): User | null {
    const userStr = Cookies.get(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Get token
  getToken(): string | null {
    return Cookies.get(TOKEN_KEY) || null;
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!token && !!user && user.role === 'admin';
  },

  // Initialize auth (call on app load)
  initAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  // Refresh token
  async refreshToken(): Promise<string> {
    const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await api.post('/auth/refresh-token', {
      refreshToken
    });

    if (response.data.success) {
      const { accessToken } = response.data.data;
      // Cookie settings for iPad Safari compatibility
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const cookieOptions = {
        expires: 1,
        secure: isProduction, // Only send over HTTPS in production
        sameSite: 'lax' as const, // Allow cookies in top-level navigations
      };
      Cookies.set(TOKEN_KEY, accessToken, cookieOptions);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return accessToken;
    }

    throw new Error('Token refresh failed');
  }
};

// Initialize auth on module load
if (typeof window !== 'undefined') {
  authService.initAuth();
}

