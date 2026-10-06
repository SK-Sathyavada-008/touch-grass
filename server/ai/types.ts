import { TenMinuteAdventure, ExploreAdventure, ImageAnalysisResult, TenMinuteAdventureParams } from '../types.js';

export interface NearbyPlace {
  name: string;
  type: string;
  distance?: string;
  lat?: number;
  lon?: number;
}

export interface IGemmaProvider {
  readonly name: string;
  readonly isMock: boolean;
  generateTenMinuteAdventure(params?: TenMinuteAdventureParams | string): Promise<TenMinuteAdventure>;
  generateExploreAdventure(
    timeMinutes: number,
    groupType: 'solo' | 'friends',
    nearbyPlaces: NearbyPlace[]
  ): Promise<ExploreAdventure>;
  generateQuestClue(destinationName: string, destinationType: string): Promise<string>;
  analyzeDiscoveryImage(imageBase64: string, mimeType: string): Promise<ImageAnalysisResult>;
}
