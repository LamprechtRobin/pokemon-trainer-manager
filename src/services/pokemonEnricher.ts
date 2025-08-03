import { 
  GeneratedPokemonData, 
  EnrichedPokemonData,
  ValidationStatus
} from '../types/aiTrainer';
import { Pokemon } from '../types/pokemon';
import { pokeApiService } from './pokeapi';
import { TalentPointService } from './talentPointService';

export class PokemonEnricher {
  /**
   * Enriches AI-generated Pokemon data with real PokeAPI data
   */
  static async enrichPokemon(
    generatedPokemon: GeneratedPokemonData,
    targetLevel: number
  ): Promise<EnrichedPokemonData | null> {
    try {
      console.log(`Enriching Pokemon: ${generatedPokemon.name} at level ${targetLevel}`);
      
      // First, try to find the Pokemon via PokeAPI
      const pokemonDetails = await this.getPokemonFromAPI(generatedPokemon.name);
      
      if (!pokemonDetails) {
        console.warn(`Pokemon not found in PokeAPI: ${generatedPokemon.name}`);
        return null;
      }

      // Create base Pokemon object with guaranteed values
      const enrichedPokemon: EnrichedPokemonData = {
        id: `pokemon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: pokemonDetails.germanName || generatedPokemon.name || 'Unknown',
        level: targetLevel || 1,
        pokemonId: pokemonDetails.apiId || 1,
        imageUrl: pokemonDetails.imageUrl || '',
        type: pokemonDetails.primaryType || 'normal',
        secondaryType: pokemonDetails.secondaryType || undefined,
        stats: {
          hp: pokemonDetails.baseStats?.hp || 50,
          attack: pokemonDetails.baseStats?.attack || 50,
          defense: pokemonDetails.baseStats?.defense || 50,
          speed: pokemonDetails.baseStats?.speed || 50
        },
        talentPoints: { hp: 0, attack: 0, defense: 0, speed: 0 },
        talentPointsSpentOnAttacks: 0,
        isShiny: generatedPokemon.isShiny || false,
        validationStatus: 'valid' as ValidationStatus,
        createdAt: new Date().toISOString()
      };

      console.log(`Successfully enriched Pokemon: ${enrichedPokemon.name}`);
      return enrichedPokemon;

    } catch (error) {
      console.error(`Error enriching Pokemon ${generatedPokemon.name}:`, error);
      return null;
    }
  }

  /**
   * Enriches a full team of AI-generated Pokemon
   */
  static async enrichTeam(
    generatedTeam: GeneratedPokemonData[]
  ): Promise<EnrichedPokemonData[]> {
    const enrichedTeam: EnrichedPokemonData[] = [];
    
    console.log(`Enriching team of ${generatedTeam.length} Pokemon...`);

    for (let i = 0; i < generatedTeam.length; i++) {
      const pokemon = generatedTeam[i];
      console.log(`Processing Pokemon ${i + 1}/${generatedTeam.length}: ${pokemon.name}`);
      
      try {
        const enriched = await this.enrichPokemon(pokemon, pokemon.level);
        
        if (enriched) {
          enrichedTeam.push(enriched);
          console.log(`✓ Successfully enriched ${enriched.name}`);
        } else {
          console.warn(`✗ Failed to enrich ${pokemon.name}, creating fallback`);
          // Create a fallback Pokemon if enrichment fails
          const fallback = this.createFallbackPokemon(pokemon);
          enrichedTeam.push(fallback);
        }
        
        // Small delay to avoid overwhelming the API
        if (i < generatedTeam.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (error) {
        console.error(`Error processing ${pokemon.name}:`, error);
        // Create fallback Pokemon on error
        const fallback = this.createFallbackPokemon(pokemon);
        enrichedTeam.push(fallback);
      }
    }

    console.log(`Team enrichment complete: ${enrichedTeam.length} Pokemon processed`);
    return enrichedTeam;
  }

  /**
   * Gets Pokemon data from PokeAPI by name
   */
  private static async getPokemonFromAPI(pokemonName: string): Promise<{
    germanName: string;
    englishName: string;
    apiId: number;
    imageUrl: string;
    primaryType: string;
    secondaryType?: string;
    baseStats: {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
    };
  } | null> {
    try {
      // First, try to get German name if we have an English name
      let germanName = pokemonName;
      let englishName = pokemonName.toLowerCase();

      // Try to convert English to German name
      const germanFromAPI = await pokeApiService.getGermanName(englishName);
      if (germanFromAPI) {
        germanName = germanFromAPI;
      } else {
        // If that fails, maybe we already have a German name - try to get English
        const englishFromAPI = await pokeApiService.getEnglishName(pokemonName);
        if (englishFromAPI) {
          englishName = englishFromAPI;
          germanName = pokemonName; // Keep original as German
        }
      }

      // Get detailed Pokemon data
      const details = await pokeApiService.getPokemonDetails(germanName);
      if (!details) {
        return null;
      }

      // Extract type names without emojis
      const primaryType = details.type.replace(/[^\w\s]/gi, '').trim().toLowerCase();
      const secondaryType = details.secondaryType 
        ? details.secondaryType.replace(/[^\w\s]/gi, '').trim().toLowerCase()
        : undefined;

      // Get Pokemon ID from the name
      const apiId = await this.getPokemonIdFromName(englishName);

      return {
        germanName,
        englishName,
        apiId: apiId || 1, // Fallback to Bulbasaur if ID not found
        imageUrl: details.imageUrl,
        primaryType,
        secondaryType,
        baseStats: details.stats
      };

    } catch (error) {
      console.error(`Error getting Pokemon from API: ${pokemonName}`, error);
      return null;
    }
  }

  /**
   * Gets Pokemon ID from name by searching the species list
   */
  private static async getPokemonIdFromName(englishName: string): Promise<number | null> {
    try {
      // Try direct API call first
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${englishName.toLowerCase()}`);
      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
      
      // If direct call fails, use fallback mapping
      const pokemonIds: Record<string, number> = {
        'pikachu': 25,
        'charizard': 6,
        'blastoise': 9,
        'venusaur': 3,
        'alakazam': 65,
        'machamp': 68,
        'gengar': 94,
        'dragonite': 149,
        'mewtwo': 150,
        'mew': 151,
        'typhlosion': 157,
        'feraligatr': 160,
        'meganium': 154,
        'umbreon': 197,
        'espeon': 196,
        'lucario': 448,
        'garchomp': 445,
        'rayquaza': 384,
        'kyogre': 382,
        'groudon': 383
      };

      return pokemonIds[englishName.toLowerCase()] || null;
    } catch (error) {
      console.error(`Error getting Pokemon ID for ${englishName}:`, error);
      return null;
    }
  }

