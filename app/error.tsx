"use client"

import Link from "next/link";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-4">
      <div className="text-center space-y-6">
        {/* Animated 404 Text */}
        <div className="text-9xl font-bold animate-bounce">
          404
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-semibold">
          Oops! Something went wrong.
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Discord-like Button to Go Home */}
        <Link href="/">
          <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-purple-600 dark:hover:bg-purple-700">
            Return to Home
          </button>
        </Link>

        {/* Fun Illustration or Icon */}
        <div className="mt-10">
          <svg
            className="w-32 h-32 mx-auto text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>

        {/* Additional Fun Message */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Don&apos;t worry, even the best chat apps have their off days!
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;