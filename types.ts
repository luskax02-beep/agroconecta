
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
