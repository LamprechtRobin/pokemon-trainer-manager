import React, { useState } from 'react';
import { Trainer, TrainerFormData } from '../types/trainer';

interface AddTrainerFormProps {
  onSubmit: (trainerData: Omit<Trainer, 'id'>) => void;
  onCancel: () => void;
}

const AddTrainerForm: React.FC<AddTrainerFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<TrainerFormData>({
    name: '',
    description: '',
    imageFile: null
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
    
    // Convert image file to data URL if provided
    let imageUrl: string | undefined = undefined;
    if (formData.imageFile) {
      const reader = new FileReader();
      imageUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(formData.imageFile!);
      });
    }
    
    const trainerData = {
      name: formData.name,
      description: formData.description || undefined,
      imageUrl,
      team: [], // Initialize with empty Pokemon team
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

        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-900 mb-1">
            Trainer Image (optional)
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

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            type="submit"
            className="flex-1 sm:flex-none px-6 py-3 bg-success-500 text-white font-medium rounded-lg hover:bg-success-600 transition-colors"
          >
            Add Trainer
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTrainerForm;