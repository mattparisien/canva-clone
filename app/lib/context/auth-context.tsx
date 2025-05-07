"use client";

import {
  createContext,
  useContext,
  ReactNode
} from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { authAPI } from "../api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
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
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
  } : null;

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // First register the user with our API
      await authAPI.register(name, email, password);
      
      // Then sign them in with NextAuth
      await login(email, password);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
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
      await authAPI.resetPassword(resetToken, password);
      // User will need to log in after password reset
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
    if (!session?.accessToken) {
      throw new Error("You must be logged in to update your profile");
    }

    try {
      const { user } = await authAPI.updateProfile(session.accessToken, data);
      // The session will be updated on next refresh
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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