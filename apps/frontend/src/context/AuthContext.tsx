import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@repo/shared-types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, subscriptionStatus?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isSaaSSuspended: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isSaaSSuspended, setIsSaaSSuspended] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      // Restore user from localStorage
      const savedUser = localStorage.getItem("user");
      const savedSubStatus = localStorage.getItem("subscription_status");
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      if (savedSubStatus && savedSubStatus !== "active") {
        setIsSaaSSuspended(true);
      }
      
      // Set default header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  const login = (newToken: string, newUser: User, subscriptionStatus: string = "active") => {
    setToken(newToken);
    setUser(newUser);
    
    const suspended = subscriptionStatus !== "active";
    setIsSaaSSuspended(suspended);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("subscription_status", subscriptionStatus);
    
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsSaaSSuspended(false);
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("subscription_status");
    
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token, isSaaSSuspended }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};