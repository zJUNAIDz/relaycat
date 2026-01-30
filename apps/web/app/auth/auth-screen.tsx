"use client";

import { signIn } from "@/shared/lib/auth-client";
import { PAGE_ROUTES } from "@/shared/lib/routes";
import { useAuth } from "@/shared/providers/auth-provider";
import { motion } from "framer-motion";
import { Inter, Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

const providers = [{ name: "Google", id: "google" }, { name: "GitHub", id: "github" }];
const AuthScreen = ({ isLoginParam }: {
  isLoginParam: boolean
}) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(isLoginParam);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(PAGE_ROUTES.HOME);
    }
  }, [user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return null;
  }

  return (
    <div className={`${inter.className} min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900`}>
      <div className="w-full max-w-md p-6">
        <div className="backdrop-blur-lg bg-white/80 dark:bg-neutral-800/80 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <motion.div
            className="p-8"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <div className="mb-8 text-center space-y-2">
              <h1 className={`${spaceGrotesk.className} text-4xl mb-2`}>
                Relay<span className="text-sky-500">cat</span>
              </h1>
              <form className="space-y-4">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full px-4 py-3 bg-neutral-100/50 dark:bg-neutral-700/20 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </motion.div>
                )}

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-neutral-100/50 dark:bg-neutral-700/20 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-neutral-100/50 dark:bg-neutral-700/20 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-sky-500 hover:bg-sky-600 py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  type="button"
                >
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <HiArrowRight className="animate-pulse" />
                </motion.button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-sky-500 transition-colors text-sm"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
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

              <div className="grid grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <motion.button
                    key={provider.id}
                    onClick={() => signIn(provider.id)}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-center gap-2 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 dark:hover:border-sky-600 transition-colors"
                    type="button"
                  >
                    <span className="text-neutral-600 dark:text-neutral-400">{provider.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div >
    </div>
  );
}

export default AuthScreen;