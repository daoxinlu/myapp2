export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SubAttraction {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  distance?: string;
  type?: string;
  subAttractions?: SubAttraction[];
}

export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean; // Added isPaused state
  isLoading: boolean;
  currentText: string | null;
  playingItemName?: string | null; // Track specific item name playing
}