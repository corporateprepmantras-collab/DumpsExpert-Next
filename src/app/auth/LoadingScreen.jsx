import React, { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const messages = [
    "Setting up your account...",
    "Securing your data...",
    "Preparing dashboard...",
    "Almost there...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white animate-spin"></div>

            {/* Middle circle */}
            <div
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-white border-l-white animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            ></div>

            {/* Inner circle with glow */}
            <div className="absolute inset-4 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-white/20">
              <div className="text-white text-2xl font-bold animate-pulse">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-white text-2xl font-bold mb-2 h-8">
          <span className="inline-block animate-fade-in-out">
            {messages[messageIndex]}
          </span>
        </h2>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mb-6 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-white via-blue-200 to-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Percentage */}
        <p className="text-white/70 text-sm font-medium">
          {Math.round(progress)}%
        </p>

        {/* Animated dots */}
        <div className="mt-8 flex justify-center gap-2">
          <div
            className="w-3 h-3 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-out {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
