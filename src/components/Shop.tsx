import React, { useState, useEffect } from 'react';
import { itemsService, PokemonItem } from '../services/itemsService';
import { Trainer, Item } from '../types/trainer';

interface ShopProps {
  trainer: Trainer;
  onPurchase: (updatedTrainer: Trainer) => void;
  onClose: () => void;
}

interface ShopItem extends PokemonItem {
  inStock: boolean;
}

// Essential items that should be available in the shop
const SHOP_ITEMS_CONFIG = [
  // Pokéballs - Essential for catching
  { name: 'poke-ball', price: 200, category: 'pokeballs' },
  { name: 'great-ball', price: 600, category: 'pokeballs' },
  { name: 'ultra-ball', price: 1200, category: 'pokeballs' },
  
  // Healing Items - Essential for battles
  { name: 'potion', price: 300, category: 'potions' },
  { name: 'super-potion', price: 700, category: 'potions' },
  { name: 'hyper-potion', price: 1500, category: 'potions' },
  { name: 'max-potion', price: 2500, category: 'potions' },
  
  // Status Healing - Important utilities
  { name: 'antidote', price: 100, category: 'status_healing' },
  { name: 'burn-heal', price: 250, category: 'status_healing' },
  { name: 'paralyze-heal', price: 200, category: 'status_healing' },
  { name: 'full-heal', price: 600, category: 'status_healing' },
  
  // Revival - Critical items
  { name: 'revive', price: 1500, category: 'revival' },
  { name: 'max-revive', price: 4000, category: 'revival' },
  
  // Berries - Natural healing
  { name: 'oran-berry', price: 80, category: 'berries' },
  { name: 'sitrus-berry', price: 200, category: 'berries' },
];

const Shop: React.FC<ShopProps> = ({ trainer, onPurchase, onClose }) => {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchaseQuantities, setPurchaseQuantities] = useState<{[itemName: string]: number}>({});

  useEffect(() => {
    loadShopItems();
  }, []);

  const loadShopItems = async () => {
    try {
      const itemsCatalog = await itemsService.loadItemsCatalog();
      
      const availableItems: ShopItem[] = SHOP_ITEMS_CONFIG.map(config => {
        const catalogItem = itemsCatalog.find(item => item.name === config.name);
        if (catalogItem) {
          return {
            ...catalogItem,
            cost: config.price, // Override with shop price
            inStock: true
          };
        }
        return null;
      }).filter(Boolean) as ShopItem[];

      setShopItems(availableItems);
      
      // Initialize purchase quantities
      const initialQuantities: {[itemName: string]: number} = {};
      availableItems.forEach(item => {
        initialQuantities[item.name] = 1;
      });
      setPurchaseQuantities(initialQuantities);
      
    } catch (error) {
      console.error('Error loading shop items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (selectedCategory === 'all') {
      return shopItems;
    }
    return shopItems.filter(item => item.category === selectedCategory);
  };

  const updateQuantity = (itemName: string, change: number) => {
    setPurchaseQuantities(prev => ({
      ...prev,
      [itemName]: Math.max(1, (prev[itemName] || 1) + change)
    }));
  };

  const getTotalCost = (item: ShopItem) => {
    return item.cost * (purchaseQuantities[item.name] || 1);
  };

  const canAfford = (item: ShopItem) => {
    return (trainer.money || 0) >= getTotalCost(item);
  };

  const handlePurchase = (item: ShopItem) => {
    const quantity = purchaseQuantities[item.name] || 1;
    const totalCost = getTotalCost(item);
    
    if (!canAfford(item)) {
      alert(`Nicht genug Geld! Du brauchst ₽${totalCost.toLocaleString()}, hast aber nur ₽${(trainer.money || 0).toLocaleString()}.`);
      return;
    }

    // Update trainer money
    const newMoney = (trainer.money || 0) - totalCost;
    
    // Update trainer items
    const existingItems = trainer.items || [];
    const existingItemIndex = existingItems.findIndex(
      trainerItem => trainerItem.name.toLowerCase() === item.display_name.toLowerCase()
    );

    let updatedItems: Item[];
    if (existingItemIndex >= 0) {
      // Item exists, increase quantity
      updatedItems = [...existingItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: (updatedItems[existingItemIndex].quantity || 1) + quantity
      };
    } else {
      // New item, add to inventory
      const newItem: Item = {
        name: item.display_name,
        description: item.description,
        imageUrl: item.image_url,
        quantity: quantity,
        createdAt: new Date().toISOString(),
      };
      updatedItems = [...existingItems, newItem];
    }

    const updatedTrainer = {
      ...trainer,
      money: newMoney,
      items: updatedItems
    };

    onPurchase(updatedTrainer);
    
    // Reset quantity after purchase
    setPurchaseQuantities(prev => ({
      ...prev,
      [item.name]: 1
    }));
  };

  const categories = ['all', ...Array.from(new Set(shopItems.map(item => item.category)))];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-center">Lade Shop...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">🏪 Pokemon Shop</h3>
            <p className="text-sm text-gray-600 mt-1">
              Verfügbares Geld: <span className="font-medium">₽{(trainer.money || 0).toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Alle' : itemsService.getCategoryDisplayName(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredItems().map((item) => {
              const quantity = purchaseQuantities[item.name] || 1;
              const totalCost = getTotalCost(item);
              const affordable = canAfford(item);

              return (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 transition-all ${
                    affordable ? 'border-gray-200 hover:border-primary-300' : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={item.image_url}
                      alt={item.display_name}
                      className="w-12 h-12 object-contain"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.display_name}</h4>
                      <p className="text-sm text-gray-600">₽{item.cost.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 mb-3">
                    {item.description.substring(0, 80)}...
                  </p>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => updateQuantity(item.name, -1)}
                      className="w-8 h-8 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center font-bold"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <div className="w-12 text-center">
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <button
                      onClick={() => updateQuantity(item.name, 1)}
                      className="w-8 h-8 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Total Cost */}
                  <div className="text-center mb-3">
                    <span className={`font-bold ${affordable ? 'text-gray-900' : 'text-red-600'}`}>
                      Gesamt: ₽{totalCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!affordable}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      affordable
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {affordable ? 'Kaufen' : 'Zu teuer'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {getFilteredItems().length} Items verfügbar
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;