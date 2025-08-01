import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trainer } from "../types/trainer";
import { Pokemon } from "../types/pokemon";
import { trainerService } from "../firebase/trainerService";
import PokemonSearch from "../components/PokemonSearch";
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
              <h4 className="font-medium text-gray-900 mb-3">Aktuelles Team</h4>
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
      </div>
    </div>
  );
};

export default TrainerDetail;
