/**
 * Utility for loading and processing markdown documentation files
 */

interface MarkdownFile {
  path: string;
  name: string;
  group: string;
  content: string;
}

interface MarkdownGroup {
  name: string;
  files: MarkdownFile[];
}

/**
 * Loads markdown files from the docs directory
 */
export async function loadMarkdownFiles(): Promise<MarkdownGroup[]> {
  try {
    // Use Vite's glob import to get all markdown files
    const markdownFiles = import.meta.glob('/docs/*.md', {
      eager: true,
      query: '?raw',
      import: 'default'
    });

    // Process each file and extract group information
    const files = Object.entries(markdownFiles).map(([path, content]) => {
      // Extract group from frontmatter
      const groupMatch = content.match(/^---\s*\ngroup:\s*(.+?)\s*\n---/m);
      const group = groupMatch ? groupMatch[1] : 'General';
      
      // Remove frontmatter from content
      const cleanContent = content.replace(/^---\s*\n.*?\n---\s*/m, '');
      
      return {
        path,
        name: path
          .replace('/docs/', '')
          .replace('.md', '')
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        group,
        content: cleanContent
      };
    });

    // Group files by their group property
    const groupedFiles = files.reduce((groups, file) => {
      const group = groups.find(g => g.name === file.group);
      if (group) {
        group.files.push(file);
      } else {
        groups.push({ name: file.group, files: [file] });
      }
      return groups;
    }, [] as MarkdownGroup[]);

    // Sort groups and files within groups
    return groupedFiles
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(group => ({
        ...group,
        files: group.files.sort((a, b) => a.name.localeCompare(b.name))
      }));
  } catch (error) {
    console.error('Error loading markdown files:', error);
    return [];
  }
}