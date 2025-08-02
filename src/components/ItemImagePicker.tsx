import React, { useState, useEffect } from 'react';
import { itemsService, PokemonItem, ItemsByCategory } from '../services/itemsService';

interface ItemImagePickerProps {
  onImageSelect: (imageUrl: string, itemName?: string, description?: string) => void;
  selectedImageUrl?: string;
  onCancel: () => void;
}

const ItemImagePicker: React.FC<ItemImagePickerProps> = ({
  onImageSelect,
  selectedImageUrl,
  onCancel
}) => {
  const [itemsByCategory, setItemsByCategory] = useState<ItemsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<PokemonItem[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [itemsByCategory, selectedCategory, searchQuery]); // filterItems is called inline, so it's safe to ignore this warning

  const loadItems = async () => {
    try {
      const items = await itemsService.getItemsByCategory();
      setItemsByCategory(items);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let items: PokemonItem[] = [];

    if (selectedCategory === 'all') {
      // Get all items from all categories
      items = Object.values(itemsByCategory).flat();
    } else {
      // Get items from selected category
      items = itemsByCategory[selectedCategory] || [];
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.display_name.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    setFilteredItems(items);
  };

  const handleItemSelect = (item: PokemonItem) => {
    onImageSelect(item.image_url, item.display_name, item.description);
  };

  const categories = Object.keys(itemsByCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Lade Items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Pokemon Item auswählen</h4>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Items suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">Alle Kategorien</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {itemsService.getCategoryDisplayName(category)}
            </option>
          ))}
        </select>
      </div>

      {/* Items Grid */}
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'Keine Items gefunden' : 'Keine Items verfügbar'}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemSelect(item)}
                className={`group relative p-2 rounded-lg border-2 transition-all hover:bg-gray-50 ${
                  selectedImageUrl === item.image_url
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={`${item.display_name} - ${item.description.substring(0, 100)}...`}
              >
                <div className="aspect-square flex items-center justify-center">
                  <img
                    src={item.image_url}
                    alt={item.display_name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1 truncate">
                  {item.display_name}
                </div>
                
                {/* Selection indicator */}
                {selectedImageUrl === item.image_url && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 text-center">
        {filteredItems.length} Items verfügbar
        {searchQuery && ` (gefiltert nach "${searchQuery}")`}
      </div>
    </div>
  );
};

export default ItemImagePicker;