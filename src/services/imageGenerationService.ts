// Image Generation Service für Trainer-Bilder mit Runware API

// Generate UUIDv4 string
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface ImageGenerationOptions {
  prompt: string;
  style?: 'anime' | 'realistic' | 'cartoon';
  size?: '256' | '512' | '1024';
  width?: number;
  height?: number;
  apiKey?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: string;
}

export const imageGenerationService = {
  /**
   * Generiert ein Trainer-Bild basierend auf Beschreibung mit Runware API
   */
  async generateTrainerImage(
    trainerName: string, 
    description: string,
    options: Partial<ImageGenerationOptions> = {}
  ): Promise<ImageGenerationResult> {
    const apiKey = process.env.REACT_APP_RUNWARE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Runware API Key nicht gefunden. Bitte REACT_APP_RUNWARE_API_KEY in .env setzen.');
    }

    // Erstelle optimierten Prompt für Trainer-Bilder (immer anime style)
    const prompt = this.createTrainerPrompt(trainerName, description, 'anime');
    
    try {
      // Try the standard Runware API format first
      let requestBody, endpoint;
      
      // Format 1: Standard REST API format with HiDream-i1 Fast
      requestBody = [
        {
          taskType: "imageInference",
          taskUUID: generateUUID(),
          positivePrompt: prompt,
          model: "HiDream-i1-Fast",
          width: options.width || parseInt(options.size || '512'),
          height: options.height || parseInt(options.size || '512'),
          numberResults: 1,
          CFGScale: 7,
          steps: 20,
          seed: Math.floor(Math.random() * 1000000)
        }
      ];
      endpoint = 'https://api.runware.ai/v1/';

      console.log('Trying Runware API format 1:', requestBody);

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      // If first format fails, try alternative format
      if (!response.ok && response.status === 400) {
        console.log('Format 1 failed, trying format 2...');
        
        // Format 2: Alternative format - try different model name
        requestBody = {
          prompt: prompt,
          model: "hidream-i1-fast",
          width: options.width || parseInt(options.size || '512'),
          height: options.height || parseInt(options.size || '512'),
          num_images: 1,
          guidance_scale: 7,
          steps: 20,
          seed: Math.floor(Math.random() * 1000000)
        };
        endpoint = 'https://api.runware.ai/v1/images/generate';

        console.log('Trying Runware API format 2:', requestBody);

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
      }

      // If still failing, try simplified format
      if (!response.ok && response.status === 400) {
        console.log('Format 2 failed, trying format 3...');
        
        // Format 3: Simplified format - try another model variant
        requestBody = {
          positivePrompt: prompt,
          model: "HiDream-i1",
          taskType: "imageInference",
          taskUUID: generateUUID(),
          width: options.width || parseInt(options.size || '512'),
          height: options.height || parseInt(options.size || '512'),
          numberResults: 1
        };

        response = await fetch('https://api.runware.ai/v1/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([requestBody])
        });
      }

      // If format 3 fails, try most basic format (wrapped in array)
      if (!response.ok && response.status === 400) {
        console.log('Format 3 failed, trying format 4 (most basic)...');
        
        // Format 4: Most basic format - fallback to standard model
        requestBody = {
          taskType: "imageInference",
          positivePrompt: prompt,
          model: "runware:100@1",
          width: options.width || parseInt(options.size || '512'),
          height: options.height || parseInt(options.size || '512'),
          numberResults: 1,
          taskUUID: generateUUID()
        };
        endpoint = 'https://api.runware.ai/v1/';

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([requestBody])  // Must be array!
        });
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Runware API Error Response:', errorText);
        console.error('Failed request body:', requestBody);
        console.error('Failed endpoint:', endpoint);
        
        let errorMessage = `Runware API Error: ${response.status} - ${errorText}\n\n`;
        
        if (response.status === 400) {
          errorMessage += `Bad Request - Mögliche Ursachen:\n`;
          errorMessage += `- API-Format wird nicht unterstützt\n`;
          errorMessage += `- Ungültige Parameter im Request\n`;
          errorMessage += `- Model "HiDream-i1-Fast" nicht verfügbar\n`;
          errorMessage += `- Prompt zu lang oder enthält unerlaubte Inhalte\n\n`;
        } else if (response.status === 401) {
          errorMessage += `Authentifizierung fehlgeschlagen:\n`;
          errorMessage += `- API Key ungültig oder falsch konfiguriert\n`;
          errorMessage += `- API Key in .env Datei überprüfen\n\n`;
        } else if (response.status === 402) {
          errorMessage += `Bezahlung erforderlich:\n`;
          errorMessage += `- Runware-Guthaben aufgebraucht\n`;
          errorMessage += `- Zahlungsinformationen auf runware.ai aktualisieren\n\n`;
        }
        
        errorMessage += `Alle 4 API-Formate wurden getestet.`;
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Runware API Success! Response:', data);
      console.log('Used request format:', requestBody);
      console.log('Data array:', data.data);
      if (data.data && data.data.length > 0) {
        console.log('First data item:', data.data[0]);
        console.log('First data item keys:', Object.keys(data.data[0]));
      }
      
      // Handle different response formats
      let imageUrl = null;
      
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        imageUrl = result.imageURL || result.imagePath || result.image_url || result.url;
      } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Runware specific format: {data: [{...}]}
        const result = data.data[0];
        imageUrl = result.imageURL || result.imagePath || result.image_url || result.url || result.outputImageURL || result.outputURL;
      } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        imageUrl = data.images[0].url || data.images[0].imageURL;
      } else if (data.imageURL || data.imagePath || data.url) {
        imageUrl = data.imageURL || data.imagePath || data.url;
      }

      if (!imageUrl) {
        console.error('No image URL found in response:', data);
        throw new Error('Kein Bild-URL in der Runware API Antwort gefunden');
      }

      return {
        imageUrl: imageUrl,
        prompt: prompt,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Runware API Error:', error);
      throw new Error(`Bildgenerierung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  },

  /**
   * Erstellt optimierten Prompt für Trainer-Bilder
   */
  createTrainerPrompt(name: string, description: string, style: string = 'anime'): string {
    // If name is empty, treat description as custom prompt
    if (!name || name.trim() === '') {
      // Always ensure anime style for custom prompts
      let customPrompt = description.trim();
      if (!customPrompt.toLowerCase().includes('anime')) {
        customPrompt = `anime style, ${customPrompt}`;
      }
      return customPrompt;
    }
    
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
   * Verfügbare Bild-Generierungs-APIs
   */
  getAvailableAPIs(): Array<{
    name: string;
    description: string;
    requiresApiKey: boolean;
    website: string;
  }> {
    return [
      {
        name: 'Runware AI',
        description: 'Schnelle und hochqualitative AI-Bildgenerierung (AKTIV)',
        requiresApiKey: true,
        website: 'https://runware.ai/'
      },
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
      }
    ];
  }
};