import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { tokenManager } from '../config/api';
import { toast } from 'react-toastify';
import { useAuthContext } from '../contexts/AuthContext'

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
}

interface LoginResponse {
  refresh: string;
  access: string;
}

interface ProfileData {
  birthdate?: string;
  gender?: string;
  education?: string;
}

export const useAuth = () => {
  const { setAccessToken } = useAuthContext();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    setIsLoading(true);
    try {
      const accessToken = tokenManager.getToken();
      if (!accessToken) {
        setAuthState({
          isAuthenticated: false,
          user: null
        });
        setAccessToken(null);
        return;
      }

      setAccessToken(accessToken);

      const response = await apiRequest("/auth/user/", {
        method: "GET",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setAuthState({
          isAuthenticated: true,
          user: userData
        });
      } else {
        tokenManager.setToken(null);
        setAuthState({
          isAuthenticated: false,
          user: null
        });
      }
    } catch (error) {
      console.error('User check failed:', error);
      tokenManager.setToken(null);
      setAuthState({
        isAuthenticated: false,
        user: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("/auth/login/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const responseData = await response.json();
      tokenManager.setToken(responseData.access);
      setAccessToken(responseData.access);
      
      const userResponse = await apiRequest("/auth/user/", {
        method: "GET",
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setAuthState({
          isAuthenticated: true,
          user: userData
        });
        toast.success('Successfully logged in!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout/", {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setAccessToken(null);
      setAuthState({
        isAuthenticated: false,
        user: null
      });
      window.location.href = '/';
    }
  };

  const register = async (email: string, password: string, profileData?: ProfileData): Promise<boolean> => {
    try {
      const response = await apiRequest("/auth/register/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          birthdate: profileData?.birthdate,
          gender: profileData?.gender,
          education: profileData?.education
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      toast.success('Registration successful! You can now log in.');
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'An unexpected error occurred. Please try again later.');
      return false;
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading,
    login,
    logout,
    register,
  };
}; 