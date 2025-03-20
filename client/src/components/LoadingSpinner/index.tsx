

import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-4">
       
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        
        <p className="text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;