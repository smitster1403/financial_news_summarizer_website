'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '../utils/csvReader';
import NewsCard from './NewsCard';
import NewsDetail from './NewsDetail';

interface NewsDisplayProps {
  initialNewsData: NewsItem[];
}

export default function NewsDisplay({ initialNewsData }: NewsDisplayProps) {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    // Simulate loading data (can be removed in production)
    setTimeout(() => {
      setNewsData(initialNewsData);
      setLoading(false);
    }, 500);
  }, [initialNewsData]);

  const filteredNews = newsData.filter(news => {
    // Apply sentiment filter
    if (filter !== 'all' && news.sentiment !== filter) return false;
    
    // Apply search filter if there's a search term
    if (searchTerm && !news.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !news.summary_textrank?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleCardClick = (news: NewsItem) => {
    setSelectedNews(news);
  };

  const closeDetail = () => {
    setSelectedNews(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        {/* Filter buttons in a scrollable row on mobile */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('positive')}
              className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                filter === 'positive' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setFilter('negative')}
              className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                filter === 'negative' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Negative
            </button>
            <button
              onClick={() => setFilter('neutral')}
              className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                filter === 'neutral' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Neutral
            </button>
          </div>
        </div>
        
        {/* Search input */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
              
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">No news articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredNews.map((news) => (
            <NewsCard key={news.id} news={news} onCardClick={handleCardClick} />
          ))}
        </div>
      )}
      
      <div className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredNews.length} of {newsData.length} news items
      </div>

      {selectedNews && (
        <NewsDetail news={selectedNews} onClose={closeDetail} />
      )}
    </div>
  );
}