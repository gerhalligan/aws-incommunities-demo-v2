import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { DocumentContent } from './DocumentContent';
import { DocumentNavigation } from './DocumentNavigation';
import { MarkdownViewer } from './MarkdownViewer';
import { DocumentationSearch } from './DocumentationSearch';
import { useDocumentSearch } from './useDocumentSearch';
import { documents } from '../../data/documentation';

export function DocumentationViewer() {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLoadingMarkdown, setIsLoadingMarkdown] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { filteredDocs, searchResults } = useDocumentSearch(documents, searchQuery);
  const currentDoc = documents.find(doc => doc.id === selectedDoc);

  useEffect(() => {
    const docId = searchParams.get('doc');
    // If no doc is selected, default to the first markdown file
    if (!docId && documents.length > 0) {
      const firstDoc = documents[0];
      setSearchParams({ doc: firstDoc.id });
      setSelectedDoc(firstDoc.id);
      if (firstDoc.id.endsWith('.md')) {
        loadMarkdownContent(firstDoc.id);
      }
    } else if (docId) {
      setSelectedDoc(docId);
      if (docId.endsWith('.md')) {
        loadMarkdownContent(docId);
      }
    }
  }, [searchParams, documents]);

  const loadMarkdownContent = async (path: string) => {
    setIsLoadingMarkdown(true);
    try {
      const doc = documents.find(d => d.id === path);
      
      if (!doc) {
        throw new Error(`Markdown file not found: ${path}`);
      }
      
      setMarkdownContent(doc.content as string);
    } catch (error) {
      console.error('Error loading markdown:', error);
      setMarkdownContent(null);
    } finally {
      setIsLoadingMarkdown(false);
    }
  };

  const handleDocSelect = (id: string) => {
    setSelectedDoc(id);
    setSearchParams({ doc: id });
    setIsMobileNavOpen(false);
    if (id.endsWith('.md')) {
      loadMarkdownContent(id);
    } else {
      setMarkdownContent(null);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-900/70 to-purple-900/30 pointer-events-none" />
      <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-purple-100/20">
        <div className="w-full lg:w-72 bg-gray-50 border-r border-b lg:border-b-0 flex flex-col">
          <div className="p-4">
            <DocumentationSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="overflow-y-auto flex-1">
            <DocumentNavigation
              documents={filteredDocs}
              selectedDoc={selectedDoc}
              onSelectDoc={handleDocSelect}
              searchResults={searchResults}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white/80 backdrop-blur-sm lg:border-l border-purple-100/20">
          {isLoadingMarkdown ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : selectedDoc?.endsWith('.md') && markdownContent ? (
            <MarkdownViewer content={markdownContent} />
          ) : currentDoc ? (
            <DocumentContent
              document={currentDoc}
              searchQuery={searchQuery}
              searchResults={searchResults}
            />
          ) : (
            <div className="p-8 text-center text-gray-500">
              Select a document to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}