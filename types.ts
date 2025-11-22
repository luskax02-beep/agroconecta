
export interface GroundingChunk {
  maps?: {
    title: string;
    uri: string;
  };
  web?: {
    title: string;
    uri: string;
  };
}

export interface AnalysisResult {
  diagnosis: string;
  stores: string;
  groundingChunks: GroundingChunk[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  result: AnalysisResult;
  thumbnail?: string; // Optional: preview image URL if we decide to store it
}

export interface UserProfile {
  farmName: string;
  location: string;
  crops: string[];
  history: HistoryItem[];
}
