import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MarkdownService, LORE_SECTIONS, MarkdownSection } from "../services/markdownService";

const LorePage: React.FC = () => {
  const navigate = useNavigate();
  const [loreContent, setLoreContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    const loadLore = async () => {
      try {
        if (activeSection) {
          // Load specific section
          const section = LORE_SECTIONS.find(s => s.id === activeSection);
          if (section) {
            if (section.folder) {
              // Load folder contents
              const files = await MarkdownService.loadFolderFiles(section.folder);
              const fileContents = await Promise.all(
                files.map(async (file) => {
                  const content = await MarkdownService.loadMarkdownFile(file.path);
                  return { file, content };
                })
              );
              
              let combinedContent = `# ${section.title}\n\n`;
              for (const { content } of fileContents) {
                if (combinedContent !== `# ${section.title}\n\n`) {
                  combinedContent += '\n\n---\n\n';
                }
                combinedContent += content;
              }
              setLoreContent(combinedContent);
            } else if (section.filename) {
              // Load single file
              const content = await MarkdownService.loadMarkdownFile(section.filename);
              setLoreContent(`# ${section.title}\n\n${content}`);
            }
          }
        } else {
          // Load all sections
          const markdownContent = await MarkdownService.loadMarkdownCollection(LORE_SECTIONS);
          setLoreContent(markdownContent.content);
        }
      } catch (error) {
        console.error("Error loading lore:", error);
        setLoreContent(
          "# Fehler beim Laden der Lore\n\nDie Lore konnte nicht geladen werden."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLore();
  }, [activeSection]);

  const handleSectionChange = (sectionId: string | null) => {
    setActiveSection(sectionId);
    setShowNavigation(false);
    setLoading(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button and navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Lore</h1>
          <button
            onClick={() => setShowNavigation(!showNavigation)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            📖 Bereiche
          </button>
        </div>

        {/* Navigation dropdown */}
        {showNavigation && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Bereiche wählen:</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => handleSectionChange(null)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeSection === null
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Alles anzeigen
              </button>
              {LORE_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lore content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Lade Lore...</p>
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: MarkdownService.markdownToHtml(loreContent),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LorePage;