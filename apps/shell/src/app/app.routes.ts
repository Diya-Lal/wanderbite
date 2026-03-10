import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  {
    path: 'homepage',
    loadChildren: () => import('homepage/Routes').then((m) => m!.remoteRoutes),
  },
];
