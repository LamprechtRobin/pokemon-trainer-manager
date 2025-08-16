import React, { useState } from 'react';
import { Trainer, TrainerFormData } from '../types/trainer';
import { EnrichedTrainerData } from '../types/aiTrainer';
import { PokemonEnricher } from '../services/pokemonEnricher';
import ImageModeSelector from './ImageModeSelector';
import AITrainerGenerator from './AITrainerGenerator';
import { TrainerImage } from '../utils/imageUtils';
import { imageGenerationService } from '../services/imageGenerationService';

interface AddTrainerFormProps {
  onSubmit: (trainerData: Omit<Trainer, 'id'>) => void;
  onCancel: () => void;
}

type CreationMode = 'manual' | 'ai';

const AddTrainerForm: React.FC<AddTrainerFormProps> = ({ onSubmit, onCancel }) => {
  const [creationMode, setCreationMode] = useState<CreationMode>('manual');
  const [formData, setFormData] = useState<TrainerFormData>({
    name: '',
    description: '',
    money: '1000',
    imageFile: null,
    imageMode: 'upload',
    aiPrompt: '',
    generatedImageUrl: null,
    isGenerating: false
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      imageFile: file
    });

    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!formData.name.trim()) {
      alert('Trainer name is required');
      return;
    }

    if (formData.isGenerating) {
      alert('Please wait for image generation to complete');
      return;
    }
    
    // Determine image URL based on mode
    let imageUrl: string | undefined = undefined;
    
    if (formData.imageMode === 'upload' && formData.imageFile) {
      // Convert uploaded file to data URL
      const reader = new FileReader();
      imageUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(formData.imageFile!);
      });
    } else if (formData.imageMode === 'generate' && formData.generatedImageUrl) {
      // Use generated image
      imageUrl = formData.generatedImageUrl;
    }
    
    const trainerData: Omit<Trainer, 'id'> = {
      name: formData.name,
      description: formData.description || '',
      money: parseInt(formData.money) || 0,
      team: [], // Initialize with empty Pokemon team
      items: [], // Initialize with empty items inventory
      createdAt: new Date().toISOString()
    };

    // Only add imageUrl if it exists
    if (imageUrl) {
      (trainerData as any).imageUrl = imageUrl;
    }
    
    console.log('Calling onSubmit with:', trainerData);
    onSubmit(trainerData);
  };

  const handleImageGeneration = async (): Promise<void> => {
    if (!formData.aiPrompt.trim()) {
      alert('⚠️ Bitte gib einen Prompt für die Bildgenerierung ein.');
      return;
    }

    setFormData(prev => ({ ...prev, isGenerating: true }));
    
    try {
      // Generate trainer image using custom prompt
      const result = await imageGenerationService.generateTrainerImage(
        '', // Don't use trainer name when custom prompt is provided
        formData.aiPrompt.trim(),
        { 
          style: 'anime',
          size: '512',
          width: 512,
          height: 512  // 1:1 Square ratio (512x512)
        }
      );
      
      // Update the form with the generated image URL
      setFormData(prev => ({
        ...prev,
        generatedImageUrl: result.imageUrl,
        isGenerating: false
      }));
      
      // Log success to console
      console.log('✅ Bild erfolgreich generiert!');
      console.log('Prompt verwendet:', result.prompt);
      console.log('Bild-URL:', result.imageUrl);
      
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      alert(`❌ Fehler beim Generieren des Bildes:\n\n${errorMessage}\n\n💡 Tipp: Falls du keinen Runware API Key hast, nutze bitte Upload stattdessen.`);
      
      setFormData(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleAIGenerate = (enrichedTrainer: EnrichedTrainerData): void => {
    // Convert enriched trainer to standard trainer format
    const pokemonTeam = enrichedTrainer.team.map(pokemon => 
      PokemonEnricher.convertToStandardPokemon(pokemon)
    );

    const trainerData: Omit<Trainer, 'id'> = {
      name: enrichedTrainer.name || 'AI-Generated Trainer',
      description: enrichedTrainer.description || '',
      imageUrl: enrichedTrainer.imageUrl, // Include generated image
      money: enrichedTrainer.money || 1000,
      team: pokemonTeam, // Now includes real Pokemon with PokeAPI data
      items: enrichedTrainer.items || [],
      createdAt: enrichedTrainer.createdAt || new Date().toISOString()
    };
    
    console.log('AI Generated enriched trainer:', enrichedTrainer);
    console.log('Generated imageUrl:', enrichedTrainer.imageUrl);
    console.log('Converted Pokemon team:', pokemonTeam);
    console.log('Calling onSubmit with enriched trainer data:', trainerData);
    onSubmit(trainerData);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 md:p-8 mb-6 shadow-sm">
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
        Add New Trainer
      </h3>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setCreationMode('manual')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            creationMode === 'manual'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Manuell erstellen
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('ai')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ml-8 ${
            creationMode === 'ai'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          KI-generiert
        </button>
      </div>

      {/* Manual Creation Tab */}
      {creationMode === 'manual' && (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
            Name *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter trainer name"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Image Mode Selector */}
        <ImageModeSelector
          selectedMode={formData.imageMode}
          onModeChange={(mode) => {
            setFormData(prev => ({
              ...prev,
              imageMode: mode,
              // Clear opposite mode data
              imageFile: mode === 'generate' ? null : prev.imageFile,
              generatedImageUrl: mode === 'upload' ? null : prev.generatedImageUrl
            }));
            if (mode === 'upload') {
              setImagePreview(null);
            }
          }}
        />

        {/* Upload Mode */}
        {formData.imageMode === 'upload' && (
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-900 mb-1">
              Upload Trainer Image
            </label>
            <input
              id="imageFile"
              type="file"
              name="imageFile"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="mt-2 flex justify-center">
              <TrainerImage 
                imageUrl={imagePreview || undefined}
                name={formData.name || "Neuer Trainer"}
                size={80}
              />
            </div>
          </div>
        )}

        {/* Generate Mode */}
        {formData.imageMode === 'generate' && (
          <div>
            <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-900 mb-1">
              Benutzerdefinierter Prompt für KI-Bildgenerierung
            </label>
            <textarea
              id="aiPrompt"
              value={formData.aiPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
              placeholder="z.B. anime style Pokemon trainer, red hair, blue jacket, confident pose, high quality"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gib deinen eigenen Prompt ein. Automatisch: Anime-Style, quadratisches Format (512x512px).
            </p>
            
            <button
              type="button"
              onClick={handleImageGeneration}
              disabled={formData.isGenerating || !formData.aiPrompt.trim()}
              className={`w-full mt-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                formData.isGenerating || !formData.aiPrompt.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {formData.isGenerating ? '⏳ Generiere...' : '🤖 KI-Bild generieren'}
            </button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Erstellt ein Anime-Style Bild im quadratischen Format basierend auf deinem Prompt
            </p>
            {formData.generatedImageUrl && (
              <div className="mt-2 flex justify-center">
                <TrainerImage 
                  imageUrl={formData.generatedImageUrl}
                  name={formData.name || "AI Generated Trainer"}
                  size={80}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us about this trainer..."
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-vertical"
          />
        </div>

        <div>
          <label htmlFor="money" className="block text-sm font-medium text-gray-900 mb-1">
            Startgeld (₽)
          </label>
          <input
            id="money"
            type="number"
            name="money"
            value={formData.money}
            onChange={handleChange}
            min="0"
            placeholder="1000"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            type="submit"
            disabled={formData.isGenerating}
            className={`flex-1 sm:flex-none px-6 py-3 font-medium rounded-lg transition-colors ${
              formData.isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-success-500 text-white hover:bg-success-600'
            }`}
          >
            {formData.isGenerating ? 'Generating Image...' : 'Add Trainer'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={formData.isGenerating}
            className={`flex-1 sm:flex-none px-6 py-3 font-medium rounded-lg transition-colors ${
              formData.isGenerating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
        </div>
        </form>
      )}

      {/* AI Generation Tab */}
      {creationMode === 'ai' && (
        <AITrainerGenerator
          onGenerate={handleAIGenerate}
          onCancel={onCancel}
          className="mt-0"
        />
      )}
    </div>
  );
};

export default AddTrainerForm;