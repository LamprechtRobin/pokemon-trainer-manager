// Pokemon evolution data
export interface EvolutionData {
  canEvolve: boolean;
  evolutions: string[];
  minLevel?: number;
}

// Evolution chains for common Pokemon
const EVOLUTION_DATA: Record<string, EvolutionData> = {
  // Gen 1 Classic evolutions
  'Bisasam': { canEvolve: true, evolutions: ['Bisaknosp'], minLevel: 16 },
  'Bisaknosp': { canEvolve: true, evolutions: ['Bisaflor'], minLevel: 32 },
  'Bisaflor': { canEvolve: false, evolutions: [] },
  
  'Glumanda': { canEvolve: true, evolutions: ['Glutexo'], minLevel: 16 },
  'Glutexo': { canEvolve: true, evolutions: ['Glurak'], minLevel: 36 },
  'Glurak': { canEvolve: false, evolutions: [] },
  
  'Schiggy': { canEvolve: true, evolutions: ['Schillok'], minLevel: 16 },
  'Schillok': { canEvolve: true, evolutions: ['Turtok'], minLevel: 36 },
  'Turtok': { canEvolve: false, evolutions: [] },
  
  // Pikachu line
  'Pichu': { canEvolve: true, evolutions: ['Pikachu'], minLevel: 15 },
  'Pikachu': { canEvolve: true, evolutions: ['Raichu'], minLevel: 25 },
  'Raichu': { canEvolve: false, evolutions: [] },
  
  // Eevee evolutions
  'Evoli': { 
    canEvolve: true, 
    evolutions: ['Aquana', 'Blitzeon', 'Flamara', 'Psiana', 'Nachtara', 'Folipurba', 'Glaziola', 'Feelinara'], 
    minLevel: 20 
  },
  'Aquana': { canEvolve: false, evolutions: [] },
  'Blitzeon': { canEvolve: false, evolutions: [] },
  'Flamara': { canEvolve: false, evolutions: [] },
  'Psiana': { canEvolve: false, evolutions: [] },
  'Nachtara': { canEvolve: false, evolutions: [] },
  'Folipurba': { canEvolve: false, evolutions: [] },
  'Glaziola': { canEvolve: false, evolutions: [] },
  'Feelinara': { canEvolve: false, evolutions: [] },
  
  // More popular Pokemon
  'Raupy': { canEvolve: true, evolutions: ['Safcon'], minLevel: 7 },
  'Safcon': { canEvolve: true, evolutions: ['Smettbo'], minLevel: 10 },
  'Smettbo': { canEvolve: false, evolutions: [] },
  
  'Hornliu': { canEvolve: true, evolutions: ['Kokuna'], minLevel: 7 },
  'Kokuna': { canEvolve: true, evolutions: ['Bibor'], minLevel: 10 },
  'Bibor': { canEvolve: false, evolutions: [] },
  
  'Taubsi': { canEvolve: true, evolutions: ['Tauboga'], minLevel: 18 },
  'Tauboga': { canEvolve: true, evolutions: ['Tauboss'], minLevel: 36 },
  'Tauboss': { canEvolve: false, evolutions: [] },
  
  'Rattfratz': { canEvolve: true, evolutions: ['Rattikarl'], minLevel: 20 },
  'Rattikarl': { canEvolve: false, evolutions: [] },
  
  'Habitak': { canEvolve: true, evolutions: ['Ibitak'], minLevel: 20 },
  'Ibitak': { canEvolve: false, evolutions: [] },
  
  'Zubat': { canEvolve: true, evolutions: ['Golbat'], minLevel: 22 },
  'Golbat': { canEvolve: true, evolutions: ['Iksbat'], minLevel: 35 },
  'Iksbat': { canEvolve: false, evolutions: [] },
  
  'Myrapla': { canEvolve: true, evolutions: ['Duflor'], minLevel: 21 },
  'Duflor': { canEvolve: true, evolutions: ['Giflor', 'Blubella'], minLevel: 35 },
  'Giflor': { canEvolve: false, evolutions: [] },
  'Blubella': { canEvolve: false, evolutions: [] },
  
  'Paras': { canEvolve: true, evolutions: ['Parasek'], minLevel: 24 },
  'Parasek': { canEvolve: false, evolutions: [] },
  
  'Bluzuk': { canEvolve: true, evolutions: ['Omot'], minLevel: 31 },
  'Omot': { canEvolve: false, evolutions: [] },
  
  'Digda': { canEvolve: true, evolutions: ['Digdri'], minLevel: 26 },
  'Digdri': { canEvolve: false, evolutions: [] },
  
  'Mauzi': { canEvolve: true, evolutions: ['Snobilikat'], minLevel: 28 },
  'Snobilikat': { canEvolve: false, evolutions: [] },
  
  'Enton': { canEvolve: true, evolutions: ['Entoron'], minLevel: 33 },
  'Entoron': { canEvolve: false, evolutions: [] },
  
  'Menki': { canEvolve: true, evolutions: ['Rasaff'], minLevel: 28 },
  'Rasaff': { canEvolve: false, evolutions: [] },
  
  'Fukano': { canEvolve: true, evolutions: ['Arkani'], minLevel: 30 },
  'Arkani': { canEvolve: false, evolutions: [] },
  
  'Quapsel': { canEvolve: true, evolutions: ['Quaputzi'], minLevel: 25 },
  'Quaputzi': { canEvolve: true, evolutions: ['Quappo', 'Quaxo'], minLevel: 40 },
  'Quappo': { canEvolve: false, evolutions: [] },
  'Quaxo': { canEvolve: false, evolutions: [] },
  
  'Abra': { canEvolve: true, evolutions: ['Kadabra'], minLevel: 16 },
  'Kadabra': { canEvolve: true, evolutions: ['Simsala'], minLevel: 35 },
  'Simsala': { canEvolve: false, evolutions: [] },
  
  'Machollo': { canEvolve: true, evolutions: ['Maschock'], minLevel: 28 },
  'Maschock': { canEvolve: true, evolutions: ['Machomei'], minLevel: 40 },
  'Machomei': { canEvolve: false, evolutions: [] },
  
  'Knofensa': { canEvolve: true, evolutions: ['Ultrigaria'], minLevel: 21 },
  'Ultrigaria': { canEvolve: true, evolutions: ['Sarzenia'], minLevel: 35 },
  'Sarzenia': { canEvolve: false, evolutions: [] },
  
  'Tentacha': { canEvolve: true, evolutions: ['Tentoxa'], minLevel: 30 },
  'Tentoxa': { canEvolve: false, evolutions: [] },
  
  'Kleinstein': { canEvolve: true, evolutions: ['Georok'], minLevel: 25 },
  'Georok': { canEvolve: true, evolutions: ['Geowaz'], minLevel: 40 },
  'Geowaz': { canEvolve: false, evolutions: [] },
  
  'Ponita': { canEvolve: true, evolutions: ['Gallopa'], minLevel: 40 },
  'Gallopa': { canEvolve: false, evolutions: [] },
  
  'Flegmon': { canEvolve: true, evolutions: ['Lahmus', 'Laschoking'], minLevel: 37 },
  'Lahmus': { canEvolve: false, evolutions: [] },
  'Laschoking': { canEvolve: false, evolutions: [] },
  
  'Magnetilo': { canEvolve: true, evolutions: ['Magneton'], minLevel: 30 },
  'Magneton': { canEvolve: true, evolutions: ['Magnezone'], minLevel: 45 },
  'Magnezone': { canEvolve: false, evolutions: [] },
  
  'Porenta': { canEvolve: false, evolutions: [] },
  
  'Dodu': { canEvolve: true, evolutions: ['Dodri'], minLevel: 31 },
  'Dodri': { canEvolve: false, evolutions: [] },
  
  'Jurob': { canEvolve: true, evolutions: ['Jugong'], minLevel: 34 },
  'Jugong': { canEvolve: false, evolutions: [] },
  
  'Sleima': { canEvolve: true, evolutions: ['Sleimok'], minLevel: 38 },
  'Sleimok': { canEvolve: false, evolutions: [] },
  
  'Muschas': { canEvolve: true, evolutions: ['Austos'], minLevel: 30 },
  'Austos': { canEvolve: false, evolutions: [] },
  
  'Nebulak': { canEvolve: true, evolutions: ['Alpollo'], minLevel: 25 },
  'Alpollo': { canEvolve: true, evolutions: ['Gengar'], minLevel: 40 },
  'Gengar': { canEvolve: false, evolutions: [] },
  
  'Onix': { canEvolve: true, evolutions: ['Stahlos'], minLevel: 35 },
  'Stahlos': { canEvolve: false, evolutions: [] },
  
  'Traumato': { canEvolve: true, evolutions: ['Hypno'], minLevel: 26 },
  'Hypno': { canEvolve: false, evolutions: [] },
  
  'Krabby': { canEvolve: true, evolutions: ['Kingler'], minLevel: 28 },
  'Kingler': { canEvolve: false, evolutions: [] },
  
  'Voltobal': { canEvolve: true, evolutions: ['Lektrobal'], minLevel: 30 },
  'Lektrobal': { canEvolve: false, evolutions: [] },
  
  'Owei': { canEvolve: true, evolutions: ['Kokowei'], minLevel: 25 },
  'Kokowei': { canEvolve: false, evolutions: [] },
  
  'Tragosso': { canEvolve: true, evolutions: ['Knogga'], minLevel: 28 },
  'Knogga': { canEvolve: false, evolutions: [] },
  
  'Kicklee': { canEvolve: false, evolutions: [] },
  'Nockchan': { canEvolve: false, evolutions: [] },
  
  'Schlurp': { canEvolve: false, evolutions: [] },
  
  'Smogon': { canEvolve: true, evolutions: ['Smogmog'], minLevel: 35 },
  'Smogmog': { canEvolve: false, evolutions: [] },
  
  'Rihorn': { canEvolve: true, evolutions: ['Rizeros'], minLevel: 42 },
  'Rizeros': { canEvolve: true, evolutions: ['Rihornior'], minLevel: 55 },
  'Rihornior': { canEvolve: false, evolutions: [] },
  
  'Chaneira': { canEvolve: true, evolutions: ['Heiteira'], minLevel: 40 },
  'Heiteira': { canEvolve: false, evolutions: [] },
  
  'Tangela': { canEvolve: true, evolutions: ['Tangoloss'], minLevel: 35 },
  'Tangoloss': { canEvolve: false, evolutions: [] },
  
  'Kangama': { canEvolve: false, evolutions: [] },
  
  'Seeper': { canEvolve: true, evolutions: ['Seemon'], minLevel: 32 },
  'Seemon': { canEvolve: false, evolutions: [] },
  
  'Goldini': { canEvolve: true, evolutions: ['Golking'], minLevel: 33 },
  'Golking': { canEvolve: false, evolutions: [] },
  
  'Sterndu': { canEvolve: true, evolutions: ['Starmie'], minLevel: 30 },
  'Starmie': { canEvolve: false, evolutions: [] },
  
  'Pantimos': { canEvolve: false, evolutions: [] },
  
  'Sichlor': { canEvolve: true, evolutions: ['Scherox'], minLevel: 35 },
  'Scherox': { canEvolve: false, evolutions: [] },
  
  'Rossana': { canEvolve: false, evolutions: [] },
  
  'Elektek': { canEvolve: true, evolutions: ['Elevoltek'], minLevel: 40 },
  'Elevoltek': { canEvolve: false, evolutions: [] },
  
  'Magmar': { canEvolve: true, evolutions: ['Magbrant'], minLevel: 40 },
  'Magbrant': { canEvolve: false, evolutions: [] },
  
  'Pinsir': { canEvolve: false, evolutions: [] },
  
  'Tauros': { canEvolve: false, evolutions: [] },
  
  'Karpador': { canEvolve: true, evolutions: ['Garados'], minLevel: 20 },
  'Garados': { canEvolve: false, evolutions: [] },
  
  'Lapras': { canEvolve: false, evolutions: [] },
  
  'Ditto': { canEvolve: false, evolutions: [] },
  
  'Relaxo': { canEvolve: false, evolutions: [] },
  
  'Arktos': { canEvolve: false, evolutions: [] },
  'Zapdos': { canEvolve: false, evolutions: [] },
  'Lavados': { canEvolve: false, evolutions: [] },
  
  'Dratini': { canEvolve: true, evolutions: ['Dragonir'], minLevel: 30 },
  'Dragonir': { canEvolve: true, evolutions: ['Dragoran'], minLevel: 55 },
  'Dragoran': { canEvolve: false, evolutions: [] },
  
  'Mewtu': { canEvolve: false, evolutions: [] },
  'Mew': { canEvolve: false, evolutions: [] }
};

