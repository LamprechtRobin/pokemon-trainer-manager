// Skills Konfiguration - HIER KÖNNEN SKILLS UND PUNKTE ANGEPASST WERDEN
// Diese Datei ist die zentrale Stelle für alle Skill-Anpassungen

export const SKILL_CONFIG = {
  // REGEL-EINSTELLUNGEN - hier anpassen für Änderungen
  MAX_ATTRIBUTE_POINTS: 15,        // Gesamt Punkte für Charaktererstellung
  MAX_POINTS_PER_ATTRIBUTE: 5,     // Maximum Punkte pro Basis-Attribut
  
  // SKILL STUFEN - hier können Würfelstufen angepasst werden
  SKILL_LEVELS: [
    { level: 0, die: '', label: 'Keine' },
    { level: 1, die: 'd4', label: 'Anfänger' },
    { level: 2, die: 'd6', label: 'Kompetent' },
    { level: 3, die: 'd8', label: 'Professionell' },
    { level: 4, die: 'd10', label: 'Experte' },
    { level: 5, die: 'd12', label: 'Meister' }
  ] as const,
  
  // NACHTEILE - hier können neue Nachteile hinzugefügt werden
  DISADVANTAGES: [
    'Ehrenkodex',
    'Feind (Team Rocket)',
    'Loyal zu Pokemon',
    'Jung und naiv',
    'Neugierig',
    'Selbstüberschätzt',
    'Typ-Spezialist',
    'Schwache Pokemon-Bindung',
    'Angst vor Pokemon-Typ'
  ] as const,
  
  // SPEZIELLE FÄHIGKEITEN - hier können neue Fähigkeiten hinzugefügt werden
  SPECIAL_ABILITIES: [
    'Pokemon-Bindung (+2 Pokemon Führung)',
    'Typ-Experte (+2 auf spezifischen Typ)',
    'Schnellzieher (Pokeballs schneller)',
    'Tierversteher (Wilde Pokemon beruhigen)',
    'Pokemon-Flüsterer (Pokemon Emotionen)',
    'Reich (1500 Pokedollar Start)',
    'Adelig (Gesellschaftlicher Einfluss)',
    'Forscher (+2 Forschungs-Skills)',
    'Survival-Experte (+2 Navigation/Erste Hilfe)'
  ] as const
} as const;

// BASIS-ATTRIBUTE - hier können Attribute hinzugefügt/entfernt werden
export const BASE_ATTRIBUTES = {
  intelligence: {
    id: 'intelligence',
    name: 'Intelligenz',
    description: 'Logisches Denken, Wissen, Problemlösung und strategische Planung',
    color: 'blue'
  },
  agility: {
    id: 'agility', 
    name: 'Geschicklichkeit',
    description: 'Körperliche Koordination, Reflexe, Fingerfertigkeit und Präzision',
    color: 'green'
  },
  social: {
    id: 'social',
    name: 'Sozial', 
    description: 'Empathie, Menschenkenntnis, emotionale Intelligenz und Verständnis',
    color: 'purple'
  },
  strength: {
    id: 'strength',
    name: 'Stärke',
    description: 'Physische Kraft, Ausdauer, körperliche Belastbarkeit',
    color: 'red'
  },
  presence: {
    id: 'presence',
    name: 'Präsenz',
    description: 'Charisma, Führungsqualitäten, Ausstrahlung und Überzeugungskraft',
    color: 'yellow'
  }
} as const;

// SKILLS - hier können Skills hinzugefügt/entfernt/geändert werden
export const SKILLS_BY_ATTRIBUTE = {
  intelligence: [
    { id: 'pokemonKnowledge', name: 'Pokemon Wissen', description: 'Allgemeine Pokemon Kenntnisse' },
    { id: 'typeKnowledge', name: 'Typ-Wissen', description: 'Pokemon-Typ Effektivitäten und Schwächen' },
    { id: 'combatTactics', name: 'Kampftaktik', description: 'Strategische Kampfführung' },
    { id: 'navigation', name: 'Navigation', description: 'Orientierung und Wegfindung' },
    { id: 'research', name: 'Forschung', description: 'Wissenschaftliche Pokemon Studien' },
    { id: 'computer', name: 'Computer', description: 'Umgang mit Pokemon-Technologie' },
    { id: 'firstAid', name: 'Erste Hilfe', description: 'Medizinische Grundversorgung' }
  ],
  agility: [
    { id: 'pokemonCatching', name: 'Pokemon Fangen', description: 'Wilde Pokemon erfolgreich fangen' },
    { id: 'pokeballHandling', name: 'Pokeball Handling', description: 'Geschickter Umgang mit Pokeballs' },
    { id: 'climbing', name: 'Klettern', description: 'Hindernisse überwinden' },
    { id: 'stealth', name: 'Schleichen', description: 'Unbemerkt bewegen' },
    { id: 'vehicles', name: 'Fahrzeuge', description: 'Lenken von Fahrzeugen' },
    { id: 'lockpicking', name: 'Schlösser knacken', description: 'Mechanische Rätsel lösen' }
  ],
  social: [
    { id: 'pokemonEmpathy', name: 'Pokemon Empathie', description: 'Pokemon Gefühle verstehen' },
    { id: 'negotiation', name: 'Verhandeln', description: 'Geschäfte und Tausche abwickeln' },
    { id: 'insight', name: 'Menschenkenntnis', description: 'Menschen einschätzen' },
    { id: 'teamwork', name: 'Teamwork', description: 'Zusammenarbeit mit anderen' },
    { id: 'calming', name: 'Beruhigen', description: 'Pokemon und Menschen besänftigen' }
  ],
  strength: [
    { id: 'swimming', name: 'Schwimmen', description: 'Wasserhindernisse meistern' },
    { id: 'running', name: 'Laufen', description: 'Ausdauer und Geschwindigkeit' },
    { id: 'carrying', name: 'Tragen', description: 'Schwere Lasten bewegen' },
    { id: 'powerClimbing', name: 'Klettern (Kraft)', description: 'Kraftbasiertes Klettern' },
    { id: 'wrestling', name: 'Ringen', description: 'Körperlichen Widerstand überwinden' }
  ],
  presence: [
    { id: 'pokemonLeadership', name: 'Pokemon Führung', description: 'Pokemon befehligen und koordinieren' },
    { id: 'persuasion', name: 'Überreden', description: 'Andere von etwas überzeugen' },
    { id: 'intimidation', name: 'Einschüchtern', description: 'Durch Präsenz beeindrucken' },
    { id: 'inspiration', name: 'Inspirieren', description: 'Andere motivieren und anführen' },
    { id: 'performance', name: 'Auftreten', description: 'Öffentliche Präsentation' }
  ]
} as const;

// HILFSFUNKTIONEN
export const getSkillDie = (level: number): string => {
  const skillLevel = SKILL_CONFIG.SKILL_LEVELS.find(sl => sl.level === level);
  return skillLevel?.die || '';
};

export const getSkillLabel = (level: number): string => {
  const skillLevel = SKILL_CONFIG.SKILL_LEVELS.find(sl => sl.level === level);
  return skillLevel?.label || 'Keine';
};

export const getAllSkills = () => {
  return Object.values(SKILLS_BY_ATTRIBUTE).flat();
};

export const getSkillsByAttribute = (attributeId: keyof typeof SKILLS_BY_ATTRIBUTE) => {
  return SKILLS_BY_ATTRIBUTE[attributeId] || [];
};

// TYPEN FÜR TYPESCRIPT
export type AttributeId = keyof typeof BASE_ATTRIBUTES;
export type SkillId = ReturnType<typeof getAllSkills>[number]['id'];
export type SkillLevel = typeof SKILL_CONFIG.SKILL_LEVELS[number]['level'];
export type Disadvantage = typeof SKILL_CONFIG.DISADVANTAGES[number];
export type SpecialAbility = typeof SKILL_CONFIG.SPECIAL_ABILITIES[number];