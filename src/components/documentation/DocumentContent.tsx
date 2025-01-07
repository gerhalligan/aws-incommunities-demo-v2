import React from 'react';
import { SearchResult } from '../../hooks/useDocumentSearch';

interface DocumentContentProps {
  document: {
    id: string;
    title: string;
    content: React.ReactNode;
  };
  searchQuery: string;
  searchResults: SearchResult[];
}

export function DocumentContent({ document, searchQuery, searchResults }: DocumentContentProps) {
  const results = searchResults.filter(result => result.documentId === document.id);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{document.title}</h1>
      
      {searchQuery && results.length > 0 && (
        <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <h2 className="text-sm font-medium text-yellow-800 mb-2">
            Search Results in This Document
          </h2>
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={index} className="text-sm">
                <a
                  href={`#${result.sectionId}`}
                  className="text-yellow-900 hover:text-yellow-700"
                >
                  {result.title}
                  <span className="text-yellow-600 ml-2">
                    ({result.matches} matches)
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="prose prose-indigo max-w-none">
        {document.content}
      </div>
    </div>
  );
}