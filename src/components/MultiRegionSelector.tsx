import React from 'react';
import { RegionOption, REGION_OPTIONS } from '../types/aiTrainer';

interface MultiRegionSelectorProps {
  selectedRegions: RegionOption[];
  onChange: (regions: RegionOption[]) => void;
  className?: string;
}

const MultiRegionSelector: React.FC<MultiRegionSelectorProps> = ({
  selectedRegions,
  onChange,
  className = ''
}) => {
  const handleRegionToggle = (regionId: RegionOption) => {
    if (regionId === 'all') {
      // If "all" is selected, clear other selections
      onChange(['all']);
      return;
    }

    // If any specific region is selected when "all" was active, remove "all"
    let newSelection = selectedRegions.includes('all') 
      ? [regionId] 
      : selectedRegions.includes(regionId)
        ? selectedRegions.filter(r => r !== regionId)
        : [...selectedRegions, regionId];

    // Ensure at least one region is selected
    if (newSelection.length === 0) {
      newSelection = ['all'];
    }

    onChange(newSelection);
  };

  const isAllSelected = selectedRegions.includes('all');
  const availableRegions = REGION_OPTIONS.filter(region => region.id !== 'all');

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-900 mb-3">
        Regionen / Generationen
      </label>
      
      {/* All Regions Toggle */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={() => handleRegionToggle('all')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm font-medium text-gray-900">
            Alle Regionen
          </span>
        </label>
        <p className="text-xs text-gray-500 ml-6 mt-1">
          Pokemon aus allen Generationen (1-9)
        </p>
      </div>

      {/* Individual Regions */}
      {!isAllSelected && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 mb-2">
            Oder wähle spezifische Regionen:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableRegions.map((region) => (
              <label key={region.id} className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(region.id)}
                  onChange={() => handleRegionToggle(region.id)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                />
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-900">
                    {region.name}
                  </span>
                  <p className="text-xs text-gray-500">
                    {region.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-700 mb-1">Ausgewählt:</h4>
        <p className="text-sm text-gray-600">
          {isAllSelected 
            ? 'Alle Regionen (Pokemon ID 1-1025)'
            : selectedRegions.length === 0 
              ? 'Keine Region ausgewählt'
              : selectedRegions.length === 1
                ? `${REGION_OPTIONS.find(r => r.id === selectedRegions[0])?.name}`
                : `${selectedRegions.length} Regionen: ${selectedRegions.map(id => 
                    REGION_OPTIONS.find(r => r.id === id)?.name?.split(' ')[0]
                  ).join(', ')}`
          }
        </p>
      </div>
    </div>
  );
};

export default MultiRegionSelector;