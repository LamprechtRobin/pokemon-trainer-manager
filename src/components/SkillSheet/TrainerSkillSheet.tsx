import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import AttributeInput from './AttributeInput';
import SkillSection from './SkillSection';
import { BASE_ATTRIBUTES, SKILL_CONFIG } from '../../config/skills.config';
import { SkillCalculator } from '../../utils/skillCalculator';
import type { TrainerSkills } from '../../types/trainer';
import type { AttributeId, SkillId, SkillLevel, Disadvantage, SpecialAbility } from '../../config/skills.config';

interface TrainerSkillSheetProps {
  initialSkills?: TrainerSkills;
  onSkillsChange?: (skills: TrainerSkills) => void;
  trainerName?: string;
  readonly?: boolean;
}

const TrainerSkillSheet: React.FC<TrainerSkillSheetProps> = ({
  initialSkills,
  onSkillsChange,
  trainerName = '',
  readonly = false
}) => {
  const [skills, setSkills] = useState<TrainerSkills>(() => {
    if (initialSkills) {
      return {
        intelligence: initialSkills.intelligence || 0,
        agility: initialSkills.agility || 0,
        social: initialSkills.social || 0,
        strength: initialSkills.strength || 0,
        presence: initialSkills.presence || 0,
        skills: SkillCalculator.normalizeSkills(initialSkills.skills || {}),
        disadvantage: initialSkills.disadvantage,
        specialAbility: initialSkills.specialAbility,
        notes: initialSkills.notes
      };
    }
    return SkillCalculator.createEmptyTrainerSkills();
  });
  const [trainerInfo, setTrainerInfo] = useState({
    name: trainerName,
    age: '',
    region: ''
  });
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${trainerInfo.name || 'Trainer'}_Skill_Sheet`
  });

  const updateSkills = (newSkills: TrainerSkills) => {
    setSkills(newSkills);
    onSkillsChange?.(newSkills);
  };

  const handleAttributeChange = (attributeId: AttributeId, value: number) => {
    if (readonly) return;
    
    const newSkills = {
      ...skills,
      [attributeId]: value
    };
    updateSkills(newSkills);
  };

  const handleSkillChange = (skillId: string, value: SkillLevel) => {
    if (readonly) return;
    
    const newSkills = {
      ...skills,
      skills: {
        ...skills.skills,
        [skillId as SkillId]: value
      }
    };
    updateSkills(newSkills);
  };

  const handleOptionalChange = (field: 'disadvantage' | 'specialAbility' | 'notes', value: string) => {
    if (readonly) return;
    
    const newSkills = {
      ...skills,
      [field]: value || undefined
    };
    updateSkills(newSkills);
  };

  const remainingPoints = SkillCalculator.getRemainingAttributePoints(skills);
  const validation = SkillCalculator.validateTrainerSkills(skills);
  const stats = SkillCalculator.getCharacterStats(skills);

  // Export functions
  const exportToJSON = () => {
    const data = {
      trainerInfo,
      skills,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trainerInfo.name || 'trainer'}_skills.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Controls (nicht gedruckt) */}
      {!readonly && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg print:hidden">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                📄 Drucken
              </button>
              <button
                onClick={exportToJSON}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                💾 Export JSON
              </button>
            </div>
            
            <div className="text-sm">
              <span className={`font-medium ${remainingPoints === 0 ? 'text-green-600' : remainingPoints < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                Übrige Punkte: {remainingPoints}
              </span>
            </div>
          </div>
          
          {!validation.isValid && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded">
              <div className="font-medium text-red-700 mb-2">Validierungsfehler:</div>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Druckbarer Bereich */}
      <div ref={printRef} className="skill-sheet bg-white">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-center mb-4">Pokemon Trainer Skill Sheet</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={trainerInfo.name}
                onChange={(e) => setTrainerInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border-b border-gray-400 bg-transparent focus:outline-none print:border-black"
                disabled={readonly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alter</label>
              <input
                type="text"
                value={trainerInfo.age}
                onChange={(e) => setTrainerInfo(prev => ({ ...prev, age: e.target.value }))}
                className="w-full border-b border-gray-400 bg-transparent focus:outline-none print:border-black"
                disabled={readonly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                type="text"
                value={trainerInfo.region}
                onChange={(e) => setTrainerInfo(prev => ({ ...prev, region: e.target.value }))}
                className="w-full border-b border-gray-400 bg-transparent focus:outline-none print:border-black"
                disabled={readonly}
              />
            </div>
          </div>
        </div>

        {/* Basis Attribute */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Basis Attribute 
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({SKILL_CONFIG.MAX_ATTRIBUTE_POINTS} Punkte gesamt)
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(BASE_ATTRIBUTES).map(([attributeId, attribute]) => (
              <AttributeInput
                key={attributeId}
                attributeId={attributeId as AttributeId}
                value={skills[attributeId as AttributeId] || 0}
                onChange={handleAttributeChange}
                remainingPoints={remainingPoints}
              />
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          
          <div className="space-y-6">
            {Object.keys(BASE_ATTRIBUTES).map((attributeId) => (
              <SkillSection
                key={attributeId}
                attributeId={attributeId as AttributeId}
                attributePoints={skills[attributeId as AttributeId] || 0}
                skills={skills.skills}
                onSkillChange={handleSkillChange}
              />
            ))}
          </div>
        </div>

        {/* Optional Sections */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nachteil <span className="text-xs text-gray-500">(optional, +2 Punkte)</span>
            </label>
            {readonly ? (
              <div className="border border-gray-300 rounded p-2 bg-gray-50">
                {skills.disadvantage || 'Keiner'}
              </div>
            ) : (
              <select
                value={skills.disadvantage || ''}
                onChange={(e) => handleOptionalChange('disadvantage', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Keiner</option>
                {SKILL_CONFIG.DISADVANTAGES.map((disadvantage) => (
                  <option key={disadvantage} value={disadvantage}>
                    {disadvantage}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spezielle Fähigkeit <span className="text-xs text-gray-500">(optional)</span>
            </label>
            {readonly ? (
              <div className="border border-gray-300 rounded p-2 bg-gray-50">
                {skills.specialAbility || 'Keine'}
              </div>
            ) : (
              <select
                value={skills.specialAbility || ''}
                onChange={(e) => handleOptionalChange('specialAbility', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Keine</option>
                {SKILL_CONFIG.SPECIAL_ABILITIES.map((ability) => (
                  <option key={ability} value={ability}>
                    {ability}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Notizen */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notizen</label>
          {readonly ? (
            <div className="border border-gray-300 rounded p-3 bg-gray-50 min-h-24">
              {skills.notes || ''}
            </div>
          ) : (
            <textarea
              value={skills.notes || ''}
              onChange={(e) => handleOptionalChange('notes', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-vertical"
              placeholder="Notizen, Hintergrundgeschichte, besondere Eigenschaften..."
            />
          )}
        </div>

        {/* Standard Ausrüstung */}
        <div className="border-t border-gray-300 pt-4">
          <h3 className="font-medium text-gray-700 mb-2">Standard Ausrüstung</h3>
          <p className="text-sm text-gray-600">
            6 Pokeballs • Pokedex • Grundausrüstung (Rucksack, Schlafsack, etc.) • 500 Pokedollar
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainerSkillSheet;