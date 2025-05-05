"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { authAPI } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      setIsLoading(true);
      const { user } = await authAPI.verifyToken(token);
      setUser(user);
      setToken(token);
    } catch (error) {
      console.error("Error verifying token:", error);
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await authAPI.login(email, password);
      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await authAPI.register(name, email, password);
      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call the logout endpoint
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Even if the server logout fails, clear local state
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<string> => {
    try {
      const { message } = await authAPI.forgotPassword(email);
      return message;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  };

  const resetPassword = async (resetToken: string, password: string): Promise<void> => {
    try {
      const { user, token } = await authAPI.resetPassword(resetToken, password);
      // Auto-login after successful password reset
      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const updateProfile = async (data: { 
    name?: string; 
    email?: string; 
    currentPassword?: string; 
    newPassword?: string 
  }): Promise<void> => {
    if (!token) {
      throw new Error("You must be logged in to update your profile");
    }

    try {
      const { user } = await authAPI.updateProfile(token, data);
      // Update local user state with the new data
      setUser(user);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}