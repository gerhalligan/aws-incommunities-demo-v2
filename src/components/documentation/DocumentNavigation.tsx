import React from 'react';
import { Book, Code, Shield, Webhook, FileText } from 'lucide-react';
import { SearchResult } from '../../hooks/useDocumentSearch';
import { cn } from '@/lib/utils';

interface DocumentNavigationProps {
  markdownGroups?: Array<{
    name: string;
    files: Array<{ path: string; name: string }>;
  }>;
  documents: Array<{
    id: string;
    title: string;
    category: string;
    icon: keyof typeof icons;
  }>;
  selectedDoc: string;
  onSelectDoc: (id: string) => void;
  searchResults: SearchResult[];
}

const icons = {
  book: Book,
  code: Code,
  shield: Shield,
  webhook: Webhook,
};

export function DocumentNavigation({
  documents,
  selectedDoc,
  onSelectDoc,
  markdownGroups = [],
  searchResults
}: DocumentNavigationProps) {
  const categories = [...new Set(documents.map(doc => doc.category))];

  return (
    <nav className="h-full overflow-y-auto py-4">
      {categories.map(category => {
        const categoryDocs = documents.filter(doc => doc.category === category);
        
        return (
          <div key={`category-${category}`} className="mb-6">
            <h3 className="px-4 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
              {category}
            </h3>
            <ul className="space-y-1">
              {categoryDocs.map(doc => {
                const Icon = icons[doc.icon];
                const resultCount = searchResults.filter(r => r.documentId === doc.id).length;
                
                return (
                  <li key={doc.id}>
                    <button
                      onClick={() => onSelectDoc(doc.id)}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-sm font-medium rounded-none transition-colors",
                        selectedDoc === doc.id
                          ? "text-purple-700 bg-purple-100"
                          : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="truncate">{doc.title}</span>
                      {resultCount > 0 && (
                        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {resultCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      
      {markdownGroups.map(group => (
        <div key={`group-${group.name}`} className="mb-6">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {group.name}
          </h3>
          <ul className="space-y-1">
            {group.files.map(file => (
              <li key={file.path}>
                <button
                  onClick={() => onSelectDoc(file.path)}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-none transition-colors ${
                    selectedDoc === file.path
                      ? 'text-amazon-prime bg-amazon-prime/5'
                      : 'text-gray-600 hover:text-amazon-prime hover:bg-amazon-prime/5'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}