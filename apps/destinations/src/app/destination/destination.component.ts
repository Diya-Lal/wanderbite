import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';

export interface Destination {
  city: string;
  country: string;
  region: string;
}

const ALL_DESTINATIONS: Destination[] = [
  { city: 'Paris', country: 'France', region: 'Europe' },
  { city: 'Tokyo', country: 'Japan', region: 'Asia' },
  { city: 'New York', country: 'United States', region: 'Americas' },
  { city: 'Rome', country: 'Italy', region: 'Europe' },
  { city: 'Bali', country: 'Indonesia', region: 'Asia' },
  { city: 'Barcelona', country: 'Spain', region: 'Europe' },
  { city: 'Santorini', country: 'Greece', region: 'Europe' },
  { city: 'Kyoto', country: 'Japan', region: 'Asia' },
  { city: 'Machu Picchu', country: 'Peru', region: 'Americas' },
  { city: 'Cape Town', country: 'South Africa', region: 'Africa' },
  { city: 'Sydney', country: 'Australia', region: 'Oceania' },
  { city: 'Istanbul', country: 'Turkey', region: 'Europe' },
  { city: 'Dubai', country: 'UAE', region: 'Middle East' },
  { city: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
  { city: 'Marrakech', country: 'Morocco', region: 'Africa' },
  { city: 'Prague', country: 'Czech Republic', region: 'Europe' },
  { city: 'Maldives', country: 'Maldives', region: 'Asia' },
  { city: 'Lisbon', country: 'Portugal', region: 'Europe' },
  { city: 'Vienna', country: 'Austria', region: 'Europe' },
  { city: 'Bangkok', country: 'Thailand', region: 'Asia' },
  { city: 'Rio de Janeiro', country: 'Brazil', region: 'Americas' },
  { city: 'Edinburgh', country: 'Scotland', region: 'Europe' },
  { city: 'Amalfi Coast', country: 'Italy', region: 'Europe' },
  { city: 'Queenstown', country: 'New Zealand', region: 'Oceania' },
  { city: 'Havana', country: 'Cuba', region: 'Americas' },
  { city: 'Reykjavik', country: 'Iceland', region: 'Europe' },
  { city: 'Petra', country: 'Jordan', region: 'Middle East' },
  { city: 'Serengeti', country: 'Tanzania', region: 'Africa' },
  { city: 'Vancouver', country: 'Canada', region: 'Americas' },
  { city: 'Singapore', country: 'Singapore', region: 'Asia' },
  { city: 'Zurich', country: 'Switzerland', region: 'Europe' },
  { city: 'Cairo', country: 'Egypt', region: 'Africa' },
  { city: 'Mexico City', country: 'Mexico', region: 'Americas' },
  { city: 'Seoul', country: 'South Korea', region: 'Asia' },
  { city: 'Dubrovnik', country: 'Croatia', region: 'Europe' },
  { city: 'Buenos Aires', country: 'Argentina', region: 'Americas' },
  { city: 'Phuket', country: 'Thailand', region: 'Asia' },
  { city: 'Florence', country: 'Italy', region: 'Europe' },
  { city: 'Nairobi', country: 'Kenya', region: 'Africa' },
  { city: 'Cusco', country: 'Peru', region: 'Americas' },
];

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
  selectedDestination: Destination | null = null;
  suggestions: Destination[] = [];
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
    const q = event.query.trim().toLowerCase();
    this.suggestions = ALL_DESTINATIONS.filter(
      (d) =>
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q)
    ).slice(0, 8);
  }

  selectFeatured(dest: Destination): void {
    this.selectedDestination = dest;
  }

  get displayName(): string {
    return this.selectedDestination
      ? `${this.selectedDestination.city}, ${this.selectedDestination.country}`
      : '';
  }
}
