// Image Generation Service für Trainer-Bilder
// Kann mit verschiedenen AI-APIs erweitert werden

export interface ImageGenerationOptions {
  prompt: string;
  style?: 'anime' | 'realistic' | 'cartoon';
  size?: '256' | '512' | '1024';
  apiKey?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: string;
}

export const imageGenerationService = {
  /**
   * Generiert ein Trainer-Bild basierend auf Beschreibung
   */
  async generateTrainerImage(
    trainerName: string, 
    description: string,
    options: Partial<ImageGenerationOptions> = {}
  ): Promise<ImageGenerationResult> {
    // Erstelle optimierten Prompt für Trainer-Bilder
    const prompt = this.createTrainerPrompt(trainerName, description, options.style || 'anime');
    
    // Placeholder-Implementation
    // In einer echten Anwendung würde hier eine AI-API wie DALL-E, Midjourney, oder Stable Diffusion aufgerufen
    throw new Error(
      'AI-Bildgenerierung noch nicht implementiert.\n\n' +
      'Für echte Implementierung können folgende APIs verwendet werden:\n' +
      '• OpenAI DALL-E API\n' +
      '• Stability AI API\n' +
      '• Midjourney API\n' +
      '• Local Stable Diffusion\n\n' +
      'Verwende vorerst Upload oder URL-Eingabe.'
    );
  },

  /**
   * Erstellt optimierten Prompt für Trainer-Bilder
   */
  createTrainerPrompt(name: string, description: string, style: string = 'anime'): string {
    let prompt = '';
    
    // Basis-Prompt je nach Stil
    switch (style) {
      case 'anime':
        prompt = 'anime style Pokemon trainer portrait, ';
        break;
      case 'realistic':
        prompt = 'realistic Pokemon trainer portrait, photographic style, ';
        break;
      case 'cartoon':
        prompt = 'cartoon style Pokemon trainer, colorful and friendly, ';
        break;
      default:
        prompt = 'Pokemon trainer portrait, ';
    }

    // Name hinzufügen
    prompt += `character named "${name}", `;

    // Beschreibung verarbeiten
    if (description && description.trim()) {
      const cleanDescription = description.trim().toLowerCase();
      prompt += `${cleanDescription}, `;
    }

    // Standard-Eigenschaften für Pokemon-Trainer
    prompt += 'confident pose, Pokemon world setting, high quality, detailed, ';
    
    // Stil-spezifische Zusätze
    switch (style) {
      case 'anime':
        prompt += 'studio quality, vibrant colors, clean lines';
        break;
      case 'realistic':
        prompt += 'sharp focus, good lighting, professional photography';
        break;
      case 'cartoon':
        prompt += 'bright colors, cheerful expression, fun atmosphere';
        break;
    }

    return prompt;
  },

  /**
   * Validiert Bild-URL
   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      if (!url || !url.startsWith('http')) {
        return false;
      }

      // Prüfe ob URL ein Bild ist
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      return response.ok && !!contentType?.startsWith('image/');
    } catch {
      return false;
    }
  },

  /**
   * Konvertiert File zu Data URL
   */
  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Datei ist kein Bild'));
        return;
      }

      // Größenprüfung (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Datei ist zu groß (Maximum: 5MB)'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei'));
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Verfügbare Bild-Generierungs-APIs (für zukünftige Implementierung)
   */
  getAvailableAPIs(): Array<{
    name: string;
    description: string;
    requiresApiKey: boolean;
    website: string;
  }> {
    return [
      {
        name: 'OpenAI DALL-E',
        description: 'Hochqualitative AI-Bildgenerierung von OpenAI',
        requiresApiKey: true,
        website: 'https://openai.com/dall-e-2/'
      },
      {
        name: 'Stability AI',
        description: 'Stable Diffusion API für flexible Bildgenerierung',
        requiresApiKey: true,
        website: 'https://stability.ai/'
      },
      {
        name: 'Midjourney',
        description: 'Künstlerische AI-Bildgenerierung (Discord Bot)',
        requiresApiKey: true,
        website: 'https://midjourney.com/'
      },
      {
        name: 'Hugging Face',
        description: 'Kostenlose AI-Modelle und APIs',
        requiresApiKey: false,
        website: 'https://huggingface.co/'
      }
    ];
  }
};