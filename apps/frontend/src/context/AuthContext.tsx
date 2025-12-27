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

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
    setIsSaaSSuspended(false);

    localStorage.removeItem("token");

    delete api.defaults.headers.common["Authorization"];
  }, []);

  const login = React.useCallback(
    (
      newToken: string,
      newUser: User,
      subscriptionStatus: string = "active"
    ) => {
      setToken(newToken);
      setUser(newUser);

      const suspended = subscriptionStatus !== "active";
      setIsSaaSSuspended(suspended);

      localStorage.setItem("token", newToken);

      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    },
    []
  );

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fetch user profile if not loaded (e.g. page refresh)
      if (!user) {
        api
          .get("/auth/me")
          .then((response) => {
            const { user: fetchedUser, subscription_status } = response.data;
            setUser(fetchedUser);
            setIsSaaSSuspended(subscription_status !== "active");
          })
          .catch((err) => {
            console.error("Failed to restore session", err);
            logout();
          });
      }
    }
  }, [token, user, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isSaaSSuspended,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
