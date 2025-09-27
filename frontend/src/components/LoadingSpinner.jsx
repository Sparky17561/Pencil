// frontend/src/components/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-blue-600 opacity-20"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Generating Your Diagram
        </h3>
        <p className="text-sm text-gray-600 max-w-xs">
          Our AI is analyzing your prompt and creating FlowLang code...
        </p>
      </div>
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;