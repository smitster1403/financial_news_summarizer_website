import { getNewsData } from '@/utils/csvReader';
import NewsDisplay from '@/components/NewsDisplay';

export default function Home() {
  const newsData = getNewsData();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Financial News Summarizer</h1>
          <p className="mt-2 text-sm text-gray-600">
            Get the latest financial news with sentiment analysis and summaries
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <NewsDisplay initialNewsData={newsData} />
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-center text-gray-500">
            Financial News Summarizer with Sentiment Analysis - {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
