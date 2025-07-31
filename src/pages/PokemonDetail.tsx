import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pokemon, PokemonFormData } from '../types/pokemon';
import { Trainer } from '../types/trainer';
import { Attack } from '../types/attack';
import { trainerService } from '../firebase/trainerService';
import { attackService } from '../services/attackService';
import { evolutionService } from '../services/evolutionService';
import { pokeApiService } from '../services/pokeapi';


// Pokemon type options
const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
  'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

// Experience system: 0-10 points
const MIN_EXP = 0;
const MAX_EXP = 10;

// Attack upgrade costs (in talent points)
const ATTACK_UPGRADE_COSTS = {
  TIER_1_TO_2: 25,
  TIER_2_TO_3: 50
};

const PokemonDetail: React.FC = () => {
  const { trainerId, pokemonIndex } = useParams<{ trainerId: string; pokemonIndex: string }>();
  const navigate = useNavigate();
  
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAttackSelection, setShowAttackSelection] = useState(false);
  const [attackSearchTerm, setAttackSearchTerm] = useState('');
  const [showEvolutionDialog, setShowEvolutionDialog] = useState(false);
  const [selectedEvolution, setSelectedEvolution] = useState('');
  
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
      
      // Ensure talent points and learned attacks exist
      let needsUpdate = false;
      let updatedPokemon = { ...foundPokemon };
      
      if (!foundPokemon.talentPoints) {
        updatedPokemon.talentPoints = { hp: 0, attack: 0, defense: 0, speed: 0 };
        needsUpdate = true;
      }
      
      if (foundPokemon.talentPointsSpentOnAttacks === undefined) {
        updatedPokemon.talentPointsSpentOnAttacks = 0;
        needsUpdate = true;
      }
      
      if (!foundPokemon.evolutionData && evolutionService.hasEvolutionData(foundPokemon.name)) {
        updatedPokemon.evolutionData = evolutionService.getEvolutionData(foundPokemon.name);
        needsUpdate = true;
      }
      
      if (!foundPokemon.learnedAttacks) {
        // Initialize with default attack based on type
        const defaultAttack = foundPokemon.type 
          ? attackService.getDefaultAttackForType(foundPokemon.type)
          : undefined;
        updatedPokemon.learnedAttacks = defaultAttack ? [defaultAttack.id] : [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        setPokemon(updatedPokemon);
      }
      
    } catch (error) {
      console.error('Error loading Pokemon data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof PokemonFormData, value: string) => {
    setEditForm(prev => {
      const newForm = { ...prev, [field]: value };
      
      // Auto-level up system when EXP changes
      if (field === 'exp') {
        const newExp = parseInt(value) || 0;
        const currentLevel = parseInt(prev.level) || 1;
        
        if (newExp >= 10) {
          // Level up: increase level and reduce EXP by 10
          const levelsToGain = Math.floor(newExp / 10);
          const remainingExp = newExp % 10;
          
          newForm.level = (currentLevel + levelsToGain).toString();
          newForm.exp = remainingExp.toString();
        }
      }
      
      return newForm;
    });
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
        species: editForm.species.trim() || editForm.name.trim(),
        talentPoints: pokemon.talentPoints || { hp: 0, attack: 0, defense: 0, speed: 0 },
        talentPointsSpentOnAttacks: pokemon.talentPointsSpentOnAttacks || 0,
        learnedAttacks: pokemon.learnedAttacks || []
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
    const currentLevel = parseInt(editForm.level) || 1;
    
    let newExp = currentExp + amount;
    let newLevel = currentLevel;
    
    // Handle level ups (when EXP >= 10)
    if (newExp >= 10) {
      const levelUps = Math.floor(newExp / 10);
      newLevel += levelUps;
      newExp = newExp % 10;
    }
    
    // Handle level downs (when EXP < 0 and level > 1)
    while (newExp < 0 && newLevel > 1) {
      newLevel--;
      newExp += 10;
    }
    
    // Ensure EXP stays within bounds
    newExp = Math.max(MIN_EXP, Math.min(MAX_EXP, newExp));
    
    setEditForm(prev => ({
      ...prev,
      level: newLevel.toString(),
      exp: newExp.toString()
    }));
  };

  // Talent Points System
  const getMaxTalentPoints = (): number => {
    const level = parseInt(editForm.level) || 1;
    return (level - 1) * 5;
  };

  const getUsedTalentPoints = (): number => {
    if (!pokemon?.talentPoints) return 0;
    return pokemon.talentPoints.hp + pokemon.talentPoints.attack + 
           pokemon.talentPoints.defense + pokemon.talentPoints.speed;
  };

  const getAvailableTalentPoints = (): number => {
    const maxPoints = getMaxTalentPoints();
    const usedOnStats = getUsedTalentPoints();
    const spentOnAttacks = pokemon?.talentPointsSpentOnAttacks || 0;
    return maxPoints - usedOnStats - spentOnAttacks;
  };

  const getMaxTalentPointsForStat = (stat: 'hp' | 'attack' | 'defense' | 'speed'): number => {
    const baseStat = pokemon?.stats?.[stat] || 0;
    return baseStat > 0 ? baseStat : 999; // If no base stat, allow up to 999 points
  };

  const handleTalentPointChange = (stat: 'hp' | 'attack' | 'defense' | 'speed', amount: number) => {
    if (!pokemon?.talentPoints) return;
    
    const currentPoints = pokemon.talentPoints[stat];
    const newPoints = currentPoints + amount;
    const availablePoints = getAvailableTalentPoints();
    const maxPointsForStat = getMaxTalentPointsForStat(stat);
    
    // Check bounds: can't go below 0, can't exceed available points, and can't exceed max for stat
    if (newPoints < 0) return;
    if (amount > 0 && availablePoints < amount) return;
    if (newPoints > maxPointsForStat) return;
    
    const updatedPokemon = {
      ...pokemon,
      talentPoints: {
        ...pokemon.talentPoints,
        [stat]: newPoints
      }
    };
    
    setPokemon(updatedPokemon);
  };

  // Attack Management
  const getLearnedAttacks = (): Attack[] => {
    if (!pokemon?.learnedAttacks) return [];
    return pokemon.learnedAttacks
      .map(attackId => attackService.getAttackById(attackId))
      .filter((attack): attack is Attack => attack !== undefined);
  };

  const getAvailableAttacks = (): Attack[] => {
    // Get all tier 1 (basic) attacks
    const basicAttacks = attackService.getAttacksByTier(1);
    const learnedAttackIds = pokemon?.learnedAttacks || [];
    let availableAttacks = basicAttacks.filter(attack => !learnedAttackIds.includes(attack.id));
    
    // Filter by search term
    if (attackSearchTerm.trim()) {
      const searchLower = attackSearchTerm.toLowerCase().trim();
      availableAttacks = availableAttacks.filter(attack => 
        attack.name.toLowerCase().includes(searchLower) ||
        attack.type.toLowerCase().includes(searchLower)
      );
    }
    
    return availableAttacks.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleLearnAttack = (attackId: string) => {
    if (!pokemon) return;
    
    const currentAttacks = pokemon.learnedAttacks || [];
    if (currentAttacks.length >= 4) {
      alert('Ein Pokemon kann maximal 4 Attacken lernen!');
      return;
    }
    
    if (currentAttacks.includes(attackId)) {
      alert('Diese Attacke wurde bereits gelernt!');
      return;
    }
    
    const updatedPokemon = {
      ...pokemon,
      learnedAttacks: [...currentAttacks, attackId]
    };
    
    setPokemon(updatedPokemon);
    setShowAttackSelection(false);
    setAttackSearchTerm(''); // Clear search when closing
  };

  const handleForgetAttack = (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack) return;
    
    // Calculate refund based on attack tier and upgrades spent
    let refund = 0;
    if (attack.tier === 2) {
      refund = ATTACK_UPGRADE_COSTS.TIER_1_TO_2; // Refund tier 1->2 upgrade
    } else if (attack.tier === 3) {
      refund = ATTACK_UPGRADE_COSTS.TIER_1_TO_2 + ATTACK_UPGRADE_COSTS.TIER_2_TO_3; // Refund both upgrades
    }
    
    const updatedAttacks = pokemon.learnedAttacks.filter(id => id !== attackId);
    
    // Reduce spent talent points on attacks
    const currentSpentOnAttacks = pokemon.talentPointsSpentOnAttacks || 0;
    const newSpentOnAttacks = Math.max(0, currentSpentOnAttacks - refund);
    
    const updatedPokemon = {
      ...pokemon,
      learnedAttacks: updatedAttacks,
      talentPointsSpentOnAttacks: newSpentOnAttacks
    };
    
    setPokemon(updatedPokemon);
  };

  // Attack Evolution System
  const getUpgradeCost = (fromTier: 1 | 2 | 3): number => {
    switch (fromTier) {
      case 1: return ATTACK_UPGRADE_COSTS.TIER_1_TO_2;
      case 2: return ATTACK_UPGRADE_COSTS.TIER_2_TO_3;
      default: return 0;
    }
  };

  const getDowngradeRefund = (fromTier: 1 | 2 | 3): number => {
    switch (fromTier) {
      case 2: return ATTACK_UPGRADE_COSTS.TIER_1_TO_2; // Refund for going from tier 2 to tier 1
      case 3: return ATTACK_UPGRADE_COSTS.TIER_2_TO_3; // Refund for going from tier 3 to tier 2
      default: return 0;
    }
  };

  const canUpgradeAttack = (attack: Attack): boolean => {
    if (!attack.evolvesTo) return false;
    const upgradeCost = getUpgradeCost(attack.tier);
    const availablePoints = getAvailableTalentPoints();
    return availablePoints >= upgradeCost;
  };

  const handleUpgradeAttack = (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack?.evolvesTo) return;
    
    const upgradeCost = getUpgradeCost(attack.tier);
    const availablePoints = getAvailableTalentPoints();
    
    if (availablePoints < upgradeCost) {
      alert(`Nicht genügend Talent Points! Benötigt: ${upgradeCost}, Verfügbar: ${availablePoints}`);
      return;
    }
    
    // Upgrade the attack
    const updatedAttacks = pokemon.learnedAttacks.map(id => 
      id === attackId ? attack.evolvesTo! : id
    );
    
    // Track talent points spent on attacks
    const currentSpentOnAttacks = pokemon.talentPointsSpentOnAttacks || 0;
    const newSpentOnAttacks = currentSpentOnAttacks + upgradeCost;
    
    const updatedPokemon = {
      ...pokemon,
      learnedAttacks: updatedAttacks,
      talentPointsSpentOnAttacks: newSpentOnAttacks
    };
    
    setPokemon(updatedPokemon);
  };

  const canDowngradeAttack = (attack: Attack): boolean => {
    return attack.tier > 1; // Can downgrade if not tier 1
  };

  const handleDowngradeAttack = (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack || attack.tier === 1) return;
    
    const previousAttack = attackService.getPreviousTierAttack(attackId);
    if (!previousAttack) return;
    
    const refund = getDowngradeRefund(attack.tier);
    
    // Downgrade the attack
    const updatedAttacks = pokemon.learnedAttacks.map(id => 
      id === attackId ? previousAttack.id : id
    );
    
    // Refund talent points by reducing spent on attacks
    const currentSpentOnAttacks = pokemon.talentPointsSpentOnAttacks || 0;
    const newSpentOnAttacks = Math.max(0, currentSpentOnAttacks - refund);
    
    const updatedPokemon = {
      ...pokemon,
      learnedAttacks: updatedAttacks,
      talentPointsSpentOnAttacks: newSpentOnAttacks
    };
    
    setPokemon(updatedPokemon);
  };

  // Evolution System
  const getAvailableEvolutions = (): string[] => {
    if (!pokemon) return [];
    return evolutionService.getEvolutionData(pokemon.name).evolutions;
  };

  const canEvolvePokemon = (): boolean => {
    if (!pokemon) return false;
    return evolutionService.getEvolutionData(pokemon.name).canEvolve;
  };

  const handleShowEvolution = () => {
    const availableEvolutions = getAvailableEvolutions();
    if (availableEvolutions.length === 1) {
      setSelectedEvolution(availableEvolutions[0]);
    }
    setShowEvolutionDialog(true);
  };

  const handleEvolvePokemon = async () => {
    if (!pokemon || !trainer || !selectedEvolution || pokemonIndex === undefined) return;
    
    setSaving(true);
    try {
      // Get evolution data from PokeAPI
      const evolutionDetails = await pokeApiService.getPokemonDetails(selectedEvolution);
      
      // Evolve the Pokemon - keep all stats and progress but change basic info
      const evolvedPokemon: Pokemon = {
        ...pokemon,
        name: selectedEvolution,
        species: selectedEvolution,
        type: evolutionDetails?.type || pokemon.type,
        secondaryType: evolutionDetails?.secondaryType || pokemon.secondaryType,
        imageUrl: evolutionDetails?.imageUrl || pokemon.imageUrl,
        stats: evolutionDetails?.stats || pokemon.stats,
        // Keep all progress: level, exp, talent points, learned attacks
        evolutionData: evolutionService.getEvolutionData(selectedEvolution)
      };

      const updatedTeam = [...(trainer.team || [])];
      updatedTeam[parseInt(pokemonIndex)] = evolvedPokemon;
      
      const updatedTrainer = { ...trainer, team: updatedTeam };
      
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      
      setPokemon(evolvedPokemon);
      setTrainer(updatedTrainer);
      
      // Update form data
      setEditForm(prev => ({
        ...prev,
        name: selectedEvolution,
        species: selectedEvolution,
        type: evolutionDetails?.type || prev.type,
        secondaryType: evolutionDetails?.secondaryType || prev.secondaryType
      }));
      
      setShowEvolutionDialog(false);
      setSelectedEvolution('');
      
      alert(`${pokemon.name} hat sich zu ${selectedEvolution} entwickelt! 🎉`);
    } catch (error) {
      console.error('Error evolving Pokemon:', error);
      alert('Fehler bei der Entwicklung des Pokemon');
    } finally {
      setSaving(false);
    }
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
            <div className="flex gap-2">
              {canEvolvePokemon() && (
                <button
                  onClick={handleShowEvolution}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🌟 Entwickeln
                </button>
              )}
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

              {/* Talent Points */}
              {editMode && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Talent Points</h4>
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">{getAvailableTalentPoints()}</span>
                      <span className="text-gray-500"> / </span>
                      <span className="text-gray-900">{getMaxTalentPoints()}</span>
                      <span className="text-gray-500 ml-1">verfügbar</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {(['hp', 'attack', 'defense', 'speed'] as const).map((stat) => {
                      const statNames = {
                        hp: 'HP',
                        attack: 'Angriff',
                        defense: 'Verteidigung',
                        speed: 'Geschwindigkeit'
                      };
                      
                      const talentPoints = pokemon?.talentPoints?.[stat] || 0;
                      const maxPointsForStat = getMaxTalentPointsForStat(stat);
                      const isMaxed = talentPoints >= maxPointsForStat;
                      const baseStat = pokemon?.stats?.[stat] || 0;
                      
                      return (
                        <div key={stat} className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">
                              {statNames[stat]}:
                            </span>
                            <span className={`ml-2 text-sm font-medium ${
                              isMaxed ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              +{talentPoints} Punkte
                            </span>
                            {baseStat > 0 && (
                              <span className="ml-1 text-xs text-gray-500">
                                (max: +{maxPointsForStat})
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleTalentPointChange(stat, -5)}
                              disabled={talentPoints < 5}
                              className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => handleTalentPointChange(stat, 5)}
                              disabled={getAvailableTalentPoints() < 5 || isMaxed}
                              className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                isMaxed 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats Preview */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(['hp', 'attack', 'defense', 'speed'] as const).map((stat) => {
                    const statNames = {
                      hp: 'HP',
                      attack: 'Angriff',
                      defense: 'Verteidigung',
                      speed: 'Geschwindigkeit'
                    };
                    
                    const baseStat = pokemon.stats?.[stat] || 0;
                    const talentPoints = pokemon?.talentPoints?.[stat] || 0;
                    const totalStat = baseStat + talentPoints;
                    const maxPointsForStat = getMaxTalentPointsForStat(stat);
                    const isMaxed = talentPoints >= maxPointsForStat && baseStat > 0;
                    
                    return (
                      <div key={stat} className="flex justify-between">
                        <span className="text-gray-600">{statNames[stat]}:</span>
                        <span>
                          {baseStat > 0 ? (
                            <>
                              <span className={`${
                                talentPoints > 0 
                                  ? isMaxed 
                                    ? 'text-red-600 font-bold' 
                                    : 'text-green-600 font-semibold'
                                  : ''
                              }`}>
                                {totalStat}
                              </span>
                              {talentPoints > 0 && (
                                <span className={`text-xs ml-1 ${
                                  isMaxed ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  (+{talentPoints})
                                </span>
                              )}
                              {isMaxed && (
                                <span className="text-red-500 text-xs ml-1 font-bold">
                                  MAX
                                </span>
                              )}
                            </>
                          ) : (
                            '---'
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Learned Attacks */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Gelernte Attacken</h4>
                  <div className="text-sm text-gray-500">
                    {getLearnedAttacks().length}/4
                  </div>
                </div>
                
                {editMode && (getLearnedAttacks().some(attack => attack.evolvesTo) || getLearnedAttacks().some(attack => attack.tier > 1)) && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-800 font-medium mb-1">Attacken-Management:</div>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>
                        <span className="font-medium">Upgrade:</span> Basis → Fortgeschritten: {ATTACK_UPGRADE_COSTS.TIER_1_TO_2} TP • 
                        Fortgeschritten → Meister: {ATTACK_UPGRADE_COSTS.TIER_2_TO_3} TP
                      </div>
                      <div>
                        <span className="font-medium">Downgrade:</span> Fortgeschritten → Basis: +{ATTACK_UPGRADE_COSTS.TIER_1_TO_2} TP • 
                        Meister → Fortgeschritten: +{ATTACK_UPGRADE_COSTS.TIER_2_TO_3} TP
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 mb-4">
                  {getLearnedAttacks().length === 0 ? (
                    <p className="text-gray-500 italic text-sm">Keine Attacken gelernt</p>
                  ) : (
                    getLearnedAttacks().map(attack => (
                      <div key={attack.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{attack.name}</span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {attackService.getTierName(attack.tier)}
                            </span>
                            {attack.evolvesTo && (
                              <span className="text-xs text-gray-400">
                                → {attackService.getAttackById(attack.evolvesTo)?.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>{attackService.getTypeDisplay(attack.type)}</span>
                            <span>Stärke: {attack.power}</span>
                            <span>Genauigkeit: {attack.accuracy}%</span>
                          </div>
                        </div>
                        {editMode && (
                          <div className="flex gap-1">
                            {attack.evolvesTo && (
                              <button
                                onClick={() => handleUpgradeAttack(attack.id)}
                                disabled={!canUpgradeAttack(attack)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                  canUpgradeAttack(attack)
                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                title={`Upgrade (${getUpgradeCost(attack.tier)} TP)`}
                              >
                                ↑ {getUpgradeCost(attack.tier)} TP
                              </button>
                            )}
                            {canDowngradeAttack(attack) && (
                              <button
                                onClick={() => handleDowngradeAttack(attack.id)}
                                className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200 transition-colors"
                                title={`Downgrade (+${getDowngradeRefund(attack.tier)} TP)`}
                              >
                                ↓ +{getDowngradeRefund(attack.tier)} TP
                              </button>
                            )}
                            <button
                              onClick={() => handleForgetAttack(attack.id)}
                              className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                            >
                              Vergessen
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add Attack Button */}
                {editMode && getLearnedAttacks().length < 4 && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAttackSelection(!showAttackSelection)}
                      className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      + Attacke lernen
                    </button>
                    
                    {/* Attack Selection Dropdown */}
                    {showAttackSelection && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h5 className="font-medium text-gray-900 mb-3">Verfügbare Basis-Attacken:</h5>
                        
                        {/* Search Field */}
                        <div className="mb-3">
                          <input
                            type="text"
                            placeholder="Attacke suchen (Name oder Typ)..."
                            value={attackSearchTerm}
                            onChange={(e) => setAttackSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          />
                        </div>
                        
                        <div className="mb-2 text-xs text-gray-500">
                          {getAvailableAttacks().length} Attacken gefunden
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {getAvailableAttacks().length === 0 ? (
                            <p className="text-gray-500 italic text-sm">
                              {attackSearchTerm.trim() ? 'Keine Attacken gefunden' : 'Keine neuen Attacken verfügbar'}
                            </p>
                          ) : (
                            getAvailableAttacks().map(attack => (
                              <button
                                key={attack.id}
                                onClick={() => handleLearnAttack(attack.id)}
                                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{attack.name}</span>
                                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        {attackService.getTierName(attack.tier)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                      <span>{attackService.getTypeDisplay(attack.type)}</span>
                                      <span>Stärke: {attack.power}</span>
                                      <span>Genauigkeit: {attack.accuracy}%</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setShowAttackSelection(false);
                            setAttackSearchTerm('');
                          }}
                          className="mt-3 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                        >
                          Schließen
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Dialog */}
      {showEvolutionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 m-4 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pokemon entwickeln</h2>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                {pokemon?.name} kann sich entwickeln!
              </p>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Diese Aktion kann nicht rückgängig gemacht werden!
              </p>
            </div>

            {getAvailableEvolutions().length > 1 ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entwicklung wählen:
                </label>
                <select
                  value={selectedEvolution}
                  onChange={(e) => setSelectedEvolution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Entwicklung auswählen...</option>
                  {getAvailableEvolutions().map(evolution => (
                    <option key={evolution} value={evolution}>
                      {evolution}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">{pokemon?.name}</span> wird sich zu{' '}
                  <span className="font-bold text-purple-600">
                    {getAvailableEvolutions()[0]}
                  </span>{' '}
                  entwickeln.
                </p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Was bleibt erhalten:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Level und Erfahrung</li>
                <li>✅ Talent Points Verteilung</li>
                <li>✅ Gelernte Attacken</li>
                <li>✅ Shiny Status</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEvolutionDialog(false);
                  setSelectedEvolution('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleEvolvePokemon}
                disabled={saving || (getAvailableEvolutions().length > 1 && !selectedEvolution)}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Entwickelt...' : '🌟 Entwickeln!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonDetail;