import React from 'react';
import SkillInput from './SkillInput';
import { BASE_ATTRIBUTES, getSkillsByAttribute } from '../../config/skills.config';
import { SkillCalculator } from '../../utils/skillCalculator';
import type { AttributeId, SkillId, SkillLevel } from '../../config/skills.config';

interface SkillSectionProps {
  attributeId: AttributeId;
  attributePoints: number;
  skills: Record<SkillId, SkillLevel>;
  onSkillChange: (skillId: string, value: SkillLevel) => void;
}

const SkillSection: React.FC<SkillSectionProps> = ({
  attributeId,
  attributePoints,
  skills,
  onSkillChange
}) => {
  const attribute = BASE_ATTRIBUTES[attributeId];
  const attributeSkills = getSkillsByAttribute(attributeId);
  const usedSkillLevels = SkillCalculator.getUsedSkillLevels(attributeId, skills);
  const availableSkillLevels = SkillCalculator.getAvailableSkillLevels(attributeId, attributePoints, skills);

  const colorClasses = {
    blue: 'border-blue-300 bg-blue-50',
    green: 'border-green-300 bg-green-50',
    purple: 'border-purple-300 bg-purple-50',
    red: 'border-red-300 bg-red-50',
    yellow: 'border-yellow-300 bg-yellow-50'
  };

  const headerColorClasses = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    purple: 'bg-purple-600 text-white',
    red: 'bg-red-600 text-white',
    yellow: 'bg-yellow-600 text-white'
  };

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${colorClasses[attribute.color as keyof typeof colorClasses]}`}>
      <div className={`px-4 py-3 ${headerColorClasses[attribute.color as keyof typeof headerColorClasses]}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{attribute.name} Skills</h3>
            <p className="text-sm opacity-90">{attribute.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Skill-Level verwendet</div>
            <div className="text-xl font-bold">
              {usedSkillLevels} / {attributePoints}
            </div>
            {availableSkillLevels > 0 && (
              <div className="text-sm opacity-90">
                {availableSkillLevels} verfügbar
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white">
        {attributeSkills.map((skill, index) => {
          const skillId = skill.id as SkillId;
          const currentLevel = skills[skillId] || 0;
          
          // Calculate max level this skill can have
          const maxPossibleLevel = Math.min(
            5, // Max skill level
            currentLevel + availableSkillLevels // Current level + available levels
          );

          return (
            <SkillInput
              key={skillId}
              skillId={skillId}
              skillName={skill.name}
              skillDescription={skill.description}
              value={currentLevel}
              onChange={onSkillChange}
              maxLevel={maxPossibleLevel}
              className={index === attributeSkills.length - 1 ? 'border-b-0' : ''}
            />
          );
        })}
      </div>

      {availableSkillLevels < 0 && (
        <div className="px-4 py-2 bg-red-100 border-t border-red-200">
          <div className="text-sm text-red-600 font-medium">
            ⚠️ Zu viele Skill-Level verwendet! 
            {Math.abs(availableSkillLevels)} Level über dem Limit.
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSection;