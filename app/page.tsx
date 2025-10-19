'use client';

import { useState } from 'react';
import WebScraper from '@/components/WebScraper';
import ResearchSearch from '@/components/ResearchSearch';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scraper' | 'research'>('scraper');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Smart-Scrape Research Tool
          </h1>
          <p className="text-gray-300 text-lg">
            Extract insights from web pages and academic research papers
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setActiveTab('scraper')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'scraper'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Web Scraper
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'research'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Research Papers
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'scraper' ? <WebScraper /> : <ResearchSearch />}
        </div>
      </div>
    </main>
  );
}
