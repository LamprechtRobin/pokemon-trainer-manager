export interface Attack {
  id: string;
  name: string;
  type: string; // Pokemon type (fire, water, etc.)
  power: number;
  accuracy: number; // 0-100
  tier: 1 | 2 | 3; // 1 = basic, 2 = intermediate, 3 = advanced
  evolvesTo?: string; // ID of the next tier attack
  effect?: string; // Optional effect description
}

export interface AttackDatabase {
  attacks: Attack[];
}