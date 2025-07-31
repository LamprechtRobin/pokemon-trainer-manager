import React, { useState } from 'react';
import { pokeApiService } from '../services/pokeapi';

const PokeAPITest: React.FC = () => {
  const [pokemonNames, setPokemonNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testLoadAll = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await pokeApiService.loadAllPokemon();
      const randomPokemon = await pokeApiService.getRandomPokemon(20);
      setPokemonNames(randomPokemon);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await pokeApiService.searchPokemon('pi', 20);
      setPokemonNames(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const testApiHealth = async () => {
    const isHealthy = await pokeApiService.checkApiHealth();
    alert(isHealthy ? 'PokeAPI ist erreichbar! ✅' : 'PokeAPI ist nicht erreichbar ❌');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        PokeAPI Test
      </h3>
      
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={testApiHealth}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          API Status prüfen
        </button>
        
        <button
          onClick={testLoadAll}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Lädt...' : 'Alle Pokemon laden'}
        </button>
        
        <button
          onClick={testSearch}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Lädt...' : 'Suche "pi" testen'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="text-blue-600">Lade Pokemon-Namen...</div>
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {pokemonNames.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">
            Geladene Pokemon ({pokemonNames.length}):
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {pokemonNames.map((name, index) => (
              <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                {name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PokeAPITest;