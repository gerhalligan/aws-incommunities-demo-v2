import { useMemo } from 'react';

export interface SearchResult {
  documentId: string;
  sectionId: string;
  title: string;
  matches: number;
}

export function useDocumentSearch(
  documents: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    searchableContent: string;
    sections: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  }>,
  query: string
) {
  return useMemo(() => {
    if (!query.trim()) {
      return {
        filteredDocs: documents,
        searchResults: []
      };
    }

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search through all documents and their sections
    documents.forEach(doc => {
      doc.sections.forEach(section => {
        const matches = (section.content.toLowerCase().match(new RegExp(searchTerm, 'g')) || []).length;
        if (matches > 0) {
          results.push({
            documentId: doc.id,
            sectionId: section.id,
            title: section.title,
            matches
          });
        }
      });
    });

    // Filter documents that have matching content
    const matchingDocIds = new Set(results.map(r => r.documentId));
    const filteredDocs = documents.filter(doc => 
      matchingDocIds.has(doc.id) || 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.searchableContent.toLowerCase().includes(searchTerm)
    );

    return {
      filteredDocs,
      searchResults: results.sort((a, b) => b.matches - a.matches)
    };
  }, [documents, query]);
}