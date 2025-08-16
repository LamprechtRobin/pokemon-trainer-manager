import React, { useState, useEffect } from 'react';
import { trainerService } from '../firebase/trainerService';
import TrainerCard from './TrainerCard';
import AddTrainerForm from './AddTrainerForm';
import { Trainer } from '../types/trainer';
import { PokemonMigration } from '../utils/pokemonMigration';

const TrainerOverview: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      console.log('Loading trainers...');
      const trainersData = await trainerService.getAllTrainers();
      console.log('Loaded trainers:', trainersData);
      
      // Run migration to ensure all Pokemon have basic attacks
      const migrationResult = PokemonMigration.migrateAllTrainers(trainersData);
      
      // If any trainers were updated, save them back to Firebase
      if (migrationResult.migrationCount > 0) {
        console.log(`Migrating ${migrationResult.migrationCount} trainers with basic attacks...`);
        
        // Save updated trainers back to Firebase
        for (const trainer of migrationResult.updatedTrainers) {
          if (trainer.id) {
            await trainerService.updateTrainer(trainer.id, trainer);
          }
        }
        
        console.log('Migration complete - all Pokemon now have basic attacks');
      }
      
      setTrainers(migrationResult.updatedTrainers);
    } catch (error) {
      console.error('Failed to load trainers:', error);
      alert('Failed to load trainers. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainer = async (trainerData: Omit<Trainer, 'id'>): Promise<void> => {
    try {
      console.log('Adding trainer:', trainerData);
      const trainerId = await trainerService.addTrainer(trainerData);
      console.log('Trainer added with ID:', trainerId);
      await loadTrainers();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add trainer:', error);
      alert('Failed to add trainer. Check console for details.');
    }
  };

  const handleDeleteTrainer = async (trainerId: string): Promise<void> => {
    try {
      await trainerService.deleteTrainer(trainerId);
      await loadTrainers();
    } catch (error) {
      console.error('Failed to delete trainer:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Loading trainers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
            showAddForm 
              ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' 
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {showAddForm ? 'Cancel' : 'Add New Trainer'}
        </button>
        
      </div>

      {showAddForm && (
        <AddTrainerForm 
          onSubmit={handleAddTrainer} 
          onCancel={() => setShowAddForm(false)} 
        />
      )}

      {trainers.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No trainers found
          </h3>
          <p className="text-gray-500">
            Add your first trainer to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map(trainer => (
            <TrainerCard 
              key={trainer.id} 
              trainer={trainer} 
              onDelete={handleDeleteTrainer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerOverview;