import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Attack } from '../types/attack';
import { attackService } from '../services/attackService';

const AttacksOverview: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const allAttacks = attackService.getAllAttacks();
  const allTypes = attackService.getAllTypes();

  // Filter attacks based on selected filters
  const filteredAttacks = allAttacks.filter(attack => {
    const typeMatch = selectedType === 'all' || attack.type === selectedType;
    const tierMatch = selectedTier === 'all' || attack.tier.toString() === selectedTier;
    return typeMatch && tierMatch;
  });

  // Group attacks by type for better organization
  const attacksByType = filteredAttacks.reduce((acc, attack) => {
    if (!acc[attack.type]) {
      acc[attack.type] = [];
    }
    acc[attack.type].push(attack);
    return acc;
  }, {} as Record<string, Attack[]>);

  const getTierColor = (tier: 1 | 2 | 3): string => {
    switch (tier) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEvolutionArrow = (attack: Attack): JSX.Element | null => {
    if (!attack.evolvesTo) return null;
    const nextAttack = attackService.getAttackById(attack.evolvesTo);
    if (!nextAttack) return null;
    
    return (
      <div className="flex items-center text-xs text-gray-500 mt-1">
        <span>→ {nextAttack.name}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Zurück zur Übersicht
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attacken-Datenbank</h1>
          <p className="text-gray-600">Alle verfügbaren Attacken und ihre Entwicklungen</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ:
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Alle Typen</option>
                {allTypes.map(type => (
                  <option key={type} value={type}>
                    {attackService.getTypeDisplay(type)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stufe:
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Alle Stufen</option>
                <option value="1">Basis</option>
                <option value="2">Fortgeschritten</option>
                <option value="3">Meister</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{filteredAttacks.length} Attacken gefunden</span>
            <span>{Object.keys(attacksByType).length} Typen</span>
          </div>
        </div>

        {/* Attacks Grid */}
        <div className="space-y-8">
          {Object.entries(attacksByType)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([type, attacks]) => (
              <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  {attackService.getTypeDisplay(type)}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({attacks.length} Attacken)
                  </span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attacks
                    .sort((a, b) => a.tier - b.tier)
                    .map(attack => (
                      <div
                        key={attack.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{attack.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTierColor(attack.tier)}`}>
                            {attackService.getTierName(attack.tier)}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stärke:</span>
                            <span className="font-medium">{attack.power}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Genauigkeit:</span>
                            <span className="font-medium">{attack.accuracy}%</span>
                          </div>
                        </div>
                        
                        {getEvolutionArrow(attack)}
                        
                        {attack.effect && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-600">{attack.effect}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>

        {filteredAttacks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Keine Attacken gefunden.</p>
            <p className="text-gray-400 text-sm mt-2">Versuche andere Filter-Einstellungen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttacksOverview;