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
  talentPointsSpentOnAttacks?: number; // Track TP spent on attack upgrades
  evolutionData?: {
    canEvolve: boolean;
    evolutions: string[]; // Array of Pokemon names that this can evolve into
    minLevel?: number; // Minimum level required for evolution
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
