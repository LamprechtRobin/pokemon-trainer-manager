import React, { useState } from 'react';
import { 
  AIGenerationSettings, 
  DEFAULT_AI_SETTINGS,
  EnrichedTrainerData,
  GenerationProgress 
} from '../types/aiTrainer';
import { GeminiService } from '../services/geminiService';
import GenerationSettings from './GenerationSettings';
import { TrainerImage } from '../utils/imageUtils';

interface AITrainerGeneratorProps {
  onGenerate: (trainer: EnrichedTrainerData) => void;
  onCancel: () => void;
  className?: string;
}

const AITrainerGenerator: React.FC<AITrainerGeneratorProps> = ({
  onGenerate,
  onCancel,
  className = ''
}) => {
  const [settings, setSettings] = useState<AIGenerationSettings>(DEFAULT_AI_SETTINGS);
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedTrainer, setGeneratedTrainer] = useState<EnrichedTrainerData | null>(null);

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      setError('Bitte gib eine Beschreibung für den Trainer ein.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(null);
    setGeneratedTrainer(null);

    try {
      const enrichedTrainer = await GeminiService.generateEnrichedTrainer(
        settings,
        userPrompt.trim(),
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      setGeneratedTrainer(enrichedTrainer);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler bei der Generierung');
      setProgress(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedTrainer) {
      onGenerate(generatedTrainer);
    }
  };

  const handleRegenerateWithSettings = () => {
    setGeneratedTrainer(null);
    setError(null);
    setProgress(null);
    handleGenerate();
  };

  const getExamplePrompts = () => [
    "Erstelle einen freundlichen Anfänger-Trainer mit niedlichen Pokemon",
    "Ein erfahrener Gym Leader für Feuer-Pokemon",
    "Mysteriöser Team Rocket Bösewicht mit Dark/Poison Pokemon",
    "Pokémon-Professor mit seltenen und wissenschaftlichen Pokemon",
    "Ranger aus dem Wald mit Natur-Pokemon",
    "Kampf-Experte mit starken Fighting-Type Pokemon"
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">
          KI-Trainer Generator
        </h3>
        <button
          type="button"
          onClick={onCancel}
          disabled={isGenerating}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isGenerating
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Zurück
        </button>
      </div>

      {/* User Prompt Section */}
      <div>
        <label htmlFor="userPrompt" className="block text-sm font-medium text-gray-900 mb-2">
          Trainer-Beschreibung
        </label>
        <textarea
          id="userPrompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Beschreibe den gewünschten Trainer, z.B. 'Ein freundlicher Gym Leader mit Wasser-Pokemon'"
          rows={3}
          disabled={isGenerating}
          className={`w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-vertical ${
            isGenerating ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        
        {/* Example Prompts */}
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">Beispiele:</p>
          <div className="flex flex-wrap gap-2">
            {getExamplePrompts().slice(0, 3).map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setUserPrompt(example)}
                disabled={isGenerating}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  isGenerating
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700'
                }`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generation Settings */}
      <GenerationSettings
        settings={settings}
        onChange={setSettings}
        className={isGenerating ? 'opacity-50 pointer-events-none' : ''}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Fehler bei der Generierung</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {progress && isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-blue-800">{progress.message}</p>
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Trainer Preview */}
      {generatedTrainer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              {/* Trainer Image */}
              <div className="flex-shrink-0">
                <TrainerImage 
                  imageUrl={generatedTrainer.imageUrl}
                  name={generatedTrainer.name}
                  size={80}
                />
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-green-900">
                  {generatedTrainer.name}
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  {generatedTrainer.description}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleRegenerateWithSettings}
                disabled={isGenerating}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  isGenerating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Neu generieren
              </button>
            </div>
          </div>

          {/* Pokemon Team Preview */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-green-900 mb-2">
              Pokemon-Team ({generatedTrainer.team.length} Pokemon):
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {generatedTrainer.team.map((pokemon, index) => (
                <div key={index} className="bg-white rounded-lg border border-green-200 p-3">
                  <div className="flex items-start space-x-3">
                    {/* Pokemon Image */}
                    {pokemon.imageUrl && (
                      <img 
                        src={pokemon.imageUrl} 
                        alt={pokemon.name}
                        className="w-12 h-12 object-contain flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 capitalize truncate">
                            {pokemon.name}
                          </p>
                          <p className="text-sm text-gray-600">Level {pokemon.level}</p>
                          {pokemon.type && (
                            <p className="text-xs text-gray-500 mt-1">
                              {pokemon.type}
                              {pokemon.secondaryType && ` / ${pokemon.secondaryType}`}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          {pokemon.isShiny && (
                            <div className="text-yellow-500 text-xs bg-yellow-100 px-2 py-1 rounded-full">
                              ✨
                            </div>
                          )}
                          {pokemon.validationStatus && pokemon.validationStatus !== 'valid' && (
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              pokemon.validationStatus === 'warning' 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {pokemon.validationStatus === 'warning' ? '⚠' : '✗'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Base Stats Preview */}
                      {pokemon.stats && (
                        <div className="mt-2 text-xs text-gray-500">
                          <div className="grid grid-cols-2 gap-1">
                            <span>HP: {pokemon.stats.hp}</span>
                            <span>ATK: {pokemon.stats.attack}</span>
                            <span>DEF: {pokemon.stats.defense}</span>
                            <span>SPD: {pokemon.stats.speed}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backstory */}
          {generatedTrainer.backstory && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-green-900 mb-2">Hintergrund:</h5>
              <p className="text-sm text-green-700 bg-white rounded-lg border border-green-200 p-3">
                {generatedTrainer.backstory}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-green-200">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Trainer übernehmen
            </button>
            <button
              type="button"
              onClick={() => setGeneratedTrainer(null)}
              className="px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!generatedTrainer && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !userPrompt.trim()}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              isGenerating || !userPrompt.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isGenerating ? 'Generiere Trainer...' : 'Trainer generieren'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AITrainerGenerator;