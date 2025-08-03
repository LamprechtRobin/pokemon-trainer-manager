/**
 * Migration utilities to ensure all Pokemon have their basic attacks
 */

import { Pokemon } from '../types/pokemon';
import { Trainer } from '../types/trainer';
import { BasicAttackService } from '../services/basicAttackService';

export class PokemonMigration {
  /**
   * Ensures a single Pokemon has its basic attack
   */
  static migratePokemonBasicAttack(pokemon: Pokemon): { updated: boolean; pokemon: Pokemon } {
    // Check if Pokemon already has attacks
    if (pokemon.learnedAttacks && pokemon.learnedAttacks.length > 0) {
      return { updated: false, pokemon };
    }

    // Get basic attack for this Pokemon's type
    const basicAttackId = pokemon.type 
      ? BasicAttackService.getBasicAttackForType(pokemon.type)
      : null;

    if (!basicAttackId) {
      console.warn(`No basic attack found for Pokemon ${pokemon.name} with type: ${pokemon.type}`);
      return { updated: false, pokemon };
    }

    // Add the basic attack
    const updatedPokemon: Pokemon = {
      ...pokemon,
      learnedAttacks: [basicAttackId]
    };

    console.log(`Migrated Pokemon ${pokemon.name}: added basic attack "${basicAttackId}" for type "${pokemon.type}"`);
    return { updated: true, pokemon: updatedPokemon };
  }

  /**
   * Migrates all Pokemon in a trainer's team
   */
  static migrateTrainerPokemon(trainer: Trainer): { updated: boolean; trainer: Trainer } {
    if (!trainer.team || trainer.team.length === 0) {
      return { updated: false, trainer };
    }

    let hasUpdates = false;
    const updatedTeam = trainer.team.map(pokemon => {
      const result = this.migratePokemonBasicAttack(pokemon);
      if (result.updated) {
        hasUpdates = true;
      }
      return result.pokemon;
    });

    if (!hasUpdates) {
      return { updated: false, trainer };
    }

    const updatedTrainer: Trainer = {
      ...trainer,
      team: updatedTeam
    };

    console.log(`Migrated trainer ${trainer.name}: updated ${updatedTeam.length} Pokemon with basic attacks`);
    return { updated: true, trainer: updatedTrainer };
  }

  /**
   * Migrates all trainers and their Pokemon
   */
  static migrateAllTrainers(trainers: Trainer[]): { updatedTrainers: Trainer[]; migrationCount: number } {
    let migrationCount = 0;
    const updatedTrainers = trainers.map(trainer => {
      const result = this.migrateTrainerPokemon(trainer);
      if (result.updated) {
        migrationCount++;
      }
      return result.trainer;
    });

    if (migrationCount > 0) {
      console.log(`Migration complete: updated ${migrationCount} trainers with basic attacks`);
    } else {
      console.log('No migration needed - all Pokemon already have attacks');
    }

    return { updatedTrainers, migrationCount };
  }
}

export default PokemonMigration;