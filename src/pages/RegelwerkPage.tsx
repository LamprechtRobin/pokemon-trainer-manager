import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MarkdownService } from "../services/markdownService";

interface DocumentFile {
  name: string;
  title: string;
  filename: string;
}

const RegelwerkPage: React.FC = () => {
  const navigate = useNavigate();
  const [docContent, setDocContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>("doc.md");

  // Verfügbare Dokumentationsdateien
  const documentFiles: DocumentFile[] = [
    { name: "overview", title: "Übersicht", filename: "docs/doc.md" },
    { name: "hero", title: "Hero Regelwerk", filename: "docs/hero_regelwerk.md" }
  ];

  useEffect(() => {
    loadDocument(selectedFile);
  }, [selectedFile]);

  const loadDocument = async (filename: string) => {
    setLoading(true);
    try {
      const content = await MarkdownService.loadMarkdownFile(filename);
      setDocContent(content);
    } catch (error) {
      console.error("Error loading document:", error);
      setDocContent(
        `# Fehler beim Laden\n\nDie Datei "${filename}" konnte nicht geladen werden.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (filename: string) => {
    setSelectedFile(filename);
  };

  const getCurrentTitle = () => {
    const currentFile = documentFiles.find(file => file.filename === selectedFile);
    return currentFile ? currentFile.title : "Regelwerk";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Regelwerk</h1>
          <div></div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Navigation</h2>
              
              <div className="space-y-2">
                {documentFiles.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => handleFileSelect(file.filename)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedFile === file.filename
                        ? "bg-primary-100 text-primary-700 border border-primary-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">{file.title}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <div className="font-medium mb-2">Aktuell gezeigt:</div>
                  <div className="text-primary-600">{getCurrentTitle()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="prose prose-lg max-w-none">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Lade {getCurrentTitle()}...</p>
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
      </div>
    </div>
  );
};

export default RegelwerkPage;