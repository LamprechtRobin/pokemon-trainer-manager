import { TalentPointsDistribution, StatDistributionStyle } from '../types/aiTrainer';
import { Pokemon } from '../types/pokemon';

interface PokemonStats {
  hp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
}

export class TalentPointService {
  // Calculate max talent points based on level (existing rule from codebase)
  static getMaxTalentPoints(level: number): number {
    return (level - 1) * 5;
  }
  
  // Calculate max talent points for a specific stat (existing rule from codebase)
  static getMaxTalentPointsForStat(baseStat: number): number {
    return baseStat > 0 ? baseStat : 999; // If no base stat, allow up to 999 points
  }
  
  // Distribute talent points according to style and existing rules
  static distributeTalentPoints(
    level: number,
    baseStats: PokemonStats,
    style: StatDistributionStyle = 'balanced'
  ): TalentPointsDistribution {
    const totalPoints = this.getMaxTalentPoints(level);
    
    if (totalPoints <= 0) {
      return {
        hp: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        total: 0,
        remaining: 0
      };
    }
    
    let distribution: TalentPointsDistribution;
    
    switch (style) {
      case 'balanced':
        distribution = this.distributeBalanced(totalPoints, baseStats);
        break;
      case 'specialized':
        distribution = this.distributeSpecialized(totalPoints, baseStats);
        break;
      case 'defensive':
        distribution = this.distributeDefensive(totalPoints, baseStats);
        break;
      case 'offensive':
        distribution = this.distributeOffensive(totalPoints, baseStats);
        break;
      case 'random':
        distribution = this.distributeRandomly(totalPoints, baseStats);
        break;
      default:
        distribution = this.distributeBalanced(totalPoints, baseStats);
    }
    
    // Validate distribution doesn't exceed stat limits
    distribution = this.validateAndAdjustDistribution(distribution, baseStats);
    
    return distribution;
  }
  
  // Balanced distribution - even split across all stats
  private static distributeBalanced(
    totalPoints: number,
    baseStats: PokemonStats
  ): TalentPointsDistribution {
    const stats = ['hp', 'attack', 'defense', 'speed'] as const;
    const pointsPerStat = Math.floor(totalPoints / 4);
    const remainder = totalPoints % 4;
    
    const distribution: TalentPointsDistribution = {
      hp: pointsPerStat,
      attack: pointsPerStat,
      defense: pointsPerStat,
      speed: pointsPerStat,
      total: totalPoints,
      remaining: 0
    };
    
    // Distribute remainder randomly
    for (let i = 0; i < remainder; i++) {
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      distribution[randomStat]++;
    }
    
    return distribution;
  }
  
  // Specialized distribution - focus on 1-2 main stats
  private static distributeSpecialized(
    totalPoints: number,
    baseStats: PokemonStats
  ): TalentPointsDistribution {
    const stats = ['hp', 'attack', 'defense', 'speed'] as const;
    
    // Pick 1-2 stats to specialize in based on highest base stats
    const statValues = stats.map(stat => ({
      stat,
      value: baseStats[stat] || 0
    })).sort((a, b) => b.value - a.value);
    
    const primaryStat = statValues[0].stat;
    const secondaryStat = statValues[1].stat;
    
    // Allocate 60% to primary, 30% to secondary, 10% split among others
    const primaryPoints = Math.floor(totalPoints * 0.6);
    const secondaryPoints = Math.floor(totalPoints * 0.3);
    const remainingPoints = totalPoints - primaryPoints - secondaryPoints;
    const otherPointsEach = Math.floor(remainingPoints / 2);
    const leftover = remainingPoints % 2;
    
    const distribution: TalentPointsDistribution = {
      hp: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      total: totalPoints,
      remaining: 0
    };
    
    distribution[primaryStat] = primaryPoints;
    distribution[secondaryStat] = secondaryPoints;
    
    // Distribute remaining points to other stats
    const otherStats = stats.filter(s => s !== primaryStat && s !== secondaryStat);
    otherStats.forEach(stat => {
      distribution[stat] = otherPointsEach;
    });
    
    // Add leftover to random stat
    if (leftover > 0) {
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      distribution[randomStat] += leftover;
    }
    
    return distribution;
  }
  
  // Defensive distribution - focus on HP and Defense
  private static distributeDefensive(
    totalPoints: number,
    baseStats: PokemonStats
  ): TalentPointsDistribution {
    const hpPoints = Math.floor(totalPoints * 0.4);
    const defensePoints = Math.floor(totalPoints * 0.4);
    const attackPoints = Math.floor(totalPoints * 0.1);
    const speedPoints = totalPoints - hpPoints - defensePoints - attackPoints;
    
    return {
      hp: hpPoints,
      attack: attackPoints,
      defense: defensePoints,
      speed: speedPoints,
      total: totalPoints,
      remaining: 0
    };
  }
  
  // Offensive distribution - focus on Attack and Speed
  private static distributeOffensive(
    totalPoints: number,
    baseStats: PokemonStats
  ): TalentPointsDistribution {
    const attackPoints = Math.floor(totalPoints * 0.4);
    const speedPoints = Math.floor(totalPoints * 0.4);
    const hpPoints = Math.floor(totalPoints * 0.1);
    const defensePoints = totalPoints - attackPoints - speedPoints - hpPoints;
    
    return {
      hp: hpPoints,
      attack: attackPoints,
      defense: defensePoints,
      speed: speedPoints,
      total: totalPoints,
      remaining: 0
    };
  }
  
  // Random distribution - completely random allocation
  private static distributeRandomly(
    totalPoints: number,
    baseStats: PokemonStats
  ): TalentPointsDistribution {
    const stats = ['hp', 'attack', 'defense', 'speed'] as const;
    const distribution: TalentPointsDistribution = {
      hp: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      total: totalPoints,
      remaining: 0
    };
    
    let remainingPoints = totalPoints;
    
    // Randomly distribute points
    while (remainingPoints > 0) {
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      const maxForThisStat = this.getMaxTalentPointsForStat(baseStats[randomStat] || 0);
      
      if (distribution[randomStat] < maxForThisStat) {
        const pointsToAdd = Math.min(
          remainingPoints,
          Math.floor(Math.random() * 10) + 1, // Add 1-10 points at a time
          maxForThisStat - distribution[randomStat]
        );
        
        distribution[randomStat] += pointsToAdd;
        remainingPoints -= pointsToAdd;
      }
      
      // Safety check to prevent infinite loop
      if (stats.every(stat => 
        distribution[stat] >= this.getMaxTalentPointsForStat(baseStats[stat] || 0)
      )) {
        break;
      }
    }
    
    distribution.remaining = remainingPoints;
    return distribution;
  }
  
  // Validate and adjust distribution to follow existing rules
  private static validateAndAdjustDistribution(
    distribution: TalentPointsDistribution,
    baseStats: PokemonStats
  ): TalentPointsDistribution {
    const stats = ['hp', 'attack', 'defense', 'speed'] as const;
    let adjustedDistribution = { ...distribution };
    let redistributePoints = 0;
    
    // Check each stat against its maximum allowed points
    for (const stat of stats) {
      const maxForStat = this.getMaxTalentPointsForStat(baseStats[stat] || 0);
      
      if (adjustedDistribution[stat] > maxForStat) {
        // Move excess points to redistribution pool
        redistributePoints += adjustedDistribution[stat] - maxForStat;
        adjustedDistribution[stat] = maxForStat;
      }
    }
    
    // Redistribute excess points to other stats that can accept them
    while (redistributePoints > 0) {
      let distributed = false;
      
      for (const stat of stats) {
        if (redistributePoints <= 0) break;
        
        const maxForStat = this.getMaxTalentPointsForStat(baseStats[stat] || 0);
        const canAdd = maxForStat - adjustedDistribution[stat];
        
        if (canAdd > 0) {
          const pointsToAdd = Math.min(redistributePoints, canAdd);
          adjustedDistribution[stat] += pointsToAdd;
          redistributePoints -= pointsToAdd;
          distributed = true;
        }
      }
      
      // If we couldn't distribute any points, break to prevent infinite loop
      if (!distributed) {
        break;
      }
    }
    
    // Update remaining points
    adjustedDistribution.remaining = redistributePoints;
    
    // Recalculate total used points
    adjustedDistribution.total = 
      adjustedDistribution.hp + 
      adjustedDistribution.attack + 
      adjustedDistribution.defense + 
      adjustedDistribution.speed;
    
    return adjustedDistribution;
  }
  
