import React from 'react';
import { NewsItem } from '../utils/csvReader';

interface NewsCardProps {
  news: NewsItem;
  onCardClick: (news: NewsItem) => void;
}

export default function NewsCard({ news, onCardClick }: NewsCardProps) {
  const getSentimentClass = () => {
    if (news.sentiment === 'positive') return 'sentiment-positive-card';
    if (news.sentiment === 'negative') return 'sentiment-negative-card';
    return 'sentiment-neutral-card';
  };

  const getSentimentTextColor = () => {
    if (news.sentiment === 'positive') return 'text-green-700 dark:text-green-400';
    if (news.sentiment === 'negative') return 'text-red-700 dark:text-red-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  const formatSentimentScore = (score: number) => {
    return (score).toFixed(1) + '%';
  };

  return (
    <div 
      className={`news-card ${getSentimentClass()} p-4 sm:p-6 rounded-lg transition-all cursor-pointer relative overflow-hidden h-full`}
      onClick={() => onCardClick(news)}
    >
      <div className="relative z-10">
        <h2 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white">
          {news.title || 'Untitled Article'}
        </h2>
        
        <div className="mb-4">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-3">{news.summary_textrank}</p>
        </div>
        
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentTextColor()}`}>
              {news.sentiment.charAt(0).toUpperCase() + news.sentiment.slice(1)}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold">
            Score: <span className={getSentimentTextColor()}>{formatSentimentScore(news.sentiment_score)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}