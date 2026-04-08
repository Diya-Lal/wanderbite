import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Location, DecimalPipe, TitleCasePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { RestaurantService } from '../../restaurant.service';
import { Restaurant } from '../../types/restaurant.types';
import { CityStorageService } from '@org/data-access';

@Component({
  selector: 'app-restaurants',
  imports: [RouterModule, DecimalPipe, TitleCasePipe],
  templateUrl: './restaurants.component.html',
  styleUrl: './restaurants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestaurantsComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private restaurantService = inject(RestaurantService);
  private cityStorage = inject(CityStorageService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  city = '';
  lat = 0;
  lon = 0;
  restaurants: Restaurant[] = [];
  loading = false;
  error = false;

  ngOnInit(): void {
    this.readQueryParams();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.readQueryParams());
  }

  private readQueryParams(): void {
    const params = new URLSearchParams(window.location.search);
    this.city = params.get('city') ?? '';
    this.lat = parseFloat(params.get('lat') ?? '0');
    this.lon = parseFloat(params.get('lon') ?? '0');

    // Fall back to last selected city from sessionStorage (when navigating via nav bar)
    if (!this.lat || !this.lon) {
      const c = this.cityStorage.read();
      if (c) {
        this.city = c.name;
        this.lat = c.lat;
        this.lon = c.lon;
      }
    }

    if (this.lat && this.lon) {
      this.fetchRestaurants();
    }
  }

  private fetchRestaurants(): void {
    this.loading = true;
    this.error = false;
    this.restaurantService.getRestaurants(this.lat, this.lon).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (results) => {
        this.restaurants = results;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  openMap(restaurant: Restaurant): void {
    window.open(
      `https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lon}&zoom=17`,
      '_blank',
      'noopener,noreferrer'
    );
  }
}
