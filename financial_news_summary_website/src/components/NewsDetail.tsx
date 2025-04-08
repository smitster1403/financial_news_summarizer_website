import React from 'react';
import { NewsItem } from '../utils/csvReader';

interface NewsDetailProps {
  news: NewsItem;
  onClose: () => void;
}

export default function NewsDetail({ news, onClose }: NewsDetailProps) {
  // Function to determine the color based on sentiment
  const getSentimentColor = () => {
    if (news.sentiment === 'positive') return 'bg-green-100 text-green-800 border-green-300';
    if (news.sentiment === 'negative') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatSentimentScore = (score: number) => {
    return (score).toFixed(1) + '%';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex-1 pr-4">{news.title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {news.link && (
            <a 
              href={news.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mb-4 block"
            >
              Original Article
            </a>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Summary (TextRank)</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200">{news.summary_textrank}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Sentiment Analysis</h3>
              <div className={`p-4 rounded-md border ${getSentimentColor()}`}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Sentiment:</span>
                  <span>{news.sentiment.charAt(0).toUpperCase() + news.sentiment.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Confidence:</span>
                  <span>{formatSentimentScore(news.sentiment_score)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Alternative Summaries</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1 text-gray-700">LexRank</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 text-sm">{news.summary_lexrank}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1 text-gray-700">Luhn</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 text-sm">{news.summary_luhn}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1 text-gray-700">LSA</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 text-sm">{news.summary_lsa}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Original Content</h3>
            <div className="text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200 max-h-[300px] overflow-y-auto">
              {news.content ? (
                <p>{news.content}</p>
              ) : (
                <p className="text-gray-500 italic">No content available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}