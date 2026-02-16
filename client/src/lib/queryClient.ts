import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

// Get API base URL from environment or default to relative URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Disabled due to CORS - Backend needs to fix: Allow specific origin instead of wildcard
});

// Add request interceptor to include auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token directly from localStorage
    let token = localStorage.getItem('auth_token');
    
    // If not found, try to extract from user_data object
    if (!token) {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          // Check for token in various possible locations
          token = parsed.token || parsed.accessToken || parsed.access_token;
        } catch (e) {
          // Silently fail if parsing fails
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Request with token:', config.method?.toUpperCase(), config.url, '| Token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No auth token found for request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Check for authentication errors (401)
      if (error.response.status === 401 && !originalRequest._retry) {
        // Try to refresh token once before logging out
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          try {
            console.log('� Attempting to refresh expired token...');
            const parsedUserData = JSON.parse(userData);
            const userId = parsedUserData._id || parsedUserData.id || parsedUserData.user_id;

            if (userId) {
              // Call refresh token endpoint
              const response = await axiosInstance.post('/auth/refresh_token', {
                token: token,
                user_id: userId,
              });

              const newToken = response.data?.data?.token || response.data?.token || response.data?.access_token;

              if (newToken) {
                // Update stored token
                localStorage.setItem('auth_token', newToken);
                console.log('✅ Token refreshed successfully, retrying original request');

                // Update auth header for original request
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                
                // Process queued requests
                processQueue(null, newToken);
                isRefreshing = false;

                // Retry the original request
                return axiosInstance(originalRequest);
              }
            }
          } catch (refreshError: any) {
            console.error('❌ Token refresh failed:', refreshError.message);
            processQueue(refreshError, null);
            isRefreshing = false;
            
            // Fall through to logout logic below
          }
        }

        // If refresh failed or no token, proceed with logout
        console.warn('🔒 Authentication error - Logging out user');
        const errorMessage = error.response.data?.message || 'Your session has expired. Please login again.';
        
        // Clear auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Show alert
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          alert(errorMessage);
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          if (window.location.pathname !== '/login' && 
              window.location.pathname !== '/auth' && 
              window.location.pathname !== '/' &&
              window.location.pathname !== '/register' &&
              window.location.pathname !== '/onboarding') {
            window.location.href = '/login';
          }
        }, 500);
        
        isRefreshing = false;
      } else if (error.response.status === 403) {
        // 403 Forbidden - don't try to refresh, just logout
        console.warn('🔒 Access forbidden - Logging out user');
        const errorMessage = error.response.data?.message || 'Access denied. Please login again.';
        
        // Clear auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Show alert
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          alert(errorMessage);
        }
        
        // Redirect to login
        setTimeout(() => {
          if (window.location.pathname !== '/login' && 
              window.location.pathname !== '/auth' && 
              window.location.pathname !== '/' &&
              window.location.pathname !== '/register' &&
              window.location.pathname !== '/onboarding') {
            window.location.href = '/login';
          }
        }, 500);
      }
      
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || error.response.statusText || error.message;
      const customError: any = new Error(message);
      customError.status = error.response.status;
      customError.statusText = error.response.statusText;
      customError.data = error.response.data;
      throw customError;
    } else if (error.request) {
      // Request made but no response received
      const customError: any = new Error("No response from server");
      customError.status = 0;
      throw customError;
    } else {
      // Error setting up request
      throw error;
    }
  }
);

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<{ json: () => Promise<any> }> {
  try {
    const response: AxiosResponse = await axiosInstance.request({
      method,
      url,
      data,
    });
    
    // Return fetch-like response object for compatibility
    return {
      json: async () => response.data,
    };
  } catch (error: any) {
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/");

    try {
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.status === 401) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Trust Ratings API
export const createTrustRating = async (data: {
  group_id: string;
  group_member_id: string;
  rating_score: number;
  description?: string;
}) => {
  const response = await axiosInstance.post('/groups/rating', data);
  return response.data;
};

export const getMemberRatings = async (data: {
  group_id: string;
  member_id: string;
}) => {
  const response = await axiosInstance.post('/groups/rating/member', data);
  return response.data;
};

// Contributions API
export const startGroupContribution = async (data: {
  group_id: string;
  creator_of_group_id: string;
}) => {
  const response = await axiosInstance.post('/groups/contribution/start', data);
  return response.data;
};

export const contributeToGroup = async (data: {
  group_id: string;
  member_id: string;
  amount: number;
}) => {
  const response = await axiosInstance.post('/groups/contribution', data);
  return response.data;
};

// Get user's received ratings
export const getUserReceivedRatings = async (userId: string) => {
  const response = await axiosInstance.get(`/users/${userId}/ratings/received`);
  return response.data;
};

// ============================================
// AUTHENTICATION API
// ============================================

// Logout user
export const logoutUser = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

// Get user profile
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/auth/user');
  return response.data;
};

// Refresh authentication token
export const refreshToken = async (data: {
  token: string;
  user_id: string;
}) => {
  const response = await axiosInstance.post('/auth/refresh_token', data);
  return response.data;
};

// Update user profile (including profile picture)
export const updateUserProfile = async (data: FormData | {
  name?: string;
  email?: string;
  phone?: string;
  profile_picture?: string;
  [key: string]: any;
}) => {
  const response = await axiosInstance.put('/auth/profile', data, {
    headers: {
      'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
    },
  });
  return response.data;
};

// ============================================
// GROUPS API
// ============================================

// Create new group
export const createGroup = async (data: {
  name: string;
  description?: string;
  contribution_amount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  max_members: number;
  is_public?: boolean;
  [key: string]: any;
}) => {
  const response = await axiosInstance.post('/groups/', data);
  return response.data;
};

// Get all public groups
export const getPublicGroups = async () => {
  console.log('📍 Fetching public groups from:', axiosInstance.defaults.baseURL + '/groups/public');
  try {
    const response = await axiosInstance.get('/groups/public');
    console.log('✅ Public groups raw response:', response);
    console.log('✅ Public groups data:', response.data);
    
    // Handle different response structures
    let groups = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('✅ Extracted data array:', response.data.data);
      groups = response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log('✅ Direct array:', response.data);
      groups = response.data;
    } else {
      console.warn('⚠️ Unexpected response structure, returning empty array');
      return [];
    }
    
    // Map MongoDB _id to id for frontend compatibility
    return groups.map((group: any) => ({
      ...group,
      id: group._id || group.id,
    }));
  } catch (error: any) {
    console.error('❌ Get public groups error:', {
      url: axiosInstance.defaults.baseURL + '/groups/public',
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      headers: error.response?.headers
    });
    // Return empty array instead of throwing to prevent UI break
    return [];
  }
};

