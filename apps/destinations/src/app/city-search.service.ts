import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CityResult, OpenMeteoResponse } from './types/destination.types';
import { GEOCODING_BASE_URL, GEOCODING_RESULTS_COUNT, GEOCODING_MIN_QUERY_LENGTH } from './constants/destination.constants';

export type { CityResult };

@Injectable({ providedIn: 'root' })
export class CitySearchService {
  private readonly http = inject(HttpClient);

  search(query: string): Observable<CityResult[]> {
    if (!query || query.trim().length < GEOCODING_MIN_QUERY_LENGTH) return of([]);

    const params = new HttpParams()
      .set('name', query.trim())
      .set('count', String(GEOCODING_RESULTS_COUNT))
      .set('language', 'en')
      .set('format', 'json');

    return this.http.get<OpenMeteoResponse>(GEOCODING_BASE_URL, { params }).pipe(
      map((res) =>
        (res.results ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          country: r.country ?? '',
          region: r.admin1 ?? '',
          displayName: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
          lat: r.latitude,
          lon: r.longitude,
        }))
      ),
      catchError(() => of([]))
    );
  }
}
