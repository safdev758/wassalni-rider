import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userAPI, setAccessToken, loadStoredToken, connectWebSocket, disconnectWebSocket } from '../services/api';

type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalRides: number;
  avatar?: string;
};

type AuthState = {
  isGuest: boolean;
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
};

type AuthContextType = AuthState & {
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  login: (phone: string) => void;
  signup: (name: string, phone: string) => void;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isGuest: true,
  isAuthenticated: false,
  user: null,
  isLoading: true,
  sendOTP: async () => {},
  verifyOTP: async () => {},
  login: () => {},
  signup: () => {},
  logout: () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isGuest: true,
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredToken().then(async (token) => {
      if (token) {
        try {
          const profile = await userAPI.getProfile();
          setAuth({
            isGuest: false,
            isAuthenticated: true,
            user: {
              id: profile.id,
              name: profile.name,
              phone: profile.phone,
              email: profile.email,
              totalRides: profile.total_rides,
              avatar: profile.avatar_url,
            },
            isLoading: false,
          });
          connectWebSocket();
        } catch {
          setAccessToken(null);
          setAuth({ isGuest: true, isAuthenticated: false, user: null, isLoading: false });
        }
      } else {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    });
  }, []);

  const sendOTP = async (phone: string) => {
    await authAPI.sendOTP(phone);
  };

  const verifyOTP = async (phone: string, code: string) => {
    const response = await authAPI.verifyOTP(phone, code);
    setAccessToken(response.access_token);

    const user = response.user;
    setAuth({
      isGuest: false,
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email || '',
        totalRides: user.total_rides || 0,
      },
      isLoading: false,
    });
    connectWebSocket();
  };

  const login = (phone: string) => {
    sendOTP(phone).catch(console.error);
  };

  const signup = (name: string, phone: string) => {
    sendOTP(phone).catch(console.error);
  };

  const logout = () => {
    setAccessToken(null);
    disconnectWebSocket();
    setAuth({
      isGuest: true,
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    const profile = await userAPI.updateProfile(data);
    setAuth(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        name: profile.name || prev.user.name,
        email: profile.email || prev.user.email,
      } : null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, sendOTP, verifyOTP, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
