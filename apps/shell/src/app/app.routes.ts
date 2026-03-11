import { Route } from '@angular/router';

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
];
