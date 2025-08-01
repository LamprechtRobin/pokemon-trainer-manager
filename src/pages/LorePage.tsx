import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LorePage: React.FC = () => {
  const navigate = useNavigate();
  const [loreContent, setLoreContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        // Fetch the markdown file from the public folder
        const response = await fetch("/lore.md");
        const text = await response.text();
        setLoreContent(text);
      } catch (error) {
        console.error("Error loading lore:", error);
        setLoreContent(
          "# Fehler beim Laden der Lore\n\nDie Lore konnte nicht geladen werden."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, []);

  // Simple markdown to HTML converter for basic formatting
  const markdownToHtml = (markdown: string) => {
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
      .replace(/\*\*(.*?)\**/g, "<strong>$1</strong>")
      .replace(/^(\d+)\. (.*)$/gim, '<li class="mb-2">$2</li>')
      .replace(/^- (.*)$/gim, '<li class="mb-2">$1</li>');

    // Convert paragraphs
    const lines = html.split("\n");
    let result = "";
    let inList = false;
    let listType = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("<h") || line.startsWith("<li")) {
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Lore</h1>
          <div></div> {/* Spacer for centering */}
        </div>

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
                  __html: markdownToHtml(loreContent),
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
