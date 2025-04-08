'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '@/utils/csvReader';
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
    // Simulate loading data (remove this in production if not needed)
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('positive')}
            className={`px-4 py-2 rounded-md ${
              filter === 'positive' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setFilter('negative')}
            className={`px-4 py-2 rounded-md ${
              filter === 'negative' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Negative
          </button>
          <button
            onClick={() => setFilter('neutral')}
            className={`px-4 py-2 rounded-md ${
              filter === 'neutral' 
                ? 'bg-gray-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Neutral
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-6 rounded-lg shadow-md border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
              
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No news articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <NewsCard key={news.id} news={news} onCardClick={handleCardClick} />
          ))}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredNews.length} of {newsData.length} news items
      </div>

      {selectedNews && (
        <NewsDetail news={selectedNews} onClose={closeDetail} />
      )}
    </div>
  );
}