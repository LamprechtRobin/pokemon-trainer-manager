import React, { useState, useEffect } from 'react';
import { Trainer } from '../types/trainer';
import { Pokemon } from '../types/pokemon';
import { TrainerImage } from '../utils/imageUtils';

interface PokemonTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: Pokemon;
  pokemonIndex: number;
  currentTrainer: Trainer;
  onTransfer: (targetTrainerId: string) => void;
}

const PokemonTransferModal: React.FC<PokemonTransferModalProps> = ({
  isOpen,
  onClose,
  pokemon,
  pokemonIndex,
  currentTrainer,
  onTransfer,
}) => {
  const [availableTrainers, setAvailableTrainers] = useState<Trainer[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableTrainers();
    }
  }, [isOpen, currentTrainer.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAvailableTrainers = async () => {
    try {
      setLoading(true);
      // Import the trainerService dynamically to avoid circular imports
      const { trainerService } = await import('../firebase/trainerService');
      const allTrainers = await trainerService.getAllTrainers();
      
      // Filter out the current trainer
      const otherTrainers = allTrainers.filter(trainer => trainer.id !== currentTrainer.id);
      setAvailableTrainers(otherTrainers);
    } catch (error) {
      console.error('Error loading trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = () => {
    if (selectedTrainerId) {
      onTransfer(selectedTrainerId);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTrainerId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Pokemon transferieren
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Pokemon Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {pokemon.imageUrl && (
                <img
                  src={pokemon.imageUrl}
                  alt={pokemon.name}
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <h4 className="font-bold text-lg text-gray-900">{pokemon.name}</h4>
                <p className="text-sm text-gray-600">
                  {pokemon.level && `Level ${pokemon.level}`}
                  {pokemon.exp !== undefined && ` • ${pokemon.exp}/10 EXP`}
                </p>
                <p className="text-xs text-gray-500">
                  von {currentTrainer.name}
                </p>
              </div>
            </div>
          </div>

          {/* Trainer Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Zieltrainer auswählen:
            </label>
            
            {loading ? (
              <div className="text-center text-gray-500">
                Lade Trainer...
              </div>
            ) : availableTrainers.length === 0 ? (
              <div className="text-center text-gray-500">
                Keine anderen Trainer verfügbar
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableTrainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    onClick={() => setSelectedTrainerId(trainer.id!)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedTrainerId === trainer.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrainerImage 
                        imageUrl={trainer.imageUrl}
                        name={trainer.name}
                        size={40}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {trainer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(trainer.team || []).length} Pokemon im Team
                        </div>
                      </div>
                      {selectedTrainerId === trainer.id && (
                        <div className="text-primary-500">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleTransfer}
              disabled={!selectedTrainerId || loading}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                selectedTrainerId && !loading
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Transferieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonTransferModal;