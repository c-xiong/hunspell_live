import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenManager } from '../config/api';

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // 设置 token 更新回调
    tokenManager.setUpdateCallback(setAccessToken);
    
    // 清理函数
    return () => {
      tokenManager.setUpdateCallback(() => {});
    };
  }, []);

  const handleSetAccessToken = (token: string | null) => {
    tokenManager.setToken(token);
    setAccessToken(token);
  };

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken: handleSetAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 