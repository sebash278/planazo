import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const httpsJwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Bloquea peticiones HTTP en texto plano hacia endpoints externos (RNF-01 / RNF-04).
  if (/^http:\/\//i.test(req.url)) {
    return throwError(
      () => new Error(`Petición insegura bloqueada: se requiere HTTPS/TLS 1.3 (${req.url})`)
    );
  }

  const token = authService.token();
  if (token && authService.isAuthenticated()) {
    const authenticatedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authenticatedReq);
  }

  return next(req);
};
