import React, { useEffect, useState } from 'react';

export const DomainRedirectLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show loader immediately
    setIsVisible(true);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <>
      {/* Fade overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 9998 }}
      />

      {/* Loading container */}
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Loading card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4">
          {/* Animated logo/icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 animate-spin opacity-75" />
              <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                <span className="text-2xl">🌙</span>
              </div>
            </div>
          </div>

          {/* Text */}
          <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Redirecting...
          </h3>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            Taking you to Deep Sleep Reset
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Loading text */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </>
  );
};