// Join group with invitation code
export const joinGroup = async (data: {
  invitation_code: string;
}) => {
  const response = await axiosInstance.post('/groups/join', data);
  return response.data;
};

// Get user's groups
export const getUserGroups = async () => {
  console.log('📍 Fetching user groups from:', axiosInstance.defaults.baseURL + '/groups/my');
  try {
    const response = await axiosInstance.get('/groups/my');
    console.log('✅ User groups raw response:', response);
    console.log('✅ User groups data:', response.data);
    
    // Handle different response structures
    let groups = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('✅ Extracted data array:', response.data.data);
      groups = response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log('✅ Direct array:', response.data);
      groups = response.data;
    } else {
      console.warn('⚠️ Unexpected response structure, returning empty array');
      return [];
    }
    
    // Map MongoDB _id to id for frontend compatibility
    return groups.map((group: any) => ({
      ...group,
      id: group._id || group.id,
    }));
  } catch (error: any) {
    console.error('❌ Get user groups error:', {
      url: axiosInstance.defaults.baseURL + '/groups/my',
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      headers: error.response?.headers
    });
    // Return empty array instead of throwing to prevent UI break
    return [];
  }
};

// Get user's active groups only
export const getUserActiveGroups = async () => {
  console.log('📍 Fetching user active groups from:', axiosInstance.defaults.baseURL + '/groups/my-active-groups');
  try {
    const response = await axiosInstance.get('/groups/my-active-groups');
    console.log('✅ User active groups raw response:', response);
    console.log('✅ User active groups data:', response.data);
    
    // Handle different response structures
    let groups = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('✅ Extracted data array:', response.data.data);
      groups = response.data.data;
    } else if (Array.isArray(response.data)) {
      console.log('✅ Direct array:', response.data);
      groups = response.data;
    } else {
      console.warn('⚠️ Unexpected response structure, returning empty array');
      return [];
    }
    
    // Map MongoDB _id to id for frontend compatibility
    return groups.map((group: any) => ({
      ...group,
      id: group._id || group.id,
    }));
  } catch (error: any) {
    console.error('❌ Get user active groups error:', {
      url: axiosInstance.defaults.baseURL + '/groups/my-active-groups',
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      headers: error.response?.headers
    });
    // Return empty array instead of throwing to prevent UI break
    return [];
  }
};

// Get group by ID with full details (members, payout schedule, etc.)
export const getGroupById = async (groupId: string) => {
  console.log('📍 Fetching group details for:', groupId);
  try {
    const response = await axiosInstance.get(`/groups/${groupId}`);
    console.log('✅ Group details response:', response.data);
    
    // Extract the group data from the response
    const groupData = response.data?.data || response.data;
    
    // Map MongoDB _id to id for frontend compatibility
    return {
      ...groupData,
      id: groupData._id || groupData.id,
    };
  } catch (error: any) {
    console.error('❌ Get group details error:', {
      groupId,
      url: axiosInstance.defaults.baseURL + `/groups/${groupId}`,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Create trust rating for group member (using correct endpoint)
export const createGroupMemberRating = async (data: {
  group_id: string;
  group_member_id: string;
  rating_score: number;
  description?: string;
}) => {
  const response = await axiosInstance.post('/groups/rating', data);
  return response.data;
};

// ============================================
// PAYMENT & TRANSACTIONS API
// ============================================

// Get user's transactions
export const getUserTransactions = async () => {
  const response = await axiosInstance.get('/payment/transaction/my');
  // Extract the data array from the response
  return response.data?.data || response.data || [];
};

// Make a contribution/payment
export const makeContribution = async (data: {
  group_id: string;
  amount: number;
  [key: string]: any;
}) => {
  const response = await axiosInstance.post('/payment/contribute', data);
  return response.data;
};

// Activate contribution for a group (admin only)
export const activateGroupContribution = async (data: {
  group_id: string;
  [key: string]: any;
}) => {
  const response = await axiosInstance.post('/groups/activate_contribution', data);
  return response.data;
};
