// app/signout/page.tsx
'use client';

import { ModeToggle } from '@/shared/components/mode-toggle';
import { useAuth } from '@/shared/providers/auth-provider';
import { PAGE_ROUTES } from '@/shared/lib/routes';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HiLogout } from 'react-icons/hi';

export default function LogOutPage() {
  const router = useRouter();
  const signOut = useAuth((state) => state.signOut);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.replace(PAGE_ROUTES.AUTH);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white dark:bg-card backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-xl p-8"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-foreground">Sign Out</h1>
          <ModeToggle />
        </div>

        <motion.div
          className="flex flex-col items-center space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 bg-destructive/10 rounded-full">
            <HiLogout className="w-12 h-12 text-destructive animate-pulse" />
          </div>

          <p className="text-center text-muted-foreground">
            Are you sure you want to sign out?<br />
            You&apos;ll need to sign in again to access your account.
          </p>

          <div className="w-full space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full bg-destructive hover:bg-destructive/90 disabled:opacity-60 disabled:cursor-not-allowed text-destructive-foreground py-3 rounded-lg font-medium transition-colors"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </motion.button>

            <Link href={PAGE_ROUTES.HOME}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-muted hover:bg-accent text-foreground py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}