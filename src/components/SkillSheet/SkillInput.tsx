import React from 'react';
import { SKILL_CONFIG, getSkillDie, getSkillLabel } from '../../config/skills.config';
import type { SkillLevel } from '../../config/skills.config';

interface SkillInputProps {
  skillId: string;
  skillName: string;
  skillDescription: string;
  value: SkillLevel;
  onChange: (skillId: string, value: SkillLevel) => void;
  maxLevel: number;
  className?: string;
}

const SkillInput: React.FC<SkillInputProps> = ({
  skillId,
  skillName,
  skillDescription,
  value,
  onChange,
  maxLevel,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = parseInt(e.target.value) as SkillLevel;
    onChange(skillId, newValue);
  };

  const getCurrentDie = getSkillDie(value);
  const getCurrentLabel = getSkillLabel(value);

  return (
    <div className={`flex items-center justify-between py-2 px-3 border-b border-gray-200 ${className}`}>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{skillName}</span>
          {getCurrentDie && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {getCurrentDie}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">{skillDescription}</p>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <select
          value={value}
          onChange={handleChange}
          className="border border-gray-300 rounded px-2 py-1 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {SKILL_CONFIG.SKILL_LEVELS.map((level) => (
            <option 
              key={level.level} 
              value={level.level}
              disabled={level.level > maxLevel}
            >
              {level.level === 0 ? 'Keine' : `${level.die} (${level.label})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SkillInput;