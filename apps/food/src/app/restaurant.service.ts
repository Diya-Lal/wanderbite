import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SEARCH_RADIUS_METRES } from '@org/utils';
import { Restaurant, OverpassElement, OverpassResponse } from './types/restaurant.types';
import {
  OVERPASS_MIRRORS,
  OVERPASS_TIMEOUT,
  OVERPASS_RESULTS_LIMIT,
  MAX_RATING,
  CUISINE_IMAGES,
} from './constants/restaurant.constants';

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
  return isNaN(n) ? null : Math.min(MAX_RATING, n);
}

function buildAddress(tags: Record<string, string>): string {
  return [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
    .filter(Boolean)
    .join(' ') || tags['addr:full'] || '';
}

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly http = inject(HttpClient);

  getRestaurants(lat: number, lon: number): Observable<Restaurant[]> {
    const query = `[out:json][timeout:${OVERPASS_TIMEOUT}];node["amenity"="restaurant"](around:${SEARCH_RADIUS_METRES},${lat},${lon});out ${OVERPASS_RESULTS_LIMIT};`;
    const body = `data=${encodeURIComponent(query)}`;
    const options = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

    const requests = OVERPASS_MIRRORS.map((url) =>
      this.http.post<OverpassResponse>(url, body, options)
    );

    return requests[0].pipe(
      catchError(() => requests[1].pipe(catchError(() => requests[2]))),
      map((res) =>
        (res.elements ?? [])
          .filter((el: OverpassElement) => el.tags?.['name'])
          .map((el: OverpassElement) => ({
            id: el.id,
            name: el.tags['name'],
            cuisine: el.tags['cuisine']?.split(';')[0]?.trim() ?? 'Restaurant',
            address: buildAddress(el.tags),
            rating: parseRating(el.tags),
            stars: (() => { const r = Math.round(parseRating(el.tags) ?? 0); return Array.from({ length: 5 }, (_, i) => i + 1 <= r ? 1 : 0); })(),
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
