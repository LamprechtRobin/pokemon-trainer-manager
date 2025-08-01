import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trainer } from "../types/trainer";
import { Pokemon } from "../types/pokemon";
import { Attack } from "../types/attack";
import { trainerService } from "../firebase/trainerService";
import { attackService } from "../services/attackService";

type BattlePhase = "selection" | "battle";

const BattleMode: React.FC = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [battlePhase, setBattlePhase] = useState<BattlePhase>("selection");
  const [selectedPokemonIndices, setSelectedPokemonIndices] = useState<
    number[]
  >([]);
  const [activePokemonIndex, setActivePokemonIndex] = useState<number>(0);
  const [showAttackRoll, setShowAttackRoll] = useState<{
    attack: Attack;
    attackValue: number;
    damage: number;
  } | null>(null);
  
  const [showDefenseDialog, setShowDefenseDialog] = useState<{
    step: 'roll' | 'damage';
    defenseValue: number;
    rollSuccess?: boolean;
    incomingDamage: number;
    effectiveness: number;
  } | null>(null);
  
  const [showEvasionDialog, setShowEvasionDialog] = useState<{
    step: 'roll' | 'damage';
    speedValue: number;
    rollSuccess?: boolean;
    incomingDamage: number;
    effectiveness: number;
    roll1?: number;
    roll2?: number;
  } | null>(null);

  const [showDeathNotification, setShowDeathNotification] = useState<{
    pokemonName: string;
  } | null>(null);

  const [showBattleEndDialog, setShowBattleEndDialog] = useState(false);
  const [battleEndExpGains, setBattleEndExpGains] = useState<{[pokemonIndex: number]: number}>({});

  useEffect(() => {
    if (trainerId) {
      loadTrainer();
    }
  }, [trainerId]);

  const loadTrainer = async () => {
    try {
      const trainers = await trainerService.getAllTrainers();
      const foundTrainer = trainers.find((t) => t.id === trainerId);

      if (!foundTrainer) {
        navigate("/");
        return;
      }

      if (!foundTrainer.team || foundTrainer.team.length === 0) {
        navigate(`/trainer/${trainerId}`);
        return;
      }

      setTrainer(foundTrainer);
    } catch (error) {
      console.error("Error loading trainer:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonToggle = (index: number) => {
    setSelectedPokemonIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleStartBattle = () => {
    if (selectedPokemonIndices.length === 0) return;

    setActivePokemonIndex(0); // Start with first selected Pokemon
    setBattlePhase("battle");
  };

  const handleSwitchPokemon = (selectedIndex: number) => {
    setActivePokemonIndex(selectedIndex);
  };

  const getMaxHp = (pokemon: Pokemon): number => {
    const baseHp = pokemon.stats?.hp || 0;
    const talentHp = pokemon.talentPoints?.hp || 0;
    return Math.max(1, baseHp + talentHp);
  };

  const getCurrentHp = (pokemon: Pokemon): number => {
    // If currentHp is not set, initialize it to max HP
    if (pokemon.currentHp === undefined) {
      return getMaxHp(pokemon);
    }
    return pokemon.currentHp;
  };

  const getHpPercentage = (pokemon: Pokemon): number => {
    const currentHp = getCurrentHp(pokemon);
    const maxHp = getMaxHp(pokemon);
    return maxHp > 0 ? (currentHp / maxHp) * 100 : 0;
  };

  const getHpColorClass = (pokemon: Pokemon): string => {
    const percentage = getHpPercentage(pokemon);
    if (percentage > 50) return "bg-green-500";
    if (percentage > 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Pen & Paper stat conversion functions
  const getPenPaperStats = (pokemon: Pokemon) => {
    const baseStats = pokemon.stats || {
      hp: 0,
      attack: 0,
      defense: 0,
      speed: 0,
    };
    const talentPoints = pokemon.talentPoints || {
      hp: 0,
      attack: 0,
      defense: 0,
      speed: 0,
    };

    // Calculate total stats (base + talent points)
    const totalHp = (baseStats.hp ?? 0) + (talentPoints.hp ?? 0);
    const totalAttack = (baseStats.attack ?? 0) + (talentPoints.attack ?? 0);
    const totalDefense = (baseStats.defense ?? 0) + (talentPoints.defense ?? 0);
    const totalSpeed = (baseStats.speed ?? 0) + (talentPoints.speed ?? 0);

    return {
      hp: Math.max(1, totalHp), // HP stays the same, minimum 1
      attack: Math.floor(totalAttack / 10), // Attack divided by 10, rounded down
      defense: Math.max(1, Math.floor(totalDefense / 10)), // Defense divided by 10, rounded down
      speed: Math.floor(totalSpeed / 10), // Speed divided by 10, rounded down
    };
  };

  // Attack functions
  const getLearnedAttacks = (pokemon: Pokemon): Attack[] => {
    if (!pokemon.learnedAttacks) return [];
    return pokemon.learnedAttacks
      .map(attackId => attackService.getAttackById(attackId))
      .filter((attack): attack is Attack => attack !== undefined);
  };

  const calculateAttackValue = (pokemon: Pokemon, attack: Attack): number => {
    const penPaperStats = getPenPaperStats(pokemon);
    const attackStat = penPaperStats.attack;
    const accuracyModifier = attack.accuracy / 100; // Convert percentage to decimal
    return Math.floor(attackStat * accuracyModifier);
  };

  const calculateDamage = (pokemon: Pokemon, attack: Attack): number => {
    const penPaperStats = getPenPaperStats(pokemon);
    const attackStat = penPaperStats.attack;
    return attack.power + attackStat;
  };

  const handleAttackClick = (attack: Attack) => {
    if (!activePokemon) return;
    const attackValue = calculateAttackValue(activePokemon, attack);
    const damage = calculateDamage(activePokemon, attack);
    setShowAttackRoll({ attack, attackValue, damage });
  };

  const handleDefenseClick = () => {
    if (!activePokemon) return;
    const penPaperStats = getPenPaperStats(activePokemon);
    const defenseValue = penPaperStats.defense;
    setShowDefenseDialog({
      step: 'roll',
      defenseValue,
      incomingDamage: 0,
      effectiveness: 1 // neutral
    });
  };

  const handleEvasionClick = () => {
    if (!activePokemon) return;
    const penPaperStats = getPenPaperStats(activePokemon);
    const speedValue = penPaperStats.speed;
    setShowEvasionDialog({
      step: 'roll',
      speedValue,
      incomingDamage: 0,
      effectiveness: 1 // neutral
    });
  };

  const handleBattleEndClick = () => {
    // Initialize EXP gains with 0 for all selected Pokemon
    const initialExpGains: {[pokemonIndex: number]: number} = {};
    selectedPokemonIndices.forEach(index => {
      initialExpGains[index] = 0;
    });
    setBattleEndExpGains(initialExpGains);
    setShowBattleEndDialog(true);
  };

  const updateExpGain = (pokemonIndex: number, amount: number) => {
    setBattleEndExpGains(prev => ({
      ...prev,
      [pokemonIndex]: Math.max(0, (prev[pokemonIndex] || 0) + amount)
    }));
  };

  const applyBattleEndRewards = async () => {
    if (!trainer) return;

    try {
      const updatedTeam = [...(trainer.team || [])];
      
      // Apply EXP gains
      Object.entries(battleEndExpGains).forEach(([indexStr, expGain]) => {
        const index = parseInt(indexStr);
        if (updatedTeam[index] && expGain > 0) {
          const currentExp = updatedTeam[index].exp || 0;
          updatedTeam[index].exp = currentExp + expGain;
        }
      });

      const updatedTrainer = { ...trainer, team: updatedTeam };
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
      
      setShowBattleEndDialog(false);
      setBattlePhase("selection");
    } catch (error) {
      console.error('Error applying battle end rewards:', error);
      alert('Fehler beim Speichern der Belohnungen');
    }
  };

  const handleDefenseRollResult = (success: boolean) => {
    if (!showDefenseDialog) return;
    setShowDefenseDialog({
      ...showDefenseDialog,
      step: 'damage',
      rollSuccess: success
    });
  };

  const handleEvasionRollResult = (success: boolean, roll1: number, roll2: number) => {
    if (!showEvasionDialog) return;
    setShowEvasionDialog({
      ...showEvasionDialog,
      step: 'damage',
      rollSuccess: success,
      roll1,
      roll2
    });
  };

  const updateIncomingDamage = (amount: number) => {
    if (!showDefenseDialog) return;
    const newDamage = Math.max(0, showDefenseDialog.incomingDamage + amount);
    setShowDefenseDialog({
      ...showDefenseDialog,
      incomingDamage: newDamage
    });
  };

  const updateEffectiveness = (effectiveness: number) => {
    if (!showDefenseDialog) return;
    setShowDefenseDialog({
      ...showDefenseDialog,
      effectiveness
    });
  };

  const updateEvasionDamage = (amount: number) => {
    if (!showEvasionDialog) return;
    const newDamage = Math.max(0, showEvasionDialog.incomingDamage + amount);
    setShowEvasionDialog({
      ...showEvasionDialog,
      incomingDamage: newDamage
    });
  };

  const updateEvasionEffectiveness = (effectiveness: number) => {
    if (!showEvasionDialog) return;
    setShowEvasionDialog({
      ...showEvasionDialog,
      effectiveness
    });
  };

  const calculateFinalDamage = (): number => {
    if (!showDefenseDialog || !activePokemon) return 0;
    
    const penPaperStats = getPenPaperStats(activePokemon);
    const defense = penPaperStats.defense;
    const incomingDamage = showDefenseDialog.incomingDamage;
    const effectiveness = showDefenseDialog.effectiveness;
    const rollSuccess = showDefenseDialog.rollSuccess;
    
    let finalDamage: number;
    
    if (rollSuccess) {
      // Defense succeeded: (Incoming Damage - Defense) * Effectiveness
      finalDamage = (incomingDamage - defense) * effectiveness;
    } else {
      // Defense failed: (Incoming Damage - Defense/2) * Effectiveness  
      finalDamage = (incomingDamage - (defense / 2)) * effectiveness;
    }
    
    // Minimum damage is always 1
    return Math.max(1, Math.floor(finalDamage));
  };

  const calculateEvasionFinalDamage = (): number => {
    if (!showEvasionDialog || !activePokemon) return 0;
    
    const incomingDamage = showEvasionDialog.incomingDamage;
    const effectiveness = showEvasionDialog.effectiveness;
    const rollSuccess = showEvasionDialog.rollSuccess;
    
    if (rollSuccess) {
      // Evasion succeeded: No damage
      return 0;
    } else {
      // Evasion failed: Full damage with effectiveness  
      return Math.max(1, Math.floor(incomingDamage * effectiveness));
    }
  };

  const applyDamageToActivePokemon = async () => {
    if (!showDefenseDialog || !activePokemon || !trainer) return;
    
    const finalDamage = calculateFinalDamage();
    const currentHp = getCurrentHp(activePokemon);
    const maxHp = getMaxHp(activePokemon);
    const deathThreshold = Math.floor(-maxHp / 2); // -1/2 max HP
    
    let newHp = currentHp - finalDamage;
    let isDead = false;
    
    // Check for permanent death
    if (newHp <= deathThreshold) {
      isDead = true;
      newHp = deathThreshold; // Set HP to death threshold
      setShowDeathNotification({ pokemonName: activePokemon.name });
    } else {
      newHp = Math.max(0, newHp); // Normal K.O. at 0
    }
    
    // Update the Pokemon's HP and death status
    const updatedPokemon = { 
      ...activePokemon, 
      currentHp: newHp,
      isDead: isDead || activePokemon.isDead // Once dead, always dead
    };
    
    const updatedTeam = [...(trainer.team || [])];
    const originalPokemonIndex = selectedPokemonIndices[activePokemonIndex];
    updatedTeam[originalPokemonIndex] = updatedPokemon;
    
    const updatedTrainer = { ...trainer, team: updatedTeam };
    
    try {
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
      
      // Update selected Pokemon array
      const updatedSelectedPokemon = [...selectedPokemon];
      updatedSelectedPokemon[activePokemonIndex] = updatedPokemon;
      
      setShowDefenseDialog(null);
    } catch (error) {
      console.error('Error updating Pokemon HP:', error);
      alert('Fehler beim Speichern der HP-Änderung');
    }
  };

  const applyEvasionDamageToActivePokemon = async () => {
    if (!showEvasionDialog || !activePokemon || !trainer) return;
    
    const finalDamage = calculateEvasionFinalDamage();
    const currentHp = getCurrentHp(activePokemon);
    const maxHp = getMaxHp(activePokemon);
    const deathThreshold = Math.floor(-maxHp / 2); // -1/2 max HP
    
    let newHp = currentHp - finalDamage;
    let isDead = false;
    
    // Check for permanent death
    if (newHp <= deathThreshold) {
      isDead = true;
      newHp = deathThreshold; // Set HP to death threshold
      setShowDeathNotification({ pokemonName: activePokemon.name });
    } else {
      newHp = Math.max(0, newHp); // Normal K.O. at 0
    }
    
    // Update the Pokemon's HP and death status
    const updatedPokemon = { 
      ...activePokemon, 
      currentHp: newHp,
      isDead: isDead || activePokemon.isDead // Once dead, always dead
    };
    
    const updatedTeam = [...(trainer.team || [])];
    const originalPokemonIndex = selectedPokemonIndices[activePokemonIndex];
    updatedTeam[originalPokemonIndex] = updatedPokemon;
    
    const updatedTrainer = { ...trainer, team: updatedTeam };
    
    try {
      await trainerService.updateTrainer(trainer.id!, updatedTrainer);
      setTrainer(updatedTrainer);
      
      // Update selected Pokemon array
      const updatedSelectedPokemon = [...selectedPokemon];
      updatedSelectedPokemon[activePokemonIndex] = updatedPokemon;
      
      setShowEvasionDialog(null);
    } catch (error) {
      console.error('Error updating Pokemon HP:', error);
      alert('Fehler beim Speichern der HP-Änderung');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Lade Battle Mode...</div>
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

  const selectedPokemon = selectedPokemonIndices.map(
    (index) => trainer.team![index]
  );
  const activePokemon = selectedPokemon[activePokemonIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/trainer/${trainerId}`)}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            ← Zurück zu {trainer.name}
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {battlePhase === "selection"
                  ? "Pokemon auswählen"
                  : "Battle Mode"}
              </h1>
              <p className="text-gray-600 text-sm">
                {battlePhase === "selection"
                  ? "Wähle Pokemon für den Kampf aus"
                  : `Kampf mit ${trainer.name}`}
              </p>
            </div>
            {battlePhase === "battle" && (
              <button
                onClick={handleBattleEndClick}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Kampf beenden
              </button>
            )}
          </div>
        </div>

        {/* Pokemon Selection Phase */}
        {battlePhase === "selection" && (
          <div className="space-y-6">
            {/* Selection Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Pokemon auswählen ({selectedPokemonIndices.length}/
                    {trainer.team!.length})
                  </h3>
                  <p className="text-sm text-gray-500">
                    Wähle mindestens ein Pokemon für den Kampf aus
                  </p>
                </div>
                <button
                  onClick={handleStartBattle}
                  disabled={selectedPokemonIndices.length === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPokemonIndices.length > 0
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  ⚔️ Kampf starten
                </button>
              </div>
            </div>

            {/* Pokemon Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainer.team!.map((pokemon, index) => {
                const isSelected = selectedPokemonIndices.includes(index);
                const currentHp = getCurrentHp(pokemon);
                const maxHp = getMaxHp(pokemon);
                const isKnockedOut = currentHp === 0;
                const isDead = pokemon.isDead || false;

                return (
                  <div
                    key={index}
                    onClick={() => !isKnockedOut && !isDead && handlePokemonToggle(index)}
                    className={`relative bg-white rounded-xl shadow-sm border-2 p-4 transition-all cursor-pointer ${
                      isDead
                        ? "border-black bg-gray-900 opacity-75 cursor-not-allowed"
                        : isKnockedOut
                        ? "border-red-500 opacity-60 cursor-not-allowed bg-red-50"
                        : isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {/* Selection Indicator */}
                    {isSelected && !isDead && !isKnockedOut && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}
                    
                    {/* K.O. Symbol for 0 HP */}
                    {isKnockedOut && !isDead && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xs shadow-lg">
                        K.O.
                      </div>
                    )}
                    
                    {/* Death Symbol for permanently dead Pokemon */}
                    {isDead && (
                      <div className="absolute top-2 right-2 bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                        💀
                      </div>
                    )}

                    {/* Pokemon Image */}
                    <div className="relative">
                      {pokemon.imageUrl && (
                        <img
                          src={pokemon.imageUrl}
                          alt={`${pokemon.name} sprite`}
                          className={`w-24 h-24 mx-auto mb-3 pixelated ${isDead ? 'grayscale' : ''}`}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>

                    {/* Pokemon Info */}
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {pokemon.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Level {pokemon.level || 1}
                      </p>

                      {/* HP Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>HP</span>
                          <span>
                            {currentHp}/{maxHp}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getHpColorClass(
                              pokemon
                            )}`}
                            style={{ width: `${getHpPercentage(pokemon)}%` }}
                          />
                        </div>
                      </div>

                      {isDead ? (
                        <p className="text-white text-sm font-medium">
                          💀 TOT
                        </p>
                      ) : isKnockedOut ? (
                        <p className="text-red-600 text-sm font-medium">
                          💔 K.O.
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Battle Phase */}
        {battlePhase === "battle" && activePokemon && (
          <div className="space-y-6">
            {/* Main Pokemon Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {activePokemon.imageUrl && (
                    <img
                      src={activePokemon.imageUrl}
                      alt={`${activePokemon.name} sprite`}
                      className="w-48 h-48 mx-auto mb-4 pixelated"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  
                  {/* K.O. Symbol for 0 HP */}
                  {getCurrentHp(activePokemon) === 0 && !activePokemon.isDead && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg shadow-lg">
                      K.O.
                    </div>
                  )}
                  
                  {/* Death Symbol for permanently dead Pokemon */}
                  {activePokemon.isDead && (
                    <div className="absolute top-2 right-2 bg-black text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl shadow-lg">
                      💀
                    </div>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {activePokemon.name}
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Level {activePokemon.level || 1}
                </p>

                {/* HP Display */}
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>HP</span>
                    <span className="font-medium">
                      {getCurrentHp(activePokemon)}/{getMaxHp(activePokemon)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${getHpColorClass(
                        activePokemon
                      )}`}
                      style={{ width: `${getHpPercentage(activePokemon)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(getHpPercentage(activePokemon))}% HP
                  </p>
                </div>

                {/* Pen & Paper Stats */}
                <div className="mt-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                    Pen & Paper Stats
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      const stats = getPenPaperStats(activePokemon);
                      return (
                        <>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                            <div className="text-xs text-red-600 font-medium mb-1">
                              HP
                            </div>
                            <div className="text-xl font-bold text-red-700">
                              {stats.hp}
                            </div>
                          </div>

                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                            <div className="text-xs text-orange-600 font-medium mb-1">
                              Angriff
                            </div>
                            <div className="text-xl font-bold text-orange-700">
                              {stats.attack}
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                            <div className="text-xs text-blue-600 font-medium mb-1">
                              Verteidigung
                            </div>
                            <div className="text-xl font-bold text-blue-700">
                              {stats.defense}
                            </div>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <div className="text-xs text-green-600 font-medium mb-1">
                              Geschw.
                            </div>
                            <div className="text-xl font-bold text-green-700">
                              {stats.speed}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="mt-3 text-xs text-gray-500 text-center">
                    <p>🎲 Würfelwerte für Pen & Paper</p>
                    <p className="mt-1">
                      Angriff & Geschwindigkeit: (Basis + TP) ÷ 5
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Aktionen</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => alert("Items - Noch nicht implementiert")}
                  className="w-full py-4 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  🎒 Items
                </button>

                <button
                  onClick={handleDefenseClick}
                  className="w-full py-4 px-6 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                >
                  🛡️ Verteidigen
                </button>

                <button
                  onClick={handleEvasionClick}
                  className="w-full py-4 px-6 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  💨 Ausweichen
                </button>
              </div>
            </div>

            {/* Attacks Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Attacken ({getLearnedAttacks(activePokemon).length}/4)
              </h3>
              
              {getLearnedAttacks(activePokemon).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">Keine Attacken gelernt</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getLearnedAttacks(activePokemon).map(attack => {
                    const attackValue = calculateAttackValue(activePokemon, attack);
                    const damage = calculateDamage(activePokemon, attack);
                    
                    return (
                      <button
                        key={attack.id}
                        onClick={() => handleAttackClick(attack)}
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">
                              {attack.name}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              attack.tier === 1 ? 'bg-green-100 text-green-800' :
                              attack.tier === 2 ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {attackService.getTierName(attack.tier)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div>
                                <div className="text-xs text-gray-500">Würfel</div>
                                <div className="text-sm font-bold text-purple-700">
                                  +{attackValue}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Schaden</div>
                                <div className="text-sm font-bold text-red-700">
                                  {damage}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                          <div>
                            <span className="font-medium">Typ:</span><br/>
                            {attackService.getTypeDisplay(attack.type)}
                          </div>
                          <div>
                            <span className="font-medium">Stärke:</span><br/>
                            {attack.power}
                          </div>
                          <div>
                            <span className="font-medium">Genauigkeit:</span><br/>
                            {attack.accuracy}%
                          </div>
                        </div>
                        
                        {attack.effect && (
                          <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                            {attack.effect}
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-purple-600 font-medium">
                          🎲 Klicken für Würfelanweisung
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pokemon Switching */}
            {selectedPokemon.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Pokemon wechseln ({selectedPokemon.length} verfügbar)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedPokemon.map((pokemon, selectedIndex) => {
                    const isActive = selectedIndex === activePokemonIndex;
                    const currentHp = getCurrentHp(pokemon);
                    const isKnockedOut = currentHp === 0;
                    const isDead = pokemon.isDead || false;

                    return (
                      <button
                        key={selectedIndex}
                        onClick={() =>
                          !isActive &&
                          !isKnockedOut &&
                          !isDead &&
                          handleSwitchPokemon(selectedIndex)
                        }
                        disabled={isActive || isKnockedOut || isDead}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isActive
                            ? "border-orange-500 bg-orange-50 cursor-default"
                            : isDead
                            ? "border-black bg-gray-900 opacity-75 cursor-not-allowed"
                            : isKnockedOut
                            ? "border-red-500 bg-red-50 opacity-60 cursor-not-allowed"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                        }`}
                      >
                        {pokemon.imageUrl && (
                          <img
                            src={pokemon.imageUrl}
                            alt={`${pokemon.name} sprite`}
                            className="w-12 h-12 mx-auto mb-2 pixelated"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <div className="text-center">
                          <p className="font-medium text-sm text-gray-900 mb-1">
                            {pokemon.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentHp}/{getMaxHp(pokemon)} HP
                          </p>
                          {isActive && !isDead && !isKnockedOut && (
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              Aktiv
                            </p>
                          )}
                          {isDead && (
                            <p className="text-xs text-white font-medium mt-1">
                              💀 TOT
                            </p>
                          )}
                          {isKnockedOut && !isDead && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              K.O.
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Attack Roll Dialog */}
        {showAttackRoll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  🎲 Würfelanweisung
                </h2>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-purple-900 mb-2">
                    {showAttackRoll.attack.name}
                  </h3>
                  <div className="text-2xl font-bold text-purple-700 mb-2">
                    1W20 + {showAttackRoll.attackValue}
                  </div>
                  <div className="text-sm text-purple-600 mb-2">
                    {activePokemon?.name} verwendet {showAttackRoll.attack.name}
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="text-xs text-red-600 font-medium">Bei Erfolg:</div>
                    <div className="text-lg font-bold text-red-700">
                      {showAttackRoll.damage} Schaden
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Angriff (Pen & Paper):</span>
                    <span className="font-medium">{getPenPaperStats(activePokemon!).attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attacken-Stärke:</span>
                    <span className="font-medium">{showAttackRoll.attack.power}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Genauigkeit:</span>
                    <span className="font-medium">{showAttackRoll.attack.accuracy}%</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Würfelmodifikator:</span>
                    <span className="font-bold text-purple-700">+{showAttackRoll.attackValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schaden bei Erfolg:</span>
                    <span className="font-bold text-red-700">{showAttackRoll.damage}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-1">
                  <p className="text-xs text-gray-600">
                    <strong>Würfel-Berechnung:</strong> Angriff ({getPenPaperStats(activePokemon!).attack}) × Genauigkeit ({showAttackRoll.attack.accuracy / 100}) = {showAttackRoll.attackValue}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Schaden-Berechnung:</strong> Attacken-Stärke ({showAttackRoll.attack.power}) + Angriff ({getPenPaperStats(activePokemon!).attack}) = {showAttackRoll.damage}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAttackRoll(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Schließen
                </button>
                <button
                  onClick={() => {
                    // Copy to clipboard if available
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(`1W20+${showAttackRoll.attackValue} (${showAttackRoll.attack.name})`);
                    }
                    setShowAttackRoll(null);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  📋 Kopieren
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Defense Dialog */}
        {showDefenseDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              {showDefenseDialog.step === 'roll' && (
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    🛡️ Verteidigung
                  </h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-yellow-900 mb-2">
                      Verteidigungswurf
                    </h3>
                    <div className="text-2xl font-bold text-yellow-700 mb-2">
                      1W20 + {showDefenseDialog.defenseValue}
                    </div>
                    <div className="text-sm text-yellow-600">
                      {activePokemon?.name} versucht sich zu verteidigen
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Verteidigung (Pen & Paper):</span>
                      <span className="font-medium">{showDefenseDialog.defenseValue}</span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-3">Wie ist der Wurf ausgegangen?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDefenseRollResult(true)}
                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        ✅ Geschafft
                      </button>
                      <button
                        onClick={() => handleDefenseRollResult(false)}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        ❌ Nicht geschafft
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowDefenseDialog(null)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              )}
              
              {showDefenseDialog.step === 'damage' && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    💥 Schaden berechnen
                  </h2>
                  
                  <div className={`p-3 rounded-lg mb-4 text-center ${
                    showDefenseDialog.rollSuccess 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`text-sm font-medium ${
                      showDefenseDialog.rollSuccess ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Verteidigung {showDefenseDialog.rollSuccess ? 'erfolgreich' : 'fehlgeschlagen'}
                    </div>
                  </div>
                  
                  {/* Damage Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eingehender Schaden:
                    </label>
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-gray-900">
                        {showDefenseDialog.incomingDamage}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <button onClick={() => updateIncomingDamage(1)} className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">+1</button>
                      <button onClick={() => updateIncomingDamage(2)} className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">+2</button>
                      <button onClick={() => updateIncomingDamage(5)} className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">+5</button>
                      <button onClick={() => updateIncomingDamage(10)} className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">+10</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => updateIncomingDamage(-1)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">-1</button>
                      <button onClick={() => updateIncomingDamage(-2)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">-2</button>
                      <button onClick={() => updateIncomingDamage(-5)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">-5</button>
                      <button onClick={() => updateIncomingDamage(-10)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">-10</button>
                    </div>
                  </div>
                  
                  {/* Type Effectiveness */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typ-Effektivität:
                    </label>
                    <select
                      value={showDefenseDialog.effectiveness}
                      onChange={(e) => updateEffectiveness(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value={0.25}>Überhaupt nicht effektiv (1/4)</option>
                      <option value={0.5}>Nicht sehr effektiv (1/2)</option>
                      <option value={1}>Normal effektiv (1x)</option>
                      <option value={2}>Sehr effektiv (2x)</option>
                      <option value={4}>Super effektiv (4x)</option>
                    </select>
                  </div>
                  
                  {/* Damage Calculation Preview */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Eingehender Schaden:</span>
                        <span>{showDefenseDialog.incomingDamage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verteidigung:</span>
                        <span>{showDefenseDialog.defenseValue} {showDefenseDialog.rollSuccess ? '(voll)' : '(halber)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effektivität:</span>
                        <span>{showDefenseDialog.effectiveness}x</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold text-red-700">
                        <span>Finaler Schaden:</span>
                        <span>{calculateFinalDamage()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDefenseDialog(null)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={applyDamageToActivePokemon}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      💔 Schaden anwenden
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evasion Dialog */}
        {showEvasionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              {showEvasionDialog.step === 'roll' && (
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    💨 Ausweichen
                  </h2>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-purple-900 mb-2">
                      Ausweichenwurf
                    </h3>
                    <div className="text-2xl font-bold text-purple-700 mb-2">
                      1W20 + {showEvasionDialog.speedValue}
                    </div>
                    <div className="text-sm text-purple-600 mb-2">
                      {activePokemon?.name} versucht auszuweichen
                    </div>
                    <div className="text-xs text-purple-500 bg-purple-100 rounded p-2">
                      <strong>Geschwindigkeit wird 2x gewürfelt - schlechterer Wurf zählt</strong>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Geschwindigkeit (Pen & Paper):</span>
                      <span className="font-medium">{showEvasionDialog.speedValue}</span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-3">Wie ist der Wurf ausgegangen?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEvasionRollResult(true, 0, 0)}
                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        ✅ Geschafft (kein Schaden)
                      </button>
                      <button
                        onClick={() => handleEvasionRollResult(false, 0, 0)}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        ❌ Nicht geschafft
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowEvasionDialog(null)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              )}
              
              {showEvasionDialog.step === 'damage' && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    💥 Schaden berechnen
                  </h2>
                  
                  <div className={`p-3 rounded-lg mb-4 text-center ${
                    showEvasionDialog.rollSuccess 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`text-sm font-medium ${
                      showEvasionDialog.rollSuccess ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Ausweichen {showEvasionDialog.rollSuccess ? 'erfolgreich' : 'fehlgeschlagen'}
                    </div>
                    {showEvasionDialog.rollSuccess && (
                      <div className="text-xs text-green-600 mt-1">
                        Kein Schaden erhalten!
                      </div>
                    )}
                  </div>
                  
                  {!showEvasionDialog.rollSuccess && (
                    <>
                      {/* Damage Input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Eingehender Schaden:
                        </label>
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            {showEvasionDialog.incomingDamage}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          <button onClick={() => updateEvasionDamage(1)} className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">+1</button>
                          <button onClick={() => updateEvasionDamage(2)} className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">+2</button>
                          <button onClick={() => updateEvasionDamage(5)} className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">+5</button>
                          <button onClick={() => updateEvasionDamage(10)} className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">+10</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <button onClick={() => updateEvasionDamage(-1)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">-1</button>
                          <button onClick={() => updateEvasionDamage(-2)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">-2</button>
                          <button onClick={() => updateEvasionDamage(-5)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">-5</button>
                          <button onClick={() => updateEvasionDamage(-10)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">-10</button>
                        </div>
                      </div>
                      
                      {/* Type Effectiveness */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Typ-Effektivität:
                        </label>
                        <select
                          value={showEvasionDialog.effectiveness}
                          onChange={(e) => updateEvasionEffectiveness(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value={0.25}>Überhaupt nicht effektiv (1/4)</option>
                          <option value={0.5}>Nicht sehr effektiv (1/2)</option>
                          <option value={1}>Normal effektiv (1x)</option>
                          <option value={2}>Sehr effektiv (2x)</option>
                          <option value={4}>Super effektiv (4x)</option>
                        </select>
                      </div>
                      
                      {/* Damage Calculation Preview */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Eingehender Schaden:</span>
                            <span>{showEvasionDialog.incomingDamage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Effektivität:</span>
                            <span>{showEvasionDialog.effectiveness}x</span>
                          </div>
                          <div className="flex justify-between border-t pt-1 font-bold text-red-700">
                            <span>Finaler Schaden:</span>
                            <span>{calculateEvasionFinalDamage()}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowEvasionDialog(null)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={applyEvasionDamageToActivePokemon}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      💔 Schaden anwenden
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Death Notification Dialog */}
        {showDeathNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full border-4 border-red-500">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">💀</div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">
                  Pokemon ist gestorben!
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-bold text-lg">
                    {showDeathNotification.pokemonName}
                  </p>
                  <p className="text-red-700 text-sm mt-2">
                    ist komplett gestorben und kampfunfähig für immer.
                  </p>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <p>⚠️ <strong>Permanenter Tod:</strong></p>
                  <ul className="text-left space-y-1">
                    <li>• HP fiel unter -½ Maximum</li>
                    <li>• Kann nicht mehr geheilt werden</li>
                    <li>• Für immer kampfunfähig</li>
                    <li>• Status wird gespeichert</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowDeathNotification(null)}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                😢 Verstanden
              </button>
            </div>
          </div>
        )}

        {/* Battle End Dialog */}
        {showBattleEndDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  🏆 Kampf beenden
                </h2>
                <p className="text-gray-600 text-center">
                  Verteile Erfahrungspunkte und andere Belohnungen
                </p>
              </div>

              {/* EXP Distribution */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ⭐ Erfahrungspunkte verteilen
                </h3>
                
                <div className="space-y-4">
                  {selectedPokemonIndices.map(pokemonIndex => {
                    const pokemon = trainer.team![pokemonIndex];
                    const currentExp = pokemon.exp || 0;
                    const expGain = battleEndExpGains[pokemonIndex] || 0;
                    const newExp = currentExp + expGain;
                    
                    return (
                      <div key={pokemonIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                              {pokemon.imageUrl ? (
                                <img 
                                  src={pokemon.imageUrl} 
                                  alt={pokemon.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg">
                                  {pokemon.isDead ? '💀' : getCurrentHp(pokemon) === 0 ? '😵' : '😊'}
                                </span>
                              )}
                              
                              {/* Status overlay */}
                              {pokemon.isDead && (
                                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                                  <span className="text-white text-xs">💀</span>
                                </div>
                              )}
                              {!pokemon.isDead && getCurrentHp(pokemon) === 0 && (
                                <div className="absolute inset-0 bg-red-500 bg-opacity-70 flex items-center justify-center">
                                  <span className="text-white text-xs">K.O.</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{pokemon.name}</h4>
                              <div className="text-sm text-gray-600">
                                Level {pokemon.level} • EXP: {currentExp} → {newExp}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            EXP Gewinn: {expGain}
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="grid grid-cols-6 gap-1 flex-1">
                              <button 
                                onClick={() => updateExpGain(pokemonIndex, 1)} 
                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                              >
                                +1
                              </button>
                              <button 
                                onClick={() => updateExpGain(pokemonIndex, 5)} 
                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                              >
                                +5
                              </button>
                              <button 
                                onClick={() => updateExpGain(pokemonIndex, 10)} 
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                              >
                                +10
                              </button>
                              <button 
                                onClick={() => updateExpGain(pokemonIndex, -1)} 
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                              >
                                -1
                              </button>
                              <button 
                                onClick={() => updateExpGain(pokemonIndex, -5)} 
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                              >
                                -5
                              </button>
                              <button 
                                onClick={() => updateExpGain(pokemonIndex, -10)} 
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                              >
                                -10
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {expGain > 0 && (
                          <div className="text-xs text-green-600 bg-green-50 rounded p-2">
                            ⬆️ +{expGain} EXP → Neue Gesamt-EXP: {newExp}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBattleEndDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  onClick={applyBattleEndRewards}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Belohnungen anwenden
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleMode;
