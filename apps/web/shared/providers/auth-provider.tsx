"use client"
import React from "react";
import { authClient, Session, User } from "../lib/auth-client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
});

export const useAuth = () => {

  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null)
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { data, error } = await authClient.getSession() // better auth client
        console.log({ data, error });
        if (error) setError(error.message ?? "Error while fetching session")
        setUser(data?.user ?? null);
        setSession(data?.session ?? null)
      } catch (err) {
        setError("Network error - failed to fetch token");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};