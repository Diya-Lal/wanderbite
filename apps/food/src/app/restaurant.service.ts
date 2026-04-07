import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  address: string;
  rating: number | null;
  openingHours: string | null;
  website: string | null;
  phone: string | null;
  imageUrl: string;
  lat: number;
  lon: number;
}

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const CUISINE_IMAGES: Record<string, string> = {
  japanese:    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
  italian:     'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  french:      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  chinese:     'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
  indian:      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  mexican:     'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
  thai:        'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80',
  american:    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  mediterranean: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
  seafood:     'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80',
  pizza:       'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  burger:      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  sushi:       'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80',
  steak:       'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
  vietnamese:  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
  korean:      'https://images.unsplash.com/photo-1583592643761-ebb6a1da4060?w=600&q=80',
  greek:       'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&q=80',
  spanish:     'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80',
  default:     'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
};

function sanitizeWebsiteUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

function getCuisineImage(cuisine: string | undefined): string {
  if (!cuisine) return CUISINE_IMAGES['default'];
  const key = cuisine.toLowerCase().split(';')[0].trim();
  return CUISINE_IMAGES[key] ?? CUISINE_IMAGES['default'];
}

function parseRating(tags: Record<string, string>): number | null {
  const raw = tags['stars'] ?? tags['rating'] ?? tags['michelin:stars'];
  if (!raw) return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : Math.min(5, n);
}

function buildAddress(tags: Record<string, string>): string {
  return [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
  ]
    .filter(Boolean)
    .join(' ') || tags['addr:full'] || '';
}

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly http = inject(HttpClient);

  private readonly MIRRORS = [
    'https://overpass.openstreetmap.fr/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ];

  getRestaurants(lat: number, lon: number): Observable<Restaurant[]> {
    const radius = 5000;
    const query = `[out:json][timeout:25];node["amenity"="restaurant"](around:${radius},${lat},${lon});out 50;`;
    const body = `data=${encodeURIComponent(query)}`;
    const options = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

    const requests = this.MIRRORS.map((url) =>
      this.http.post<OverpassResponse>(url, body, options)
    );

    return requests[0].pipe(
      catchError(() => requests[1]),
      catchError(() => requests[2]),
      map((res) =>
        (res.elements ?? [])
          .filter((el) => el.tags?.['name'])
          .map((el) => ({
            id: el.id,
            name: el.tags['name'],
            cuisine: el.tags['cuisine']?.split(';')[0]?.trim() ?? 'Restaurant',
            address: buildAddress(el.tags),
            rating: parseRating(el.tags),
            openingHours: el.tags['opening_hours'] ?? null,
            website: sanitizeWebsiteUrl(el.tags['website'] ?? el.tags['contact:website']),
            phone: el.tags['phone'] ?? el.tags['contact:phone'] ?? null,
            imageUrl: getCuisineImage(el.tags['cuisine']),
            lat: el.lat,
            lon: el.lon,
          }))
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      ),
      catchError(() => of([]))
    );
  }
}
