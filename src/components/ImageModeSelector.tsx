import React from 'react';

interface ImageModeSelectorProps {
  selectedMode: 'upload' | 'generate';
  onModeChange: (mode: 'upload' | 'generate') => void;
}

const ImageModeSelector: React.FC<ImageModeSelectorProps> = ({ 
  selectedMode, 
  onModeChange 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-900 mb-3">
        How would you like to add a trainer image?
      </label>
      
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => onModeChange('upload')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedMode === 'upload'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📁 Upload Image
        </button>
        
        <button
          type="button"
          onClick={() => onModeChange('generate')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedMode === 'generate'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎨 Generate with AI
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        {selectedMode === 'upload' ? (
          'Upload your own image file'
        ) : (
          'Create a cartoon-style trainer avatar using AI'
        )}
      </div>
    </div>
  );
};

export default ImageModeSelector;