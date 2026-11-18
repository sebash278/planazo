import type { Routes } from '@angular/router';

import { authGuard } from '../core/guards/auth.guard';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'explorar',
        loadComponent: () =>
          import('../features/events/explore/explore.page').then((m) => m.ExplorePage),
      },
      {
        path: 'buscar',
        loadComponent: () =>
          import('../features/events/search-map/search-map.page').then((m) => m.SearchMapPage),
      },
      {
        path: 'favoritos',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../features/favorites/favorites.page').then((m) => m.FavoritesPage),
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../features/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: '/tabs/explorar',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/explorar',
    pathMatch: 'full',
  },
];
