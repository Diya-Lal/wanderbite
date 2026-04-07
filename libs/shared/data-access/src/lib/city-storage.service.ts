import { Injectable } from '@angular/core';

export interface SavedCity {
  name: string;
  displayName?: string;
  lat: number;
  lon: number;
}

const CITY_STORAGE_KEY = 'wb_selected_city';

@Injectable({ providedIn: 'root' })
export class CityStorageService {
  read(): SavedCity | null {
    try {
      const raw = sessionStorage.getItem(CITY_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.lat === 'number' && typeof parsed?.lon === 'number') {
        return { name: parsed.name ?? '', displayName: parsed.displayName, lat: parsed.lat, lon: parsed.lon };
      }
      return null;
    } catch {
      return null;
    }
  }

  write(city: SavedCity): void {
    sessionStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(city));
  }

  clear(): void {
    sessionStorage.removeItem(CITY_STORAGE_KEY);
  }
}
