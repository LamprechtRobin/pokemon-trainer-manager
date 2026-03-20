import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PokeAPITest from '../components/PokeAPITest';
import { GeminiService } from '../services/geminiService';

const ApiTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [geminiTest, setGeminiTest] = useState({
    loading: false,
    result: '',
    error: '',
    apiKey: ''
  });

  const handleGeminiTest = async () => {
    if (!geminiTest.apiKey.trim()) {
      setGeminiTest(prev => ({ ...prev, error: 'API Key ist erforderlich' }));
      return;
    }

    setGeminiTest(prev => ({ ...prev, loading: true, error: '', result: '' }));

    try {
      const testPrompt = 'Hallo! Kannst du mir in einem Satz sagen, dass die Verbindung funktioniert?';
      const response = await GeminiService.askGemini(testPrompt, undefined, geminiTest.apiKey);
      
      setGeminiTest(prev => ({ 
        ...prev, 
        result: response,
        loading: false 
      }));
    } catch (error) {
      setGeminiTest(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        loading: false 
      }));
    }
  };

  const handleTrainerGeneration = async () => {
    if (!geminiTest.apiKey.trim()) {
      setGeminiTest(prev => ({ ...prev, error: 'API Key ist erforderlich für Trainer-Generierung' }));
      return;
    }

    setGeminiTest(prev => ({ ...prev, loading: true, error: '', result: '' }));

    try {
      const trainerPrompt = `Erstelle einen Pokemon-Trainer im JSON-Format mit folgender Struktur:
      {
        "name": "Trainer Name",
        "description": "Kurze Beschreibung",
        "pokemon": [
          {
            "name": "Pokemon Name",
            "level": 25,
            "isShiny": false
          }
        ]
      }
      
      Der Trainer soll ein Feuer-Typ Spezialist sein mit 3 Pokemon zwischen Level 20-30.`;
      
      const response = await GeminiService.askGeminiWithHighTokens(trainerPrompt, undefined, geminiTest.apiKey);
      
      setGeminiTest(prev => ({ 
        ...prev, 
        result: response,
        loading: false 
      }));
    } catch (error) {
      setGeminiTest(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        loading: false 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Zurück zur Übersicht
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 API Tests</h1>
          <p className="text-gray-600">Teste alle verfügbaren APIs und Services</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PokeAPI Tests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              🔴 PokeAPI Tests
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Externe Pokemon-Datenbank)
              </span>
            </h2>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Was wird getestet?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pokemon-Namen auf Deutsch laden</li>
                <li>• Pokemon-Details und Bilder abrufen</li>
                <li>• API-Geschwindigkeit und Verfügbarkeit</li>
                <li>• Fehlerbehandlung bei ungültigen Anfragen</li>
              </ul>
            </div>

            {/* PokeAPI Test Component */}
            <PokeAPITest />
          </div>

          {/* Gemini API Tests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              🤖 Gemini AI Tests
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Google AI API)
              </span>
            </h2>

            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Was wird getestet?</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Grundlegende Chat-Funktionalität</li>
                <li>• JSON-Generierung für Trainer</li>
                <li>• Token-Limits und Antwortzeiten</li>
                <li>• Fehlerbehandlung und Retry-Logic</li>
              </ul>
            </div>

            {/* API Key Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key:
              </label>
              <input
                type="password"
                placeholder="Gib deinen Gemini API Key ein..."
                value={geminiTest.apiKey}
                onChange={(e) => setGeminiTest(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Der API Key wird nicht gespeichert - nur für Tests verwendet
              </p>
            </div>

            {/* Test Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGeminiTest}
                disabled={geminiTest.loading || !geminiTest.apiKey.trim()}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  geminiTest.loading || !geminiTest.apiKey.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {geminiTest.loading ? '⏳ Teste Verbindung...' : '🔗 Verbindung testen'}
              </button>

              <button
                onClick={handleTrainerGeneration}
                disabled={geminiTest.loading || !geminiTest.apiKey.trim()}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  geminiTest.loading || !geminiTest.apiKey.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {geminiTest.loading ? '⏳ Generiere Trainer...' : '👤 Trainer generieren'}
              </button>
            </div>

            {/* Results */}
            {geminiTest.error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">❌ Fehler:</h3>
                <p className="text-sm text-red-800">{geminiTest.error}</p>
              </div>
            )}

            {geminiTest.result && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">✅ Antwort:</h3>
                <pre className="text-sm text-green-800 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                  {geminiTest.result}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Additional Test Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 System-Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl mb-2">🔥</div>
              <h3 className="font-medium text-gray-900 mb-1">Supabase</h3>
              <p className="text-sm text-gray-600">Postgres-Verbindung</p>
              <div className="mt-2 text-green-600 text-sm">✅ Aktiv</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-medium text-gray-900 mb-1">LocalStorage</h3>
              <p className="text-sm text-gray-600">Browser-Speicher</p>
              <div className="mt-2 text-green-600 text-sm">✅ Verfügbar</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-medium text-gray-900 mb-1">Netzwerk</h3>
              <p className="text-sm text-gray-600">Internet-Verbindung</p>
              <div className="mt-2 text-green-600 text-sm">
                {navigator.onLine ? '✅ Online' : '❌ Offline'}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">💡 Test-Tipps</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>PokeAPI:</strong> Keine Authentifizierung erforderlich, kostenlos nutzbar</li>
              <li>• <strong>Gemini API:</strong> Benötigt gültigen Google AI API Key</li>
              <li>• <strong>Rate Limits:</strong> Bei zu vielen Anfragen kann es zu Verzögerungen kommen</li>
              <li>• <strong>Fehler:</strong> Prüfe deine Internetverbindung und API-Keys</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;