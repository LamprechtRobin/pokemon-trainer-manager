import { RegionOption, RegionInfo, REGION_OPTIONS, PokemonType } from '../types/aiTrainer';

// Pokemon data grouped by generation/region
interface RegionalPokemon {
  id: number;
  name: string;
  types: PokemonType[];
  generation: number;
  isLegendary?: boolean;
  isMythical?: boolean;
}

export class RegionService {
  private static pokemonCache = new Map<RegionOption, RegionalPokemon[]>();
  
  // Get region information by ID
  static getRegionInfo(regionId: RegionOption): RegionInfo | undefined {
    return REGION_OPTIONS.find(region => region.id === regionId);
  }
  
  // Get all available regions
  static getAllRegions(): RegionInfo[] {
    return REGION_OPTIONS.filter(region => region.id !== 'all');
  }
  
  // Get Pokemon IDs for a specific region
  static getPokemonIdsForRegion(regionId: RegionOption): number[] {
    if (regionId === 'all') {
      return Array.from({ length: 1025 }, (_, i) => i + 1);
    }
    
    const regionInfo = this.getRegionInfo(regionId);
    if (!regionInfo) return [];
    
    const { start, end } = regionInfo.pokemonRange;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Get Pokemon IDs for multiple regions
  static getPokemonIdsForMultipleRegions(regionIds: RegionOption[]): number[] {
    if (regionIds.includes('all')) {
      return Array.from({ length: 1025 }, (_, i) => i + 1);
    }

    const allIds = new Set<number>();
    
    for (const regionId of regionIds) {
      const ids = this.getPokemonIdsForRegion(regionId);
      ids.forEach(id => allIds.add(id));
    }
    
    return Array.from(allIds).sort((a, b) => a - b);
  }
  
  // Get Pokemon names for a specific region (for PokeAPI queries)
  static async getPokemonNamesForRegion(regionId: RegionOption): Promise<string[]> {
    const pokemonIds = this.getPokemonIdsForRegion(regionId);
    
    // For now, we'll generate names based on IDs
    // In a real implementation, you might want to cache actual Pokemon names
    return pokemonIds.map(id => `pokemon-${id}`);
  }
  
  // Filter Pokemon by type within a region
  static async getPokemonByTypeInRegion(
    regionId: RegionOption, 
    type: PokemonType
  ): Promise<number[]> {
    const allPokemonIds = this.getPokemonIdsForRegion(regionId);
    
    // This is a simplified implementation
    // In practice, you'd want to cache Pokemon type data from PokeAPI
    return allPokemonIds; // TODO: Implement actual type filtering
  }
  
  // Get random Pokemon from a region
  static getRandomPokemonFromRegion(
    regionId: RegionOption, 
    count: number,
    excludeLegendaries: boolean = true
  ): number[] {
    const pokemonIds = this.getPokemonIdsForRegion(regionId);
    
    // Shuffle and take the requested count
    const shuffled = [...pokemonIds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  // Check if a Pokemon ID belongs to a specific region
  static isPokemonInRegion(pokemonId: number, regionId: RegionOption): boolean {
    if (regionId === 'all') return true;
    
    const regionInfo = this.getRegionInfo(regionId);
    if (!regionInfo) return false;
    
    const { start, end } = regionInfo.pokemonRange;
    return pokemonId >= start && pokemonId <= end;
  }
  
  // Get region for a Pokemon ID
  static getRegionForPokemon(pokemonId: number): RegionOption | null {
    for (const region of REGION_OPTIONS) {
      if (region.id === 'all') continue;
      
      const { start, end } = region.pokemonRange;
      if (pokemonId >= start && pokemonId <= end) {
        return region.id;
      }
    }
    return null;
  }
  
  // Generate balanced team composition based on preferences (single region)
  static generateTeamComposition(
    regionId: RegionOption,
    preferredType: PokemonType | 'all',
    teamSize: number,
    allowDuplicateTypes: boolean = true
  ): { pokemonIds: number[]; typeDistribution: Record<string, number> } {
    const allPokemonIds = this.getPokemonIdsForRegion(regionId);
    return this.generateTeamFromPokemonIds(allPokemonIds, preferredType, teamSize, allowDuplicateTypes);
  }

  // Generate balanced team composition for multiple regions
  static generateMultiRegionTeamComposition(
    regionIds: RegionOption[],
    preferredType: PokemonType | 'all',
    teamSize: number,
    allowDuplicateTypes: boolean = true
  ): { pokemonIds: number[]; typeDistribution: Record<string, number> } {
    const allPokemonIds = this.getPokemonIdsForMultipleRegions(regionIds);
    return this.generateTeamFromPokemonIds(allPokemonIds, preferredType, teamSize, allowDuplicateTypes);
  }

  // Common team generation logic
  private static generateTeamFromPokemonIds(
    allPokemonIds: number[],
    preferredType: PokemonType | 'all',
    teamSize: number,
    allowDuplicateTypes: boolean = true
  ): { pokemonIds: number[]; typeDistribution: Record<string, number> } {
    
    let selectedPokemon: number[] = [];
    const typeDistribution: Record<string, number> = {};
    
    if (preferredType !== 'all') {
      // Try to get at least 50% of preferred type
      const preferredCount = Math.ceil(teamSize * 0.5);
      const mixedCount = teamSize - preferredCount;
      
      // For now, randomly select from all available Pokemon
      // TODO: Implement actual type filtering
      const preferredPokemon = this.getRandomPokemonFromIds(allPokemonIds, preferredCount);
      const mixedPokemon = this.getRandomPokemonFromIds(allPokemonIds, mixedCount);
      
      selectedPokemon = [...preferredPokemon, ...mixedPokemon];
      typeDistribution[preferredType] = preferredCount;
      typeDistribution['mixed'] = mixedCount;
    } else {
      // Random selection from all Pokemon
      selectedPokemon = this.getRandomPokemonFromIds(allPokemonIds, teamSize);
      typeDistribution['mixed'] = teamSize;
    }
    
    // Ensure no duplicates
    selectedPokemon = Array.from(new Set(selectedPokemon));
    
    // Fill up if we don't have enough due to deduplication
    while (selectedPokemon.length < teamSize) {
      const additionalPokemon = this.getRandomPokemonFromIds(allPokemonIds, 1);
      if (!selectedPokemon.includes(additionalPokemon[0])) {
        selectedPokemon.push(additionalPokemon[0]);
      }
    }
    
    return {
      pokemonIds: selectedPokemon.slice(0, teamSize),
      typeDistribution
    };
  }

  // Helper method to get random Pokemon from array of IDs
  private static getRandomPokemonFromIds(pokemonIds: number[], count: number): number[] {
    // Shuffle and take the requested count
    const shuffled = [...pokemonIds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  // Get popular Pokemon for a region (commonly used ones)
  static getPopularPokemonForRegion(regionId: RegionOption): number[] {
    const regionInfo = this.getRegionInfo(regionId);
    if (!regionInfo) return [];
    
    // Return some popular Pokemon IDs based on region
    const popularByRegion: Record<RegionOption, number[]> = {
      kanto: [1, 4, 7, 25, 94, 130, 144, 145, 146, 150], // Bulbasaur, Charmander, Squirtle, Pikachu, etc.
      johto: [152, 155, 158, 249, 250, 243, 244, 245], // Chikorita, Cyndaquil, Totodile, etc.
      hoenn: [252, 255, 258, 382, 383, 384], // Treecko, Torchic, Mudkip, etc.
      sinnoh: [387, 390, 393, 483, 484, 487], // Turtwig, Chimchar, Piplup, etc.
      unova: [494, 495, 498, 501, 643, 644, 646], // Victini, Snivy, Tepig, etc.
      kalos: [650, 653, 656, 716, 717, 718], // Chespin, Fennekin, Froakie, etc.
      alola: [722, 725, 728, 789, 791, 792], // Rowlet, Litten, Popplio, etc.
      galar: [810, 813, 816, 888, 889, 890], // Grookey, Scorbunny, Sobble, etc.
      paldea: [906, 909, 912, 1007, 1008, 1009], // Sprigatito, Fuecoco, Quaxly, etc.
      all: []
    };
    
    return popularByRegion[regionId] || [];
  }
  
  // Get starter Pokemon for a region
  static getStarterPokemonForRegion(regionId: RegionOption): number[] {
    const startersByRegion: Record<RegionOption, number[]> = {
      kanto: [1, 4, 7], // Bulbasaur, Charmander, Squirtle
      johto: [152, 155, 158], // Chikorita, Cyndaquil, Totodile  
      hoenn: [252, 255, 258], // Treecko, Torchic, Mudkip
      sinnoh: [387, 390, 393], // Turtwig, Chimchar, Piplup
      unova: [495, 498, 501], // Snivy, Tepig, Oshawott
      kalos: [650, 653, 656], // Chespin, Fennekin, Froakie
      alola: [722, 725, 728], // Rowlet, Litten, Popplio
      galar: [810, 813, 816], // Grookey, Scorbunny, Sobble
      paldea: [906, 909, 912], // Sprigatito, Fuecoco, Quaxly
      all: []
    };
    
    return startersByRegion[regionId] || [];
  }
  
  // Validate if Pokemon list fits region constraints
  static validatePokemonForRegion(
    pokemonIds: number[], 
    regionId: RegionOption
  ): { valid: boolean; invalidPokemon: number[]; suggestions: string[] } {
    if (regionId === 'all') {
      return { valid: true, invalidPokemon: [], suggestions: [] };
    }
    
    const invalidPokemon: number[] = [];
    const suggestions: string[] = [];
    
    for (const pokemonId of pokemonIds) {
      if (!this.isPokemonInRegion(pokemonId, regionId)) {
        invalidPokemon.push(pokemonId);
        
        // Suggest alternative from the same region
        const alternativePokemon = this.getRandomPokemonFromRegion(regionId, 1);
        suggestions.push(`Replace Pokemon ${pokemonId} with ${alternativePokemon[0]} from ${regionId}`);
      }
    }
    
    return {
      valid: invalidPokemon.length === 0,
      invalidPokemon,
      suggestions
    };
  }
  
  // Calculate level range from average and variance
  static getLevelRange(averageLevel: number, variance: number): { min: number; max: number } {
    return {
      min: Math.max(1, averageLevel - variance),
      max: Math.min(100, averageLevel + variance)
    };
  }
  
  // Generate level distribution for a team
  static generateLevelDistribution(
    averageLevel: number,
    variance: number, 
    teamSize: number
  ): number[] {
    const { min, max } = this.getLevelRange(averageLevel, variance);
    const levels: number[] = [];
    
    for (let i = 0; i < teamSize; i++) {
      // Generate level with variance
      const randomVariance = (Math.random() - 0.5) * 2 * variance;
      let level = Math.round(averageLevel + randomVariance);
      
      // Clamp to calculated bounds
      level = Math.max(min, Math.min(max, level));
      
      // Ensure level is at least 1
      level = Math.max(1, level);
      
      levels.push(level);
    }
    
    return levels;
  }
}