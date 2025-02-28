"use client"
import { login } from "@/shared/lib/actions";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiArrowRight, HiChat, HiGlobe, HiLockClosed, HiMail, HiShieldCheck, HiSparkles, HiUser } from "react-icons/hi";
const AuthScreen = ({ isAuthenticated, isLoginParam }: { isAuthenticated: boolean, isLoginParam: boolean }) => {
  const router = useRouter()
  if (isAuthenticated) {

    router.replace("/setup")
  }
  const [isLogin, setIsLogin] = useState(isLoginParam);
  // const [view, setView] = useState<"mobile" | "desktop">("desktop");
  const features = [
    { icon: HiChat, title: "Real-Time Chat", text: "Instant messaging with markdown support" },
    { icon: HiGlobe, title: "Global Servers", text: "Low-latency worldwide server network" },
    { icon: HiShieldCheck, title: "Secure", text: "End-to-end encryption & 2FA support" },
    { icon: HiSparkles, title: "Customizable", text: "Themes, plugins & custom emojis" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center p-4">
      {/* Main Container */}
      <motion.div
        className="w-full max-w-6xl bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-blue-400/20 shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Branding */}
          <motion.div
            className="flex-1 p-8 lg:p-12 hidden lg:flex flex-col justify-center relative overflow-hidden"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
          >
            <div className="space-y-2 mb-8">
              <h1 className="text-4xl font-bold text-blue-400">Relaycat</h1>
              <p className="text-xl text-blue-200/80">Connect without boundaries</p>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              {features.map(({ icon: Icon, title, text }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="p-4 bg-gray-800/20 backdrop-blur-sm rounded-xl border border-blue-400/20 hover:border-blue-400/40 transition-colors group"
                >
                  <motion.div
                    className="mb-3 text-blue-400"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 + index }}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{title}</h3>
                  <p className="text-sm text-blue-200/80">{text}</p>
                </motion.div>
              ))}
            </div>

            {/* Floating background elements */}
            <motion.div
              className="absolute -top-32 -left-32 w-64 h-64 bg-purple-400/10 rounded-full blur-xl"
              animate={{ scale: [1, 3, 1] }}
              transition={{ repeat: Infinity, duration: 8 }}
            />
            <motion.div
              className="absolute -bottom-48 -right-48 w-96 h-96 bg-blue-400/10 rounded-full blur-xl"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 12 }}
            />
            <br />
            <p className="text-blue-300/80 text-lg">
              {isLogin ? "Welcome back!" : "Join our community"}
            </p>
          </motion.div>

          {/* Right Side - Form */}
          <div className="flex-1 p-8 lg:p-12">
            <motion.div
              className="max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-center lg:hidden mb-8">
                <h1 className="text-3xl font-bold text-blue-400">Relaycat</h1>
              </div>

              <div className="space-y-1 mb-8">
                <h2 className="text-3xl font-bold text-gray-100">
                  {isLogin ? "Sign In" : "Create Account"}
                </h2>
                <p className="text-blue-300/80">
                  {isLogin
                    ? "Continue your conversation"
                    : "Start your journey with us"}
                </p>
              </div>

              <form className="space-y-6">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="relative">
                      <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/80" />
                      <input
                        type="text"
                        placeholder="Username"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-blue-400/20 focus:border-blue-400/40 focus:outline-none text-gray-100"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/80" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-blue-400/20 focus:border-blue-400/40 focus:outline-none text-gray-100"
                  />
                </div>

                <div className="relative">
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/80" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-blue-400/20 focus:border-blue-400/40 focus:outline-none text-gray-100"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <HiArrowRight className="animate-pulse" />
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-300/80 hover:text-blue-400 transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-400/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900/50 text-blue-300/80">
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
                    className="flex items-center justify-center space-x-2 py-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-blue-400/20 hover:border-blue-400/40 transition-colors"
                  >
                    <span className="text-blue-300/80">{provider}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;