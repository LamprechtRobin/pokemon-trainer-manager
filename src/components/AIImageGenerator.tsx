import React, { useState } from 'react';
import { imageGenerationService } from '../services/imageGenerationService';

interface AIImageGeneratorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  generatedImageUrl: string | null;
  onImageGenerated: (imageUrl: string) => void;
  isGenerating: boolean;
  onGeneratingChange: (isGenerating: boolean) => void;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  prompt,
  onPromptChange,
  generatedImageUrl,
  onImageGenerated,
  isGenerating,
  onGeneratingChange
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = imageGenerationService.getPromptSuggestions();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your trainer');
      return;
    }

    const validation = imageGenerationService.validatePrompt(prompt);
    if (!validation.isValid) {
      setError(validation.message || 'Invalid prompt');
      return;
    }

    setError(null);
    onGeneratingChange(true);

    try {
      const result = await imageGenerationService.generateTrainerAvatar({
        prompt: prompt
      });
      
      onImageGenerated(result.imageUrl);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      onGeneratingChange(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onPromptChange(suggestion);
    setShowSuggestions(false);
    setError(null);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(e.target.value);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Prompt Input */}
      <div>
        <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-900 mb-1">
          Describe your trainer *
        </label>
        <div className="relative">
          <textarea
            id="aiPrompt"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="e.g., young pokemon trainer with brown hair and blue eyes"
            rows={3}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-vertical"
            disabled={isGenerating}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {prompt.length}/200
          </div>
        </div>
        
        {/* Suggestions Toggle */}
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="mt-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
          disabled={isGenerating}
        >
          {showSuggestions ? '▼ Hide suggestions' : '▶ Show suggestions'}
        </button>
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-700 mb-2">Click a suggestion to use it:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md hover:bg-primary-50 hover:border-primary-300 transition-colors"
                disabled={isGenerating}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm text-red-700">
            ❌ {error}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
          isGenerating || !prompt.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating avatar...</span>
          </div>
        ) : (
          '🎨 Generate Avatar'
        )}
      </button>

      {/* Generated Image Preview */}
      {generatedImageUrl && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-700 mb-2">Generated Avatar:</div>
          <div className="flex justify-center">
            <img 
              src={generatedImageUrl} 
              alt="Generated trainer avatar" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
          <div className="mt-3 flex justify-center space-x-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="text-sm px-3 py-1 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
              disabled={isGenerating}
            >
              🔄 Generate Another
            </button>
          </div>
        </div>
      )}

      {/* Generation Info */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-700">
            ⏳ This might take 10-15 seconds. The AI is creating your unique trainer avatar...
          </div>
        </div>
      )}
    </div>
  );
};

export default AIImageGenerator;