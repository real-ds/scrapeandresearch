'use client';

interface Citation {
  title: string;
  authors: string;
  year: string;
  venue: string;
  url: string;
}

interface ApiResult {
  status: string;
  extracted_info?: string;
  summary?: string;
  citations?: Citation[];
  source_url?: string;
  papers_found?: number;
  message?: string;
}

interface ResultDisplayProps {
  result: ApiResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  if (!result) return null;

  return (
    <div className="mt-8 space-y-6">
      {/* Extracted Information / Summary */}
      {(result.extracted_info || result.summary) && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            📋 Extracted Information
          </h3>
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 whitespace-pre-wrap">
              {result.extracted_info || result.summary}
            </div>
          </div>
        </div>
      )}

      {/* Message (for mock/test responses) */}
      {result.message && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <p className="text-sm text-blue-200">{result.message}</p>
        </div>
      )}

      {/* Citations/References */}
      {result.citations && result.citations.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            📚 References & Citations
          </h3>
          <div className="text-gray-400 text-sm mb-4">
            Found {result.papers_found || result.citations.length} papers
          </div>
          <div className="space-y-4">
            {result.citations.map((citation, index) => (
              <div
                key={index}
                className="border-l-4 border-purple-500 pl-4 py-2 bg-slate-800/50 rounded-r"
              >
                <p className="text-white font-medium mb-1">{citation.title}</p>
                <p className="text-gray-400 text-sm mb-1">{citation.authors}</p>
                <p className="text-gray-500 text-sm mb-2">
                  {citation.year} • {citation.venue}
                </p>
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center gap-1"
                  >
                    View Paper
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source URL */}
      {result.source_url && (
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm flex items-start gap-2">
            <span className="text-gray-500">Source:</span>
            <a
              href={result.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline break-all"
            >
              {result.source_url}
            </a>
          </p>
        </div>
      )}

      {/* Status Indicator */}
      {result.status === 'success' && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Analysis completed successfully
        </div>
      )}
    </div>
  );
}
