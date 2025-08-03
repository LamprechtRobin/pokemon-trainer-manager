/**
 * Service for managing basic attacks that Pokemon automatically learn based on their primary type
 */

export interface BasicAttackMapping {
  [type: string]: string; // type -> attackId
}

// Mapping of Pokemon types to their basic (tier 1) attacks
export const BASIC_ATTACK_MAPPING: BasicAttackMapping = {
  'normal': 'tackle',
  'fire': 'ember',
  'water': 'water_gun',
  'electric': 'thunder_shock',
  'grass': 'absorb',
  'ice': 'powder_snow',
  'fighting': 'karate_chop',
  'poison': 'poison_sting',
  'ground': 'mud_slap',
  'flying': 'gust',
  'psychic': 'confusion',
  'bug': 'bug_bite',
  'rock': 'rock_throw',
  'ghost': 'lick',
  'dragon': 'dragon_breath',
  'dark': 'bite',
  'steel': 'metal_claw',
  'fairy': 'fairy_wind'
};

export class BasicAttackService {
  /**
   * Get the basic attack ID for a given Pokemon type
   */
  static getBasicAttackForType(type: string): string | null {
    // Remove emojis and extra characters, then normalize
    const cleanType = type.replace(/[^\w\s]/gi, '').trim().toLowerCase();
    
    // If the type contains multiple words (e.g., "electric" from "⚡ Electric"), take the last word
    const typeWords = cleanType.split(' ');
    const actualType = typeWords[typeWords.length - 1];
    
    return BASIC_ATTACK_MAPPING[actualType] || null;
  }

  /**
   * Add basic attack to a Pokemon's learned attacks if not already present
   */
  static addBasicAttackToPokemon(pokemon: { type?: string; learnedAttacks?: string[] }): string[] {
    const currentAttacks = pokemon.learnedAttacks || [];
    
    if (!pokemon.type) {
      console.warn('Pokemon has no type, cannot add basic attack');
      return currentAttacks;
    }

    const basicAttackId = this.getBasicAttackForType(pokemon.type);
    if (!basicAttackId) {
      console.warn(`No basic attack found for type: "${pokemon.type}"`);
      return currentAttacks;
    }

    // Check if Pokemon already has this attack
    if (currentAttacks.includes(basicAttackId)) {
      console.log(`Pokemon already has basic attack: ${basicAttackId}`);
      return currentAttacks;
    }

    // Add basic attack as the first attack
    console.log(`Adding basic attack "${basicAttackId}" for type "${pokemon.type}"`);
    return [basicAttackId, ...currentAttacks];
  }

  /**
   * Ensure all Pokemon in a team have their basic attacks
   */
  static addBasicAttacksToTeam<T extends { type?: string; learnedAttacks?: string[] }>(team: T[]): T[] {
    return team.map(pokemon => ({
      ...pokemon,
      learnedAttacks: this.addBasicAttackToPokemon(pokemon)
    }));
  }

  /**
   * Get all available basic attack IDs
   */
  static getAllBasicAttackIds(): string[] {
    return Object.values(BASIC_ATTACK_MAPPING);
  }

  /**
   * Check if an attack is a basic attack
   */
  static isBasicAttack(attackId: string): boolean {
    return this.getAllBasicAttackIds().includes(attackId);
  }

  /**
   * Get the type that corresponds to a basic attack
   */
  static getTypeForBasicAttack(attackId: string): string | null {
    for (const [type, basicAttackId] of Object.entries(BASIC_ATTACK_MAPPING)) {
      if (basicAttackId === attackId) {
        return type;
      }
    }
    return null;
  }
}

export default BasicAttackService;