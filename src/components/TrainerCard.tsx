import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trainer } from '../types/trainer';

interface TrainerCardProps {
  trainer: Trainer;
  onDelete: (trainerId: string) => void;
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer, onDelete }) => {
  const navigate = useNavigate();
  
  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent navigation when deleting
    if (window.confirm(`Are you sure you want to delete trainer ${trainer.name}?`)) {
      onDelete(trainer.id!);
    }
  };

  const handleCardClick = (): void => {
    navigate(`/trainer/${trainer.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      <div className="mb-4">
        {trainer.imageUrl && (
          <div className="mb-4 flex justify-center">
            <img 
              src={trainer.imageUrl} 
              alt={`${trainer.name} avatar`}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 text-center">
          {trainer.name}
        </h3>
      </div>
      
      {trainer.description && (
        <div className="mb-6">
          <p className="text-sm md:text-base text-gray-600">
            <span className="font-semibold text-gray-900">Description:</span> {trainer.description}
          </p>
        </div>
      )}
      
      {/* Pokemon Team Section */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">
          Pokemon Team ({(trainer.team || []).length}/6)
        </h4>
        {trainer.team && trainer.team.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {trainer.team.slice(0, 6).map((pokemon, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-xs font-medium text-gray-700 truncate">
                  {pokemon.name}
                </div>
                {pokemon.level && (
                  <div className="text-xs text-gray-500">Lvl {pokemon.level}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No Pokemon in team</p>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Klicken für Details →
        </div>
        <button 
          onClick={handleDelete}
          className="px-4 py-2 bg-danger-500 text-white text-sm font-medium rounded-lg hover:bg-danger-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TrainerCard;