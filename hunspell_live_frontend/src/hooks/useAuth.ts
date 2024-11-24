import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { toast } from 'react-toastify';
import { useAuthContext } from '../contexts/AuthContext'
interface LoginResponse {
  refresh: string;
  access: string;
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
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setAuthState({
          isAuthenticated: false,
          user: null
        });
        return;
      }

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
        localStorage.removeItem('accessToken');
        setAuthState({
          isAuthenticated: false,
          user: null
        });
      }
    } catch (error) {
      console.error('User check failed:', error);
      localStorage.removeItem('accessToken');
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
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access);
        
        // Get user data with bearer token
        const userResponse = await apiRequest("/auth/user/", {
          method: "GET",
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${data.access}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setAuthState({
            isAuthenticated: true,
            user: userData
          });
          toast.success('Successfully logged in!');
          return true;
        } else {
          console.error('Failed to get user data:', userResponse.statusText);
        }
      } else {
        console.error('Login failed:', response.statusText);
      }
      
      toast.error('Invalid credentials');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
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

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("/auth/register/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! You can now log in.');
        return true;
      } else {
        if (data.email) {
          toast.error(data.email[0]);
        } else if (data.password) {
          toast.error(data.password[0]);
        } else if (data.detail) {
          toast.error(data.detail);
        } else {
          toast.error(data.message || 'Registration failed. Please try again.');
        }
        return false;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('An unexpected error occurred. Please try again later.');
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