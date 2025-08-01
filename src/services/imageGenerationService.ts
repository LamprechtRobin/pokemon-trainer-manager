/**
 * Hugging Face Image Generation Service
 * Generates cartoon-style trainer avatars using AI
 */

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: string;
}

class ImageGenerationService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';
  
  // Working models for text-to-image generation
  private readonly workingModels = [
    'black-forest-labs/FLUX.1-dev',          // Latest, most reliable
    'stabilityai/stable-diffusion-xl-base-1.0', // SDXL
    'runwayml/stable-diffusion-v1-5'         // Fallback
  ];

  constructor() {
    this.apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not found. Please set REACT_APP_HUGGINGFACE_API_KEY in .env.local');
    }
  }

  /**
   * Generate a cartoon-style trainer avatar
   */
  async generateTrainerAvatar(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const enhancedPrompt = this.enhancePromptForTrainer(options.prompt);
    const negativePrompt = options.negativePrompt || this.getDefaultNegativePrompt();

    try {
      const imageBlob = await this.callHuggingFaceAPI(enhancedPrompt, negativePrompt);
      const imageUrl = await this.blobToDataURL(imageBlob);

      return {
        imageUrl,
        prompt: enhancedPrompt,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error('Failed to generate trainer avatar. Please try again.');
    }
  }

  /**
   * Enhance user prompt for better avatar results
   */
  private enhancePromptForTrainer(userPrompt: string): string {
    const baseStyle = 'cartoon style, anime style, character avatar';
    const qualityTags = 'high quality, detailed, colorful, friendly face';
    const avatarSpecs = 'portrait, character design, solo person';
    
    return `${userPrompt}, ${baseStyle}, ${avatarSpecs}, ${qualityTags}`;
  }

  /**
   * Default negative prompt to avoid unwanted elements
   */
  private getDefaultNegativePrompt(): string {
    return 'blurry, low quality, distorted, ugly, scary, dark, nsfw, multiple people, crowd, realistic photo';
  }

  /**
   * Call Hugging Face Inference API with multiple model fallbacks
   */
  private async callHuggingFaceAPI(prompt: string, negativePrompt: string): Promise<Blob> {
    console.log(`API Key present: ${!!this.apiKey}`);
    console.log(`API Key starts with: ${this.apiKey.substring(0, 5)}...`);
    
    // Try each model until one works
    for (const model of this.workingModels) {
      console.log(`Trying model: ${model}`);
      const modelUrl = `${this.baseUrl}/${model}`;
      
      try {
        const requestBody = {
          inputs: prompt,
          options: {
            wait_for_model: true,
            use_cache: false
          }
        };

        console.log(`Request URL: ${modelUrl}`);
        console.log(`Request body:`, requestBody);
        
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log(`${model} - Response status: ${response.status}`);
        
        if (response.ok) {
          const blob = await response.blob();
          console.log(`Success with ${model}! Blob size: ${blob.size} bytes`);
          return blob;
        } else {
          const errorText = await response.text();
          console.log(`${model} failed: ${response.status} - ${errorText}`);
          
          // Continue to next model unless it's an auth error
          if (response.status === 401) {
            throw new Error('Invalid API key. Please check your Hugging Face token.');
          }
          // For other errors, try next model
          continue;
        }
      } catch (error) {
        console.log(`${model} error:`, error);
        // Try next model
        continue;
      }
    }
    
    // If all models failed, try a simple fallback approach
    return this.trySimpleFallback(prompt);
  }

  /**
   * Simple fallback using a definitely working model
   */
  private async trySimpleFallback(prompt: string): Promise<Blob> {
    console.log('Trying simple fallback approach...');
    
    // Use the most basic text-to-image model
    const modelUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2';
    
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fallback also failed:', response.status, errorText);
      throw new Error(`All models failed. Last error: ${response.status} - ${errorText}`);
    }

    return await response.blob();
  }

  /**
   * Convert blob to data URL for display
   */
  private async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get suggested prompts for diverse avatars
   */
  getPromptSuggestions(): string[] {
    return [
      'young person with brown hair and friendly smile',
      'woman with blue eyes and ponytail hairstyle',
      'man with baseball cap and adventure backpack',
      'person with red hair and determined expression',
      'cheerful character with green jacket',
      'cool person wearing sunglasses',
      'energetic character with spiky colorful hair',
      'person in sporty uniform outfit',
      'adventurous character with hiking gear',
      'smiling person with curly hair'
    ];
  }

  /**
   * Validate prompt for appropriate content
   */
  validatePrompt(prompt: string): { isValid: boolean; message?: string } {
    const minLength = 3;
    const maxLength = 200;

    if (prompt.length < minLength) {
      return { isValid: false, message: 'Prompt is too short. Please describe your trainer.' };
    }

    if (prompt.length > maxLength) {
      return { isValid: false, message: 'Prompt is too long. Please keep it under 200 characters.' };
    }

    // Check for inappropriate content (basic filtering)
    const inappropriate = ['nsfw', 'nude', 'sexual', 'violent'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const word of inappropriate) {
      if (lowerPrompt.includes(word)) {
        return { isValid: false, message: 'Please use appropriate content for trainer descriptions.' };
      }
    }

    return { isValid: true };
  }
}

export const imageGenerationService = new ImageGenerationService();