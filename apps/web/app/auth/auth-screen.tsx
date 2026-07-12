"use client";

import { Input } from "@/shared/components/ui/input";
import { signIn, signinWithEmail, signupWithEmail } from "@/shared/lib/auth-client";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/auth-provider";
import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
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

  // Already authenticated (e.g. arrived via OAuth redirect or an existing
  // session) -> bounce to the app. router.replace avoids a back-button loop.
  useEffect(() => {
    if (user) {
      router.replace(PAGE_ROUTES.HOME);
    }
  }, [user, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signinWithEmail(email, password);
        // Session is now set; AuthProvider syncs the store and the effect
        // above redirects. Replace explicitly so it happens immediately.
        router.replace(PAGE_ROUTES.HOME);
      } else if (mode === "signup") {
        await signupWithEmail(email, password, name);
        setMode("verification-sent");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred";
      // Signing in with an unverified email -> guide the user to verify.
      if (/verify/i.test(message)) {
        setMode("verification-sent");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setError("");
    try {
      await signIn(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-card">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  if (mode === "verification-sent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-card px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center space-y-4">
              <h1 className={`${spaceGrotesk.className} text-3xl mb-2`}>
                Relay<span className="text-brand">cat</span>
              </h1>

              <div className="text-success text-5xl mb-4">✓</div>

              <h2 className="text-2xl font-semibold text-foreground">
                Check your email
              </h2>

              <p className="text-muted-foreground">
                We&apos;ve sent a verification link to <strong>{email}</strong>
              </p>

              <p className="text-sm text-muted-foreground">
                Click the link in the email to verify your account and complete signup.
              </p>

              <button
                onClick={() => setMode("login")}
                className="mt-6 text-brand hover:text-brand transition-colors"
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
    <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-card px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border p-8">
          <div className="text-center mb-8">
            <h1 className={`${spaceGrotesk.className} text-4xl mb-2`}>
              Relay<span className="text-brand">cat</span>
            </h1>
            <p className="text-muted-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
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
                className="w-full px-4 py-3 bg-muted rounded-lg border border-border focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand/90 disabled:bg-brand disabled:cursor-not-allowed text-brand-foreground py-3 rounded-lg font-medium transition-colors"
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
              className="text-muted-foreground hover:text-brand transition-colors text-sm"
            >
              {mode === "login"
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-card text-sm text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialSignIn("google")}
              className="flex items-center justify-center gap-2 py-3 bg-muted rounded-lg border border-border hover:border-brand hover:bg-accent transition-all"
              type="button"
            >
              <FaGoogle className="text-destructive" />
              <span className="text-sm font-medium text-foreground">Google</span>
            </button>

            <button
              onClick={() => handleSocialSignIn("github")}
              className="flex items-center justify-center gap-2 py-3 bg-muted rounded-lg border border-border hover:border-brand hover:bg-accent transition-all"
              type="button"
            >
              <FaGithub className="text-foreground" />
              <span className="text-sm font-medium text-foreground">GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;