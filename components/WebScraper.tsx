'use client';

import { useState } from 'react';
import ResultDisplay from './ResultDisplay';

interface ApiResult {
  status: string;
  extracted_info?: string;
  summary?: string;
  citations?: Array<{
    title: string;
    authors: string;
    year: string;
    venue: string;
    url: string;
  }>;
  source_url?: string;
}

export default function WebScraper() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState('');

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          query,
          mode: 'web',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape website');
      }

      const data: ApiResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scraping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6">
      <form onSubmit={handleScrape} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/product-page"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What would you like to extract?
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., Extract product name, price, and summary of user reviews"
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Analyzing...' : 'Scrape & Analyze'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {result && <ResultDisplay result={result} />}
    </div>
  );
}
