import React from "react";
import { useNavigate } from "react-router-dom";
import TrainerOverview from "../components/TrainerOverview";

const TrainerOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pokemon Trainer Manager
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your Pokemon trainers and their teams
          </p>
        </header>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate("/attacks")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
          >
            ⚔️ Attacken-Datenbank
          </button>
        </div>
        <div className="grid grid-cols-2 md:flex md:justify-center gap-4 mb-8">
          <button
            onClick={() => navigate("/backup")}
            className="px-4 md:px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm md:text-base"
          >
            💾 Backup
          </button>
          <button
            onClick={() => navigate("/regelwerk")}
            className="px-4 md:px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm md:text-base"
          >
            📋 Regelwerk
          </button>
          <button
            onClick={() => navigate("/lore")}
            className="px-4 md:px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm md:text-base"
          >
            📚 Lore
          </button>
          <button
            onClick={() => navigate("/api-tests")}
            className="px-4 md:px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm md:text-base"
          >
            🧪 API Tests
          </button>
        </div>

        <TrainerOverview />
      </div>
    </div>
  );
};

export default TrainerOverviewPage;
