import { Pokemon } from './pokemon';

export interface Trainer {
  id?: string;
  name: string;
  imageUrl?: string; // Optional trainer image (will be uploaded file converted to data URL)
  description?: string;
  team?: Pokemon[]; // Array of Pokemon in trainer's team (optional for backwards compatibility)
  createdAt: string;
}

export interface TrainerFormData {
  name: string;
  description: string;
  imageFile: File | null;
}