import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthState = {
  isGuest: boolean;
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    totalRides: number;
    avatar?: string;
  } | null;
};

type AuthContextType = AuthState & {
  login: (phone: string) => void;
  signup: (name: string, phone: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isGuest: true,
  isAuthenticated: false,
  user: null,
  login: () => {},
  signup: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isGuest: true,
    isAuthenticated: false,
    user: null,
  });

  const login = (phone: string) => {
    setAuth({
      isGuest: false,
      isAuthenticated: true,
      user: {
        id: 'usr_001',
        name: 'Ahmed Benali',
        phone,
        email: '',
        totalRides: 0,
      },
    });
  };

  const signup = (name: string, phone: string) => {
    setAuth({
      isGuest: false,
      isAuthenticated: true,
      user: {
        id: 'usr_001',
        name,
        phone,
        email: '',
        totalRides: 0,
      },
    });
  };

  const logout = () => {
    setAuth({
      isGuest: true,
      isAuthenticated: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
