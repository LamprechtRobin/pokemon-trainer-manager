import React, { useState, useEffect, useRef } from 'react';
import { pokeApiService } from '../services/pokeapi';

interface PokemonSearchProps {
  onSelect: (pokemonName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const PokemonSearch: React.FC<PokemonSearchProps> = ({ 
  onSelect, 
  placeholder = "Pokemon suchen...", 
  disabled = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial load aller Pokemon
  useEffect(() => {
    const initializePokemon = async () => {
      try {
        await pokeApiService.loadAllPokemon();
      } catch (error) {
        console.error('Error initializing Pokemon:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    initializePokemon();
  }, []);

  // Search effect mit Debouncing
  useEffect(() => {
    const searchPokemon = async () => {
      if (searchTerm.trim().length === 0) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      if (searchTerm.trim().length < 2) {
        return; // Mindestens 2 Zeichen für Suche
      }

      setIsLoading(true);
      try {
        const searchResults = await pokeApiService.searchPokemon(searchTerm, 15);
        setResults(searchResults);
        setShowDropdown(searchResults.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching Pokemon:', error);
        setResults([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce die Suche um 300ms
    const timeoutId = setTimeout(searchPokemon, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelect(results[0]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const handleSelect = (pokemonName: string) => {
    onSelect(pokemonName);
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  const handleFocus = () => {
    if (results.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={initialLoading ? "Lade Pokemon..." : placeholder}
          disabled={disabled || initialLoading}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {/* Loading/Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg 
              className="w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((pokemon, index) => (
            <div
              key={pokemon}
              onClick={() => handleSelect(pokemon)}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-primary-100 text-primary-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{pokemon}</div>
            </div>
          ))}
          
          {/* Hint Text */}
          <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
            {results.length} Ergebnisse • ↑↓ Navigation • Enter Auswahl • Esc Schließen
          </div>
        </div>
      )}

      {/* No Results */}
      {showDropdown && results.length === 0 && searchTerm.length >= 2 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-3 py-4 text-gray-500 text-center">
            Keine Pokemon gefunden für "{searchTerm}"
          </div>
        </div>
      )}

      {/* Search Hint */}
      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-3 py-2 text-xs text-gray-500 text-center">
            Mindestens 2 Zeichen eingeben
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonSearch;