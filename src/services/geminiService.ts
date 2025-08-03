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
}