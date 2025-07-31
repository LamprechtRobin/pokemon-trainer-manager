export interface Pokemon {
  id?: string;
  name: string;
  level?: number;
  exp?: number; // Current experience points
  type?: string; // Primary type
  secondaryType?: string; // Secondary type (optional)
  imageUrl?: string;
  species?: string;
  abilities?: string[];
  moves?: string[]; // Deprecated - kept for backwards compatibility
  learnedAttacks?: string[]; // Array of attack IDs
  stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
  talentPoints?: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  isShiny?: boolean;
  createdAt?: string;
}
//test commit
export interface PokemonFormData {
  name: string;
  level: string;
  exp: string;
  type: string;
  secondaryType: string;
  species: string;
}