  /**
   * Creates a fallback Pokemon when API enrichment fails
   */
  private static createFallbackPokemon(generatedPokemon: GeneratedPokemonData): EnrichedPokemonData {
    return {
      id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: generatedPokemon.name,
      level: generatedPokemon.level,
      pokemonId: 1, // Default to Bulbasaur ID
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      type: 'normal',
      stats: { hp: 50, attack: 50, defense: 50, speed: 50 },
      talentPoints: { hp: 0, attack: 0, defense: 0, speed: 0 },
      talentPointsSpentOnAttacks: 0,
      isShiny: generatedPokemon.isShiny || false,
      validationStatus: 'warning' as ValidationStatus,
      createdAt: new Date().toISOString(),
      enrichmentErrors: ['Pokemon not found in PokeAPI, using fallback data']
    };
  }

  /**
   * Applies talent points to enriched Pokemon based on level and strategy
   */
  static applyTalentPoints(
    pokemon: EnrichedPokemonData,
    distributionStyle: 'balanced' | 'specialized' | 'defensive' | 'offensive' | 'random' = 'balanced'
  ): EnrichedPokemonData {
    const level = pokemon.level || 1;
    const baseStats = pokemon.stats || { hp: 50, attack: 50, defense: 50, speed: 50 };
    
    const talentDistribution = TalentPointService.distributeTalentPoints(
      level,
      baseStats,
      distributionStyle
    );

    return {
      ...pokemon,
      talentPoints: {
        hp: talentDistribution.hp,
        attack: talentDistribution.attack,
        defense: talentDistribution.defense,
        speed: talentDistribution.speed
      }
    };
  }

