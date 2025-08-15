import { 
  AIGenerationSettings, 
  GeneratedTrainerData, 
  GeminiTrainerResponse,
  GenerationProgress,
  TrainerPersonality,
  PokemonType,
  EnrichedTrainerData,
  RegionOption
} from '../types/aiTrainer';
import { RegionService } from './regionService';
import { TalentPointService } from './talentPointService';
import { PokemonEnricher } from './pokemonEnricher';
import { imageGenerationService } from './imageGenerationService';

export interface GeminiContent {
  parts: Array<{
    text: string;
  }>;
  role?: 'user' | 'model';
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export class GeminiService {
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
  private static readonly DEFAULT_MODEL = 'gemini-1.5-flash';
  private static readonly MAX_TOKENS = 1000;
  private static readonly MAX_TRAINER_TOKENS = 2000;

  static async sendMessage(
    message: string,
    systemPrompt?: string,
    apiKey?: string
  ): Promise<GeminiResponse> {
    const finalApiKey = apiKey || process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!finalApiKey) {
      throw new Error('Gemini API key is required. Please set REACT_APP_GEMINI_API_KEY environment variable.');
    }

    const contents: GeminiContent[] = [];
    
    // Combine system prompt with user message if provided
    let finalMessage = message;
    if (systemPrompt) {
      finalMessage = `${systemPrompt}\n\n${message}`;
    }
    
    // Add user message
    contents.push({
      parts: [{ text: finalMessage }],
      role: 'user'
    });

    const request: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: this.MAX_TOKENS,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }
      ]
    };

    try {
      const response = await fetch(`${this.API_URL}?key=${finalApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.error?.details || response.statusText;
        throw new Error(
          `Gemini API error: ${response.status} - ${errorMessage}. Stelle sicher, dass dein API Key gültig ist und das Modell verfügbar ist.`
        );
      }

      const data: GeminiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  static extractTextFromResponse(response: GeminiResponse): string {
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No response candidates found');
    }
    
    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('No content found in response');
    }
    
    return candidate.content.parts
      .map(part => part.text)
      .join('');
  }

  static async askGemini(
    message: string,
    systemPrompt?: string,
    apiKey?: string
  ): Promise<string> {
    const response = await this.sendMessage(message, systemPrompt, apiKey);
    return this.extractTextFromResponse(response);
  }

  static async askGeminiWithHighTokens(
    message: string,
    systemPrompt?: string,
    apiKey?: string
  ): Promise<string> {
    const finalApiKey = apiKey || process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!finalApiKey) {
      throw new Error('Gemini API key is required. Please set REACT_APP_GEMINI_API_KEY environment variable.');
    }

    const contents: GeminiContent[] = [];
    
    // Combine system prompt with user message if provided
    let finalMessage = message;
    if (systemPrompt) {
      finalMessage = `${systemPrompt}\n\n${message}`;
    }
    
    // Add user message
    contents.push({
      parts: [{ text: finalMessage }],
      role: 'user'
    });

    const request: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: this.MAX_TRAINER_TOKENS,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }
      ]
    };

    try {
      const response = await fetch(`${this.API_URL}?key=${finalApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.error?.details || response.statusText;
        throw new Error(
          `Gemini API error: ${response.status} - ${errorMessage}. Stelle sicher, dass dein API Key gültig ist und das Modell verfügbar ist.`
        );
      }

      const data: GeminiResponse = await response.json();
      return this.extractTextFromResponse(data);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  static async generatePokemonStory(trainerName: string, apiKey?: string): Promise<string> {
    const systemPrompt = `Du bist ein kreativer Pokemon-Story-Generator. Erstelle kurze, unterhaltsame Geschichten über Pokemon-Trainer und ihre Abenteuer. Die Geschichten sollen auf Deutsch sein und etwa 2-3 Sätze lang.`;
    
    const userMessage = `Erstelle eine kurze Geschichte über den Pokemon-Trainer ${trainerName} und ein spannendes Abenteuer.`;
    
    return this.askGemini(userMessage, systemPrompt, apiKey);
  }

  static async analyzePokemonTeam(
    trainerData: { name: string; favoriteType?: string; location?: string },
    apiKey?: string
  ): Promise<string> {
    const systemPrompt = `Du bist ein Pokemon-Experte und Trainer-Berater. Analysiere Trainer-Profile und gib hilfreiche Tipps für Pokemon-Teams basierend auf den gegebenen Informationen.`;
    
    const userMessage = `Analysiere diesen Trainer: Name: ${trainerData.name}, Lieblings-Pokemon-Typ: ${trainerData.favoriteType || 'Nicht angegeben'}, Standort: ${trainerData.location || 'Unbekannt'}. Gib Empfehlungen für ein gutes Pokemon-Team.`;
    
    return this.askGemini(userMessage, systemPrompt, apiKey);
  }

  static async generatePokemonAdvice(question: string, apiKey?: string): Promise<string> {
    const systemPrompt = `Du bist ein freundlicher Pokemon-Experte. Beantworte Fragen über Pokemon, Kampfstrategien, und alles rund um die Pokemon-Welt auf Deutsch. Halte deine Antworten informativ aber nicht zu lang.`;
    
    return this.askGemini(question, systemPrompt, apiKey);
  }

  // AI Trainer Generation Methods
  static async generateTrainer(
    settings: AIGenerationSettings,
    userPrompt: string,
    onProgress?: (progress: GenerationProgress) => void,
    apiKey?: string
  ): Promise<GeneratedTrainerData> {
    try {
      // Report progress
      onProgress?.({
        step: 'generating_concept',
        message: 'Generiere Trainer-Konzept...',
        progress: 10
      });

      // Build comprehensive system prompt
      const systemPrompt = this.buildTrainerGenerationPrompt(settings);
      
      // Generate trainer concept with higher token limit
      const response = await this.askGeminiWithHighTokens(userPrompt, systemPrompt, apiKey);
      
      onProgress?.({
        step: 'creating_team',
        message: 'Erstelle Pokemon-Team...',
        progress: 50
      });

      // Parse and validate response
      const generatedData = this.parseTrainerResponse(response);
      
      onProgress?.({
        step: 'finalizing',
        message: 'Finalisiere Trainer...',
        progress: 90
      });

      // Apply generation rules and constraints
      const finalTrainer = this.applyGenerationRules(generatedData, settings);

      onProgress?.({
        step: 'finalizing',
        message: 'Trainer erfolgreich generiert!',
        progress: 100
      });

      return finalTrainer;
    } catch (error) {
      console.error('Error generating trainer:', error);
      throw new Error(`Trainer-Generierung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  private static buildTrainerGenerationPrompt(settings: AIGenerationSettings): string {
    const levelRange = RegionService.getLevelRange(settings.averageLevel, settings.levelVariance);
    
    // Ensure regions array exists and has content
    const regions = settings.regions || ['all'];
    const regionNames = regions.includes('all') 
      ? 'Alle Regionen'
      : regions.length > 0
        ? regions.map(id => {
            const region = RegionService.getRegionInfo(id);
            return region?.name || id;
          }).filter(Boolean).join(', ')
        : 'Alle Regionen';

    return `Du bist ein erfahrener Pokemon-Trainer-Generator. Erstelle basierend auf den gegebenen Einstellungen einen vollständigen Trainer mit Pokemon-Team.

WICHTIGE REGELN:
- Antworte NUR mit einem gültigen JSON-Objekt
- Kein zusätzlicher Text vor oder nach dem JSON
- Alle Pokemon müssen real existieren (keine erfundenen Namen)
- Level zwischen ${levelRange.min} und ${levelRange.max}
- Team-Größe: ${settings.teamSize} Pokemon
- Regionen: ${regionNames}
- Bevorzugter Typ: ${settings.preferredType === 'all' ? 'Alle Typen' : settings.preferredType}
- Persönlichkeit: ${settings.trainerPersonality}

JSON-SCHEMA (EXAKT SO VERWENDEN):
{
  "name": "string - Trainer Name",
  "description": "string - Kurze Beschreibung des Trainers (2-3 Sätze)",
  "personality": "${settings.trainerPersonality}",
  "pokemon": [
    {
      "name": "string - Exakter Pokemon Name (z.B. 'pikachu', 'charizard')",
      "level": number,
      "isShiny": boolean,
      "nickname": "string - Optional, kreativer Spitzname"
    }
  ],
  "backstory": "string - Optional, kurze Hintergrundgeschichte"
}

POKEMON-AUSWAHL REGELN:
- Verwende nur echte Pokemon-Namen in Kleinschreibung
- Regionen: ${regionNames} ${this.getRegionConstraints(regions)}
- Wenn Typ '${settings.preferredType}' gewählt: Mindestens 50% des Teams soll diesen Typ haben
- Shiny-Rate: ${settings.allowShiny ? '10%' : '0%'} (selten verwenden)
- Level-Verteilung: Durchschnitt ${settings.averageLevel} ± ${settings.levelVariance}

PERSÖNLICHKEITS-GUIDE:
- friendly: Süße, freundliche Pokemon (Normal, Fairy, Grass Typen bevorzugt)
- aggressive: Starke, einschüchternde Pokemon (Fighting, Dark, Dragon Typen)
- mysterious: Geheimnisvolle Pokemon (Psychic, Ghost, Dark Typen)
- professional: Strategische, meta-relevante Pokemon
- random: Völlig gemischte Auswahl

BEISPIEL-POKEMON FÜR REGIONEN ${(regionNames || 'ALLE').toUpperCase()}:
${this.getExamplePokemonForRegions(regions, settings.preferredType)}

Erstelle jetzt einen kreativen, aber regelkonformen Trainer basierend auf diesen Vorgaben.`;
  }

  private static getRegionConstraints(regions: RegionOption[]): string {
    if (regions.includes('all')) {
      return '(Pokemon ID 1-1025 aus allen Generationen)';
    }

    const constraints = regions.map(regionId => {
      const region = RegionService.getRegionInfo(regionId);
      if (!region) return '';
      
      const { start, end } = region.pokemonRange;
      return `${region.name}: Pokemon ID ${start}-${end}`;
    }).filter(Boolean);

    return `(${constraints.join(', ')})`;
  }

  private static getExamplePokemonForRegions(regions: RegionOption[], preferredType: PokemonType | 'all'): string {
    const examples: Record<string, string[]> = {
      kanto: ['pikachu', 'charizard', 'blastoise', 'venusaur', 'alakazam', 'machamp', 'gengar', 'dragonite'],
      johto: ['typhlosion', 'feraligatr', 'meganium', 'umbreon', 'espeon', 'skarmory', 'tyranitar', 'lugia'],
      hoenn: ['blaziken', 'swampert', 'sceptile', 'metagross', 'salamence', 'gardevoir', 'aggron', 'rayquaza'],
      sinnoh: ['infernape', 'empoleon', 'torterra', 'garchomp', 'dialga', 'palkia', 'darkrai', 'arceus'],
      unova: ['serperior', 'emboar', 'samurott', 'reshiram', 'zekrom', 'kyurem', 'volcarona', 'hydreigon'],
      kalos: ['greninja', 'talonflame', 'chesnaught', 'delphox', 'xerneas', 'yveltal', 'zygarde', 'goodra'],
      alola: ['decidueye', 'incineroar', 'primarina', 'solgaleo', 'lunala', 'necrozma', 'toxapex', 'mimikyu'],
      galar: ['rillaboom', 'cinderace', 'inteleon', 'dragapult', 'corviknight', 'toxapex', 'grimmsnarl', 'zacian'],
      paldea: ['meowscarada', 'skeledirge', 'quaquaval', 'gholdengo', 'annihilape', 'kingambit', 'koraidon', 'miraidon'],
      all: ['pikachu', 'charizard', 'lucario', 'garchomp', 'mewtwo', 'rayquaza', 'arceus', 'greninja']
    };

    if (regions.includes('all')) {
      return examples.all.join(', ');
    }

    // Combine examples from all selected regions
    const allExamples = new Set<string>();
    regions.forEach(region => {
      const regionExamples = examples[region] || [];
      regionExamples.forEach(pokemon => allExamples.add(pokemon));
    });

    return Array.from(allExamples).slice(0, 12).join(', ');
  }

  private static parseTrainerResponse(response: string): GeneratedTrainerData {
    try {
      // Clean response - remove any markdown formatting or extra text
      let cleanedResponse = response.trim();
      
      // Find JSON object in response
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON object found in response');
      }
      
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
      
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate required fields
      if (!parsed.name || !parsed.pokemon || !Array.isArray(parsed.pokemon)) {
        throw new Error('Invalid trainer structure: missing required fields');
      }
      
      // Validate Pokemon array
      for (const pokemon of parsed.pokemon) {
        if (!pokemon.name || typeof pokemon.level !== 'number') {
          throw new Error('Invalid Pokemon structure: missing name or level');
        }
      }
      
      return parsed as GeneratedTrainerData;
    } catch (error) {
      console.error('Failed to parse trainer response:', response);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  private static applyGenerationRules(
    data: GeneratedTrainerData, 
    settings: AIGenerationSettings
  ): GeneratedTrainerData {
    const levelRange = RegionService.getLevelRange(settings.averageLevel, settings.levelVariance);
    
    // Ensure team size constraints
    if (data.pokemon.length > settings.teamSize) {
      data.pokemon = data.pokemon.slice(0, settings.teamSize);
    }
    
    // Validate and adjust levels
    data.pokemon = data.pokemon.map(pokemon => ({
      ...pokemon,
      level: Math.max(levelRange.min, Math.min(levelRange.max, pokemon.level)),
      // Ensure reasonable shiny rate
      isShiny: settings.allowShiny ? (pokemon.isShiny && Math.random() < 0.1) : false
    }));
    
    // Ensure minimum team size
    while (data.pokemon.length < Math.min(settings.teamSize, 1)) {
      data.pokemon.push({
        name: 'pikachu',
        level: Math.floor((levelRange.min + levelRange.max) / 2),
        isShiny: false,
        nickname: undefined
      });
    }
    
    return data;
  }

  static async generateTrainerVariations(
    baseSettings: AIGenerationSettings,
    count: number = 3,
    onProgress?: (progress: GenerationProgress) => void,
    apiKey?: string
  ): Promise<GeneratedTrainerData[]> {
    const variations: GeneratedTrainerData[] = [];
    
    for (let i = 0; i < count; i++) {
      onProgress?.({
        step: 'generating_concept',
        message: `Generiere Trainer-Variation ${i + 1}/${count}...`,
        progress: (i / count) * 100
      });
      
      // Slightly modify settings for variety
      const variedSettings = {
        ...baseSettings,
        averageLevel: baseSettings.averageLevel + (Math.random() - 0.5) * 10,
        trainerPersonality: i === 0 ? baseSettings.trainerPersonality : 'random' as TrainerPersonality
      };
      
      const prompt = `Erstelle einen ${this.getRandomTrainerType()} Trainer mit einzigartiger Persönlichkeit.`;
      
      try {
        const trainer = await this.generateTrainer(variedSettings, prompt, undefined, apiKey);
        variations.push(trainer);
      } catch (error) {
        console.warn(`Failed to generate variation ${i + 1}:`, error);
      }
    }
    
    onProgress?.({
      step: 'finalizing',
      message: `${variations.length} Trainer-Variationen erstellt!`,
      progress: 100
    });
    
    return variations;
  }

  private static getRandomTrainerType(): string {
    const types = [
      'erfahrenen', 'freundlichen', 'mysteriösen', 'aggressiven', 'professionellen',
      'anfänger', 'veteran', 'gym leader', 'elite vier', 'forscher',
      'ranger', 'züchter', 'koordinator', 'kämpfer', 'sammler'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private static buildImagePrompt(trainer: GeneratedTrainerData, settings: AIGenerationSettings): string {
    // Build a descriptive prompt for the trainer image based on personality and description
    let prompt = `Pokemon trainer portrait, ${trainer.name}`;
    
    // Add personality-based styling
    switch (settings.trainerPersonality) {
      case 'friendly':
        prompt += ', friendly and cheerful person, warm smile, bright colors';
        break;
      case 'aggressive':
        prompt += ', tough and intimidating person, serious expression, dark colors';
        break;
      case 'mysterious':
        prompt += ', mysterious and enigmatic person, hood or cape, shadowy atmosphere';
        break;
      case 'professional':
        prompt += ', professional scientist or gym leader, clean uniform, confident pose';
        break;
      default:
        prompt += ', unique personality';
    }

    // Add preferred type theming
    if (settings.preferredType && settings.preferredType !== 'all') {
      const typeColors: Record<string, string> = {
        fire: 'red and orange colors',
        water: 'blue and aqua colors',
        grass: 'green and nature colors',
        electric: 'yellow and electric colors',
        psychic: 'purple and mystical colors',
        ice: 'light blue and white colors',
        dragon: 'purple and gold colors',
        dark: 'black and gray colors',
        fighting: 'brown and tan colors',
        poison: 'purple and green colors',
        ground: 'brown and earth colors',
        flying: 'sky blue and white colors',
        bug: 'green and brown colors',
        rock: 'gray and brown colors',
        ghost: 'purple and ethereal colors',
        steel: 'silver and metallic colors',
        fairy: 'pink and pastel colors',
        normal: 'neutral colors'
      };
      
      const typeColor = typeColors[settings.preferredType];
      if (typeColor) {
        prompt += `, ${typeColor}`;
      }
    }

    // Add description context if available
    if (trainer.description) {
      prompt += `, ${trainer.description}`;
    }

    // Add style requirements
    prompt += ', anime style, high quality, detailed face, Pokemon art style';

    return prompt;
  }

  // New method: Generate trainer with full Pokemon enrichment
  static async generateEnrichedTrainer(
    settings: AIGenerationSettings,
    userPrompt: string,
    onProgress?: (progress: GenerationProgress) => void,
    apiKey?: string
  ): Promise<EnrichedTrainerData> {
    try {
      // Step 1: Generate basic trainer concept
      onProgress?.({
        step: 'generating_concept',
        message: 'Generiere Trainer-Konzept...',
        progress: 10
      });

      const generatedTrainer = await this.generateTrainer(settings, userPrompt, undefined, apiKey);

      // Step 2: Enrich Pokemon with PokeAPI data
      onProgress?.({
        step: 'enriching_pokemon',
        message: 'Lade Pokemon-Daten von PokeAPI...',
        progress: 40
      });

      const enrichedPokemon = await PokemonEnricher.enrichTeamWithProgress(
        generatedTrainer.pokemon,
        (current, total, pokemonName) => {
          const progressPercent = 40 + (current / total) * 40; // 40-80%
          onProgress?.({
            step: 'enriching_pokemon',
            message: `Lade ${pokemonName} (${current}/${total})...`,
            progress: progressPercent
          });
        }
      );

      // Step 3: Apply talent points
      onProgress?.({
        step: 'calculating_stats',
        message: 'Berechne Talent-Punkte...',
        progress: 85
      });

      const pokemonWithTalentPoints = enrichedPokemon.map(pokemon => 
        PokemonEnricher.applyTalentPoints(pokemon, settings.statDistributionStyle)
      );

      // Step 4: Generate trainer image (if requested)
      let trainerImageUrl: string | undefined;
      if (settings.generateImage) {
        onProgress?.({
          step: 'generating_image',
          message: 'Generiere Trainer-Bild...',
          progress: 88
        });

        try {
          const imagePrompt = this.buildImagePrompt(generatedTrainer, settings);
          const imageResult = await imageGenerationService.generateTrainerImage(
            generatedTrainer.name, 
            generatedTrainer.description || '', 
            { style: 'anime' }
          );
          trainerImageUrl = imageResult.imageUrl;
        } catch (error) {
          console.warn('Failed to generate trainer image:', error);
          
          // Show a more specific progress message about the failure
          onProgress?.({
            step: 'generating_image',
            message: `Bildgenerierung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
            progress: 88
          });
          
          // Continue without image rather than failing the entire generation
        }
      }

      // Step 5: Create final enriched trainer
      onProgress?.({
        step: 'finalizing',
        message: 'Finalisiere Trainer...',
        progress: 95
      });

      const enrichedTrainer: EnrichedTrainerData = {
        id: `ai-generated-${Date.now()}`,
        name: generatedTrainer.name,
        description: generatedTrainer.description || '',
        imageUrl: trainerImageUrl,
        money: 1000,
        team: pokemonWithTalentPoints,
        items: [],
        createdAt: new Date().toISOString(),
        backstory: generatedTrainer.backstory,
        generationSettings: settings,
        validationSummary: {
          overall: 'valid',
          issues: [],
          autoCorrections: []
        }
      };

      // Step 6: Validate final result
      const validation = PokemonEnricher.validateEnrichedTeam(pokemonWithTalentPoints);
      if (!validation.isValid) {
        enrichedTrainer.validationSummary = {
          overall: 'error',
          issues: validation.errors.map(error => ({
            type: 'pokemon_not_found' as const,
            severity: 'error' as const,
            message: error
          })),
          autoCorrections: []
        };
      } else if (validation.warnings.length > 0) {
        enrichedTrainer.validationSummary = {
          overall: 'warning',
          issues: validation.warnings.map(warning => ({
            type: 'pokemon_not_found' as const,
            severity: 'warning' as const,
            message: warning
          })),
          autoCorrections: []
        };
      }

      onProgress?.({
        step: 'finalizing',
        message: 'Trainer erfolgreich erstellt!',
        progress: 100
      });

      return enrichedTrainer;

    } catch (error) {
      console.error('Error generating enriched trainer:', error);
      throw new Error(`Trainer-Generierung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  static validateTrainerData(data: GeneratedTrainerData): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic structure
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Trainer name is required');
    }

    if (!data.pokemon || !Array.isArray(data.pokemon)) {
      errors.push('Pokemon team is required and must be an array');
    } else {
      // Validate each Pokemon
      data.pokemon.forEach((pokemon, index) => {
        if (!pokemon.name || pokemon.name.trim().length === 0) {
          errors.push(`Pokemon ${index + 1}: Name is required`);
        }
        
        if (typeof pokemon.level !== 'number' || pokemon.level < 1 || pokemon.level > 100) {
          errors.push(`Pokemon ${index + 1}: Level must be between 1 and 100`);
        }
        
        if (pokemon.name && pokemon.name.length > 50) {
          warnings.push(`Pokemon ${index + 1}: Name is unusually long`);
        }
      });

      // Team size validation
      if (data.pokemon.length === 0) {
        errors.push('Team must have at least 1 Pokemon');
      // Teams can now have unlimited Pokemon - no warning needed
      }
    }

    // Validate personality
    const validPersonalities = ['friendly', 'aggressive', 'mysterious', 'professional', 'random'];
    if (data.personality && !validPersonalities.includes(data.personality)) {
      warnings.push('Unknown trainer personality');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}