import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TrainerOverviewPage from "./pages/TrainerOverviewPage";
import TrainerDetail from "./pages/TrainerDetail";
import PokemonDetail from "./pages/PokemonDetail";
import AttacksOverview from "./pages/AttacksOverview";
import AttackManagement from "./pages/AttackManagement";
import BattleMode from "./pages/BattleMode";
import DocumentationPage from "./pages/DocumentationPage";
import LorePage from "./pages/LorePage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrainerOverviewPage />} />
        <Route path="/attacks" element={<AttacksOverview />} />
        <Route
          path="/attacks/:trainerId/:pokemonIndex"
          element={<AttackManagement />}
        />
        <Route path="/trainer/:trainerId" element={<TrainerDetail />} />
        <Route
          path="/pokemon/:trainerId/:pokemonIndex"
          element={<PokemonDetail />}
        />
        <Route path="/battle/:trainerId" element={<BattleMode />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/lore" element={<LorePage />} />
      </Routes>
    </Router>
  );
};

export default App;
