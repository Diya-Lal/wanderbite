import { Route } from '@angular/router';
import { ActivitiesPageComponent } from './activities-page/activities-page.component';

export const appRoutes: Route[] = [
  {
    path: 'destination',
    loadChildren: () =>
      import('destinations/Routes').then((m) => m!.remoteRoutes),
  },
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  {
    path: 'homepage',
    loadChildren: () => import('homepage/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'food',
    loadChildren: () => import('food/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'activities',
    component: ActivitiesPageComponent,
  },
];
