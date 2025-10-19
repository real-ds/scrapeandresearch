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
  papers_found?: number;
}

export default function ResearchSearch() {
  const [query, setQuery] = useState('');
  const [yearFrom, setYearFrom] = useState('2020');
  const [yearTo, setYearTo] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
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
          query,
          year_from: parseInt(yearFrom),
          year_to: parseInt(yearTo),
          mode: 'research',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch research papers');
      }

      const data: ApiResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6">
      <form onSubmit={handleSearch} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Research Topic or Keywords
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., machine learning in healthcare"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              From Year
            </label>
            <input
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              min="1900"
              max={yearTo}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              To Year
            </label>
            <input
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              min={yearFrom}
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            📚 Searches credible research sources like Google Scholar with proper citations
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Searching Papers...' : 'Search Research Papers'}
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
