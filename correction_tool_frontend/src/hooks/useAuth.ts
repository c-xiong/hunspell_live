import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { toast } from 'react-toastify';

interface LoginResponse {
  refresh: string;
  access: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken'); // Retrieve token from storage
      if (!accessToken) {
        throw new Error('No access token found');
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
        console.error('Failed to get user data:', response.statusText);
      }
    } catch (error) {
      console.error('User check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("/auth/login/", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        
        // Store the access token in local storage
        localStorage.setItem('accessToken', data.access);

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
      const accessToken = localStorage.getItem('accessToken');
      
      // Call logout endpoint with authorization header
      const response = await apiRequest("/auth/logout/", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // Clear local storage and auth state regardless of response
      localStorage.removeItem('accessToken');
      setAuthState({
        isAuthenticated: false,
        user: null
      });
      
      if (response.ok) {
        toast.success('Logged out successfully');
        // Optionally redirect to home page
        window.location.href = '/';
      } else {
        console.error('Logout API call failed:', response.statusText);
        // Still consider the user logged out locally
        toast.warning('Logged out locally. Server sync failed.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      localStorage.removeItem('accessToken');
      setAuthState({
        isAuthenticated: false,
        user: null
      });
      toast.warning('Logged out locally. Server sync failed.');
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading,
    login,
    logout,
  };
}; 