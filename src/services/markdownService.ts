export interface MarkdownSection {
  id: string;
  title: string;
  filename?: string;
  folder?: string;
  files?: MarkdownFile[];
}

export interface MarkdownFile {
  name: string;
  title: string;
  path: string;
}

export interface MarkdownContent {
  content: string;
  sections: MarkdownSection[];
}

export class MarkdownService {
  private static cache = new Map<string, string>();

  static async loadMarkdownFile(filename: string): Promise<string> {
    // Check cache first
    if (this.cache.has(filename)) {
      return this.cache.get(filename)!;
    }

    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }
      const text = await response.text();
      
      // Cache the result
      this.cache.set(filename, text);
      return text;
    } catch (error) {
      console.error(`Error loading markdown file ${filename}:`, error);
      throw error;
    }
  }

  static async loadFolderFiles(folderPath: string): Promise<MarkdownFile[]> {
    try {
      // Predefined file lists for each folder since we can't dynamically scan in browser
      const folderContents: Record<string, MarkdownFile[]> = {
        'lore/characters': [
          { name: 'ash-ketchum', title: 'Ash Ketchum', path: 'lore/characters/ash-ketchum.md' },
          { name: 'marko-dash', title: 'Marko Dash', path: 'lore/characters/marko-dash.md' },
          { name: 'sophia-ketchum', title: 'Sophia Ketchum', path: 'lore/characters/sophia-ketchum.md' }
        ],
        'lore/factions': [
          { name: 'team-jet-origin', title: 'Team Jet Ursprung', path: 'lore/factions/team-jet-origin.md' },
          { name: 'team-x', title: 'Team X', path: 'lore/factions/team-x.md' },
          { name: 'team-y', title: 'Team Y', path: 'lore/factions/team-y.md' },
          { name: 'team-z', title: 'Team Z', path: 'lore/factions/team-z.md' }
        ],
        'lore/world': [
          { name: 'current-state', title: 'Aktueller Zustand', path: 'lore/world/current-state.md' },
          { name: 'kanto-government', title: 'Kanto-Regierung', path: 'lore/world/kanto-government.md' },
          { name: 'other-regions', title: 'Andere Regionen', path: 'lore/world/other-regions.md' }
        ]
      };

      return folderContents[folderPath] || [];
    } catch (error) {
      console.error(`Error loading folder ${folderPath}:`, error);
      return [];
    }
  }

  static async loadMarkdownCollection(sections: MarkdownSection[]): Promise<MarkdownContent> {
    try {
      const loadPromises = sections.map(async (section) => {
        if (section.folder) {
          // Load all files from folder
          const files = await this.loadFolderFiles(section.folder);
          const fileContents = await Promise.all(
            files.map(async (file) => {
              const content = await this.loadMarkdownFile(file.path);
              return { file, content };
            })
          );
          
          // Combine folder contents
          let folderContent = '';
          for (const { file, content } of fileContents) {
            if (folderContent) {
              folderContent += '\n\n---\n\n';
            }
            folderContent += content;
          }
          
          return { section, content: folderContent };
        } else if (section.filename) {
          // Load single file
          const content = await this.loadMarkdownFile(section.filename);
          return { section, content };
        } else {
          return { section, content: '' };
        }
      });

      const results = await Promise.all(loadPromises);
      
      // Combine all content with section headers
      let combinedContent = "";
      for (const { section, content } of results) {
        if (combinedContent) {
          combinedContent += "\n\n---\n\n";
        }
        combinedContent += `# ${section.title}\n\n${content}`;
      }

      return {
        content: combinedContent,
        sections
      };
    } catch (error) {
      console.error("Error loading markdown collection:", error);
      throw error;
    }
  }

  static markdownToHtml(markdown: string): string {
    let html = markdown
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold text-gray-900 mb-6">$1</h1>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold text-gray-800 mb-4 mt-8">$1</h2>'
      )
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-medium text-gray-700 mb-3 mt-6">$1</h3>'
      )
      .replace(
        /^#### (.*$)/gim,
        '<h4 class="text-md font-medium text-gray-600 mb-2 mt-4">$1</h4>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/^(\d+)\. (.*)$/gim, '<li class="mb-2">$2</li>')
      .replace(/^- (.*)$/gim, '<li class="mb-2">$1</li>')
      .replace(/^---$/gim, '<hr class="border-t-2 border-gray-200 my-8" />');

    // Convert paragraphs and handle lists
    const lines = html.split("\n");
    let result = "";
    let inList = false;
    let listType = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("<h") || line.startsWith("<li") || line.startsWith("<hr")) {
        if (inList && !line.startsWith("<li")) {
          result += `</${listType}>\n`;
          inList = false;
        }

        if (line.startsWith("<li")) {
          if (!inList) {
            listType =
              line.includes('class="mb-2"') &&
              (markdown.includes("1. ") ||
                markdown.includes("2. ") ||
                markdown.includes("3. "))
                ? 'ol class="list-decimal list-inside mb-4 ml-4"'
                : 'ul class="list-disc list-inside mb-4 ml-4"';
            result += `<${listType}>\n`;
            inList = true;
          }
        }

        result += line + "\n";
      } else if (line === "") {
        if (inList) {
          result += `</${listType}>\n`;
          inList = false;
        }
        result += "\n";
      } else if (!line.startsWith("<")) {
        if (inList) {
          result += `</${listType}>\n`;
          inList = false;
        }
        result += `<p class="mb-4">${line}</p>\n`;
      } else {
        result += line + "\n";
      }
    }

    if (inList) {
      result += `</${listType}>\n`;
    }

    return result;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// Predefined section configurations
export const LORE_SECTIONS: MarkdownSection[] = [
  {
    id: "history",
    title: "Das Ereignis & Geschichte",
    filename: "lore/history.md"
  },
  {
    id: "characters",
    title: "Wichtige Personen",
    folder: "lore/characters"
  },
  {
    id: "factions", 
    title: "Team Jet Fraktionen",
    folder: "lore/factions"
  },
  {
    id: "world",
    title: "Die Welt heute",
    folder: "lore/world"
  }
];

export const DOC_SECTIONS: MarkdownSection[] = [
  {
    id: "battle-guide",
    title: "Kampfmodus Anleitung", 
    filename: "doc.md"
  }
];