  /**
   * Converts enriched Pokemon to standard Pokemon format for saving
   */
  static convertToStandardPokemon(enrichedPokemon: EnrichedPokemonData): Pokemon {
    const pokemon: Pokemon = {
      id: enrichedPokemon.id || `pokemon-${Date.now()}`,
      name: enrichedPokemon.name || 'Unknown',
      level: enrichedPokemon.level || 1,
      imageUrl: enrichedPokemon.imageUrl || '',
      type: enrichedPokemon.type || 'normal',
      stats: enrichedPokemon.stats || { hp: 50, attack: 50, defense: 50, speed: 50 },
      talentPoints: enrichedPokemon.talentPoints || { hp: 0, attack: 0, defense: 0, speed: 0 },
      talentPointsSpentOnAttacks: enrichedPokemon.talentPointsSpentOnAttacks || 0,
      isShiny: enrichedPokemon.isShiny || false,
      createdAt: enrichedPokemon.createdAt || new Date().toISOString(),
      learnedAttacks: [], // Start with no learned attacks
      abilities: [], // Start with no abilities
      species: enrichedPokemon.name || 'Unknown' // Use name as species
    };

    // Only add secondaryType if it exists
    if (enrichedPokemon.secondaryType) {
      pokemon.secondaryType = enrichedPokemon.secondaryType;
    }

    return pokemon;
  }

  /**
   * Validates that all Pokemon in team are properly enriched
   */
  static validateEnrichedTeam(team: EnrichedPokemonData[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (team.length === 0) {
      errors.push('Team cannot be empty');
      return { isValid: false, errors, warnings };
    }

    team.forEach((pokemon, index) => {
      // Check required fields
      if (!pokemon.name) {
        errors.push(`Pokemon ${index + 1}: Name is required`);
      }
      
      if (!pokemon.level || pokemon.level < 1 || pokemon.level > 100) {
        errors.push(`Pokemon ${index + 1}: Invalid level (${pokemon.level})`);
      }

      if (!pokemon.pokemonId) {
        warnings.push(`Pokemon ${index + 1}: Missing Pokemon ID`);
      }

      if (!pokemon.imageUrl) {
        warnings.push(`Pokemon ${index + 1}: Missing image URL`);
      }

      if (pokemon.validationStatus === 'error') {
        errors.push(`Pokemon ${index + 1}: Has validation errors`);
      } else if (pokemon.validationStatus === 'warning') {
        warnings.push(`Pokemon ${index + 1}: Has validation warnings`);
      }

      if (pokemon.enrichmentErrors && pokemon.enrichmentErrors.length > 0) {
        warnings.push(`Pokemon ${index + 1}: ${pokemon.enrichmentErrors.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Batch enrichment with progress reporting
   */
  static async enrichTeamWithProgress(
    generatedTeam: GeneratedPokemonData[],
    onProgress?: (current: number, total: number, pokemonName: string) => void
  ): Promise<EnrichedPokemonData[]> {
    const enrichedTeam: EnrichedPokemonData[] = [];
    const total = generatedTeam.length;

    for (let i = 0; i < generatedTeam.length; i++) {
      const pokemon = generatedTeam[i];
      
      onProgress?.(i + 1, total, pokemon.name);
      
      try {
        const enriched = await this.enrichPokemon(pokemon, pokemon.level);
        
        if (enriched) {
          enrichedTeam.push(enriched);
        } else {
          const fallback = this.createFallbackPokemon(pokemon);
          enrichedTeam.push(fallback);
        }
        
        // Small delay between requests
        if (i < generatedTeam.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
      } catch (error) {
        console.error(`Error processing ${pokemon.name}:`, error);
        const fallback = this.createFallbackPokemon(pokemon);
        enrichedTeam.push(fallback);
      }
    }

    return enrichedTeam;
  }
}