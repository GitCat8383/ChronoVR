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

export interface MapLocation {
  id: string;
  name: string;
  x: number; // 0-100 percentage for map positioning
  y: number; // 0-100 percentage
  type: 'strategic' | 'cultural' | 'conflict';
  description: string;
  visualPrompt: string; // Prompt to generate the 3D/Panoramic view
}

export interface Perspective {
  id: string;
  name: string;
  role: string;
  type: 'key_figure' | 'commoner' | 'expert';
  content: string; // Their quote/viewpoint
}

export interface LocalNPC {
  id: string;
  name: string;
  role: string;
  activity: string;
  videoPrompt: string;
  videoUri?: string;
}

export interface GameState {
  currentLocation: string;
  currentDescription: string;
  imageUrl: string | null;
  mapBackgroundUrl: string | null; // URL for the generated strategic map
  isLoadingImage: boolean;
  isLoadingText: boolean;
  npcName: string; // Currently active chat NPC
  npcRole: string; // Currently active chat NPC role
  nearbyNPCs: LocalNPC[]; // List of all nearby characters
  atmosphere: Atmosphere;
  confidence: ConfidenceData;
  simulation: SimulationState;
  showConfidenceLayer: boolean;
  historicalEvents: HistoricalEvent[];
  mapLocations: MapLocation[];
  perspectives: Perspective[];
  isGeneratingVideo: boolean;
  currentVideoEventId: string | null;
  currentVideoNPCId: string | null; // Track which NPC video is generating
  viewingLocationId: string | null;
  locationVisuals: Record<string, string>; // Cache for map visual URLs
}

export interface NavigationAction {
  type: 'move' | 'look' | 'inspect' | 'interact';
  detail: string;
}