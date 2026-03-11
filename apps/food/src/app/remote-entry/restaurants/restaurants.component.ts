import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Location, DecimalPipe, TitleCasePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Restaurant, RestaurantService } from '../../restaurant.service';

@Component({
  selector: 'app-restaurants',
  imports: [RouterModule, DecimalPipe, TitleCasePipe],
  templateUrl: './restaurants.component.html',
  styleUrl: './restaurants.component.scss',
})
export class RestaurantsComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private restaurantService = inject(RestaurantService);
  private cdr = inject(ChangeDetectorRef);

  city = '';
  lat = 0;
  lon = 0;
  restaurants: Restaurant[] = [];
  loading = false;
  error = false;

  ngOnInit(): void {
    this.readQueryParams();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.readQueryParams());
  }

  private readQueryParams(): void {
    const params = new URLSearchParams(window.location.search);
    this.city = params.get('city') ?? '';
    this.lat = parseFloat(params.get('lat') ?? '0');
    this.lon = parseFloat(params.get('lon') ?? '0');
    if (this.lat && this.lon) {
      this.fetchRestaurants();
    }
  }

  private fetchRestaurants(): void {
    this.loading = true;
    this.error = false;
    this.restaurantService.getRestaurants(this.lat, this.lon).subscribe({
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

  getStars(rating: number | null): number[] {
    const r = Math.round(rating ?? 0);
    return Array.from({ length: 5 }, (_, i) => i + 1).map((i) => (i <= r ? 1 : 0));
  }

  goBack(): void {
    this.location.back();
  }

  openMap(restaurant: Restaurant): void {
    window.open(
      `https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lon}&zoom=17`,
      '_blank'
    );
  }
}
