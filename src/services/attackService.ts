import { Attack, AttackDatabase } from '../types/attack';
import baseAttacksData from '../data/attacks/base-attacks.json';
import powerAttacksData from '../data/attacks/power-attacks.json';

// Type emojis mapping (same as in pokeapi.ts)
const TYPE_EMOJIS: Record<string, string> = {
  normal: '⚪',
  fire: '🔥',
  water: '💧',
  electric: '⚡',
  grass: '🌱',
  ice: '❄️',
  fighting: '👊',
  poison: '☠️',
  ground: '🌍',
  flying: '🌪️',
  psychic: '🔮',
  bug: '🐛',
  rock: '🗿',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌙',
  steel: '⚙️',
  fairy: '✨'
};

export const attackService = {
  /**
   * Get all attacks (combines base and power attacks)
   */
  getAllAttacks(): Attack[] {
    const baseAttacks = (baseAttacksData as AttackDatabase).attacks;
    const powerAttacks = (powerAttacksData as AttackDatabase).attacks;
    return [...baseAttacks, ...powerAttacks];
  },

  /**
   * Get only base attacks (100% accuracy, lower power)
   */
  getBaseAttacks(): Attack[] {
    return (baseAttacksData as AttackDatabase).attacks;
  },

  /**
   * Get only power attacks (70% accuracy, higher power)
   */
  getPowerAttacks(): Attack[] {
    return (powerAttacksData as AttackDatabase).attacks;
  },

  /**
   * Get attacks by type
   */
  getAttacksByType(type: string): Attack[] {
    return this.getAllAttacks().filter(attack => attack.type === type.toLowerCase());
  },

  /**
   * Get attacks by tier
   */
  getAttacksByTier(tier: 1 | 2 | 3): Attack[] {
    return this.getAllAttacks().filter(attack => attack.tier === tier);
  },

  /**
   * Get attack by ID
   */
  getAttackById(id: string): Attack | undefined {
    return this.getAllAttacks().find(attack => attack.id === id);
  },

  /**
   * Get evolution chain for an attack
   */
  getEvolutionChain(attackId: string): Attack[] {
    const attacks = this.getAllAttacks();
    const chain: Attack[] = [];
    
    // Find the base attack (tier 1) of this chain
    let currentAttack = attacks.find(a => a.id === attackId);
    if (!currentAttack) return [];
    
    // Find the tier 1 attack of this type
    const baseAttack = attacks.find(a => a.type === currentAttack!.type && a.tier === 1);
    if (!baseAttack) return [];
    
    // Build the evolution chain
    let nextAttack: Attack | undefined = baseAttack;
    while (nextAttack) {
      chain.push(nextAttack);
      nextAttack = nextAttack.evolvesTo ? attacks.find(a => a.id === nextAttack!.evolvesTo) : undefined;
    }
    
    return chain;
  },

  /**
   * Get type emoji
   */
  getTypeEmoji(type: string): string {
    return TYPE_EMOJIS[type.toLowerCase()] || '❓';
  },

  /**
   * Get type display with emoji
   */
  getTypeDisplay(type: string): string {
    const emoji = this.getTypeEmoji(type);
    const displayName = type.charAt(0).toUpperCase() + type.slice(1);
    return `${emoji} ${displayName}`;
  },

  /**
   * Get tier display name
   */
  getTierName(tier: 1 | 2 | 3): string {
    switch (tier) {
      case 1: return 'Basis';
      case 2: return 'Fortgeschritten';  
      case 3: return 'Meister';
      default: return 'Unbekannt';
    }
  },

  /**
   * Get all unique types
   */
  getAllTypes(): string[] {
    const attackTypes = this.getAllAttacks().map(attack => attack.type);
    const uniqueTypes = Array.from(new Set(attackTypes));
    return uniqueTypes.sort();
  },

  /**
   * Get default tier 1 attack for a Pokemon type
   */
  getDefaultAttackForType(type: string): Attack | undefined {
    // Remove emoji and get clean type name
    const cleanType = type.toLowerCase().replace(/[^\w\s]/gi, '').trim();
    const typeWords = cleanType.split(' ');
    const actualType = typeWords[typeWords.length - 1]; // Get last word (actual type name)
    
    return this.getAllAttacks().find(attack => 
      attack.type === actualType && attack.tier === 1
    );
  },

  /**
   * Get the previous tier attack (for downgrading)
   */
  getPreviousTierAttack(attackId: string): Attack | undefined {
    const attacks = this.getAllAttacks();
    const currentAttack = attacks.find(a => a.id === attackId);
    if (!currentAttack) return undefined;
    
    // Find attack that evolves to current attack
    return attacks.find(a => a.evolvesTo === attackId);
  },

  /**
   * Get learnable attacks for a Pokemon (all attacks that match its types)
   */
  getLearnableAttacks(primaryType?: string, secondaryType?: string): Attack[] {
    const attacks = this.getAllAttacks();
    const learnableAttacks: Attack[] = [];
    
    if (primaryType) {
      const cleanPrimaryType = primaryType.toLowerCase().replace(/[^\w\s]/gi, '').trim();
      const primaryTypeWords = cleanPrimaryType.split(' ');
      const actualPrimaryType = primaryTypeWords[primaryTypeWords.length - 1];
      
      learnableAttacks.push(...attacks.filter(attack => attack.type === actualPrimaryType));
    }
    
    if (secondaryType) {
      const cleanSecondaryType = secondaryType.toLowerCase().replace(/[^\w\s]/gi, '').trim();
      const secondaryTypeWords = cleanSecondaryType.split(' ');
      const actualSecondaryType = secondaryTypeWords[secondaryTypeWords.length - 1];
      
      learnableAttacks.push(...attacks.filter(attack => 
        attack.type === actualSecondaryType && 
        !learnableAttacks.some(existing => existing.id === attack.id)
      ));
    }
    
    return learnableAttacks.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.tier - b.tier;
    });
  }
};