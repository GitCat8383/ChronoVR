export enum Era {
  ANCIENT_ROME = 'Ancient Rome (100 AD)',
  TENOCHTITLAN = 'Tenochtitlan (1500 AD)',
  VICTORIAN_LONDON = 'Victorian London (1880 AD)',
  ANCIENT_EGYPT = 'Ancient Egypt, Giza (2500 BC)',
  VIETNAM_WAR = 'Vietnam War, Saigon (1968 AD)'
}

export interface Message {
  id: string;
  sender: 'user' | 'npc';
  text: string;
  timestamp: Date;
}

export interface Atmosphere {
  weather: string;
  sound: string;
  smell: string;
  lighting: string;
}

export interface ConfidenceData {
  proven: string[];      // Green: Hard evidence
  likely: string[];      // Yellow: Expert speculation
  speculative: string[]; // Red: AI filler
}

export interface SimulationState {
  isActive: boolean;
  role: string;
  objective: string;
  timeOfDay: string;
  gold: number;
  health: number;
  inventory: string[];
  lastActionResult?: string; // e.g. "You lost 2 gold"
}

export interface HistoricalEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  impact: string;
  videoPrompt: string;
  videoUri?: string;
}

export interface GameState {
  currentLocation: string;
  currentDescription: string;
  imageUrl: string | null;
  isLoadingImage: boolean;
  isLoadingText: boolean;
  npcName: string;
  npcRole: string;
  atmosphere: Atmosphere;
  confidence: ConfidenceData;
  simulation: SimulationState;
  showConfidenceLayer: boolean;
  historicalEvents: HistoricalEvent[];
  isGeneratingVideo: boolean;
  currentVideoEventId: string | null;
}

export interface NavigationAction {
  type: 'move' | 'look' | 'inspect' | 'interact';
  detail: string;
}