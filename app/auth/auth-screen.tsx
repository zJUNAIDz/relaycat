"use client";

import { login } from "@/shared/lib/actions";
import { motion } from "framer-motion";
import { Inter, Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiArrowRight, HiLockClosed, HiShieldCheck, HiSparkles } from "react-icons/hi";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

const securityFeatures = [
  {
    icon: HiLockClosed,
    title: "End-to-End Encryption",
    description: "All messages secured with AES-256 encryption"
  },
  {
    icon: HiShieldCheck,
    title: "OAuth Technology",
    description: "OAuth based Authentication"
  },
  {
    icon: HiSparkles,
    title: "Zero-Knowledge Architecture",
    description: "We never store your decryption keys"
  }
];

const AuthScreen = ({ isAuthenticated, isLoginParam }: {
  isAuthenticated: boolean,
  isLoginParam: boolean
}) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(isLoginParam);

  if (isAuthenticated) router.replace("/setup");

  return (
    <div className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-900`}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="backdrop-blur-lg bg-white/80 dark:bg-neutral-800/80 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left Side - Security Features */}
            <div className="hidden lg:block p-12 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900">
              <div className="h-full flex flex-col justify-center">
                <h2 className={`${spaceGrotesk.className} text-3xl mb-8 text-neutral-900 dark:text-white`}>
                  Enterprise-grade security
                </h2>

                <div className="space-y-6">
                  {securityFeatures.map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm"
                    >
                      <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400">
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -2, 0],
                          opacity: [0.3, 1, 0.8]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: i * 0.3
                        }}
                        className="w-1 h-1 rounded-full bg-sky-500"
                      />
                    ))}
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">
                      Securing your connection...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="py-8">
              <motion.div
                className="max-w-md mx-auto"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <div className="mb-12">
                  <h1 className={`${spaceGrotesk.className} text-4xl mb-2`}>
                    Relay<span className="text-sky-500">cat</span>
                  </h1>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {isLogin ? "Welcome back to your workspace" : "Start your secure collaboration"}
                  </p>
                </div>

                <form className="space-y-6">
                  {!isLogin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Username"
                          className="w-full px-4 py-3 bg-neutral-100/50 dark:bg-neutral-700/20 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 bg-neutral-100/50 dark:bg-neutral-700/20 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full px-4 py-3 bg-neutral-100/50 dark:bg-neutral-700/20 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-sky-500 hover:bg-sky-600 py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <HiArrowRight className="animate-pulse" />
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-sky-500 transition-colors text-sm"
                  >
                    {isLogin
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Sign In"}
                  </button>
                </div>

                <div className="relative my-8">
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
                  {['Google', 'GitHub'].map((provider) => (
                    <motion.button
                      key={provider}
                      onClick={() => login(provider.toLowerCase())}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-center gap-2 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 transition-colors"
                    >
                      <span className="text-neutral-600 dark:text-neutral-400">{provider}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;