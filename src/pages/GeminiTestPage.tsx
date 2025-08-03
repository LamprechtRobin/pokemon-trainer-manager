import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GeminiService } from "../services/geminiService";

interface TestConfig {
  name: string;
  message: string;
  system: string;
  useMethod?: string;
  data?: { name: string; favoriteType?: string; location?: string };
}

const GeminiTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [testMessage, setTestMessage] = useState("Erkläre mir kurz, was Pokemon sind.");
  const [systemPrompt, setSystemPrompt] = useState("Du bist ein hilfsbereiter Pokemon-Experte. Antworte auf Deutsch.");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTest, setSelectedTest] = useState("custom");
  
  // Check if API key is available from environment
  const envApiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const hasApiKey = !!envApiKey;

  const predefinedTests: Record<string, TestConfig> = {
    custom: {
      name: "Eigene Nachricht",
      message: testMessage,
      system: systemPrompt
    },
    pokemon_story: {
      name: "Pokemon Story Generator",
      message: "Ash",
      system: "",
      useMethod: "generatePokemonStory"
    },
    team_analysis: {
      name: "Team Analyse",
      message: "",
      system: "",
      useMethod: "analyzePokemonTeam",
      data: { name: "Max", favoriteType: "Feuer", location: "Alabastia" }
    },
    pokemon_advice: {
      name: "Pokemon Beratung",
      message: "Welches Pokemon ist am besten gegen Wasser-Pokemon?",
      system: "",
      useMethod: "generatePokemonAdvice"
    }
  };

  const handleTestRequest = async () => {
    if (!hasApiKey) {
      setError("Gemini API Key ist nicht in der .env Datei konfiguriert. Bitte setze REACT_APP_GEMINI_API_KEY.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const test = predefinedTests[selectedTest];
      let result = "";

      if (test.useMethod) {
        switch (test.useMethod) {
          case "generatePokemonStory":
            result = await GeminiService.generatePokemonStory(test.message);
            break;
          case "analyzePokemonTeam":
            if (test.data) {
              result = await GeminiService.analyzePokemonTeam(test.data);
            }
            break;
          case "generatePokemonAdvice":
            result = await GeminiService.generatePokemonAdvice(test.message);
            break;
        }
      } else {
        result = await GeminiService.askGemini(testMessage, systemPrompt);
      }

      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async () => {
    setTestMessage("Hallo Gemini! Kannst du mir kurz erklären, was ein Pikachu ist?");
    setSystemPrompt("Du bist ein freundlicher Pokemon-Experte. Antworte kurz und auf Deutsch.");
    setSelectedTest("custom");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            ← Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Gemini API Test</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">API Konfiguration</h2>
            
            {/* API Key Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key Status
              </label>
              <div className={`px-3 py-2 rounded-lg border ${hasApiKey 
                ? 'bg-green-50 border-green-300 text-green-800' 
                : 'bg-red-50 border-red-300 text-red-800'
              }`}>
                {hasApiKey 
                  ? '✅ API Key aus .env Datei geladen (REACT_APP_GEMINI_API_KEY)' 
                  : '❌ Kein API Key gefunden - Bitte REACT_APP_GEMINI_API_KEY in .env setzen'
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Der API Key wird automatisch aus der .env Datei geladen.
              </p>
            </div>

            {/* Test Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Typ
              </label>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(predefinedTests).map(([key, test]) => (
                  <option key={key} value={key}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Message (only for custom test) */}
            {selectedTest === "custom" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Beschreibe Claude's Rolle und Verhalten..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Nachricht
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Deine Nachricht an Gemini..."
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleTestRequest}
                disabled={loading || !hasApiKey}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sende..." : "Test senden"}
              </button>
              
              {selectedTest === "custom" && (
                <button
                  onClick={handleQuickTest}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Quick Test
                </button>
              )}
            </div>
          </div>

          {/* Response Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Antwort</h2>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Gemini antwortet...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-800 mb-2">Fehler:</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {response && !loading && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Gemini's Antwort:</h3>
                <div className="text-green-700 whitespace-pre-wrap">{response}</div>
              </div>
            )}

            {!loading && !error && !response && (
              <div className="text-gray-500 text-center py-8">
                Klicke auf "Test senden" um Gemini zu testen.
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Setup Information</h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p>• <strong>API Key erstellen:</strong> Gehe zu <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a> und erstelle einen neuen API Key.</p>
            <p>• <strong>API Key konfigurieren:</strong> Füge <code className="bg-blue-100 px-1 rounded">REACT_APP_GEMINI_API_KEY=dein_key_hier</code> zu deiner <code className="bg-blue-100 px-1 rounded">.env</code> Datei hinzu.</p>
            <p>• <strong>App neustarten:</strong> Nach dem Hinzufügen des API Keys musst du die App neustarten (<code className="bg-blue-100 px-1 rounded">pnpm start</code>).</p>
            <p>• <strong>Kostenloses Kontingent:</strong> Gemini 1.5 Flash hat großzügige kostenlose Limits.</p>
            <p>• Die verfügbaren Test-Funktionen zeigen verschiedene Anwendungsfälle für Pokemon-Trainer.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiTestPage;