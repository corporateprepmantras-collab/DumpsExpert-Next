"use client";

export default function ProductPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Loading Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Animated Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Loading Product Details
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Please wait while we fetch the latest information...
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            <div
              className="flex items-center space-x-3 animate-fadeIn"
              style={{ animationDelay: "0s" }}
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm md:text-base">
                Fetching product data
              </span>
            </div>
            <div
              className="flex items-center space-x-3 animate-fadeIn"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm md:text-base">
                Loading certification details
              </span>
            </div>
            <div
              className="flex items-center space-x-3 animate-fadeIn"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm md:text-base">
                Preparing content
              </span>
            </div>
          </div>

          {/* Skeleton Preview */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            <div className="flex space-x-4 mt-6">
              <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Loading typically takes just a few seconds</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
