import React from 'react';
import {
  AIGenerationSettings,
  DEFAULT_AI_SETTINGS,
  POKEMON_TYPES,
  TYPE_NAMES,
  PERSONALITY_DESCRIPTIONS,
  STAT_STYLE_DESCRIPTIONS,
  TrainerPersonality,
  StatDistributionStyle,
  PokemonType,
  RegionOption
} from '../types/aiTrainer';
import RangeSlider from './RangeSlider';
import MultiRegionSelector from './MultiRegionSelector';

interface GenerationSettingsProps {
  settings: AIGenerationSettings;
  onChange: (settings: AIGenerationSettings) => void;
  className?: string;
}

const GenerationSettings: React.FC<GenerationSettingsProps> = ({
  settings,
  onChange,
  className = ''
}) => {
  const updateSetting = <K extends keyof AIGenerationSettings>(
    key: K,
    value: AIGenerationSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const resetToDefaults = () => {
    onChange(DEFAULT_AI_SETTINGS);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          KI-Generierung Einstellungen
        </h3>
        <button
          type="button"
          onClick={resetToDefaults}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Multi-Region Selection */}
      <MultiRegionSelector
        selectedRegions={settings.regions}
        onChange={(regions) => updateSetting('regions', regions)}
      />

      {/* Preferred Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Bevorzugter Pokemon-Typ
        </label>
        <select
          value={settings.preferredType}
          onChange={(e) => updateSetting('preferredType', e.target.value as PokemonType | 'all')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">Alle Typen</option>
          {POKEMON_TYPES.map((type) => (
            <option key={type} value={type}>
              {TYPE_NAMES[type]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-600">
          {settings.preferredType === 'all' 
            ? 'Zufällige Auswahl aus allen Pokemon-Typen'
            : `Mindestens 50% des Teams wird ${TYPE_NAMES[settings.preferredType as PokemonType]} sein`
          }
        </p>
      </div>

      {/* Level Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RangeSlider
          label="Durchschnittslevel"
          value={settings.averageLevel}
          min={1}
          max={100}
          onChange={(value) => updateSetting('averageLevel', value)}
          unit=" Level"
        />

        <RangeSlider
          label="Level-Varianz"
          value={settings.levelVariance}
          min={0}
          max={20}
          onChange={(value) => updateSetting('levelVariance', value)}
          unit=" Level"
        />
      </div>

      {/* Team Size */}
      <RangeSlider
        label="Team-Größe"
        value={settings.teamSize}
        min={1}
        max={6}
        onChange={(value) => updateSetting('teamSize', value)}
        unit=" Pokemon"
      />


      {/* Trainer Personality */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Trainer-Persönlichkeit
        </label>
        <select
          value={settings.trainerPersonality}
          onChange={(e) => updateSetting('trainerPersonality', e.target.value as TrainerPersonality)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {Object.entries(PERSONALITY_DESCRIPTIONS).map(([key, description]) => (
            <option key={key} value={key}>
              {description}
            </option>
          ))}
        </select>
      </div>

      {/* Stat Distribution Style */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Stat-Verteilungsstil
        </label>
        <select
          value={settings.statDistributionStyle}
          onChange={(e) => updateSetting('statDistributionStyle', e.target.value as StatDistributionStyle)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {Object.entries(STAT_STYLE_DESCRIPTIONS).map(([key, description]) => (
            <option key={key} value={key}>
              {description}
            </option>
          ))}
        </select>
      </div>

      {/* Additional Options */}
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowShiny"
            checked={settings.allowShiny}
            onChange={(e) => updateSetting('allowShiny', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="allowShiny" className="ml-2 text-sm text-gray-900">
            Shiny Pokemon erlauben (selten)
          </label>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Zusammenfassung</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• {settings.regions.includes('all') 
            ? 'Alle Regionen' 
            : settings.regions.length === 1 
              ? `${settings.regions.length} Region`
              : `${settings.regions.length} Regionen`
          }</p>
          <p>• {settings.teamSize} Pokemon, Level {Math.max(1, settings.averageLevel - settings.levelVariance)}-{Math.min(100, settings.averageLevel + settings.levelVariance)}</p>
          <p>• {settings.preferredType === 'all' ? 'Gemischte Typen' : `Fokus auf ${TYPE_NAMES[settings.preferredType as PokemonType]}`}</p>
          <p>• {PERSONALITY_DESCRIPTIONS[settings.trainerPersonality].split(' (')[0]} Persönlichkeit</p>
          <p>• {STAT_STYLE_DESCRIPTIONS[settings.statDistributionStyle].split(' (')[0]} Stat-Verteilung</p>
        </div>
      </div>
    </div>
  );
};

export default GenerationSettings;