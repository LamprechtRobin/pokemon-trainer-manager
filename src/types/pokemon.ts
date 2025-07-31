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
  moves?: string[];
  stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
  isShiny?: boolean;
  createdAt?: string;
}

export interface PokemonFormData {
  name: string;
  level: string;
  exp: string;
  type: string;
  secondaryType: string;
  species: string;
}
