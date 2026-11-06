import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'explorar',
        loadComponent: () =>
          import('../pages/explore/explore.page').then((m) => m.ExplorePage),
      },
      {
        path: 'buscar',
        loadComponent: () =>
          import('../pages/search-map/search-map.page').then((m) => m.SearchMapPage),
      },
      {
        path: 'favoritos',
        loadComponent: () =>
          import('../pages/favorites/favorites.page').then((m) => m.FavoritesPage),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
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
