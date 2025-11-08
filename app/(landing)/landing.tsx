"use client";
import { Button } from "@/shared/components/ui/button";
import { authClient, User } from "@/shared/lib/auth-client";
import { useAuth } from "@/shared/providers/auth-provider";
import { motion } from "framer-motion";
import { Inter, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

const Landing = () => {
  const containerRef = useRef(null);
  const { user, isLoading } = useAuth();
  return (
    <div className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-900`} ref={containerRef}>
      <Navbar isLoading={isLoading} user={user} />
      <main className="pt-32 pb-20 px-6 md:px-1 max-w-7xl mx-auto">
        <HeroSection />
      </main>
    </div>
  );
};

const Navbar = ({ isLoading, user }: { isLoading: boolean; user: User | null }) => {
  return (
    <motion.nav
      className="fixed w-full opacity-1 z-999  top-0 backdrop-blur-md z-50 py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800"
    >
      <motion.div
        className={`text-xl ${spaceGrotesk.className} tracking-tight text-neutral-800 dark:text-neutral-200`}
        initial={{ x: -20 }}
        animate={{ x: 0 }}
      >
        Relay<span className="text-sky-500">cat</span>
      </motion.div>

      <div className="hidden md:flex gap-6 items-center">
        <AuthPanel isLoading={isLoading} user={user} />
      </div>
    </motion.nav>
  )
}

const HeroSection = () => {
  return (
    <section className="text-center mb-32">
      <motion.div
        className="inline-block relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl mb-6 text-neutral-900 dark:text-neutral-100`}>
          Modern Communication
          <span className="block mt-4 pb-1 bg-gradient-to-r from-sky-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            Reimagined
          </span>
        </h1>
        <div className="absolute inset-x-0 -bottom-6 h-1 bg-gradient-to-r from-sky-500/30 via-purple-500/30 to-blue-600/30 rounded-full" />
      </motion.div>

      <motion.p
        className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.2 } }}
      >
        Secure enterprise messaging platform with real-time translation, end-to-end encryption, and global infrastructure.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.4 } }}
        className="inline-flex flex-col sm:flex-row gap-4"
      >
        <Link
          href="/auth"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
        >
          <span>Get Started</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </motion.div>
    </section>
  )
}
const AuthPanel = ({ isLoading, user }: { isLoading: boolean; user: User | null }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 ml-4" aria-hidden>
        {/* avatar skeleton */}
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        {/* button/placeholders skeleton */}
        <div className="flex gap-3">
          <div className="w-20 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 ml-4">
        <Image
          src={user.image ?? ""}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full border-2 border-sky-500 hover:border-sky-600 transition-colors"
        />
        <Button
          onClick={() => authClient.signOut()}
          className="px-4 py-2.5 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-sm rounded-lg shadow-sm"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 ml-4">
      <Link
        href="/auth"
        className="px-4 py-2.5 text-sm rounded-lg border border-neutral-300 hover:border-sky-500 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm transition-colors"
      >
        Login
      </Link>
      <Link
        href="/auth"
        className="px-4 py-2.5 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-sm rounded-lg text-white shadow-sm"
      >
        Get Started
      </Link>
    </div>
  );
};
export default Landing; 