import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pokemon } from '../types/pokemon';
import { Trainer } from '../types/trainer';
import { Attack } from '../types/attack';
import { trainerService } from '../firebase/trainerService';
import { attackService } from '../services/attackService';

// Attack upgrade costs (in talent points)
const ATTACK_UPGRADE_COSTS = {
  TIER_1_TO_2: 25,
  TIER_2_TO_3: 50
};

const AttackManagement: React.FC = () => {
  const { trainerId, pokemonIndex } = useParams<{ trainerId: string; pokemonIndex: string }>();
  const navigate = useNavigate();
  
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attackSearchTerm, setAttackSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'learned' | 'learn'>('learned');
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

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
      
    } catch (error) {
      console.error('Error loading Pokemon data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const savePokemon = async (updatedPokemon: Pokemon) => {
    if (!trainer || pokemonIndex === undefined) return;
    
    setSaving(true);
    try {
      const updatedTeam = [...(trainer.team || [])];
      updatedTeam[parseInt(pokemonIndex)] = updatedPokemon;
      
      const updatedTrainer = { ...trainer, team: updatedTeam };
      
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      
      setPokemon(updatedPokemon);
      setTrainer(updatedTrainer);
    } catch (error) {
      console.error('Error saving Pokemon:', error);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  // Talent Points calculations
  const getMaxTalentPoints = (): number => {
    const level = pokemon?.level || 1;
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

  // Attack Management
  const getLearnedAttacks = (): Attack[] => {
    if (!pokemon?.learnedAttacks) return [];
    return pokemon.learnedAttacks
      .map(attackId => attackService.getAttackById(attackId))
      .filter((attack): attack is Attack => attack !== undefined);
  };

  const getAvailableAttacks = (): Attack[] => {
    const basicAttacks = attackService.getAttacksByTier(1);
    const learnedAttackIds = pokemon?.learnedAttacks || [];
    let availableAttacks = basicAttacks.filter(attack => !learnedAttackIds.includes(attack.id));
    
    if (attackSearchTerm.trim()) {
      const searchLower = attackSearchTerm.toLowerCase().trim();
      availableAttacks = availableAttacks.filter(attack => 
        attack.name.toLowerCase().includes(searchLower) ||
        attack.type.toLowerCase().includes(searchLower)
      );
    }
    
    return availableAttacks.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleLearnAttack = async (attackId: string) => {
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
    
    await savePokemon(updatedPokemon);
    setSelectedTab('learned'); // Switch to learned attacks
  };

  const handleForgetAttack = (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack) return;
    
    setConfirmDialog({
      show: true,
      title: 'Attacke vergessen?',
      message: `${attack.name} vergessen? Dies kann nicht rückgängig gemacht werden.`,
      onConfirm: () => executeForgetAttack(attackId)
    });
  };

  const executeForgetAttack = async (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack) return;
    
    // Calculate refund based on attack tier
    let refund = 0;
    if (attack.tier === 2) {
      refund = ATTACK_UPGRADE_COSTS.TIER_1_TO_2;
    } else if (attack.tier === 3) {
      refund = ATTACK_UPGRADE_COSTS.TIER_1_TO_2 + ATTACK_UPGRADE_COSTS.TIER_2_TO_3;
    }
    
    const updatedAttacks = pokemon.learnedAttacks.filter(id => id !== attackId);
    const currentSpentOnAttacks = pokemon.talentPointsSpentOnAttacks || 0;
    const newSpentOnAttacks = Math.max(0, currentSpentOnAttacks - refund);
    
    const updatedPokemon = {
      ...pokemon,
      learnedAttacks: updatedAttacks,
      talentPointsSpentOnAttacks: newSpentOnAttacks
    };
    
    await savePokemon(updatedPokemon);
    setConfirmDialog(null);
  };

  // Attack upgrade/downgrade
  const canUpgradeAttack = (attack: Attack): boolean => {
    if (!attack.evolvesTo) return false;
    const upgradeCost = attack.tier === 1 ? ATTACK_UPGRADE_COSTS.TIER_1_TO_2 : ATTACK_UPGRADE_COSTS.TIER_2_TO_3;
    return getAvailableTalentPoints() >= upgradeCost;
  };

  const handleUpgradeAttack = (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack?.evolvesTo) return;
    
    const upgradeCost = attack.tier === 1 ? ATTACK_UPGRADE_COSTS.TIER_1_TO_2 : ATTACK_UPGRADE_COSTS.TIER_2_TO_3;
    const availablePoints = getAvailableTalentPoints();
    
    if (availablePoints < upgradeCost) {
      alert(`Nicht genügend Talent Points! Benötigt: ${upgradeCost}, Verfügbar: ${availablePoints}`);
      return;
    }
    
    const nextAttack = attackService.getAttackById(attack.evolvesTo);
    
    setConfirmDialog({
      show: true,
      title: 'Attacke upgraden?',
      message: `${attack.name} zu ${nextAttack?.name} upgraden für ${upgradeCost} TP?`,
      onConfirm: () => executeUpgradeAttack(attackId)
    });
  };

  const executeUpgradeAttack = async (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack?.evolvesTo) return;
    
    const upgradeCost = attack.tier === 1 ? ATTACK_UPGRADE_COSTS.TIER_1_TO_2 : ATTACK_UPGRADE_COSTS.TIER_2_TO_3;
    
    const updatedAttacks = pokemon.learnedAttacks.map(id => 
      id === attackId ? attack.evolvesTo! : id
    );
    
    const currentSpentOnAttacks = pokemon.talentPointsSpentOnAttacks || 0;
    const newSpentOnAttacks = currentSpentOnAttacks + upgradeCost;
    
    const updatedPokemon = {
      ...pokemon,
      learnedAttacks: updatedAttacks,
      talentPointsSpentOnAttacks: newSpentOnAttacks
    };
    
    await savePokemon(updatedPokemon);
    setConfirmDialog(null);
  };

  const handleDowngradeAttack = (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack || attack.tier === 1) return;
    
    const previousAttack = attackService.getPreviousTierAttack(attackId);
    if (!previousAttack) return;
    
    const refund = attack.tier === 2 ? ATTACK_UPGRADE_COSTS.TIER_1_TO_2 : ATTACK_UPGRADE_COSTS.TIER_2_TO_3;
    
    setConfirmDialog({
      show: true,
      title: 'Attacke downgraden?',
      message: `${attack.name} zu ${previousAttack.name} downgraden? Du erhältst ${refund} TP zurück.`,
      onConfirm: () => executeDowngradeAttack(attackId)
    });
  };

  const executeDowngradeAttack = async (attackId: string) => {
    if (!pokemon?.learnedAttacks) return;
    
    const attack = attackService.getAttackById(attackId);
    if (!attack || attack.tier === 1) return;
    
    const previousAttack = attackService.getPreviousTierAttack(attackId);
    if (!previousAttack) return;
    
    const refund = attack.tier === 2 ? ATTACK_UPGRADE_COSTS.TIER_1_TO_2 : ATTACK_UPGRADE_COSTS.TIER_2_TO_3;
    
    const updatedAttacks = pokemon.learnedAttacks.map(id => 
      id === attackId ? previousAttack.id : id
    );
    
    const currentSpentOnAttacks = pokemon.talentPointsSpentOnAttacks || 0;
    const newSpentOnAttacks = Math.max(0, currentSpentOnAttacks - refund);
    
    const updatedPokemon = {
      ...pokemon,
      learnedAttacks: updatedAttacks,
      talentPointsSpentOnAttacks: newSpentOnAttacks
    };
    
    await savePokemon(updatedPokemon);
    setConfirmDialog(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Lade Attacken...</div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/pokemon/${trainerId}/${pokemonIndex}`)}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            ← Zurück zu {pokemon.name}
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Attacken verwalten
              </h1>
              <p className="text-gray-600 text-sm">
                {pokemon.name} • Level {pokemon.level}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Talent Points</div>
              <div className="text-lg font-semibold text-green-600">
                {getAvailableTalentPoints()}/{getMaxTalentPoints()}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedTab('learned')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedTab === 'learned'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gelernte Attacken ({getLearnedAttacks().length}/4)
            </button>
            
            <button
              onClick={() => setSelectedTab('learn')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedTab === 'learn'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={getLearnedAttacks().length >= 4}
            >
              Neue lernen
            </button>
          </div>
        </div>

        {/* Learned Attacks Tab */}
        {selectedTab === 'learned' && (
          <div className="space-y-4">
            {getLearnedAttacks().length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Keine Attacken gelernt</p>
                <button
                  onClick={() => setSelectedTab('learn')}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Erste Attacke lernen
                </button>
              </div>
            ) : (
              getLearnedAttacks().map(attack => (
                <div key={attack.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  {/* Attack Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{attack.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          attack.tier === 1 ? 'bg-green-100 text-green-800' :
                          attack.tier === 2 ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {attackService.getTierName(attack.tier)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {attackService.getTypeDisplay(attack.type)}
                      </div>
                    </div>
                  </div>

                  {/* Attack Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stärke:</span>
                      <span className="font-medium">{attack.power}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Genauigkeit:</span>
                      <span className="font-medium">{attack.accuracy}%</span>
                    </div>
                  </div>

                  {/* Attack Effect */}
                  {attack.effect && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{attack.effect}</p>
                    </div>
                  )}

                  {/* Evolution Info */}
                  {attack.evolvesTo && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-800 font-medium mb-1">Kann entwickelt werden zu:</div>
                      <div className="text-sm text-blue-700">
                        {attackService.getAttackById(attack.evolvesTo)?.name}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Upgrade Button */}
                    {attack.evolvesTo && (
                      <button
                        onClick={() => handleUpgradeAttack(attack.id)}
                        disabled={!canUpgradeAttack(attack) || saving}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          canUpgradeAttack(attack)
                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {saving ? 'Upgrading...' : 
                          `⬆️ Upgrade (${attack.tier === 1 ? ATTACK_UPGRADE_COSTS.TIER_1_TO_2 : ATTACK_UPGRADE_COSTS.TIER_2_TO_3} TP)`
                        }
                      </button>
                    )}

                    {/* Downgrade Button */}
                    {attack.tier > 1 && (
                      <button
                        onClick={() => handleDowngradeAttack(attack.id)}
                        disabled={saving}
                        className="w-full py-2 px-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium disabled:opacity-50"
                      >
                        {saving ? 'Downgrading...' : 
                          `⬇️ Downgrade (+${attack.tier === 2 ? ATTACK_UPGRADE_COSTS.TIER_1_TO_2 : ATTACK_UPGRADE_COSTS.TIER_2_TO_3} TP)`
                        }
                      </button>
                    )}

                    {/* Forget Button */}
                    <button
                      onClick={() => handleForgetAttack(attack.id)}
                      disabled={saving}
                      className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? 'Forgetting...' : '🗑️ Attacke vergessen'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Learn New Attacks Tab */}
        {selectedTab === 'learn' && (
          <div className="space-y-4">
            {getLearnedAttacks().length >= 4 ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700 font-medium">
                  Maximum erreicht! Ein Pokemon kann nur 4 Attacken lernen.
                </p>
                <p className="text-red-600 text-sm mt-2">
                  Vergiss zuerst eine Attacke, um eine neue zu lernen.
                </p>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <input
                    type="text"
                    placeholder="Attacke suchen (Name oder Typ)..."
                    value={attackSearchTerm}
                    onChange={(e) => setAttackSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {getAvailableAttacks().length} verfügbare Attacken
                  </div>
                </div>

                {/* Available Attacks */}
                <div className="space-y-3">
                  {getAvailableAttacks().length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                      <p className="text-gray-500">
                        {attackSearchTerm.trim() ? 'Keine Attacken gefunden' : 'Keine neuen Attacken verfügbar'}
                      </p>
                    </div>
                  ) : (
                    getAvailableAttacks().map(attack => (
                      <div key={attack.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg text-gray-900">{attack.name}</h3>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                {attackService.getTierName(attack.tier)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {attackService.getTypeDisplay(attack.type)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stärke:</span>
                            <span className="font-medium">{attack.power}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Genauigkeit:</span>
                            <span className="font-medium">{attack.accuracy}%</span>
                          </div>
                        </div>

                        {attack.effect && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{attack.effect}</p>
                          </div>
                        )}

                        <button
                          onClick={() => handleLearnAttack(attack.id)}
                          disabled={saving}
                          className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                        >
                          {saving ? 'Learning...' : '📚 Attacke lernen'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {confirmDialog.title}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {confirmDialog.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Wird ausgeführt...' : 'Bestätigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttackManagement;