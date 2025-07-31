import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pokemon, PokemonFormData } from '../types/pokemon';
import { Trainer } from '../types/trainer';
import { trainerService } from '../firebase/trainerService';


// Pokemon type options
const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
  'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

// Experience system: 0-10 points
const MIN_EXP = 0;
const MAX_EXP = 10;

const PokemonDetail: React.FC = () => {
  const { trainerId, pokemonIndex } = useParams<{ trainerId: string; pokemonIndex: string }>();
  const navigate = useNavigate();
  
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editForm, setEditForm] = useState<PokemonFormData>({
    name: '',
    level: '',
    exp: '',
    type: '',
    secondaryType: '',
    species: ''
  });

  useEffect(() => {
    if (trainerId && pokemonIndex !== undefined) {
      loadPokemonData();
    }
  }, [trainerId, pokemonIndex]);

  const loadPokemonData = async () => {
    try {
      const trainers = await trainerService.getAllTrainers();
      const foundTrainer = trainers.find(t => t.id === trainerId);
      
      if (!foundTrainer) {
        navigate('/');
        return;
      }

      const pokemonIdx = parseInt(pokemonIndex!);
      if (isNaN(pokemonIdx) || !foundTrainer.team || pokemonIdx >= foundTrainer.team.length) {
        navigate(`/trainer/${trainerId}`);
        return;
      }

      const foundPokemon = foundTrainer.team[pokemonIdx];
      setTrainer(foundTrainer);
      setPokemon(foundPokemon);
      
      // Initialize form data
      setEditForm({
        name: foundPokemon.name,
        level: foundPokemon.level?.toString() || '1',
        exp: foundPokemon.exp?.toString() || '0',
        type: foundPokemon.type || '',
        secondaryType: foundPokemon.secondaryType || '',
        species: foundPokemon.species || foundPokemon.name
      });
      
    } catch (error) {
      console.error('Error loading Pokemon data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof PokemonFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!trainer || !pokemon || pokemonIndex === undefined) return;
    
    setSaving(true);
    try {
      const updatedPokemon: Pokemon = {
        ...pokemon,
        name: editForm.name.trim(),
        level: parseInt(editForm.level) || 1,
        exp: parseInt(editForm.exp) || 0,
        type: editForm.type || undefined,
        secondaryType: editForm.secondaryType || undefined,
        species: editForm.species.trim() || editForm.name.trim()
      };

      const updatedTeam = [...(trainer.team || [])];
      updatedTeam[parseInt(pokemonIndex)] = updatedPokemon;
      
      const updatedTrainer = { ...trainer, team: updatedTeam };
      
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      
      setPokemon(updatedPokemon);
      setTrainer(updatedTrainer);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving Pokemon:', error);
      alert('Fehler beim Speichern der Pokemon-Daten');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExp = (amount: number) => {
    const currentExp = parseInt(editForm.exp) || 0;
    const newExp = Math.max(MIN_EXP, Math.min(MAX_EXP, currentExp + amount));
    handleFormChange('exp', newExp.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Lade Pokemon-Daten...</div>
      </div>
    );
  }

  if (!trainer || !pokemon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Pokemon nicht gefunden</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/trainer/${trainerId}`)}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Zurück zu {trainer.name}
          </button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {editMode ? 'Pokemon bearbeiten' : 'Pokemon Details'}
            </h1>
            <button
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              disabled={saving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editMode 
                  ? 'bg-success-500 text-white hover:bg-success-600'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? 'Speichert...' : editMode ? 'Speichern' : 'Bearbeiten'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pokemon Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              {pokemon.imageUrl && (
                <img 
                  src={pokemon.imageUrl} 
                  alt={`${pokemon.name} sprite`}
                  className="w-48 h-48 mx-auto mb-4 pixelated"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              
              {editMode ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="text-2xl font-bold text-center w-full border-b-2 border-primary-500 focus:outline-none"
                  placeholder="Pokemon Name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{pokemon.name}</h2>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level:
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editForm.level}
                      onChange={(e) => handleFormChange('level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-primary-600">
                      Level {pokemon.level || 1}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ:
                  </label>
                  {editMode ? (
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={editForm.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Typ 1 wählen...</option>
                        {POKEMON_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <select
                        value={editForm.secondaryType}
                        onChange={(e) => handleFormChange('secondaryType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Typ 2 (optional)</option>
                        {POKEMON_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {pokemon.type || 'Unbekannt'}
                      {pokemon.secondaryType && ` / ${pokemon.secondaryType}`}
                    </p>
                  )}
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spezies:
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editForm.species}
                    onChange={(e) => handleFormChange('species', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Pokemon Spezies"
                  />
                ) : (
                  <p className="text-gray-600">{pokemon.species || pokemon.name}</p>
                )}
              </div>

            </div>
          </div>

          {/* Experience Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Erfahrung</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktuelle EXP:
                </label>
                {editMode ? (
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editForm.exp}
                    onChange={(e) => handleFormChange('exp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-primary-600">
                    {pokemon.exp || 0}/10 EXP
                  </p>
                )}
              </div>

              {/* EXP Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>0 EXP</span>
                  <span>10 EXP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${(parseInt(editForm.exp) || 0) * 10}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {parseInt(editForm.exp) || 0} von 10 Erfahrungspunkten
                </p>
              </div>

              {/* EXP Quick Add Buttons */}
              {editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EXP ändern:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAddExp(1)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      +1 EXP
                    </button>
                    <button
                      onClick={() => handleAddExp(3)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      +3 EXP
                    </button>
                    <button
                      onClick={() => handleAddExp(5)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      +5 EXP
                    </button>
                    <button
                      onClick={() => handleAddExp(-1)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      -1 EXP
                    </button>
                    <button
                      onClick={() => handleAddExp(-3)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      -3 EXP
                    </button>
                    <button
                      onClick={() => handleAddExp(-5)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      -5 EXP
                    </button>
                  </div>
                </div>
              )}

              {/* Stats Preview */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">HP:</span>
                    <span>{pokemon.stats?.hp || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Angriff:</span>
                    <span>{pokemon.stats?.attack || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verteidigung:</span>
                    <span>{pokemon.stats?.defense || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Geschwindigkeit:</span>
                    <span>{pokemon.stats?.speed || '---'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;