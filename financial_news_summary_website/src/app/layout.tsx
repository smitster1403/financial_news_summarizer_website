import { useState, useEffect } from 'react';
import DisclaimerWrapper from '@/components/DisclaimerWrapper'; 
import ScrollToTop from '@/components/ScrollToTop';
import './globals.css';
import { Geist } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata = {
  title: 'FinBrief',
  description: 'Get the latest financial news with sentiment analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">
        {children}
        <DisclaimerWrapper />
        <ScrollToTop />
      </body>
    </html>
  );
}
