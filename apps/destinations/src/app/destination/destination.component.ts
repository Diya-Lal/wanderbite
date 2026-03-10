import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CityResult, CitySearchService } from '../city-search.service';

export interface Destination {
  city: string;
  country: string;
  region: string;
}

export const FEATURED_DESTINATIONS: Destination[] = [
  { city: 'Paris', country: 'France', region: 'Europe' },
  { city: 'Tokyo', country: 'Japan', region: 'Asia' },
  { city: 'Santorini', country: 'Greece', region: 'Europe' },
  { city: 'Bali', country: 'Indonesia', region: 'Asia' },
  { city: 'Marrakech', country: 'Morocco', region: 'Africa' },
  { city: 'Reykjavik', country: 'Iceland', region: 'Europe' },
];

@Component({
  selector: 'app-destination',
  imports: [FormsModule, RouterModule, AutoComplete],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss',
})
export class DestinationComponent {
  private citySearch = inject(CitySearchService);
  private cdr = inject(ChangeDetectorRef);

  selectedCity: CityResult | null = null;
  suggestions: CityResult[] = [];
  searching = false;
  featured = FEATURED_DESTINATIONS;

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
    this.citySearch.search(event.query).subscribe({
      next: (results) => {
        this.suggestions = results;
        this.searching = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.suggestions = [];
        this.searching = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectFeatured(dest: Destination): void {
    this.selectedCity = {
      id: 0,
      name: dest.city,
      displayName: `${dest.city}, ${dest.country}`,
      country: dest.country,
      region: dest.region,
      lat: 0,
      lon: 0,
    };
  }

  get selectedDestinationName(): string {
    return this.selectedCity?.name ?? '';
  }
}
