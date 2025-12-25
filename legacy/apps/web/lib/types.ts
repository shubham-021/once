export interface CharacterState {
  name: string;
  coreTrait: string;
  genre: string;
  location: string;
  health: number;
  inventory: InventoryItem[];
  customAttributes?: Record<string, any>;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export type SceneType = 'narrative' | 'action' | 'system';

export interface Scene {
  id: string;
  type: SceneType;
  content: string;
  timestamp: number;
  stateChanges?: Partial<CharacterState>;
}

export interface StoryHistory {
  scenes: Scene[];
}

export interface SetupData {
  protagonistName: string;
  coreTrait: string;
  genre: string;
  startingScenario: string;
}

export interface GenerateSceneRequest {
  action?: string;
  characterState: CharacterState;
  recentHistory: Scene[];
  setupData?: SetupData;
}

export interface GenerateSceneResponse {
  scene: {
    content: string;
    type: SceneType;
  };
  stateUpdates?: {
    location?: string;
    health?: number;
    inventoryChanges?: {
      added?: InventoryItem[];
      removed?: string[];
    };
    customAttributes?: Record<string, any>;
  };
}

export interface StoryState {
  id: string;
  setupData: SetupData;
  characterState: CharacterState;
  history: StoryHistory;
  createdAt: number;
  updatedAt: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

export interface BackendStartRequest {
  title: string;
  description: string;
  name: string;
  currentScenario: string;
  location: string;
  genre: string;
  baseTraits: string;
  userId: string;
}

export interface BackendStartResponse {
  data: string;
  storyId: string;
  protagonistId: string;
}

export interface BackendContinueRequest {
  storyId: string;
  userId: string;
  userAction: string;
  NARRATIVE_REWRITE_TOKEN?: string;
}

export interface BackendContinueResponse {
  data: string;
  newState: {
    name: string;
    location: string;
    baseTraits: string[];
    health: number;
    inventory: string[];
    currentTraits: string[];
  };
}
