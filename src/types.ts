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

export interface PromoCode {
  id: string; // O próprio código (ex: FOX-PRO-2024)
  type: 'badge' | 'role' | 'level' | 'status';
  value: string; // O que ele dá (ex: "Elite Member", "ADM", "5")
  uses: number;
  maxUses: number;
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
}

export interface WeeklyEvent {
  id: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  type: 'challenge' | 'community' | 'news';
  rewardIcon?: string;
  badgeId?: string;
}

export interface HallOfFameEntry {
  id: string;
  saveId: string;
  userId: string;
  userName: string;
  team: string;
  titles: number;
  seasons: number;
  bestPlayer: string;
  reason: string;
  date: number;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  type: 'financial' | 'player' | 'transfer' | 'club';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  bannerUrl?: string; // Profile Banner
  bio?: string;
  role: UserRole;
  favoriteGames: string[];
  level: number;
  xp: number;
  badges: string[];
  usedCodes?: string[];
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
  seasonNumber?: number;
  content: string;
  type?: 'normal' | 'milestone' | 'title' | 'season_start' | 'season_end';
  icon?: string;
  badge?: string;
  titles?: string;
  bestPlayer?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  maxUnbeatenRun?: number;
  isFeatured?: boolean;
  imageUrl?: string;
  squad?: {
    goalie?: string;
    captain?: string;
    topScorer?: string;
    youngTalent?: string;
    starPlayer?: string;
  };
  tactic?: string;
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
  managerName?: string;
  name: string;
  game: string;
  team: string;
  country?: string;
  league?: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  managerPersonality?: string;
  season: string;
  tactic: string;
  philosophy?: string;
  objective: string;
  miniHistory?: string;
  category: string;
  minSeasons?: number;
  maxSeasons?: number;
  selectedDuration: number;
  specificRules?: string[];
  challengeBadge?: string;
  difficulty: string;
  description: string;
  rewardBadge?: string;
  tags?: string[];
  bannerStyle?: string;
  originId?: string; // ID of the career/tip/suggestion accepted
  status: 'active' | 'finished';
  isCEOChoice?: boolean;
  coherenceScore?: number;
  isExtreme?: boolean;
  unusualStatsAlert?: boolean;
  theme: 'default' | 'neon' | 'stadium' | 'classic' | 'retro';
  clubHistory: {
    team: string;
    season: string;
    country?: string;
    titles?: number;
  }[];
  images: string[]; // This can serve as the gallery
  history: SaveHistoryItem[];
  goals: SaveGoal[];
  importantPlayers?: {
    id: string;
    name: string;
    role: 'artilheiro' | 'garçom' | 'paredão' | 'líder' | 'promessa' | 'craque';
    rating?: number;
    season: string;
  }[];
  stats?: {
    seasonsPlayed: number;
    titles: number;
    wins: number;
    losses: number;
    draws?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    bestPlayer: string;
    progress: number; // 0-100
    maxUnbeatenRun?: number;
    winRate?: number;
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

export interface SystemUpdate {
  id: string;
  title: string;
  version: string;
  date: number;
  type: 'update' | 'fix' | 'news';
  description: string;
}

export interface AppLog {
  id: string;
  user: string;
  text: string;
  type: 'info' | 'admin' | 'error';
  timestamp: number;
  details?: any;
  title?: string; // Legacy support
  message?: string; // Legacy support
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
  country?: string;
  league?: string;
  miniHistory?: string;
  duration?: string;
  tags?: string[];
  rewardBadge?: string;
  timestamp: number;
}

export interface UserStats {
  generationsToday: number;
  lastGenerationDate: string; // YYYY-MM-DD
  savesCreatedThisMonth: number;
  lastSaveDate: string; // YYYY-MM-DD
  // Performance Stats
  totalTitles?: number;
  totalSeasons?: number;
  maxUnbeatenRun?: number;
  bestSaveId?: string;
}
