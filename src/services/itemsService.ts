/**
 * Items Service
 * 
 * Service for loading and managing Pokemon item data from the catalog
 */

export interface PokemonItem {
  id: number;
  name: string;
  display_name: string;
  category: string;
  filename: string;
  description: string;
  cost: number;
  image_url: string;
}

export interface ItemsByCategory {
  [category: string]: PokemonItem[];
}

class ItemsService {
  private itemsCatalog: PokemonItem[] | null = null;
  private itemsByCategory: ItemsByCategory | null = null;

  /**
   * Load the items catalog from the JSON file
   */
  async loadItemsCatalog(): Promise<PokemonItem[]> {
    if (this.itemsCatalog) {
      return this.itemsCatalog;
    }

    try {
      const response = await fetch('/items/items_catalog.json');
      if (!response.ok) {
        throw new Error(`Failed to load items catalog: ${response.status}`);
      }
      
      this.itemsCatalog = await response.json();
      return this.itemsCatalog || [];
    } catch (error) {
      console.error('Error loading items catalog:', error);
      return [];
    }
  }

  /**
   * Get all items organized by category
   */
  async getItemsByCategory(): Promise<ItemsByCategory> {
    if (this.itemsByCategory) {
      return this.itemsByCategory;
    }

    const items = await this.loadItemsCatalog();
    this.itemsByCategory = {};

    for (const item of items) {
      const category = item.category;
      if (!this.itemsByCategory[category]) {
        this.itemsByCategory[category] = [];
      }
      this.itemsByCategory[category].push(item);
    }

    return this.itemsByCategory;
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    const itemsByCategory = await this.getItemsByCategory();
    return Object.keys(itemsByCategory).sort();
  }

  /**
   * Search items by name
   */
  async searchItems(query: string): Promise<PokemonItem[]> {
    const items = await this.loadItemsCatalog();
    const lowercaseQuery = query.toLowerCase();
    
    return items.filter(item => 
      item.display_name.toLowerCase().includes(lowercaseQuery) ||
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get a specific item by name
   */
  async getItemByName(name: string): Promise<PokemonItem | null> {
    const items = await this.loadItemsCatalog();
    return items.find(item => item.name === name || item.display_name === name) || null;
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'pokeballs': 'Pokébälle',
      'potions': 'Tränke',
      'status_healing': 'Status-Heilung',
      'revival': 'Wiederbelebung',
      'drinks': 'Getränke',
      'berries': 'Beeren'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }
}

export const itemsService = new ItemsService();