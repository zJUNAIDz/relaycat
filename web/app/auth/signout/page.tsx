// app/signout/page.tsx
'use client';

import { ModeToggle } from '@/shared/components/mode-toggle';
import { authClient } from '@/shared/lib/auth-client';
import { DEFAULT_APP_PAGE } from '@/shared/lib/constants';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiLogout } from 'react-icons/hi';

export default function LogOutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-xl p-8"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign Out</h1>
          <ModeToggle />
        </div>

        <motion.div
          className="flex flex-col items-center space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 bg-red-100/50 dark:bg-red-900/20 rounded-full">
            <HiLogout className="w-12 h-12 text-red-600 dark:text-red-400 animate-pulse" />
          </div>

          <p className="text-center text-gray-600 dark:text-gray-300">
            Are you sure you want to sign out?<br />
            You&apos;ll need to sign in again to access your account.
          </p>

          <div className="w-full space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => authClient.signOut()}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Sign out
            </motion.button>

            <Link href={DEFAULT_APP_PAGE}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-medium transition-colors"
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