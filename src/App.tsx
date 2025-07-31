import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrainerOverviewPage from './pages/TrainerOverviewPage';
import TrainerDetail from './pages/TrainerDetail';
import PokemonDetail from './pages/PokemonDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrainerOverviewPage />} />
        <Route path="/trainer/:trainerId" element={<TrainerDetail />} />
        <Route path="/trainer/:trainerId/pokemon/:pokemonIndex" element={<PokemonDetail />} />
      </Routes>
    </Router>
  );
};

export default App;