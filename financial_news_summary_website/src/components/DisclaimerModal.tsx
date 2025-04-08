'use client';

import React from 'react';
import { useState, useEffect } from 'react';

interface DisclaimerModalProps {
  onAccept: () => void;
  authorName?: string;
}

export default function DisclaimerModal({ onAccept, authorName = "the developer" }: DisclaimerModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Short delay to prevent flash during page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Disclaimer</h2>
            <div className="mt-2 h-1 w-16 bg-blue-500 mx-auto"></div>
          </div>
          
          <div className="my-4 sm:my-6 text-gray-700 dark:text-gray-300 space-y-3 text-sm sm:text-base">
            <p className="font-semibold">IMPORTANT: Not Financial Advice</p>
            <p>
              The content presented on this website is for informational purposes only and should not be considered financial advice. 
              I, {authorName}, am not a financial advisor, and the summarized news articles and sentiment analysis are generated using 
              automated tools and algorithms.
            </p>
            <p>
              The sentiment scores provided are based on computational analysis and do not reflect 
              a professional assessment of financial markets or investment opportunities. 
            </p>
            <p className="font-semibold">
              By using this website, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The information provided should not be used as the sole basis for making investment decisions</li>
              <li>You should consult with qualified financial professionals before making any financial decisions</li>
              <li>Neither I nor this website will be liable for any losses or damages related to actions taken based on information presented here</li>
            </ul>
          </div>
          
          <div className="flex justify-center mt-6">
            <button 
              onClick={onAccept}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors w-full sm:w-auto"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}