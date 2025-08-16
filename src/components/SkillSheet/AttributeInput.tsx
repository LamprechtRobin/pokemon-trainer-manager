import React from 'react';
import { BASE_ATTRIBUTES, SKILL_CONFIG } from '../../config/skills.config';
import type { AttributeId } from '../../config/skills.config';

interface AttributeInputProps {
  attributeId: AttributeId;
  value: number;
  onChange: (attributeId: AttributeId, value: number) => void;
  remainingPoints: number;
}

const AttributeInput: React.FC<AttributeInputProps> = ({
  attributeId,
  value,
  onChange,
  remainingPoints
}) => {
  const attribute = BASE_ATTRIBUTES[attributeId];
  
  const handleIncrement = () => {
    if (value < SKILL_CONFIG.MAX_POINTS_PER_ATTRIBUTE && remainingPoints > 0) {
      onChange(attributeId, value + 1);
    }
  };
  
  const handleDecrement = () => {
    if (value > 0) {
      onChange(attributeId, value - 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    const maxAllowed = Math.min(
      SKILL_CONFIG.MAX_POINTS_PER_ATTRIBUTE, 
      value + remainingPoints
    );
    
    if (newValue >= 0 && newValue <= maxAllowed) {
      onChange(attributeId, newValue);
    }
  };

  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50 text-blue-900',
    green: 'border-green-500 bg-green-50 text-green-900',
    purple: 'border-purple-500 bg-purple-50 text-purple-900',
    red: 'border-red-500 bg-red-50 text-red-900',
    yellow: 'border-yellow-500 bg-yellow-50 text-yellow-900'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[attribute.color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-lg">{attribute.name}</h3>
          <p className="text-sm opacity-75">{attribute.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= 0}
            className="w-8 h-8 rounded-full bg-white border-2 border-current 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-opacity-20 transition-all"
          >
            -
          </button>
          
          <input
            type="number"
            min="0"
            max={SKILL_CONFIG.MAX_POINTS_PER_ATTRIBUTE}
            value={value}
            onChange={handleInputChange}
            className="w-16 h-8 text-center border-2 border-current rounded
                     bg-white font-bold text-lg"
          />
          
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= SKILL_CONFIG.MAX_POINTS_PER_ATTRIBUTE || remainingPoints <= 0}
            className="w-8 h-8 rounded-full bg-white border-2 border-current
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-opacity-20 transition-all"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="text-sm">
        <span className="font-medium">Verfügbare Skill-Level: {value}</span>
      </div>
    </div>
  );
};

export default AttributeInput;