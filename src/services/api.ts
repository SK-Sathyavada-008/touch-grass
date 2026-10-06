import type { TenMinuteAdventure, ExploreAdventure, DiscoveryItem } from '../types';

export class ApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[ApiService] Request to ${endpoint} failed:`, err);
      throw err;
    }
  }

  static async getHealth(): Promise<{ status: string; provider: string; isMock: boolean; model: string }> {
    return this.request('/api/health');
  }

  static async generateTenMinuteAdventure(vibe?: string): Promise<TenMinuteAdventure> {
    return this.request('/api/adventure/ten-minute', {
      method: 'POST',
      body: JSON.stringify({ vibe }),
    });
  }

  static async generateExploreAdventure(params: {
    timeMinutes: number;
    groupType: 'solo' | 'friends';
    lat?: number;
    lon?: number;
  }): Promise<ExploreAdventure> {
    return this.request('/api/adventure/explore', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  static async generateClue(destinationName: string, destinationType: string): Promise<{ clue: string }> {
    return this.request('/api/adventure/clue', {
      method: 'POST',
      body: JSON.stringify({ destinationName, destinationType }),
    });
  }

  static async analyzeDiscovery(imageBase64: string, mimeType: string): Promise<Omit<DiscoveryItem, 'id' | 'timestamp' | 'imageUrl'>> {
    return this.request('/api/discovery/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType }),
    });
  }
}
