import {
  GeneratedTrainerData,
  EnrichedTrainerData,
  EnrichedPokemonData,
  ValidationStatus,
  ValidationSummary,
  ValidationIssue,
  AIGenerationSettings
} from '../types/aiTrainer';
import { Pokemon } from '../types/pokemon';
import { Trainer } from '../types/trainer';
import { RegionService } from './regionService';
import { TalentPointService } from './talentPointService';

export class TrainerValidator {
  private static readonly COMMON_POKEMON_NAMES: Record<string, number> = {
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
    'groudon': 383,
    'dialga': 483,
    'palkia': 484,
    'giratina': 487,
    'arceus': 493,
    'reshiram': 643,
    'zekrom': 644,
    'kyurem': 646,
    'xerneas': 716,
    'yveltal': 717,
    'zygarde': 718
  };

  static async validateGeneratedTrainer(
    generatedData: GeneratedTrainerData,
    settings: AIGenerationSettings
  ): Promise<{
    isValid: boolean;
    summary: ValidationSummary;
    enrichedData?: EnrichedTrainerData;
  }> {
    const issues: ValidationIssue[] = [];
    const autoCorrections: string[] = [];

    try {
      // 1. Basic structure validation
      this.validateBasicStructure(generatedData, issues);

      // 2. Pokemon name validation and enrichment
      const enrichedPokemon = await this.validateAndEnrichPokemon(
        generatedData.pokemon,
        settings,
        issues,
        autoCorrections
      );

      // 3. Level validation
      this.validateLevels(enrichedPokemon, settings, issues, autoCorrections);

      // 4. Regional constraints validation
      this.validateRegionalConstraints(enrichedPokemon, settings, issues, autoCorrections);

      // 5. Team composition validation
      this.validateTeamComposition(enrichedPokemon, settings, issues);

      // 6. Business logic validation
      this.validateBusinessLogic(generatedData, enrichedPokemon, settings, issues);

      // Determine overall status
      const errorCount = issues.filter(i => i.severity === 'error').length;
      const warningCount = issues.filter(i => i.severity === 'warning').length;
      
      let overallStatus: ValidationStatus;
      if (errorCount > 0) {
        overallStatus = 'error';
      } else if (warningCount > 0) {
        overallStatus = 'warning';
      } else {
        overallStatus = 'valid';
      }

      const summary: ValidationSummary = {
        overall: overallStatus,
        issues,
        autoCorrections
      };

      // Create enriched trainer data if validation passed
      let enrichedData: EnrichedTrainerData | undefined;
      if (overallStatus !== 'error') {
        enrichedData = await this.createEnrichedTrainerData(
          generatedData,
          enrichedPokemon,
          settings,
          summary
        );
      }

      return {
        isValid: overallStatus !== 'error',
        summary,
        enrichedData
      };

    } catch (error) {
      console.error('Validation error:', error);
      
      const summary: ValidationSummary = {
        overall: 'error',
        issues: [{
          type: 'pokemon_not_found',
          severity: 'error',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        autoCorrections
      };

      return {
        isValid: false,
        summary
      };
    }
  }

  private static validateBasicStructure(
    data: GeneratedTrainerData,
    issues: ValidationIssue[]
  ): void {
    if (!data.name || data.name.trim().length === 0) {
      issues.push({
        type: 'pokemon_not_found',
        severity: 'error',
        message: 'Trainer name is required'
      });
    }

    if (data.name && data.name.length > 100) {
      issues.push({
        type: 'pokemon_not_found',
        severity: 'warning',
        message: 'Trainer name is very long (over 100 characters)'
      });
    }

    if (!data.pokemon || !Array.isArray(data.pokemon)) {
      issues.push({
        type: 'pokemon_not_found',
        severity: 'error',
        message: 'Pokemon team is required'
      });
      return;
    }

    if (data.pokemon.length === 0) {
      issues.push({
        type: 'pokemon_not_found',
        severity: 'error',
        message: 'Team must have at least 1 Pokemon'
      });
    }

    // No longer limiting team size to 6 Pokemon
  }

  private static async validateAndEnrichPokemon(
    pokemonList: GeneratedTrainerData['pokemon'],
    settings: AIGenerationSettings,
    issues: ValidationIssue[],
    autoCorrections: string[]
  ): Promise<EnrichedPokemonData[]> {
    const enrichedPokemon: EnrichedPokemonData[] = [];

    for (let i = 0; i < pokemonList.length; i++) {
      const pokemonData = pokemonList[i];
      
      try {
        // Validate Pokemon name
        const pokemonName = pokemonData.name.toLowerCase().trim();
        
        if (!pokemonName) {
          issues.push({
            type: 'pokemon_not_found',
            severity: 'error',
            message: `Pokemon ${i + 1}: Name is required`,
            pokemonIndex: i
          });
          continue;
        }

        // Check if Pokemon name is in our known list
        const pokemonId = this.COMMON_POKEMON_NAMES[pokemonName];
        
        if (!pokemonId) {
          // Try to suggest similar Pokemon
          const suggestion = this.findSimilarPokemon(pokemonName);
          issues.push({
            type: 'pokemon_not_found',
            severity: 'error',
            message: `Pokemon ${i + 1}: "${pokemonName}" not found`,
            pokemonIndex: i,
            suggestion: suggestion ? `Try "${suggestion}" instead` : undefined
          });
          continue;
        }

        // Create enriched Pokemon data
        const enrichedPokemon_item: EnrichedPokemonData = {
          id: `temp-${i}`,
          name: pokemonName,
          level: pokemonData.level,
          isShiny: pokemonData.isShiny || false,
          pokemonId: pokemonId,
          validationStatus: 'valid' as ValidationStatus,
          // Default stats (would normally be fetched from PokeAPI)
          stats: this.getDefaultStatsForPokemon(pokemonName),
          talentPoints: { hp: 0, attack: 0, defense: 0, speed: 0 },
          talentPointsSpentOnAttacks: 0
        };

        enrichedPokemon.push(enrichedPokemon_item);

      } catch (error) {
        issues.push({
          type: 'pokemon_not_found',
          severity: 'error',
          message: `Pokemon ${i + 1}: Error processing data - ${error instanceof Error ? error.message : 'Unknown error'}`,
          pokemonIndex: i
        });
      }
    }

    // No team size limits - all Pokemon are processed

    return enrichedPokemon;
  }

  private static validateLevels(
    pokemonList: EnrichedPokemonData[],
    settings: AIGenerationSettings,
    issues: ValidationIssue[],
    autoCorrections: string[]
  ): void {
    const levelRange = RegionService.getLevelRange(settings.averageLevel, settings.levelVariance);
    
    pokemonList.forEach((pokemon, index) => {
      const level = pokemon.level || 1;
      
      if (level < 1 || level > 100) {
        issues.push({
          type: 'invalid_level',
          severity: 'error',
          message: `Pokemon ${index + 1}: Level ${level} is invalid (must be 1-100)`,
          pokemonIndex: index
        });
      } else if (level < levelRange.min || level > levelRange.max) {
        const suggestedLevel = Math.max(levelRange.min, Math.min(levelRange.max, level));
        issues.push({
          type: 'invalid_level',
          severity: 'warning',
          message: `Pokemon ${index + 1}: Level ${level} is outside expected range (${levelRange.min}-${levelRange.max})`,
          pokemonIndex: index,
          suggestion: `Consider level ${suggestedLevel}`
        });
        
        // Auto-correct the level
        pokemon.level = suggestedLevel;
        autoCorrections.push(`${pokemon.name} level adjusted from ${level} to ${suggestedLevel}`);
      }
    });
  }

  private static validateRegionalConstraints(
    pokemonList: EnrichedPokemonData[],
    settings: AIGenerationSettings,
    issues: ValidationIssue[],
    autoCorrections: string[]
  ): void {
    if (settings.regions.includes('all')) return;

    pokemonList.forEach((pokemon, index) => {
      const isValidRegion = settings.regions.some(regionId => 
        RegionService.isPokemonInRegion(pokemon.pokemonId, regionId)
      );
      
      if (!isValidRegion) {
        const regionNames = settings.regions.map(regionId => {
          const regionInfo = RegionService.getRegionInfo(regionId);
          return regionInfo?.name || regionId;
        }).join(', ');
        
        issues.push({
          type: 'region_mismatch',
          severity: 'warning',
          message: `Pokemon ${index + 1}: ${pokemon.name} is not from the selected regions (${regionNames})`,
          pokemonIndex: index,
          suggestion: `Choose Pokemon from one of the selected regions`
        });
      }
    });
  }

  private static validateTeamComposition(
    pokemonList: EnrichedPokemonData[],
    settings: AIGenerationSettings,
    issues: ValidationIssue[]
  ): void {
    // Check for duplicate Pokemon
    const pokemonCounts = new Map<string, number>();
    pokemonList.forEach((pokemon, index) => {
      const count = pokemonCounts.get(pokemon.name) || 0;
      pokemonCounts.set(pokemon.name, count + 1);
      
      if (count > 0) {
        issues.push({
          type: 'pokemon_not_found',
          severity: 'warning',
          message: `Pokemon ${index + 1}: Duplicate ${pokemon.name} in team`,
          pokemonIndex: index
        });
      }
    });

    // Check shiny rate
    const shinyCount = pokemonList.filter(p => p.isShiny).length;
    const shinyRate = shinyCount / pokemonList.length;
    
    if (settings.allowShiny && shinyRate > 0.3) {
      issues.push({
        type: 'pokemon_not_found',
        severity: 'warning',
        message: `High shiny rate (${Math.round(shinyRate * 100)}%) - unusually many shiny Pokemon`
      });
    } else if (!settings.allowShiny && shinyCount > 0) {
      issues.push({
        type: 'pokemon_not_found',
        severity: 'warning',
        message: `Shiny Pokemon found but shiny generation is disabled`
      });
    }
  }

  private static validateBusinessLogic(
    trainerData: GeneratedTrainerData,
    pokemonList: EnrichedPokemonData[],
    settings: AIGenerationSettings,
    issues: ValidationIssue[]
  ): void {
    // Validate trainer personality matches team
    if (settings.trainerPersonality !== 'random') {
      // This would be expanded with actual type checking logic
      const teamTypes = pokemonList.map(p => this.getPrimaryTypeForPokemon(p.name));
      
      switch (settings.trainerPersonality) {
        case 'aggressive':
          const aggressiveTypes = ['fighting', 'dark', 'dragon', 'fire'];
          const aggressiveCount = teamTypes.filter(type => aggressiveTypes.includes(type)).length;
          if (aggressiveCount < pokemonList.length * 0.3) {
            issues.push({
              type: 'type_mismatch',
              severity: 'info',
              message: 'Aggressive trainer has few aggressive-type Pokemon'
            });
          }
          break;
          
        case 'mysterious':
          const mysteriousTypes = ['psychic', 'ghost', 'dark'];
          const mysteriousCount = teamTypes.filter(type => mysteriousTypes.includes(type)).length;
          if (mysteriousCount < pokemonList.length * 0.3) {
            issues.push({
              type: 'type_mismatch',
              severity: 'info',
              message: 'Mysterious trainer has few mysterious-type Pokemon'
            });
          }
          break;
      }
    }

    // Check preferred type compliance
    if (settings.preferredType !== 'all') {
      const preferredTypeCount = pokemonList.filter(p => 
        this.getPrimaryTypeForPokemon(p.name) === settings.preferredType
      ).length;
      
      const expectedMinimum = Math.ceil(pokemonList.length * 0.5);
      if (preferredTypeCount < expectedMinimum) {
        issues.push({
          type: 'type_mismatch',
          severity: 'warning',
          message: `Expected at least ${expectedMinimum} ${settings.preferredType}-type Pokemon, found ${preferredTypeCount}`
        });
      }
    }
  }

  private static async createEnrichedTrainerData(
    originalData: GeneratedTrainerData,
    enrichedPokemon: EnrichedPokemonData[],
    settings: AIGenerationSettings,
    validationSummary: ValidationSummary
  ): Promise<EnrichedTrainerData> {
    // Apply talent points to Pokemon based on their levels and settings
    const pokemonWithTalentPoints = enrichedPokemon.map(pokemon => {
      const level = pokemon.level || 1;
      const talentDistribution = TalentPointService.distributeTalentPoints(
        level,
        pokemon.stats || { hp: 50, attack: 50, defense: 50, speed: 50 },
        settings.statDistributionStyle
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
    });

    const enrichedTrainer: EnrichedTrainerData = {
      id: `ai-generated-${Date.now()}`,
      name: originalData.name,
      description: originalData.description || '',
      money: 1000, // Default starting money
      team: pokemonWithTalentPoints,
      items: [],
      createdAt: new Date().toISOString(),
      generationSettings: settings,
      validationSummary
    };

    return enrichedTrainer;
  }

  // Helper methods
  private static findSimilarPokemon(input: string): string | null {
    const knownNames = Object.keys(this.COMMON_POKEMON_NAMES);
    
    // Simple similarity check
    for (const name of knownNames) {
      if (name.includes(input) || input.includes(name)) {
        return name;
      }
    }

    // Levenshtein distance check for close matches
    let bestMatch = null;
    let bestDistance = Infinity;
    
    for (const name of knownNames) {
      const distance = this.levenshteinDistance(input.toLowerCase(), name.toLowerCase());
      if (distance < bestDistance && distance <= 3) {
        bestDistance = distance;
        bestMatch = name;
      }
    }

    return bestMatch;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private static getDefaultStatsForPokemon(pokemonName: string): { hp: number; attack: number; defense: number; speed: number } {
    // This would normally fetch from PokeAPI, but for now we'll use defaults based on Pokemon
    const statDefaults: Record<string, { hp: number; attack: number; defense: number; speed: number }> = {
      pikachu: { hp: 35, attack: 55, defense: 40, speed: 90 },
      charizard: { hp: 78, attack: 84, defense: 78, speed: 100 },
      blastoise: { hp: 79, attack: 83, defense: 100, speed: 78 },
      venusaur: { hp: 80, attack: 82, defense: 83, speed: 80 },
      // Add more as needed...
    };

    return statDefaults[pokemonName] || { hp: 50, attack: 50, defense: 50, speed: 50 };
  }

  private static getPrimaryTypeForPokemon(pokemonName: string): string {
    // This would normally fetch from PokeAPI, but for now we'll use some defaults
    const typeDefaults: Record<string, string> = {
      pikachu: 'electric',
      charizard: 'fire',
      blastoise: 'water',
      venusaur: 'grass',
      gengar: 'ghost',
      alakazam: 'psychic',
      machamp: 'fighting',
      dragonite: 'dragon',
      // Add more as needed...
    };

    return typeDefaults[pokemonName] || 'normal';
  }

  static async quickValidate(data: GeneratedTrainerData): Promise<boolean> {
    try {
      const basicValidation = this.validateBasicStructure;
      const issues: ValidationIssue[] = [];
      
      basicValidation(data, issues);
      
      // Check if all Pokemon names are known
      for (const pokemon of data.pokemon) {
        const pokemonName = pokemon.name.toLowerCase().trim();
        if (!this.COMMON_POKEMON_NAMES[pokemonName]) {
          return false;
        }
      }

      return issues.filter(i => i.severity === 'error').length === 0;
    } catch {
      return false;
    }
  }
}