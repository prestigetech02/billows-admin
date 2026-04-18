import axios from 'axios';
import Cookies from 'js-cookie';

// Get API URL from environment variable or auto-detect from hostname
// This function is called at runtime to ensure it works regardless of build-time env vars
const getApiUrl = () => {
  // Client-side: Always check window location first (most reliable)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domains - always use production API
    if (hostname.includes('billows.com.ng') || hostname.includes('admin.billows')) {
      return 'https://billows.passproafrica.com.ng/api';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000/api';
    }
  }
  
  // Server-side or fallback: check environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Final fallback (shouldn't reach here in production)
  return 'https://billows.passproafrica.com.ng/api';
};

// Get API URL dynamically at runtime, not at module load time
const getApiUrlDynamic = () => getApiUrl();

// Initialize with a placeholder - will be set dynamically in interceptor
const api = axios.create({
  baseURL: '', // Will be set dynamically in request interceptor
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for mobile Safari compatibility
});

// Request interceptor to set baseURL dynamically and add auth token
api.interceptors.request.use(
  (config) => {
    // Always set baseURL dynamically at request time (not build time)
    // This ensures it works regardless of build-time environment variables
    const apiUrl = getApiUrlDynamic();
    config.baseURL = apiUrl;
    
    // Log for debugging (only in browser, only once per session)
    if (typeof window !== 'undefined' && !(window as any).__apiUrlLogged) {
      console.log('🔗 API Base URL:', apiUrl);
      if (apiUrl.includes('localhost')) {
        console.warn('⚠️ Using localhost API URL. This should not happen in production.');
      }
      (window as any).__apiUrlLogged = true;
    }
    
    // Add auth token
    const token = Cookies.get('billows_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors (common on iPad Safari)
    if (!error.response) {
      // Network error (no response from server)
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.message = 'Request timeout. Please check your connection and try again.';
      } else if (error.message.includes('Network Error')) {
        error.message = 'Network error. Please check your internet connection.';
      }
      return Promise.reject(error);
    }

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('billows_admin_refresh_token');
        if (refreshToken) {
          const apiUrl = getApiUrlDynamic();
          const response = await axios.post(
            `${apiUrl}/auth/refresh-token`,
            { refreshToken },
            { timeout: 30000 }
          );

          if (response.data.success) {
            const { accessToken } = response.data.data;
            // Cookie settings for iPad Safari compatibility
            const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
            const cookieOptions = {
              expires: 1,
              secure: isProduction, // Only send over HTTPS in production
              sameSite: 'lax' as const, // Allow cookies in top-level navigations
            };
            Cookies.set('billows_admin_token', accessToken, cookieOptions);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          Cookies.remove('billows_admin_token');
          Cookies.remove('billows_admin_refresh_token');
          Cookies.remove('billows_admin_user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

