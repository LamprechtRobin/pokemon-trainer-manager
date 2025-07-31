// PokeAPI Service for fetching Pokemon data
const BASE_URL = 'https://pokeapi.co/api/v2';

// Interfaces for PokeAPI responses
interface PokeAPIResource {
  name: string;
  url: string;
}

interface PokeAPIListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeAPIResource[];
}

interface PokeAPIPokemonSpecies {
  id: number;
  name: string;
  names: {
    language: {
      name: string;
      url: string;
    };
    name: string;
  }[];
  evolution_chain: {
    url: string;
  };
}

interface PokeAPIEvolutionChain {
  id: number;
  chain: PokeAPIEvolutionDetail;
}

interface PokeAPIEvolutionDetail {
  species: {
    name: string;
    url: string;
  };
  evolves_to: PokeAPIEvolutionDetail[];
  evolution_details: {
    min_level: number | null;
    trigger: {
      name: string;
    };
    item: {
      name: string;
    } | null;
    held_item: {
      name: string;
    } | null;
  }[];
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
}

// Pokemon type emojis
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

// Cache für API-Anfragen
const cache = new Map<string, any>();

// Cache für alle Pokemon-Namen (einmalig geladen)
let allPokemonCache: { name: string; germanName: string }[] | null = null;

// Helper function für API calls mit Caching
async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    console.log(`Cache hit for: ${url}`);
    return cache.get(url);
  }

  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    cache.set(url, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

export const pokeApiService = {
  /**
   * Lädt alle Pokemon-Namen (alle Generationen) einmalig in den Cache
   * @returns Promise<void>
   */
  async loadAllPokemon(): Promise<void> {
    if (allPokemonCache !== null) {
      return; // Bereits geladen
    }

    try {
      console.log('Lade alle Pokemon-Namen (alle Generationen)...');
      
      // Aktuelle Pokemon-Anzahl ermitteln (Stand 2024: ~1025+ Pokemon)
      const initialResponse = await fetchWithCache<PokeAPIListResponse>(`${BASE_URL}/pokemon-species?limit=1`);
      const totalPokemon = initialResponse.count;
      
      console.log(`Gefunden: ${totalPokemon} Pokemon insgesamt`);
      
      // Alle Pokemon-Species laden
      const speciesListUrl = `${BASE_URL}/pokemon-species?limit=${totalPokemon}`;
      const speciesList = await fetchWithCache<PokeAPIListResponse>(speciesListUrl);
      
      allPokemonCache = [];
      
      // Batch-Processing für bessere Performance
      const batchSize = 100;
      for (let i = 0; i < speciesList.results.length; i += batchSize) {
        const batch = speciesList.results.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (pokemon) => {
          try {
            const speciesData = await fetchWithCache<PokeAPIPokemonSpecies>(pokemon.url);
            
            // Deutschen Namen finden
            const germanName = speciesData.names.find(
              nameEntry => nameEntry.language.name === 'de'
            );
            
            return {
              name: pokemon.name,
              germanName: germanName ? germanName.name : pokemon.name
            };
          } catch (error) {
            console.error(`Error loading ${pokemon.name}:`, error);
            return {
              name: pokemon.name,
              germanName: pokemon.name
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        allPokemonCache.push(...batchResults);
        
        // Kurze Pause zwischen Batches
        if (i + batchSize < speciesList.results.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log(`Fortschritt: ${Math.min(i + batchSize, speciesList.results.length)}/${speciesList.results.length} Pokemon geladen`);
      }
      
      // Duplikate entfernen (nur das erste Pokemon mit diesem deutschen Namen behalten)
      const uniquePokemon = new Map<string, { name: string; germanName: string }>();
      allPokemonCache.forEach(pokemon => {
        if (!uniquePokemon.has(pokemon.germanName)) {
          uniquePokemon.set(pokemon.germanName, pokemon);
        }
      });
      
      allPokemonCache = Array.from(uniquePokemon.values());
      
      // Alphabetisch nach deutschem Namen sortieren
      allPokemonCache.sort((a, b) => a.germanName.localeCompare(b.germanName));
      
      console.log(`${allPokemonCache.length} Pokemon vollständig geladen und gecacht`);
      
    } catch (error) {
      console.error('Error loading all Pokemon:', error);
      allPokemonCache = []; // Leerer Cache bei Fehler
      throw new Error('Fehler beim Laden aller Pokemon');
    }
  },

  /**
   * Sucht Pokemon nach Suchbegriff (deutsche Namen)
   * @param searchTerm - Suchbegriff
   * @param limit - Maximale Anzahl Ergebnisse (default: 20)
   * @returns Promise mit Array von Pokemon-Namen
   */
  async searchPokemon(searchTerm: string, limit: number = 20): Promise<string[]> {
    // Erst alle Pokemon laden falls noch nicht geschehen
    await this.loadAllPokemon();
    
    if (!allPokemonCache || searchTerm.trim().length === 0) {
      return [];
    }
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    // Suche nach deutschen Namen die mit dem Suchbegriff beginnen oder ihn enthalten
    const matches = allPokemonCache.filter(pokemon => {
      const germanName = pokemon.germanName.toLowerCase();
      return germanName.startsWith(normalizedSearch) || germanName.includes(normalizedSearch);
    });
    
    // Sortierung: Zuerst die, die mit dem Suchbegriff beginnen, dann die anderen
    matches.sort((a, b) => {
      const aStarts = a.germanName.toLowerCase().startsWith(normalizedSearch);
      const bStarts = b.germanName.toLowerCase().startsWith(normalizedSearch);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.germanName.localeCompare(b.germanName);
    });
    
    return matches.slice(0, limit).map(pokemon => pokemon.germanName);
  },

  /**
   * Holt eine bestimmte Anzahl zufälliger Pokemon-Namen
   * @param count - Anzahl der Pokemon
   * @returns Promise mit Array von deutschen Pokemon-Namen
   */
  async getRandomPokemon(count: number = 20): Promise<string[]> {
    await this.loadAllPokemon();
    
    if (!allPokemonCache) {
      return [];
    }
    
    const shuffled = [...allPokemonCache].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(pokemon => pokemon.germanName);
  },

  /**
   * Legacy: Holt alle Pokemon-Namen auf Deutsch
   * @param limit - Anzahl der Pokemon (default: alle)
   * @returns Promise mit Array von deutschen Pokemon-Namen
   */
  async getAllPokemonNamesGerman(limit?: number): Promise<string[]> {
    try {
      // Zuerst alle Pokemon-Species laden
      const speciesListUrl = `${BASE_URL}/pokemon-species?limit=${limit}`;
      const speciesList = await fetchWithCache<PokeAPIListResponse>(speciesListUrl);
      
      console.log(`Lade ${speciesList.results.length} Pokemon-Namen auf Deutsch...`);
      
      // Für jeden Pokemon die deutschen Namen laden
      const germanNames: string[] = [];
      
      // Batch-Processing um die API nicht zu überlasten
      const batchSize = 50;
      for (let i = 0; i < speciesList.results.length; i += batchSize) {
        const batch = speciesList.results.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (pokemon) => {
          try {
            const speciesData = await fetchWithCache<PokeAPIPokemonSpecies>(pokemon.url);
            
            // Deutschen Namen finden
            const germanName = speciesData.names.find(
              nameEntry => nameEntry.language.name === 'de'
            );
            
            return germanName ? germanName.name : speciesData.name; // Fallback zu englischem Namen
          } catch (error) {
            console.error(`Error loading ${pokemon.name}:`, error);
            return pokemon.name; // Fallback zu englischem Namen
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        germanNames.push(...batchResults);
        
        // Kurze Pause zwischen Batches um API zu schonen
        if (i + batchSize < speciesList.results.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`Fortschritt: ${Math.min(i + batchSize, speciesList.results.length)}/${speciesList.results.length} Pokemon geladen`);
      }
      
      console.log(`${germanNames.length} Pokemon-Namen auf Deutsch geladen`);
      return germanNames.sort(); // Alphabetisch sortiert
      
    } catch (error) {
      console.error('Error fetching German Pokemon names:', error);
      throw new Error('Fehler beim Laden der Pokemon-Namen');
    }
  },

  /**
   * Holt eine begrenzte Anzahl von Pokemon-Namen für Testing
   * @param count - Anzahl der Pokemon (default: 20)
   * @returns Promise mit Array von deutschen Pokemon-Namen
   */
  async getSomePokemonNamesGerman(count: number = 20): Promise<string[]> {
    return this.getAllPokemonNamesGerman(count);
  },

  /**
   * Lädt Pokemon-Details (Bild, Typen und Stats) basierend auf deutschem Namen
   * @param germanName - Deutscher Pokemon-Name
   * @returns Promise mit Pokemon-Details
   */
  async getPokemonDetails(germanName: string): Promise<{imageUrl: string, type: string, secondaryType?: string, stats: {hp: number, attack: number, defense: number, speed: number}} | null> {
    try {
      // Zuerst alle Pokemon laden falls noch nicht geschehen
      await this.loadAllPokemon();
      
      if (!allPokemonCache) {
        return null;
      }
      
      // Englischen Namen finden
      const pokemonEntry = allPokemonCache.find(p => p.germanName === germanName);
      if (!pokemonEntry) {
        return null;
      }
      
      // Pokemon-Details von API laden
      const pokemonUrl = `${BASE_URL}/pokemon/${pokemonEntry.name}`;
      const pokemonData = await fetchWithCache<PokeAPIPokemon>(pokemonUrl);
      
      // Bestes Bild auswählen (Official Artwork > Standard Sprite)
      const imageUrl = pokemonData.sprites.other['official-artwork'].front_default 
        || pokemonData.sprites.front_default 
        || '';
      
      // Typen ermitteln
      const primaryType = pokemonData.types[0]?.type.name || 'normal';
      const secondaryType = pokemonData.types[1]?.type.name;
      
      const primaryTypeEmoji = TYPE_EMOJIS[primaryType] || '❓';
      const primaryTypeDisplay = `${primaryTypeEmoji} ${primaryType.charAt(0).toUpperCase() + primaryType.slice(1)}`;
      
      let secondaryTypeDisplay: string | undefined;
      if (secondaryType) {
        const secondaryTypeEmoji = TYPE_EMOJIS[secondaryType] || '❓';
        secondaryTypeDisplay = `${secondaryTypeEmoji} ${secondaryType.charAt(0).toUpperCase() + secondaryType.slice(1)}`;
      }
      
      // Stats extrahieren mit angepasster Berechnung
      const hp = pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
      const attack = pokemonData.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
      const specialAttack = pokemonData.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
      const defense = pokemonData.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
      const specialDefense = pokemonData.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
      const speed = pokemonData.stats.find(s => s.stat.name === 'speed')?.base_stat || 0;
      
      const stats = {
        hp: hp,
        attack: Math.max(attack, specialAttack), // Höherer Wert aus Attack und Special Attack
        defense: Math.round((defense + specialDefense) / 2), // Mittelwert aus Defense und Special Defense
        speed: speed
      };
      
      return {
        imageUrl,
        type: primaryTypeDisplay,
        secondaryType: secondaryTypeDisplay,
        stats
      };
      
    } catch (error) {
      console.error(`Error loading Pokemon details for ${germanName}:`, error);
      return null;
    }
  },

  /**
   * Get evolution chain for a Pokemon by German name
   * @param germanName German Pokemon name
   * @returns Promise<{name: string, minLevel?: number}[]> Array of possible evolutions with level requirements
   */
  async getEvolutionChainWithLevels(germanName: string): Promise<{name: string, minLevel?: number}[]> {
    try {
      // First get the English name
      const englishName = this.getEnglishName(germanName);
      if (!englishName) {
        console.log(`No English name found for ${germanName}`);
        return [];
      }

      // Get the Pokemon species data to access evolution chain
      const speciesResponse = await fetch(`${BASE_URL}/pokemon-species/${englishName.toLowerCase()}`);
      if (!speciesResponse.ok) {
        console.log(`Species not found for ${englishName}`);
        return [];
      }

      const speciesData: PokeAPIPokemonSpecies = await speciesResponse.json();
      
      // Get evolution chain data
      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      if (!evolutionResponse.ok) {
        console.log(`Evolution chain not found for ${englishName}`);
        return [];
      }

      const evolutionData: PokeAPIEvolutionChain = await evolutionResponse.json();

      // Find the current Pokemon in the evolution chain and get its possible evolutions with level data
      const evolutionsWithLevels = this.findEvolutionsWithLevelsForPokemon(evolutionData.chain, englishName.toLowerCase());
      
      // Convert back to German names
      const germanEvolutions = evolutionsWithLevels
        .map(evolution => ({
          name: this.getGermanName(evolution.name),
          minLevel: evolution.minLevel
        }))
        .filter(evolution => evolution.name !== null)
        .map(evolution => ({
          name: evolution.name as string,
          minLevel: evolution.minLevel
        }));

      return germanEvolutions;
    } catch (error) {
      console.error(`Error getting evolution chain for ${germanName}:`, error);
      return [];
    }
  },

  /**
   * Recursively find evolutions with level requirements for a specific Pokemon in the evolution chain
   */
  findEvolutionsWithLevelsForPokemon(chain: PokeAPIEvolutionDetail, targetPokemon: string): {name: string, minLevel?: number}[] {
    // If this is the target Pokemon, return its direct evolutions with level data
    if (chain.species.name.toLowerCase() === targetPokemon.toLowerCase()) {
      return chain.evolves_to.map(evolution => ({
        name: evolution.species.name,
        minLevel: evolution.evolution_details[0]?.min_level || undefined
      }));
    }

    // Recursively search in evolves_to chains
    for (const evolution of chain.evolves_to) {
      const found = this.findEvolutionsWithLevelsForPokemon(evolution, targetPokemon);
      if (found.length > 0) {
        return found;
      }
    }

    return [];
  },

  /**
   * Get evolution chain for a Pokemon by German name (legacy method for backward compatibility)
   * @param germanName German Pokemon name
   * @returns Promise<string[]> Array of possible evolution names in German
   */
  async getEvolutionChain(germanName: string): Promise<string[]> {
    const evolutionsWithLevels = await this.getEvolutionChainWithLevels(germanName);
    return evolutionsWithLevels.map(evolution => evolution.name);
  },

  /**
   * Check if a Pokemon can evolve (has any evolutions available)
   * @param germanName German Pokemon name
   * @returns Promise<boolean>
   */
  async canEvolve(germanName: string): Promise<boolean> {
    const evolutions = await this.getEvolutionChain(germanName);
    return evolutions.length > 0;
  },

  /**
   * Überprüft ob die PokeAPI erreichbar ist
   * @returns Promise<boolean>
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/pokemon/1`);
      return response.ok;
    } catch (error) {
      console.error('PokeAPI health check failed:', error);
      return false;
    }
  }
};