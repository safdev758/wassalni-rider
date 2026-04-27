import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authAPI, userAPI, setAccessToken, connectWebSocket, disconnectWebSocket } from '../services/api';

const TOKEN_KEY = 'rider_access_token';
const DEVICE_ID_KEY = 'rider_device_id';

const storeToken = async (token: string | null) => {
  if (Platform.OS === 'web') return;
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

const loadToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  return SecureStore.getItemAsync(TOKEN_KEY);
};

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
  login: (phone: string) => Promise<void>;
  signup: (name: string, phone: string) => Promise<void>;
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
  login: async () => {},
  signup: async () => {},
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
  const [pendingName, setPendingName] = useState<string | null>(null);

  useEffect(() => {
    loadToken().then(async (token) => {
      if (token) {
        setAccessToken(token);
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

  const getDeviceId = async (): Promise<string> => {
    if (Platform.OS === 'web') return 'web-device';
    const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (stored) return stored;
    const id = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
    return id;
  };

  const verifyOTP = async (phone: string, code: string) => {
    const deviceId = await getDeviceId();
    const deviceType = Platform.OS;
    const response = await authAPI.verifyOTP(phone, code, deviceId, deviceType);
    setAccessToken(response.access_token);
    await storeToken(response.access_token);

    const user = response.user;
    const displayName = pendingName || user.name;
    setAuth({
      isGuest: false,
      isAuthenticated: true,
      user: {
        id: user.id,
        name: displayName,
        phone: user.phone,
        email: user.email || '',
        totalRides: user.total_rides || 0,
      },
      isLoading: false,
    });
    connectWebSocket();

    if (pendingName) {
      userAPI.updateProfile({ name: pendingName }).catch(() => {});
      setPendingName(null);
    }
  };

  const login = async (phone: string) => {
    await sendOTP(phone);
  };

  const signup = async (name: string, phone: string) => {
    setPendingName(name);
    await sendOTP(phone);
  };

  const logout = () => {
    setAccessToken(null);
    storeToken(null).catch(() => {});
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
        name: profile.name ?? prev.user.name,
        email: profile.email ?? prev.user.email,
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
