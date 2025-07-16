import { getNewsData } from '@/utils/csvReader';
import NewsDisplay from '@/components/NewsDisplay';
import Link from 'next/link';

export default function Home() {
  const newsData = getNewsData();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Financial News Summarizer</h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Get the latest financial news with sentiment analysis and summaries
              </p>
            </div>
            <Link 
              href="/documents" 
              className="text-red-400 px-4 py-2 rounded-lg text-sm font-medium no-underline hover:underline underline-offset-2 decoration-1 transition-all duration-300 ease-in-out"
            >
              View Project Documentation
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <NewsDisplay initialNewsData={newsData} />
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 sm:py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
            Financial News Summarizer with Sentiment Analysis - {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
