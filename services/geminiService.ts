
import type { GroundingChunk, AnalysisResult, TerrainAnalysis } from '../types';

export const analyzeCrop = async (imageFile: File, userLocation?: string): Promise<AnalysisResult> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64Data = (reader.result as string).split(',')[1];
                const res = await fetch("/api/analyzeCrop", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image: base64Data,
                        mimeType: imageFile.type,
                        location: userLocation
                    })
                });
                
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Failed to analyze crop.");
                }
                const data = await res.json();
                resolve(data as AnalysisResult);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
};

export const analyzeTerrain = async (location: string): Promise<TerrainAnalysis> => {
    const res = await fetch("/api/analyzeTerrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location })
    });
    
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to analyze terrain.");
    }
    return await res.json() as TerrainAnalysis;
};

