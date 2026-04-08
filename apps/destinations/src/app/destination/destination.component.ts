import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CitySearchService } from '../city-search.service';
import { CityResult, Destination } from '../types/destination.types';
import { FEATURED_DESTINATIONS, REGION_ICONS } from '../constants/destination.constants';
import { CityStorageService } from '@org/data-access';

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

  readonly regionIcons = REGION_ICONS;

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
