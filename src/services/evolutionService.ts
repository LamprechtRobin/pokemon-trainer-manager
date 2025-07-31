import { pokeApiService } from "./pokeapi";
import evolutionOverrides from "../data/evolution-overrides.json";

// Pokemon evolution data interface
export interface EvolutionData {
  canEvolve: boolean;
  evolutions: string[];
}

// Manual evolution overrides (loaded from JSON file)
interface EvolutionOverride {
  canEvolve: boolean;
  evolutions: string[];
}

// Cache for evolution data to avoid repeated API calls
const evolutionCache = new Map<string, EvolutionData>();

export const evolutionService = {
  /**
   * Get evolution data for a Pokemon - uses manual overrides first, then PokeAPI fallback
   */
  async getEvolutionData(pokemonName: string): Promise<EvolutionData> {
    // Check cache first
    if (evolutionCache.has(pokemonName)) {
      return evolutionCache.get(pokemonName)!;
    }

    // Check manual overrides first
    const overrides = evolutionOverrides as unknown as Record<
      string,
      EvolutionOverride
    >;
    if (overrides[pokemonName]) {
      const overrideData = overrides[pokemonName];
      const evolutionData: EvolutionData = {
        canEvolve: overrideData.canEvolve,
        evolutions: overrideData.evolutions,
      };
      evolutionCache.set(pokemonName, evolutionData);
      return evolutionData;
    }

    // Fallback to PokeAPI
    try {
      const evolutions = await pokeApiService.getEvolutionChain(pokemonName);
      const evolutionData: EvolutionData = {
        canEvolve: evolutions.length > 0,
        evolutions: evolutions,
      };

      // Cache the result
      evolutionCache.set(pokemonName, evolutionData);
      return evolutionData;
    } catch (error) {
      console.error(`Error getting evolution data for ${pokemonName}:`, error);
      const fallbackData: EvolutionData = { canEvolve: false, evolutions: [] };
      evolutionCache.set(pokemonName, fallbackData);
      return fallbackData;
    }
  },

  /**
   * Check if a Pokemon can evolve
   */
  async canEvolve(pokemonName: string): Promise<boolean> {
    const evolutionData = await this.getEvolutionData(pokemonName);
    return evolutionData.canEvolve;
  },

  /**
   * Get available evolutions for a Pokemon
   */
  async getAvailableEvolutions(pokemonName: string): Promise<string[]> {
    const evolutionData = await this.getEvolutionData(pokemonName);
    return evolutionData.evolutions;
  },

  /**
   * Check if a Pokemon name has evolution data
   */
  hasEvolutionData(pokemonName: string): boolean {
    const overrides = evolutionOverrides as unknown as Record<
      string,
      EvolutionOverride
    >;
    return pokemonName in overrides || true; // Always try API if no override
  },

  /**
   * Clear evolution cache (useful for testing or memory management)
   */
  clearCache(): void {
    evolutionCache.clear();
  },
};
