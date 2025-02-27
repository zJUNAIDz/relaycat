// app/auth-error/page.tsx
'use client';

import { ModeToggle } from '@/shared/components/mode-toggle';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { HiArrowLeft, HiExclamation } from 'react-icons/hi';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password';
      case 'OAuthAccountNotLinked':
        return 'Account already exists with different provider';
      default:
        return 'An unexpected error occurred';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-xl p-8"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Error</h1>
          <ModeToggle />
        </div>

        <motion.div
          className="flex flex-col items-center space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-full"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <HiExclamation className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </motion.div>

          <div className="text-center space-y-2">
            <p className="text-xl font-medium text-gray-900 dark:text-white">
              Oops! Something went wrong
            </p>
            <p className="text-gray-600 dark:text-gray-300">{getErrorMessage()}</p>
          </div>

          <Link href="/auth" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              Return to Login
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}