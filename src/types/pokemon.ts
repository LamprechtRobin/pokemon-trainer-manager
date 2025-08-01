export interface Pokemon {
  id?: string;
  name: string;
  level?: number;
  exp?: number; // Current experience points
  currentHp?: number; // Current HP (separate from max HP)
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
  isShiny?: boolean;
  isDead?: boolean; // Pokemon is permanently dead (cannot be healed)
  createdAt?: string;
}
//test commit
export interface PokemonFormData {
  name: string;
  level: string;
  exp: string;
  currentHp: string;
  type: string;
  secondaryType: string;
  species: string;
}
