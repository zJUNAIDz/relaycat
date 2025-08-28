"use client"
import { User } from "@/generated/prisma/client";
import React from "react";

type AuthContextType = {
  authToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = React.createContext<AuthContextType>({
  authToken: null,
  user: null,
  isLoading: true,
  error: null,
});

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authToken, setAuthToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true)
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/get-token');
        const data = await response.json();
        if (data.success) {
          setAuthToken(data.token);
          setUser(data.user);
        } else {
          setError(data.error || "Failed to fetch token");
        }
      } catch (err) {
        setError("Network error - failed to fetch token");
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};