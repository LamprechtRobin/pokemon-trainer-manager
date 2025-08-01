import { Pokemon } from './pokemon';

export interface Trainer {
  id?: string;
  name: string;
  imageUrl?: string; // Optional trainer image (will be uploaded file converted to data URL)
  description?: string;
  team?: Pokemon[]; // Array of Pokemon in trainer's team (optional for backwards compatibility)
  money?: number; // Trainer's money in PokéDollar (₽)
  createdAt: string;
}

export interface TrainerFormData {
  name: string;
  description: string;
  money: string; // String for form input, will be converted to number
  imageFile: File | null;
  // AI Image Generation fields
  imageMode: 'upload' | 'generate';
  aiPrompt: string;
  generatedImageUrl: string | null;
  isGenerating: boolean;
}