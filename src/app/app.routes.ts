import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'event/:id',
    loadComponent: () =>
      import('./features/events/event-detail/event-detail.page').then((m) => m.EventDetailPage),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
