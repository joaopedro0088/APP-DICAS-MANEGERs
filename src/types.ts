/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  CEO = 'CEO',
  ADM = 'ADM',
  MOD = 'MOD',
  USER = 'USER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  bio?: string;
  role: UserRole;
  favoriteGames: string[];
  level: number;
  badges: string[];
  favorites: {
    challenges: string[];
    ideas: string[];
    teams: string[];
    careers: string[];
    tips: string[];
  };
  createdAt: number;
}

export interface SaveHistoryItem {
  id: string;
  season: string;
  content: string;
  titles?: string;
  bestPlayer?: string;
  wins?: number;
  losses?: number;
  date: number;
}

export interface AppSettings {
  generatorActive: boolean;
  uploadsAllowed: boolean;
  logsPublic: boolean;
  reportsEnabled: boolean;
  dailySaveLimit: number;
  dailyGenLimit: number;
  theme: 'default' | 'neon' | 'black';
  language: 'pt' | 'en' | 'es';
  vibration: boolean;
  sounds: boolean;
  animations: boolean;
  economyMode: boolean;
  managedEras?: string[];
  managedGames?: string[];
  managedDifficulties?: string[];
}

export interface SaveGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface Save {
  id: string;
  userId: string;
  name: string;
  game: string;
  team: string;
  season: string;
  tactic: string;
  philosophy?: string;
  objective: string;
  difficulty: string;
  description: string;
  images: string[];
  history: SaveHistoryItem[];
  goals: SaveGoal[];
  stats?: {
    seasonsPlayed: number;
    titles: number;
    wins: number;
    losses: number;
    bestPlayer: string;
    progress: number; // 0-100
  };
  createdAt: number;
  updatedAt: number;
}

export interface OfficialChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Hard' | 'Extreme' | 'Month';
  rewardIcon: string;
  type: 'no-signing' | 'youth-only' | 'rebuild' | 'glory';
}

export interface CommunityTip {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  challenges?: string[];
  status: 'pending' | 'approved' | 'rejected';
  game: string;
  team?: string;
  publishedToCommunity: boolean;
  isOfficial?: boolean;
  moderatedBy?: string;
  imageUrl?: string;
  category?: string;
  createdAt: number;
}

export interface LibraryIdea {
  id: string;
  category: 'teams' | 'rules' | 'styles' | 'ready-made' | 'community';
  title: string;
  content: string;
  badge?: string;
  authorName?: string;
}

export interface ImportedCareer {
  id: string;
  name: string;
  game: string;
  team: string;
  country: string;
  league: string;
  difficulty: string;
  objective: string;
  rules: string;
  style: string;
  philosophy?: string;
  description: string;
  category: 'Rebuild' | 'Time Pequeno' | 'Sem Dinheiro' | 'Jovens/Promessas' | 'Desafio Difícil' | 'Longa Duração' | 'Carreira Curta';
  type: 'Official' | 'Special' | 'Community';
  status?: string;
  authorId?: string;
  imageUrl?: string;
  published: boolean;
  featured: boolean;
  createdAt: number;
}

export interface AppLog {
  id: string;
  title: string;
  version: string;
  date: number;
  type: 'update' | 'fix' | 'news';
  description: string;
}

export interface GeneratorItem {
  id: string;
  game: string;
  teams: string[];
  objectives: string[];
  rules: string[];
  styles: string[];
}

export interface Report {
  id: string;
  reportedBy: string;
  targetId: string; // User ID or Save ID
  targetType: 'user' | 'save';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
}

export interface GeneratorResult {
  team: string;
  objective: string;
  rule: string;
  style: string;
  philosophy?: string;
  transferBudget?: string;
  youthFocus?: string;
  difficulty?: string;
  game?: string;
  type?: string;
  timestamp: number;
}

export interface UserStats {
  generationsToday: number;
  lastGenerationDate: string; // YYYY-MM-DD
  savesCreatedThisMonth: number;
  lastSaveDate: string; // YYYY-MM-DD
}
