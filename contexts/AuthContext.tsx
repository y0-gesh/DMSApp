import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component that wraps your app and makes auth object available to any
// child component that calls useAuth().
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to load auth token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Handle routing based on authentication state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (!token && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/login');
    } else if (token && inAuthGroup) {
      // Redirect to the main app if authenticated and on a login page
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading, router]);

  // Sign in function
  const signIn = async (newToken: string) => {
    await AsyncStorage.setItem('auth_token', newToken);
    setToken(newToken);
  };

  // Sign out function
  const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
    setToken(null);
  };

  const value = {
    token,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
