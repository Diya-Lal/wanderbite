import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CityResult, CitySearchService } from '../city-search.service';
import { CityStorageService } from '@org/data-access';

export interface Destination {
  city: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
}

export const FEATURED_DESTINATIONS: Destination[] = [
  { city: 'Paris',     country: 'France',    region: 'Europe', lat: 48.8566,  lon: 2.3522   },
  { city: 'Tokyo',     country: 'Japan',     region: 'Asia',   lat: 35.6762,  lon: 139.6503 },
  { city: 'Santorini', country: 'Greece',    region: 'Europe', lat: 36.3932,  lon: 25.4615  },
  { city: 'Bali',      country: 'Indonesia', region: 'Asia',   lat: -8.3405,  lon: 115.0920 },
  { city: 'Marrakech', country: 'Morocco',   region: 'Africa', lat: 31.6295,  lon: -7.9811  },
  { city: 'Reykjavik', country: 'Iceland',   region: 'Europe', lat: 64.1265,  lon: -21.8174 },
];

@Component({
  selector: 'app-destination',
  imports: [FormsModule, RouterModule, AutoComplete],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DestinationComponent {
  private citySearch = inject(CitySearchService);
  private cityStorage = inject(CityStorageService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  selectedCity: CityResult | null = null;
  suggestions: CityResult[] = [];
  searching = false;
  featured = FEATURED_DESTINATIONS;

  constructor() {
    this.selectedCity = this.cityStorage.read() as CityResult | null;

    this.searchSubject.pipe(
      debounceTime(150),
      switchMap((query) => this.citySearch.search(query)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (results) => { this.suggestions = results; this.searching = false; this.cdr.detectChanges(); },
      error: () => { this.suggestions = []; this.searching = false; this.cdr.detectChanges(); },
    });
  }

  regionIcons: Record<string, string> = {
    Europe: '🏰',
    Asia: '🌸',
    Americas: '🌎',
    Africa: '🌍',
    Oceania: '🌊',
    'Middle East': '🕌',
  };

  search(event: AutoCompleteCompleteEvent): void {
    this.searching = true;
    this.searchSubject.next(event.query);
  }

  onCitySelect(): void {
    if (this.selectedCity?.lat) {
      this.cityStorage.write(this.selectedCity);
    }
  }

  onCityClear(): void {
    this.selectedCity = null;
    this.cityStorage.clear();
  }

  selectFeatured(dest: Destination): void {
    this.selectedCity = {
      id: 0,
      name: dest.city,
      displayName: `${dest.city}, ${dest.country}`,
      country: dest.country,
      region: dest.region,
      lat: dest.lat,
      lon: dest.lon,
    };
    this.cityStorage.write(this.selectedCity);
  }

  get selectedDestinationName(): string {
    return this.selectedCity?.name ?? '';
  }

  exploreRestaurants(): void {
    if (!this.selectedCity) return;
    this.router.navigate(['/food'], {
      queryParams: {
        city: this.selectedCity.name,
        lat: this.selectedCity.lat,
        lon: this.selectedCity.lon,
      },
    });
  }

  exploreActivities(): void {
    if (!this.selectedCity) return;
    this.router.navigate(['/activities'], {
      queryParams: {
        city: this.selectedCity.name,
        lat: this.selectedCity.lat,
        lon: this.selectedCity.lon,
      },
    });
  }
}
