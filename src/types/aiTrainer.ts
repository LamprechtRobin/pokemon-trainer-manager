import { Trainer } from './trainer';
import { Pokemon } from './pokemon';

// AI Generation Settings
export interface AIGenerationSettings {
  regions: RegionOption[]; // Changed to array for multi-region support
  preferredType: PokemonType | "all";
  averageLevel: number; // 1-100
  levelVariance: number; // ±X levels variance
  teamSize: number; // 1-6 Pokemon
  allowShiny: boolean;
  trainerPersonality: TrainerPersonality;
  statDistributionStyle: StatDistributionStyle;
}

// Region Options (Generation-based)
export type RegionOption = 
  | "kanto"     // Gen 1 (#1-151)
  | "johto"     // Gen 2 (#152-251) 
  | "hoenn"     // Gen 3 (#252-386)
  | "sinnoh"    // Gen 4 (#387-493)
  | "unova"     // Gen 5 (#494-649)
  | "kalos"     // Gen 6 (#650-721)
  | "alola"     // Gen 7 (#722-809)
  | "galar"     // Gen 8 (#810-905)
  | "paldea"    // Gen 9 (#906-1025)
  | "all";      // All generations

// Pokemon Types
export type PokemonType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

// Removed DifficultyLevel - now using level sliders directly

// Trainer Personalities (affects team composition)
export type TrainerPersonality =
  | "friendly"      // Balanced, cute Pokemon
  | "aggressive"    // Attack-focused, intimidating Pokemon
  | "mysterious"    // Dark, Psychic types
  | "professional"  // Organized, meta teams
  | "random";       // Completely random

// Stat Distribution Styles
export type StatDistributionStyle =
  | "balanced"      // Even distribution across all stats
  | "specialized"   // Focus on 1-2 main stats
  | "defensive"     // Emphasis on HP and Defense
  | "offensive"     // Emphasis on Attack and Speed
  | "random";       // Completely random distribution

// Default settings
export const DEFAULT_AI_SETTINGS: AIGenerationSettings = {
  regions: ["kanto"],
  preferredType: "all",
  averageLevel: 25,
  levelVariance: 10,
  teamSize: 4,
  allowShiny: true,
  trainerPersonality: "random",
  statDistributionStyle: "balanced"
};

// Region Information
export interface RegionInfo {
  id: RegionOption;
  name: string;
  generation: number;
  pokemonRange: {
    start: number;
    end: number;
  };
  description: string;
}

// Generated Trainer Data (before enrichment)
export interface GeneratedTrainerData {
  name: string;
  description: string;
  personality: TrainerPersonality;
  pokemon: GeneratedPokemonData[];
  backstory?: string;
}

// Generated Pokemon Data (before enrichment)
export interface GeneratedPokemonData {
  name: string;
  level: number;
  isShiny?: boolean;
  nickname?: string;
}

// Enriched Pokemon Data (after PokeAPI enrichment)
export interface EnrichedPokemonData extends Pokemon {
  // All Pokemon fields plus validation status
  pokemonId: number; // Pokemon ID from PokeAPI
  validationStatus: ValidationStatus;
  enrichmentErrors?: string[];
}

// Enriched Trainer Data (final result)
export interface EnrichedTrainerData extends Trainer {
  team: EnrichedPokemonData[];
  generationSettings: AIGenerationSettings;
  validationSummary: ValidationSummary;
  backstory?: string; // Optional backstory from AI generation
}

// Validation Status
export type ValidationStatus = "valid" | "warning" | "error";

// Validation Summary
export interface ValidationSummary {
  overall: ValidationStatus;
  issues: ValidationIssue[];
  autoCorrections: string[];
}

// Validation Issue
export interface ValidationIssue {
  type: "pokemon_not_found" | "invalid_level" | "stat_overflow" | "region_mismatch" | "type_mismatch";
  severity: "error" | "warning" | "info";
  message: string;
  pokemonIndex?: number;
  suggestion?: string;
}

// Generation Progress
export interface GenerationProgress {
  step: GenerationStep;
  message: string;
  progress: number; // 0-100
}

export type GenerationStep = 
  | "generating_concept"
  | "creating_team"
  | "enriching_pokemon"
  | "calculating_stats"
  | "validating_result"
  | "finalizing";

// API Response from Gemini
export interface GeminiTrainerResponse {
  trainer: GeneratedTrainerData;
  metadata?: {
    generation_time?: number;
    model_used?: string;
    confidence_score?: number;
  };
}

