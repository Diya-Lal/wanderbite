import { Route } from '@angular/router';
import { RestaurantsComponent } from '../restaurants/restaurants.component';

export const remoteRoutes: Route[] = [
  { path: '', component: RestaurantsComponent },
];
