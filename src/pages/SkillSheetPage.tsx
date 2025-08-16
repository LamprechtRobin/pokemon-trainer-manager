import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrainerSkillSheet from '../components/SkillSheet/TrainerSkillSheet';
import { getTrainerById, updateTrainer } from '../firebase/trainerService';
import { SkillCalculator } from '../utils/skillCalculator';
import type { Trainer, TrainerSkills } from '../types/trainer';

const SkillSheetPage: React.FC = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [isLoading, setIsLoading] = useState(!!trainerId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trainerId) {
      loadTrainer();
    }
  }, [trainerId]);

  const loadTrainer = async () => {
    if (!trainerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const trainerData = await getTrainerById(trainerId);
      
      if (trainerData) {
        setTrainer(trainerData);
      } else {
        setError('Trainer nicht gefunden');
      }
    } catch (err) {
      console.error('Error loading trainer:', err);
      setError('Fehler beim Laden des Trainers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillsChange = async (skills: TrainerSkills) => {
    if (!trainerId || !trainer) return;

    try {
      setIsSaving(true);
      
      // Clean skills data - remove undefined values for Firebase
      const cleanSkills = {
        intelligence: skills.intelligence || 0,
        agility: skills.agility || 0,
        social: skills.social || 0,
        strength: skills.strength || 0,
        presence: skills.presence || 0,
        skills: skills.skills || {},
        ...(skills.disadvantage && { disadvantage: skills.disadvantage }),
        ...(skills.specialAbility && { specialAbility: skills.specialAbility }),
        ...(skills.notes && { notes: skills.notes })
      };
      
      const updatedTrainer = {
        ...trainer,
        skills: cleanSkills
      };
      
      console.log('Saving skills:', cleanSkills);
      await updateTrainer(trainerId, updatedTrainer);
      setTrainer(updatedTrainer);
    } catch (err) {
      console.error('Error saving skills:', err);
      console.error('Skills data that failed:', skills);
      setError(`Fehler beim Speichern der Skills: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackClick = () => {
    if (trainerId) {
      navigate(`/trainer/${trainerId}`);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Trainer-Daten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  const currentSkills = trainer?.skills 
    ? {
        intelligence: trainer.skills.intelligence || 0,
        agility: trainer.skills.agility || 0,
        social: trainer.skills.social || 0,
        strength: trainer.skills.strength || 0,
        presence: trainer.skills.presence || 0,
        skills: SkillCalculator.normalizeSkills(trainer.skills.skills || {}),
        disadvantage: trainer.skills.disadvantage,
        specialAbility: trainer.skills.specialAbility,
        notes: trainer.skills.notes
      }
    : SkillCalculator.createEmptyTrainerSkills();
  const trainerName = trainer?.name || '';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header mit Navigation */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Zurück</span>
              </button>
              
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {trainerId ? `${trainerName} - Skill Sheet` : 'Neues Skill Sheet'}
                </h1>
                {trainerId && (
                  <p className="text-sm text-gray-600">
                    Trainer ID: {trainerId}
                  </p>
                )}
              </div>
            </div>

            {isSaving && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Speichern...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skill Sheet */}
      <div className="py-6">
        <TrainerSkillSheet
          initialSkills={currentSkills}
          onSkillsChange={trainerId ? handleSkillsChange : undefined}
          trainerName={trainerName}
          readonly={!trainerId}
        />
      </div>

      {/* Info für neue Skill Sheets */}
      {!trainerId && (
        <div className="max-w-4xl mx-auto px-4 pb-6 print:hidden">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-blue-800 mb-1">Neues Skill Sheet</h3>
                <p className="text-sm text-blue-700">
                  Dies ist ein unabhängiges Skill Sheet. Änderungen werden nicht automatisch gespeichert. 
                  Nutze die Export-Funktion, um deine Daten zu sichern.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Um ein Skill Sheet für einen bestehenden Trainer zu erstellen, 
                  gehe zum Trainer-Profil und klicke auf "Skill Sheet".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSheetPage;