import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trainer, Item } from "../types/trainer";
import { Pokemon } from "../types/pokemon";
import { trainerService } from "../firebase/trainerService";
import PokemonSearch from "../components/PokemonSearch";
import ItemImagePicker from "../components/ItemImagePicker";
import Shop from "../components/Shop";
import { pokeApiService } from "../services/pokeapi";
import { attackService } from "../services/attackService";
import { evolutionService } from "../services/evolutionService";

const TrainerDetail: React.FC = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    money: "",
  });

  // Item management state
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [healingMessage, setHealingMessage] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'url' | 'picker'>('picker');
  const [newItem, setNewItem] = useState<{
    name: string;
    description: string;
    imageUrl: string;
  }>({
    name: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (trainerId) {
      loadTrainer();
    }
  }, [trainerId]);

  const loadTrainer = async () => {
    try {
      const trainers = await trainerService.getAllTrainers();
      const foundTrainer = trainers.find((t) => t.id === trainerId);

      if (foundTrainer) {
        setTrainer(foundTrainer);
        setEditForm({
          name: foundTrainer.name,
          description: foundTrainer.description || "",
          money: (foundTrainer.money || 0).toString(),
        });
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading trainer:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!trainer) return;

    try {
      const updatedTrainer = {
        ...trainer,
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        money: parseInt(editForm.money) || 0,
      };

      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating trainer:", error);
      alert("Fehler beim Speichern der Änderungen");
    }
  };

  const handleAddPokemon = async (pokemonName: string) => {
    if (!trainer) return;

    if ((trainer.team || []).length >= 6) {
      alert("Ein Trainer kann maximal 6 Pokemon haben!");
      return;
    }

    const startingLevel = 1; // Always start at level 1
    const startingExp = 0; // Always start with 0 EXP

    try {
      // Pokemon-Details von API laden
      const pokemonDetails = await pokeApiService.getPokemonDetails(
        pokemonName
      );

      // Standard-Attacke basierend auf primärem Typ ermitteln
      const defaultAttack = pokemonDetails?.type
        ? attackService.getDefaultAttackForType(pokemonDetails.type)
        : undefined;

      const evolutionData = evolutionService.getEvolutionData(pokemonName);

      const newPokemon: Pokemon = {
        name: pokemonName,
        level: startingLevel,
        exp: startingExp,
        type: pokemonDetails?.type || "❓ Unknown",
        species: pokemonName,
        talentPoints: {
          hp: 0,
          attack: 0,
          defense: 0,
          speed: 0,
        },
        talentPointsSpentOnAttacks: 0,
        learnedAttacks: defaultAttack ? [defaultAttack.id] : [],
        createdAt: new Date().toISOString(),
      };

      // Only add optional fields if they have values
      if (pokemonDetails?.secondaryType) {
        newPokemon.secondaryType = pokemonDetails.secondaryType;
      }
      if (pokemonDetails?.imageUrl) {
        newPokemon.imageUrl = pokemonDetails.imageUrl;
      }
      if (pokemonDetails?.stats) {
        newPokemon.stats = pokemonDetails.stats;
      }

      const updatedTeam = [...(trainer.team || []), newPokemon];
      const updatedTrainer = { ...trainer, team: updatedTeam };

      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
    } catch (error) {
      console.error("Error adding Pokemon:", error);
      alert("Fehler beim Hinzufügen des Pokemon");
    }
  };

  const handleRemovePokemon = async (index: number) => {
    if (!trainer) return;

    const updatedTeam = (trainer.team || []).filter((_, i) => i !== index);
    const updatedTrainer = { ...trainer, team: updatedTeam };

    try {
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
    } catch (error) {
      console.error("Error removing Pokemon:", error);
      alert("Fehler beim Entfernen des Pokemon");
    }
  };

  // Item management functions
  const handleAddItem = async () => {
    if (!trainer || !newItem.name.trim()) {
      alert("Item-Name ist erforderlich");
      return;
    }

    try {
      const itemName = newItem.name.trim();
      const existingItems = trainer.items || [];
      
      // Check if item already exists
      const existingItemIndex = existingItems.findIndex(
        item => item.name.toLowerCase() === itemName.toLowerCase()
      );

      let updatedItems: Item[];
      
      if (existingItemIndex >= 0) {
        // Item exists, increase quantity
        updatedItems = [...existingItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
      } else {
        // New item, add to inventory
        const item: Item = {
          name: itemName,
          description: newItem.description.trim() || "",
          imageUrl: newItem.imageUrl.trim() || undefined,
          quantity: 1,
          createdAt: new Date().toISOString(),
        };
        updatedItems = [...existingItems, item];
      }

      const updatedTrainer = { ...trainer, items: updatedItems };

      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
      
      // Reset form
      setNewItem({ name: "", description: "", imageUrl: "" });
      setShowAddItemForm(false);
      setShowImagePicker(false);
      setImageMode('picker');
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Fehler beim Hinzufügen des Items");
    }
  };

  const handleUpdateItemQuantity = async (index: number, newQuantity: number) => {
    if (!trainer) return;

    try {
      const updatedItems = [...(trainer.items || [])];
      
      if (newQuantity <= 0) {
        // Remove item completely if quantity is 0 or less
        updatedItems.splice(index, 1);
      } else {
        // Update quantity
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: newQuantity
        };
      }

      const updatedTrainer = { ...trainer, items: updatedItems };
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
    } catch (error) {
      console.error("Error updating item quantity:", error);
      alert("Fehler beim Aktualisieren der Item-Anzahl");
    }
  };

  const handleRemoveItem = async (index: number) => {
    if (!trainer) return;

    const updatedItems = (trainer.items || []).filter((_, i) => i !== index);
    const updatedTrainer = { ...trainer, items: updatedItems };

    try {
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Fehler beim Entfernen des Items");
    }
  };

  const handleImageSelect = (imageUrl: string, itemName?: string, description?: string) => {
    setNewItem(prev => ({
      ...prev,
      imageUrl,
      // Pre-fill name and description if they're empty and we have data from the picker
      name: prev.name || itemName || "",
      description: prev.description || description || "",
    }));
    setShowImagePicker(false);
  };

  const handleShopPurchase = async (updatedTrainer: Trainer) => {
    try {
      await trainerService.updateTrainer(trainer!.id!, updatedTrainer);
      setTrainer(updatedTrainer);
    } catch (error) {
      console.error("Error saving shop purchase:", error);
      alert("Fehler beim Speichern des Kaufs");
    }
  };

  const handlePokeCenterHealing = async () => {
    if (!trainer || !trainer.team || trainer.team.length === 0) {
      alert("Keine Pokemon zum Heilen vorhanden");
      return;
    }

    try {
      const healedTeam = trainer.team.map(pokemon => {
        // Skip permanently dead Pokemon
        if (pokemon.isDead) {
          return pokemon;
        }

        // Heal Pokemon by removing currentHp (so it defaults to max HP)
        const healedPokemon = { ...pokemon };
        delete healedPokemon.currentHp;
        return healedPokemon;
      });

      const updatedTrainer = { ...trainer, team: healedTeam };
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);

      // Count healed Pokemon
      const healedCount = trainer.team.filter(pokemon => !pokemon.isDead).length;
      const deadCount = trainer.team.filter(pokemon => pokemon.isDead).length;
      
      let message = `🏥 ${healedCount} Pokemon wurden vollständig geheilt!`;
      if (deadCount > 0) {
        message += ` (${deadCount} permanent tote Pokemon konnten nicht geheilt werden)`;
      }
      
      setHealingMessage(message);
      setTimeout(() => setHealingMessage(null), 3000);
    } catch (error) {
      console.error("Error healing team:", error);
      alert("Fehler beim Heilen des Teams");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Lade Trainer...</div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Trainer nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Zurück zur Übersicht
          </button>

          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {editMode ? "Trainer bearbeiten" : "Trainer Details"}
            </h1>
            <div className="flex flex-col sm:flex-row gap-2">
              {!editMode && (trainer.team || []).length > 0 && (
                <button
                  onClick={() => navigate(`/battle/${trainerId}`)}
                  className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  ⚔️ Battle Mode
                </button>
              )}
              <button
                onClick={() => (editMode ? handleSaveEdit() : setEditMode(true))}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors ${
                  editMode
                    ? "bg-success-500 text-white hover:bg-success-600"
                    : "bg-primary-500 text-white hover:bg-primary-600"
                }`}
              >
                {editMode ? "Speichern" : "Bearbeiten"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trainer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              {trainer.imageUrl && (
                <img
                  src={trainer.imageUrl}
                  alt={`${trainer.name} avatar`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 mx-auto mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              {editMode ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="text-2xl font-bold text-center w-full border-b-2 border-primary-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {trainer.name}
                </h2>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung:
                </label>
                {editMode ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Beschreibung des Trainers..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {trainer.description || "Keine Beschreibung vorhanden"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geld:
                </label>
                {editMode ? (
                  <input
                    type="number"
                    value={editForm.money}
                    onChange={(e) =>
                      setEditForm({ ...editForm, money: e.target.value })
                    }
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                ) : (
                  <p className="text-gray-600 font-medium">
                    ₽ {(trainer.money || 0).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Team: {(trainer.team || []).length}/6 Pokemon
                </p>
              </div>
            </div>
          </div>

          {/* Pokemon Team Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Pokemon Team
            </h3>

            {/* Add Pokemon Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Pokemon hinzufügen
              </h4>
              <PokemonSearch
                onSelect={handleAddPokemon}
                placeholder="Pokemon suchen (z.B. 'Pika' für Pikachu)..."
                disabled={(trainer.team || []).length >= 6}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {(trainer.team || []).length >= 6
                    ? "Team ist voll (6/6)"
                    : `Noch ${6 - (trainer.team || []).length} Plätze frei`}
                </p>
                <p className="text-xs text-gray-400">
                  Alle Generationen • Deutsche Namen
                </p>
              </div>
            </div>

            {/* Current Team */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Aktuelles Team</h4>
                {(trainer.team || []).length > 0 && (
                  <button
                    onClick={handlePokeCenterHealing}
                    className="px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    🏥 PokéCenter
                  </button>
                )}
              </div>
              {(trainer.team || []).length === 0 ? (
                <p className="text-gray-500 italic">
                  Noch keine Pokemon im Team
                </p>
              ) : (
                <div className="space-y-2">
                  {trainer.team!.map((pokemon, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        navigate(`/pokemon/${trainerId}/${index}`)
                      }
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {pokemon.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pokemon.level && `Level ${pokemon.level}`}
                          {pokemon.exp !== undefined &&
                            ` • ${pokemon.exp}/10 EXP`}
                          {pokemon.type &&
                            pokemon.type !== "❓ Unknown" &&
                            ` • ${pokemon.type}`}
                          {pokemon.secondaryType &&
                            ` / ${pokemon.secondaryType}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Klicken für Details →
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePokemon(index);
                        }}
                        className="px-3 py-1 bg-danger-500 text-white text-sm rounded hover:bg-danger-600 transition-colors"
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Inventory - Separate Row */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Items Inventar
              </h3>
              <button
                onClick={() => setShowShop(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                🏪 Shop
              </button>
            </div>

            {/* Add Item Section */}
            <div className="mb-6">
              {!showAddItemForm ? (
                <button
                  onClick={() => setShowAddItemForm(true)}
                  className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  + Item hinzufügen
                </button>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <h4 className="font-medium text-gray-900">Neues Item</h4>
                  
                  <input
                    type="text"
                    placeholder="Item Name *"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  
                  <textarea
                    placeholder="Beschreibung"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
                  />
                  
                  {/* Image Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Item Bild
                    </label>
                    
                    {/* Image Mode Selector */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImageMode('picker');
                          setShowImagePicker(true);
                        }}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          imageMode === 'picker'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        🎮 Pokemon Item
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          imageMode === 'url'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        🔗 Eigene URL
                      </button>
                    </div>

                    {/* Image Preview */}
                    {newItem.imageUrl && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <img
                          src={newItem.imageUrl}
                          alt="Gewähltes Bild"
                          className="w-10 h-10 rounded object-contain border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="flex-1 text-sm text-gray-600">
                          Bild ausgewählt
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewItem({ ...newItem, imageUrl: "" })}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* URL Input (only when URL mode is selected) */}
                    {imageMode === 'url' && (
                      <input
                        type="url"
                        placeholder="Bild URL eingeben..."
                        value={newItem.imageUrl}
                        onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    )}

                    {/* Picker Button (only when picker mode is selected and no image chosen) */}
                    {imageMode === 'picker' && !newItem.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Pokemon Item auswählen...
                      </button>
                    )}
                  </div>

                  {/* Image Picker Modal */}
                  {showImagePicker && (
                    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                      <ItemImagePicker
                        onImageSelect={handleImageSelect}
                        selectedImageUrl={newItem.imageUrl}
                        onCancel={() => setShowImagePicker(false)}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddItem}
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Hinzufügen
                    </button>
                    <button
                      onClick={() => {
                        setShowAddItemForm(false);
                        setShowImagePicker(false);
                        setImageMode('picker');
                        setNewItem({ name: "", description: "", imageUrl: "" });
                      }}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Current Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Items ({(trainer.items || []).length} Typen, {(trainer.items || []).reduce((total, item) => total + (item.quantity || 1), 0)} Gesamt)
              </h4>
              {(trainer.items || []).length === 0 ? (
                <p className="text-gray-500 italic">
                  Noch keine Items im Inventar
                </p>
              ) : (
                <div className="space-y-2">
                  {trainer.items!.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateItemQuantity(index, (item.quantity || 1) - 1)}
                          className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center font-bold ${
                            !item.quantity || item.quantity <= 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          disabled={!item.quantity || item.quantity <= 1}
                          title={!item.quantity || item.quantity <= 1 ? 'Mindestens 1 Item erforderlich' : 'Anzahl verringern'}
                        >
                          −
                        </button>
                        
                        <div className="w-12 text-center">
                          <span className="font-medium text-gray-900">
                            {item.quantity || 1}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleUpdateItemQuantity(index, (item.quantity || 1) + 1)}
                          className="w-8 h-8 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center font-bold"
                          title="Anzahl erhöhen"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="px-3 py-1 bg-danger-500 text-white text-sm rounded hover:bg-danger-600 transition-colors"
                        title="Item komplett entfernen"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shop Modal */}
        {showShop && trainer && (
          <Shop
            trainer={trainer}
            onPurchase={handleShopPurchase}
            onClose={() => setShowShop(false)}
          />
        )}

        {/* Healing Message */}
        {healingMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm">
            <div className="flex items-center gap-2">
              <span>🏥</span>
              <span className="text-sm font-medium">{healingMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDetail;
