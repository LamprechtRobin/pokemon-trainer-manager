import React, { useState } from 'react';
import { Trainer, TrainerFormData } from '../types/trainer';
import ImageModeSelector from './ImageModeSelector';
import AIImageGenerator from './AIImageGenerator';

interface AddTrainerFormProps {
  onSubmit: (trainerData: Omit<Trainer, 'id'>) => void;
  onCancel: () => void;
}

const AddTrainerForm: React.FC<AddTrainerFormProps> = ({ onSubmit, onCancel }) => {
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
    
    const trainerData = {
      name: formData.name,
      description: formData.description || undefined,
      money: parseInt(formData.money) || 0,
      imageUrl,
      team: [], // Initialize with empty Pokemon team
      items: [], // Initialize with empty items inventory
      createdAt: new Date().toISOString()
    };
    
    console.log('Calling onSubmit with:', trainerData);
    onSubmit(trainerData);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 md:p-8 mb-6 shadow-sm">
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
        Add New Trainer
      </h3>
      
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
            {imagePreview && (
              <div className="mt-2 flex justify-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                />
              </div>
            )}
          </div>
        )}

        {/* Generate Mode */}
        {formData.imageMode === 'generate' && (
          <AIImageGenerator
            prompt={formData.aiPrompt}
            onPromptChange={(prompt) => setFormData(prev => ({ ...prev, aiPrompt: prompt }))}
            generatedImageUrl={formData.generatedImageUrl}
            onImageGenerated={(imageUrl) => setFormData(prev => ({ ...prev, generatedImageUrl: imageUrl }))}
            isGenerating={formData.isGenerating}
            onGeneratingChange={(isGenerating) => setFormData(prev => ({ ...prev, isGenerating }))}
          />
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
    </div>
  );
};

export default AddTrainerForm;