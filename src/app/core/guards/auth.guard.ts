import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  const message = state.url.includes('perfil')
    ? 'Inicia sesión para gestionar tu perfil y preferencias'
    : 'Inicia sesión para consultar y guardar tus eventos favoritos';

  return router.createUrlTree(['/auth/login'], {
    queryParams: {
      returnUrl: state.url,
      message,
    },
  });
};
