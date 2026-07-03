"use client";
import { useAuth } from "@/shared/providers/auth-provider";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

export default function ClientVerifyEmail({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const router = useRouter();
  const { token } = use(searchParams);
  const refetch = useAuth((state) => state.refetch);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");
  // StrictMode mounts effects twice in dev; guard against a double verify.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        // No callbackURL -> the endpoint returns JSON instead of redirecting.
        // credentials: "include" stores the session cookie from
        // autoSignInAfterVerification so the user lands logged in.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          { method: "GET", credentials: "include" },
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Verification failed" }));
          setStatus("error");
          setMessage(
            errorData.message ||
              "Failed to verify email. The link may be invalid or expired.",
          );
          return;
        }

        // Pull the freshly created session into the store before redirecting.
        await refetch().catch(() => {});
        setStatus("success");
        setMessage("Email verified successfully! Redirecting...");
        redirectTimer = setTimeout(() => router.push(PAGE_ROUTES.HOME), 2000);
      } catch {
        setStatus("error");
        setMessage("Failed to verify email. Please try again.");
      }
    };

    verifyEmail();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [token, router, refetch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted dark:bg-card">
      <div className="w-full max-w-md p-6">
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border p-8">
          <div className="text-center space-y-4">
            <h1 className={`${spaceGrotesk.className} text-3xl mb-2`}>
              Relay<span className="text-brand">cat</span>
            </h1>

            <div className="space-y-2">
              {status === "verifying" && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                </div>
              )}

              {status === "success" && (
                <div className="text-success text-5xl">✓</div>
              )}

              {status === "error" && (
                <div className="text-destructive text-5xl">✗</div>
              )}

              <p className={`text-lg ${status === "success" ? "text-success" :
                status === "error" ? "text-destructive" :
                  "text-muted-foreground"
                }`}>
                {message}
              </p>
            </div>

            {status === "error" && (
              <button
                onClick={() => router.push(PAGE_ROUTES.AUTH)}
                className="mt-4 px-6 py-2 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg transition-colors"
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}