  // Apply talent points to a Pokemon object (following existing structure)
  static applyTalentPointsToPokemon(
    pokemon: Pokemon,
    distribution: TalentPointsDistribution
  ): Pokemon {
    return {
      ...pokemon,
      talentPoints: {
        hp: distribution.hp,
        attack: distribution.attack,
        defense: distribution.defense,
        speed: distribution.speed
      },
      talentPointsSpentOnAttacks: 0 // No attack upgrades for AI-generated Pokemon
    };
  }
  
  // Generate talent points for multiple Pokemon
  static generateTalentPointsForTeam(
    pokemonTeam: Pokemon[],
    style: StatDistributionStyle = 'balanced'
  ): Pokemon[] {
    return pokemonTeam.map(pokemon => {
      const baseStats = pokemon.stats || { hp: 0, attack: 0, defense: 0, speed: 0 };
      const level = pokemon.level || 1;
      
      const distribution = this.distributeTalentPoints(level, baseStats, style);
      return this.applyTalentPointsToPokemon(pokemon, distribution);
    });
  }
  
  // Calculate final stats (base + talent points) - helper function
  static calculateFinalStats(pokemon: Pokemon): PokemonStats {
    const baseStats = pokemon.stats || { hp: 0, attack: 0, defense: 0, speed: 0 };
    const talentPoints = pokemon.talentPoints || { hp: 0, attack: 0, defense: 0, speed: 0 };
    
    return {
      hp: (baseStats.hp || 0) + (talentPoints.hp || 0),
      attack: (baseStats.attack || 0) + (talentPoints.attack || 0),
      defense: (baseStats.defense || 0) + (talentPoints.defense || 0),
      speed: (baseStats.speed || 0) + (talentPoints.speed || 0)
    };
  }
  
  // Validate talent points allocation for a Pokemon
  static validateTalentPoints(pokemon: Pokemon): {
    valid: boolean;
    errors: string[];
    maxAllowed: number;
    totalUsed: number;
  } {
    const errors: string[] = [];
    const level = pokemon.level || 1;
    const maxAllowed = this.getMaxTalentPoints(level);
    const talentPoints = pokemon.talentPoints || { hp: 0, attack: 0, defense: 0, speed: 0 };
    const baseStats = pokemon.stats || { hp: 0, attack: 0, defense: 0, speed: 0 };
    
    const totalUsed = talentPoints.hp + talentPoints.attack + talentPoints.defense + talentPoints.speed;
    const spentOnAttacks = pokemon.talentPointsSpentOnAttacks || 0;
    const grandTotal = totalUsed + spentOnAttacks;
    
    if (grandTotal > maxAllowed) {
      errors.push(`Total talent points (${grandTotal}) exceed maximum allowed (${maxAllowed}) for level ${level}`);
    }
    
    // Check individual stat limits
    const stats = ['hp', 'attack', 'defense', 'speed'] as const;
    for (const stat of stats) {
      const used = talentPoints[stat] || 0;
      const maxForStat = this.getMaxTalentPointsForStat(baseStats[stat] || 0);
      
      if (used > maxForStat) {
        errors.push(`${stat} talent points (${used}) exceed maximum allowed (${maxForStat})`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      maxAllowed,
      totalUsed: grandTotal
    };
  }
}