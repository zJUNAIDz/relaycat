"use client"

import { ModeToggle } from "@/shared/components/mode-toggle"
import { PAGE_ROUTES } from "@/shared/lib/routes"
import { motion } from "framer-motion"
import Link from "next/link"
import { HiArrowLeft, HiExclamation } from "react-icons/hi"

const AuthErrorComponent = ({ getErrorMessage }: { getErrorMessage: () => string }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white dark:bg-card backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-xl p-8"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
          <ModeToggle />
        </div>

        <motion.div
          className="flex flex-col items-center space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="p-4 bg-warning/10 rounded-full"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <HiExclamation className="w-12 h-12 text-warning" />
          </motion.div>

          <div className="text-center space-y-2">
            <p className="text-xl font-medium text-foreground">
              Oops! Something went wrong
            </p>
            <p className="text-muted-foreground">{getErrorMessage()}</p>
          </div>

          <Link href={PAGE_ROUTES.AUTH} className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-brand hover:bg-brand/90 text-brand-foreground py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              Return to Login
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )

}
export default AuthErrorComponent