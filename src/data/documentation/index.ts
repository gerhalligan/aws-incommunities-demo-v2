import { ReactNode } from 'react';
import programGuide from './program-guide.md?raw';

interface Section {
  id: string;
  title: string;
  content: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  icon: 'book' | 'code' | 'shield' | 'webhook';
  content: ReactNode;
  searchableContent: string;
  sections: Section[];
}

// Process markdown content into sections
function processMarkdown(content: string): Section[] {
  const sections: Section[] = [];
  const lines = content.split('\n');
  let currentSection: Section | null = null;
  let sectionContent: string[] = [];

  lines.forEach(line => {
    if (line.startsWith('## ')) {
      if (currentSection) {
        currentSection.content = sectionContent.join('\n');
        sections.push(currentSection);
      }
      currentSection = {
        id: line.slice(3).toLowerCase().replace(/[^\w]+/g, '-'),
        title: line.slice(3).trim(),
        content: ''
      };
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  });

  if (currentSection) {
    currentSection.content = sectionContent.join('\n');
    sections.push(currentSection);
  }

  return sections;
}

export const documents: Document[] = [
  {
    id: 'program-guide.md',
    title: 'Program Guide',
    category: 'Documentation',
    icon: 'book',
    content: programGuide,
    searchableContent: programGuide,
    sections: processMarkdown(programGuide)
  }
];