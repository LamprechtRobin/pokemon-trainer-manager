import React from 'react';
import TrainerOverview from '../components/TrainerOverview';
import PokeAPITest from '../components/PokeAPITest';

const TrainerOverviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pokemon Trainer Manager
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your Pokemon trainers and their teams
          </p>
        </header>
        
        {/* Temporärer PokeAPI Test */}
        <PokeAPITest />
        
        <TrainerOverview />
      </div>
    </div>
  );
};

export default TrainerOverviewPage;