export const evolutionService = {
  /**
   * Get evolution data for a Pokemon
   */
  getEvolutionData(pokemonName: string): EvolutionData {
    const data = EVOLUTION_DATA[pokemonName];
    if (!data) {
      return { canEvolve: false, evolutions: [] };
    }
    
    // Ensure no undefined values
    return {
      canEvolve: data.canEvolve,
      evolutions: data.evolutions,
      ...(data.minLevel !== undefined && { minLevel: data.minLevel })
    };
  },

  /**
   * Check if Pokemon can evolve at current level
   */
  canEvolveAtLevel(pokemonName: string, currentLevel: number): boolean {
    const evolutionData = this.getEvolutionData(pokemonName);
    if (!evolutionData.canEvolve) return false;
    if (!evolutionData.minLevel) return true;
    return currentLevel >= evolutionData.minLevel;
  },

  /**
   * Get available evolutions for a Pokemon at current level
   */
  getAvailableEvolutions(pokemonName: string, currentLevel: number): string[] {
    if (!this.canEvolveAtLevel(pokemonName, currentLevel)) return [];
    const evolutionData = this.getEvolutionData(pokemonName);
    return evolutionData.evolutions;
  },

  /**
   * Check if a Pokemon name has evolution data
   */
  hasEvolutionData(pokemonName: string): boolean {
    return pokemonName in EVOLUTION_DATA;
  }
};