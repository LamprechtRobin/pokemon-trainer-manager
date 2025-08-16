import { SKILL_CONFIG, getAllSkills, getSkillsByAttribute } from '../config/skills.config';
import type { AttributeId, SkillId, SkillLevel } from '../config/skills.config';
import type { TrainerSkills } from '../types/trainer';

export class SkillCalculator {
  /**
   * Berechnet die verbrauchten Attribut-Punkte
   */
  static getUsedAttributePoints(trainerSkills: TrainerSkills): number {
    const { intelligence, agility, social, strength, presence } = trainerSkills;
    return intelligence + agility + social + strength + presence;
  }

  /**
   * Berechnet die übrigen Attribut-Punkte
   */
  static getRemainingAttributePoints(trainerSkills: TrainerSkills): number {
    const used = this.getUsedAttributePoints(trainerSkills);
    return SKILL_CONFIG.MAX_ATTRIBUTE_POINTS - used;
  }

  /**
   * Berechnet die verbrauchten Skill-Level für ein Attribut
   */
  static getUsedSkillLevels(attributeId: AttributeId, skills: Record<SkillId, SkillLevel>): number {
    const attributeSkills = getSkillsByAttribute(attributeId);
    return attributeSkills.reduce((sum, skill) => {
      return sum + (skills[skill.id as SkillId] || 0);
    }, 0);
  }

  /**
   * Berechnet die verfügbaren Skill-Level für ein Attribut
   */
  static getAvailableSkillLevels(
    attributeId: AttributeId, 
    attributePoints: number, 
    skills: Record<SkillId, SkillLevel>
  ): number {
    const used = this.getUsedSkillLevels(attributeId, skills);
    return attributePoints - used;
  }

  /**
   * Validiert ob ein Skill-Level erhöht werden kann
   */
  static canIncreaseSkill(
    skillId: SkillId,
    currentLevel: SkillLevel,
    attributeId: AttributeId,
    attributePoints: number,
    skills: Record<SkillId, SkillLevel>
  ): boolean {
    // Check if we have available skill levels
    const available = this.getAvailableSkillLevels(attributeId, attributePoints, skills);
    if (available <= 0) return false;

    // Check if we're at max skill level
    if (currentLevel >= SKILL_CONFIG.SKILL_LEVELS.length - 1) return false;

    return true;
  }

  /**
   * Erstellt leere Skills für alle verfügbaren Skills
   */
  static createEmptySkills(): Record<SkillId, SkillLevel> {
    const allSkills = getAllSkills();
    const emptySkills: Record<string, SkillLevel> = {};
    
    allSkills.forEach(skill => {
      emptySkills[skill.id] = 0 as SkillLevel;
    });
    
    return emptySkills;
  }

  /**
   * Normalisiert Skills - stellt sicher, dass alle Skills existieren
   */
  static normalizeSkills(skills: Partial<Record<SkillId, SkillLevel>>): Record<SkillId, SkillLevel> {
    const emptySkills = this.createEmptySkills();
    const allSkills = getAllSkills();
    
    // Merge existing skills with empty skills
    allSkills.forEach(skill => {
      const skillId = skill.id as SkillId;
      emptySkills[skillId] = skills[skillId] ?? 0;
    });
    
    return emptySkills;
  }

  /**
   * Erstellt leere Attribute
   */
  static createEmptyAttributes() {
    return {
      intelligence: 0,
      agility: 0,
      social: 0,
      strength: 0,
      presence: 0
    };
  }

  /**
   * Erstellt ein komplett leeres TrainerSkills Objekt
   */
  static createEmptyTrainerSkills(): TrainerSkills {
    return {
      intelligence: 0,
      agility: 0,
      social: 0,
      strength: 0,
      presence: 0,
      skills: this.createEmptySkills()
    };
  }

  /**
   * Validiert ein komplettes TrainerSkills Objekt
   */
  static validateTrainerSkills(trainerSkills: TrainerSkills): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate attribute points
    const usedPoints = this.getUsedAttributePoints(trainerSkills);
    if (usedPoints > SKILL_CONFIG.MAX_ATTRIBUTE_POINTS) {
      errors.push(`Zu viele Attribut-Punkte verwendet: ${usedPoints}/${SKILL_CONFIG.MAX_ATTRIBUTE_POINTS}`);
    }

    // Validate individual attributes
    const attributes = [
      { id: 'intelligence', value: trainerSkills.intelligence },
      { id: 'agility', value: trainerSkills.agility },
      { id: 'social', value: trainerSkills.social },
      { id: 'strength', value: trainerSkills.strength },
      { id: 'presence', value: trainerSkills.presence }
    ];

    attributes.forEach(({ id, value }) => {
      if (value > SKILL_CONFIG.MAX_POINTS_PER_ATTRIBUTE) {
        errors.push(`${id}: Zu viele Punkte (${value}/${SKILL_CONFIG.MAX_POINTS_PER_ATTRIBUTE})`);
      }
      if (value < 0) {
        errors.push(`${id}: Negative Punkte nicht erlaubt`);
      }
    });

    // Validate skills for each attribute
    attributes.forEach(({ id, value }) => {
      const usedSkillLevels = this.getUsedSkillLevels(
        id as AttributeId, 
        trainerSkills.skills
      );
      if (usedSkillLevels > value) {
        errors.push(`${id}: Zu viele Skill-Level verwendet (${usedSkillLevels}/${value})`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Berechnet Statistiken für das Character Sheet
   */
  static getCharacterStats(trainerSkills: TrainerSkills) {
    const usedAttributePoints = this.getUsedAttributePoints(trainerSkills);
    const remainingAttributePoints = this.getRemainingAttributePoints(trainerSkills);
    
    const attributes = [
      { id: 'intelligence', value: trainerSkills.intelligence },
      { id: 'agility', value: trainerSkills.agility },
      { id: 'social', value: trainerSkills.social },
      { id: 'strength', value: trainerSkills.strength },
      { id: 'presence', value: trainerSkills.presence }
    ];

    const skillStats = attributes.map(({ id, value }) => {
      const usedSkillLevels = this.getUsedSkillLevels(
        id as AttributeId, 
        trainerSkills.skills
      );
      const availableSkillLevels = value - usedSkillLevels;
      
      return {
        attributeId: id as AttributeId,
        attributePoints: value,
        usedSkillLevels,
        availableSkillLevels
      };
    });

    return {
      usedAttributePoints,
      remainingAttributePoints,
      skillStats
    };
  }
}