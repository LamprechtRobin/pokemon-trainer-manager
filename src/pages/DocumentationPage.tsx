import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MarkdownService } from "../services/markdownService";

const DocumentationPage: React.FC = () => {
  const navigate = useNavigate();
  const [docContent, setDocContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocumentation = async () => {
      try {
        const content = await MarkdownService.loadMarkdownFile("doc.md");
        setDocContent(content);
      } catch (error) {
        console.error("Error loading documentation:", error);
        setDocContent(
          "# Fehler beim Laden der Dokumentation\n\nDie Dokumentation konnte nicht geladen werden."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocumentation();
  }, []);


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
          <h1 className="text-3xl font-bold text-gray-900">Dokumentation</h1>
          <div></div> {/* Spacer for centering */}
        </div>

        {/* Documentation content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Lade Dokumentation...</p>
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{ 
                  __html: MarkdownService.markdownToHtml(docContent) 
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
