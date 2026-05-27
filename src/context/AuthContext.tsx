import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authAPI, userAPI, setAccessToken, connectWebSocket, disconnectWebSocket } from '../services/api';
import { onUnauthorized } from '../services/authEvents';
import { registerPushTokenIfPossible, resetPushRegistration } from '../services/pushNotifications';

const DEVICE_ID_KEY = 'rider_device_id';

type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalRides: number;
  avatar?: string;
  avatarVersion?: number;
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
  signup: (name: string, phone: string, gender?: 'female' | 'male') => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  uploadAvatar: (imageBase64: string, mimeType: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
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
  uploadAvatar: async () => {},
  refreshUserProfile: async () => {},
});

function mapProfile(profile: {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar_url?: string;
  total_rides?: number;
}): User {
  return {
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    email: profile.email || '',
    totalRides: profile.total_rides ?? 0,
    avatar: profile.avatar_url,
    avatarVersion: profile.avatar_url ? Date.now() : undefined,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isGuest: true,
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [pendingGender, setPendingGender] = useState<'female' | 'male' | null>(null);

  useEffect(() => {
    const handleUnauthorized = () => {
      disconnectWebSocket();
      resetPushRegistration();
      setAuth({ isGuest: true, isAuthenticated: false, user: null, isLoading: false });
    };
    return onUnauthorized(handleUnauthorized);
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        setAuth(prev => ({ ...prev, isLoading: false }));
        return;
      }
      const token = await SecureStore.getItemAsync('rider_access_token');
      if (token) {
        setAccessToken(token);
        try {
          const profile = await userAPI.getProfile();
          setAuth({
            isGuest: false,
            isAuthenticated: true,
            user: mapProfile(profile),
            isLoading: false,
          });
          connectWebSocket();
          registerPushTokenIfPossible().catch(() => {});
        } catch {
          setAccessToken(null);
          setAuth({ isGuest: true, isAuthenticated: false, user: null, isLoading: false });
        }
      } else {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const sendOTP = async (phone: string) => {
    // Ensure phone number has +213 prefix for Algerian numbers
    const formattedPhone = phone.startsWith('+') ? phone : `+213${phone.replace(/^213/, '')}`;
    await authAPI.sendOTP(formattedPhone);
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
    // Ensure phone number has +213 prefix for Algerian numbers
    const formattedPhone = phone.startsWith('+') ? phone : `+213${phone.replace(/^213/, '')}`;
    const deviceId = await getDeviceId();
    const deviceType = Platform.OS;
    const response = await authAPI.verifyOTP(formattedPhone, code, deviceId, deviceType);
    setAccessToken(response.access_token);

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
    registerPushTokenIfPossible().catch(() => {});

    if (pendingName || pendingGender) {
      userAPI.updateProfile({
        ...(pendingName ? { name: pendingName } : {}),
        ...(pendingGender ? { gender: pendingGender } : {}),
      }).catch(() => {});
      setPendingName(null);
      setPendingGender(null);
    }
  };

  const login = async (phone: string) => {
    await sendOTP(phone);
  };

  const signup = async (name: string, phone: string, gender?: 'female' | 'male') => {
    setPendingName(name);
    setPendingGender(gender ?? null);
    await sendOTP(phone);
  };

  const logout = () => {
    setAccessToken(null);
    resetPushRegistration();
    disconnectWebSocket();
    setAuth({
      isGuest: true,
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  const refreshUserProfile = async () => {
    try {
      const profile = await userAPI.getProfile();
      setAuth((prev) => {
        if (!prev.isAuthenticated || !prev.user) return prev;
        const next = mapProfile(profile);
        const avatarChanged = next.avatar !== prev.user.avatar;
        return {
          ...prev,
          user: {
            ...next,
            avatarVersion: avatarChanged ? Date.now() : prev.user.avatarVersion,
          },
        };
      });
    } catch {
      // ignore refresh errors on profile tab
    }
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    const profile = await userAPI.updateProfile(data);
    setAuth((prev) => ({
      ...prev,
      user: prev.user ? mapProfile({ ...profile, phone: profile.phone || prev.user.phone }) : null,
    }));
  };

  const uploadAvatar = async (imageBase64: string, mimeType: string) => {
    const profile = await userAPI.uploadAvatar(imageBase64, mimeType);
    const mapped = mapProfile({ ...profile, phone: profile.phone });
    setAuth((prev) => ({
      ...prev,
      user: prev.user
        ? { ...mapped, phone: profile.phone || prev.user.phone, avatarVersion: Date.now() }
        : null,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        sendOTP,
        verifyOTP,
        login,
        signup,
        logout,
        updateProfile,
        uploadAvatar,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