// Talent Points Distribution
export interface TalentPointsDistribution {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  total: number;
  remaining: number;
}

// Team Composition Analysis
export interface TeamComposition {
  typeDistribution: Record<PokemonType, number>;
  levelRange: {
    min: number;
    max: number;
    average: number;
  };
  shinyCount: number;
  balanceScore: number; // 0-100, higher is more balanced
  coverage: PokemonType[]; // Types covered by the team
  weaknesses: PokemonType[]; // Common weaknesses
}

// Generation Options for UI
export const REGION_OPTIONS: RegionInfo[] = [
  {
    id: "kanto",
    name: "Kanto (Gen 1)",
    generation: 1,
    pokemonRange: { start: 1, end: 151 },
    description: "Klassische Pokemon wie Pikachu, Charizard, Blastoise"
  },
  {
    id: "johto", 
    name: "Johto (Gen 2)",
    generation: 2,
    pokemonRange: { start: 152, end: 251 },
    description: "Gold/Silber Pokemon wie Lugia, Ho-Oh, Typhlosion"
  },
  {
    id: "hoenn",
    name: "Hoenn (Gen 3)", 
    generation: 3,
    pokemonRange: { start: 252, end: 386 },
    description: "Rubin/Saphir Pokemon wie Rayquaza, Blaziken, Swampert"
  },
  {
    id: "sinnoh",
    name: "Sinnoh (Gen 4)",
    generation: 4, 
    pokemonRange: { start: 387, end: 493 },
    description: "Diamant/Perl Pokemon wie Dialga, Palkia, Garchomp"
  },
  {
    id: "unova",
    name: "Unova (Gen 5)",
    generation: 5,
    pokemonRange: { start: 494, end: 649 },
    description: "Schwarz/Weiß Pokemon wie Reshiram, Zekrom, Serperior"
  },
  {
    id: "kalos", 
    name: "Kalos (Gen 6)",
    generation: 6,
    pokemonRange: { start: 650, end: 721 },
    description: "X/Y Pokemon wie Xerneas, Yveltal, Greninja"
  },
  {
    id: "alola",
    name: "Alola (Gen 7)",
    generation: 7,
    pokemonRange: { start: 722, end: 809 },
    description: "Sonne/Mond Pokemon wie Solgaleo, Lunala, Decidueye"
  },
  {
    id: "galar",
    name: "Galar (Gen 8)", 
    generation: 8,
    pokemonRange: { start: 810, end: 905 },
    description: "Schwert/Schild Pokemon wie Zacian, Zamazenta, Dragapult"
  },
  {
    id: "paldea",
    name: "Paldea (Gen 9)",
    generation: 9,
    pokemonRange: { start: 906, end: 1025 },
    description: "Karmesin/Purpur Pokemon wie Koraidon, Miraidon, Meowscarada"
  },
  {
    id: "all",
    name: "Alle Regionen",
    generation: 0,
    pokemonRange: { start: 1, end: 1025 },
    description: "Pokemon aus allen Generationen"
  }
];

export const POKEMON_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug", 
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

export const TYPE_NAMES: Record<PokemonType, string> = {
  normal: "Normal",
  fire: "Feuer", 
  water: "Wasser",
  electric: "Elektro",
  grass: "Pflanze",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden", 
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht", 
  steel: "Stahl",
  fairy: "Fee"
};

// Removed DIFFICULTY_DESCRIPTIONS - now using level sliders directly

export const PERSONALITY_DESCRIPTIONS: Record<TrainerPersonality, string> = {
  friendly: "Freundlich (ausgeglichene, süße Pokemon)",
  aggressive: "Aggressiv (kampfstarke, einschüchternde Pokemon)", 
  mysterious: "Mysteriös (Unlicht-, Psycho-Pokemon)",
  professional: "Professionell (strategische, Meta-Teams)",
  random: "Zufällig (komplett gemischte Teams)"
};

export const STAT_STYLE_DESCRIPTIONS: Record<StatDistributionStyle, string> = {
  balanced: "Ausgeglichen (gleichmäßige Stat-Verteilung)",
  specialized: "Spezialisiert (Fokus auf 1-2 Haupt-Stats)",
  defensive: "Defensiv (Schwerpunkt HP und Verteidigung)",
  offensive: "Offensiv (Schwerpunkt Angriff und Initiative)", 
  random: "Zufällig (völlig zufällige Verteilung)"
};