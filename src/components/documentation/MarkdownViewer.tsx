import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Code, Link } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  console.log("MarkdownViewer-entry");
  
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true, // Disable auto-rendering
      theme: 'default',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#00a8e1',
        primaryTextColor: '#232f3e',
        primaryBorderColor: '#00a8e1',
        lineColor: '#00a8e1',
        secondaryColor: '#ff9900',
        tertiaryColor: '#232f3e',
      },
    });

    const renderDiagrams = async () => {
      try {
        console.log("MarkdownViewer-renderDiagrams");
        const elements = document.querySelectorAll('.mermaid');
        await Promise.all(
          Array.from(elements).map(async (element, index) => {
            const graphDefinition = element.textContent?.trim();
            if (graphDefinition) {
              const uniqueId = `mermaid-${Date.now()}-${index}`;
              const { svg } = await mermaid.render(uniqueId, graphDefinition);
              element.innerHTML = svg;

              // Add margin to create spacing between diagrams
              element.style.marginTop = '2rem';
              element.style.marginBottom = '2rem';
            }
          })
        );
      } catch (error) {
        console.error('Error rendering Mermaid diagrams:', error);
      }
    };

    renderDiagrams();
  }, [content]);

  return (
    <div className="prose prose-lg max-w-none p-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ inline, className, children }: CodeBlockProps) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-900 rounded font-mono text-sm">
                  {children?.toString()}
                </code>
              );
            }

            // Handle Mermaid code blocks
            if (className === 'language-mermaid') {
              return (
                <div className="mermaid flex justify-center my-8 bg-white rounded-lg p-4 shadow-sm">
                  {children?.toString()}
                </div>
              );
            }

            return (
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-800">{children}</code>
              </pre>
            );
          },
          div: ({ className, children }) => <div className={className}>{children}</div>,
          p: ({ node, children }) => {
            const hasBlockContent = node?.children?.some(
              (child: any) =>
                child.tagName && ['div', 'pre', 'code'].includes(child.tagName)
            );

            if (hasBlockContent) {
              return <>{children}</>;
            }

            return <p className="mb-4">{children}</p>;
          },
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">{children}</h3>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-amazon-prime hover:text-amazon-prime-dark inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children?.toString()}
              <Link className="h-4 w-4" />
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
          ),
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-amazon-prime pl-4 italic text-gray-700 my-4">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-gray-200" />,
          pre: ({ children }) => (
            <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto">{children}</pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-sm text-gray-500">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}