import { Pokemon } from '../types/pokemon';

const dummyPokemonNames = [
  'Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Alakazam',
  'Machamp', 'Golem', 'Lapras', 'Snorlax', 'Dragonite',
  'Mewtwo', 'Mew', 'Lugia', 'Ho-Oh', 'Rayquaza'
];

const pokemonTypes = [
  'Electric', 'Fire', 'Water', 'Grass', 'Psychic',
  'Fighting', 'Rock', 'Ice', 'Normal', 'Dragon'
];

export const generateDummyPokemon = (count: number = 1): Pokemon[] => {
  const pokemon: Pokemon[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomName = dummyPokemonNames[Math.floor(Math.random() * dummyPokemonNames.length)];
    const randomType = pokemonTypes[Math.floor(Math.random() * pokemonTypes.length)];
    const randomLevel = Math.floor(Math.random() * 100) + 1;
    
    pokemon.push({
      name: randomName,
      level: randomLevel,
      type: randomType,
      species: randomName,
      abilities: ['Dummy Ability'],
      moves: ['Dummy Move'],
      stats: {
        hp: Math.floor(Math.random() * 100) + 50,
        attack: Math.floor(Math.random() * 100) + 50,
        defense: Math.floor(Math.random() * 100) + 50,
        speed: Math.floor(Math.random() * 100) + 50,
      },
      isShiny: Math.random() < 0.1, // 10% chance for shiny
      createdAt: new Date().toISOString()
    });
  }
  
  return pokemon;
};

export const getRandomPokemonTeam = (teamSize: number = 3): Pokemon[] => {
  const maxTeamSize = Math.min(teamSize, 6); // Max 6 Pokemon per team
  return generateDummyPokemon(maxTeamSize);
};