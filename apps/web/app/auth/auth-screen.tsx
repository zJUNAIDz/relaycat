"use client";

import { Input } from "@/shared/components/ui/input";
import { signIn, signinWithEmail, signupWithEmail } from "@/shared/lib/auth-client";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/auth-provider";
import { Space_Grotesk } from "next/font/google";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

type AuthMode = "login" | "signup" | "verification-sent";

const AuthScreen = ({ isLoginParam }: { isLoginParam: boolean }) => {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(isLoginParam ? "login" : "signup");
  const { user, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      redirect(PAGE_ROUTES.HOME);
    }
  }, [user]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signinWithEmail(email, password);
        router.push(PAGE_ROUTES.HOME);
      } else if (mode === "signup") {
        await signupWithEmail(email, password, name);
        setMode("verification-sent");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    try {
      await signIn(provider);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  if (mode === "verification-sent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
            <div className="text-center space-y-4">
              <h1 className={`${spaceGrotesk.className} text-3xl mb-2`}>
                Relay<span className="text-sky-500">cat</span>
              </h1>

              <div className="text-green-500 text-5xl mb-4">✓</div>

              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                Check your email
              </h2>

              <p className="text-neutral-600 dark:text-neutral-400">
                We&apos;ve sent a verification link to <strong>{email}</strong>
              </p>

              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Click the link in the email to verify your account and complete signup.
              </p>

              <button
                onClick={() => setMode("login")}
                className="mt-6 text-sky-500 hover:text-sky-600 transition-colors"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center mb-8">
            <h1 className={`${spaceGrotesk.className} text-4xl mb-2`}>
              Relay<span className="text-sky-500">cat</span>
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              />
              {mode === "signup" && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Must be at least 8 characters
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-neutral-600 dark:text-neutral-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors text-sm"
            >
              {mode === "login"
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-neutral-800 text-sm text-neutral-500 dark:text-neutral-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialSignIn("google")}
              className="flex items-center justify-center gap-2 py-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all"
              type="button"
            >
              <FaGoogle className="text-red-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Google</span>
            </button>

            <button
              onClick={() => handleSocialSignIn("github")}
              className="flex items-center justify-center gap-2 py-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all"
              type="button"
            >
              <FaGithub className="text-neutral-800 dark:text-white" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;