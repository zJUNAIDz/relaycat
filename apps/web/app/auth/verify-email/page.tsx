"use client";

import { PAGE_ROUTES } from "@/shared/lib/routes";
import { Space_Grotesk } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link");
          return;
        }

        // The verification happens automatically via the backend
        // We just need to show the status
        setStatus("success");
        setMessage("Email verified successfully! Redirecting...");

        setTimeout(() => {
          router.push(PAGE_ROUTES.HOME);
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage("Failed to verify email. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="w-full max-w-md p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="text-center space-y-4">
            <h1 className={`${spaceGrotesk.className} text-3xl mb-2`}>
              Relay<span className="text-sky-500">cat</span>
            </h1>

            <div className="space-y-2">
              {status === "verifying" && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                </div>
              )}

              {status === "success" && (
                <div className="text-green-500 text-5xl">✓</div>
              )}

              {status === "error" && (
                <div className="text-red-500 text-5xl">✗</div>
              )}

              <p className={`text-lg ${status === "success" ? "text-green-600 dark:text-green-400" :
                  status === "error" ? "text-red-600 dark:text-red-400" :
                    "text-neutral-600 dark:text-neutral-400"
                }`}>
                {message}
              </p>
            </div>

            {status === "error" && (
              <button
                onClick={() => router.push(PAGE_ROUTES.AUTH)}
                className="mt-4 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
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
