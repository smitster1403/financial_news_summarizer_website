import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface NewsItem {
  id: number;
  title: string;
  link: string;
  content: string;
  summary_lexrank: string;
  summary_luhn: string;
  summary_lsa: string;
  summary_textrank: string;
  sentiment: string;
  sentiment_score: number;
}

export function getNewsData(): NewsItem[] {
  try {
    // Path is relative to the project root
    const csvPath = path.join(process.cwd(), '../../financial_news_summarizer/data/combined_sentiment.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    // Convert records to our interface type and add an id
    return records.map((record: any, index: number) => ({
      id: index,
      ...record,
      sentiment_score: parseFloat(record.sentiment_score || '0'),
    }));
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return [];
  }
}