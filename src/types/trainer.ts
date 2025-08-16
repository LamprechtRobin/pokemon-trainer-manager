import { Pokemon } from './pokemon';
import type { AttributeId, SkillId, SkillLevel, Disadvantage, SpecialAbility } from '../config/skills.config';

export interface Item {
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  quantity: number; // How many of this item the trainer has
  createdAt?: string;
}

export interface TrainerSkills {
  // Basis Attribute (0-5 Punkte)
  intelligence: number;
  agility: number;
  social: number;
  strength: number;
  presence: number;
  
  // Skills als Record für flexiblere Skill-Verwaltung
  skills: Record<SkillId, SkillLevel>;
  
  // Optional
  disadvantage?: Disadvantage;
  specialAbility?: SpecialAbility;
  notes?: string;
}

// Re-export types from config for easier importing
export type { AttributeId, SkillId, SkillLevel, Disadvantage, SpecialAbility } from '../config/skills.config';

export interface Trainer {
  id?: string;
  name: string;
  imageUrl?: string; // Optional trainer image (will be uploaded file converted to data URL)
  description?: string;
  team?: Pokemon[]; // Array of Pokemon in trainer's team (optional for backwards compatibility)
  items?: Item[]; // Array of items in trainer's inventory
  money?: number; // Trainer's money in PokéDollar (₽)
  skills?: TrainerSkills; // Neu: Skill System
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