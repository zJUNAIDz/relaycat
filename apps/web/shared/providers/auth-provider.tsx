"use client"
import React, { useMemo } from "react";
import { authClient, Session, User } from "../lib/auth-client";
import { useQuery } from "@tanstack/react-query";

type AuthContextType = {
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  session: Session | null;
  user: User | null;
}
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  isError: false,
});

export const useAuth = () => {
  const ctx = React.useContext(AuthContext)
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider")
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data, error } = await authClient.getSession()
      if (error) throw new Error(error.message ?? "Error while fetching session")
      return data;
    },
  });
  const value = React.useMemo(() => ({
    user: data?.user as User | null,
    session: data?.session as Session | null,
    isLoading,
    error,
    isError,
  }), [data, error, isLoading, isError]);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};