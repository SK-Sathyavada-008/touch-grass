import { NearbyPlace } from '../ai/types.js';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    leisure?: string;
    natural?: string;
    amenity?: string;
    tourism?: string;
  };
}

export class OsmService {
  /**
   * Search nearby outdoor places using public OpenStreetMap Overpass API
   */
  static async findNearbyOutdoorSpots(lat: number, lon: number, radiusMeters = 2500): Promise<NearbyPlace[]> {
    try {
      // Short Overpass QL query looking for parks, gardens, nature reserves, viewpoints
      const query = `
        [out:json][timeout:5];
        (
          node["leisure"~"park|garden|nature_reserve"](around:${radiusMeters},${lat},${lon});
          way["leisure"~"park|garden|nature_reserve"](around:${radiusMeters},${lat},${lon});
          node["natural"~"wood|water|tree"](around:${radiusMeters},${lat},${lon});
          node["tourism"="viewpoint"](around:${radiusMeters},${lat},${lon});
        );
        out center 10;
      `;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'TouchGrassPWA/1.0',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[OSM] Overpass API returned status ${response.status}`);
        return this.getDefaultOutdoorSpots();
      }

      const data = await response.json();
      const elements: OverpassElement[] = data?.elements || [];

      const named = elements.filter(el => el.tags?.name);
      if (named.length === 0) {
        return this.getDefaultOutdoorSpots();
      }

      return named.slice(0, 3).map((el, i) => {
        const placeLat = el.lat || el.center?.lat;
        const placeLon = el.lon || el.center?.lon;
        const distKm = placeLat && placeLon ? this.calculateDistanceKm(lat, lon, placeLat, placeLon) : (i + 1) * 0.4;
        
        let spotType = 'park';
        if (el.tags?.leisure === 'garden') spotType = 'garden';
        else if (el.tags?.natural === 'water') spotType = 'water';
        else if (el.tags?.tourism === 'viewpoint') spotType = 'viewpoint';
        else if (el.tags?.natural === 'wood') spotType = 'woods';

        return {
          name: el.tags!.name!,
          type: spotType,
          distance: distKm < 1 ? `${Math.round(distKm * 1000)}m away` : `${distKm.toFixed(1)}km away`,
          lat: placeLat,
          lon: placeLon,
        };
      });
    } catch (err) {
      console.warn(`[OSM] Failed to query OSM Overpass or timed out: ${(err as Error).message}`);
      return this.getDefaultOutdoorSpots();
    }
  }

  private static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static getDefaultOutdoorSpots(): NearbyPlace[] {
    return [
      { name: 'Nearest Shaded Park', type: 'park', distance: '300m away' },
      { name: 'Community Garden or Flowerbed', type: 'garden', distance: '550m away' },
      { name: 'Tranquil Tree Canopy or Open Clearing', type: 'woods', distance: '800m away' },
    ];
  }
}
