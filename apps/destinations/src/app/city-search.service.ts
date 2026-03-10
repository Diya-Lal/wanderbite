import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CityResult {
  id: number;
  name: string;
  displayName: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
}

interface OpenMeteoResult {
  id: number;
  name: string;
  country: string;
  admin1: string;
  latitude: number;
  longitude: number;
}

interface OpenMeteoResponse {
  results?: OpenMeteoResult[];
}

@Injectable({ providedIn: 'root' })
export class CitySearchService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL =
    'https://geocoding-api.open-meteo.com/v1/search';

  search(query: string): Observable<CityResult[]> {
    if (!query || query.trim().length < 2) return of([]);

    const params = new HttpParams()
      .set('name', query.trim())
      .set('count', '8')
      .set('language', 'en')
      .set('format', 'json');

    return this.http.get<OpenMeteoResponse>(this.BASE_URL, { params }).pipe(
      map((res) =>
        (res.results ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          country: r.country ?? '',
          region: r.admin1 ?? '',
          displayName: [r.name, r.admin1, r.country]
            .filter(Boolean)
            .join(', '),
          lat: r.latitude,
          lon: r.longitude,
        }))
      ),
      catchError(() => of([]))
    );
  }
}
