import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'event/:id',
    loadComponent: () =>
      import('./pages/event-detail/event-detail.page').then((m) => m.EventDetailPage),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./pages/auth/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
