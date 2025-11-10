"use client";
import { motion } from "framer-motion";
import React from "react";

const DefaultServerPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg w-full text-center border border-gray-700"
      >
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="text-3xl font-semibold text-gray-200 mb-4"
        >
          Whoops! No Channels Found!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base text-gray-400 mb-6"
        >
          It looks like this server hasn&apos;t set up any channels yet.
          Reach out to your admin or create a new channel to get started.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-indigo-600 text-gray-100 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => {
          }}
        >
          Create Channel
        </motion.button>
      </motion.div>
    </div>
  );
};

export default DefaultServerPage;
