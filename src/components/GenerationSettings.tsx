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



      {/* Additional Options */}
      <div className="space-y-3">        
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="generateImage"
              checked={settings.generateImage}
              onChange={(e) => updateSetting('generateImage', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="generateImage" className="ml-2 text-sm text-gray-900">
              Trainer-Bild automatisch generieren
            </label>
          </div>
          {settings.generateImage && (
            <div className="ml-6 text-xs text-gray-500">
              <p>⚠️ Benötigt einen gültigen Runware API-Key</p>
              <p>Bei Fehlern wird der Trainer ohne Bild erstellt</p>
            </div>
          )}
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
          <p>• {settings.generateImage ? 'Mit Bild-Generierung' : 'Ohne Bild-Generierung'}</p>
        </div>
      </div>
    </div>
  );
};

export default GenerationSettings;