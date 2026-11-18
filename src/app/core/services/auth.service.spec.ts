import { TestBed } from '@angular/core/testing';
import type { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { authGuard } from '../guards/auth.guard';

import { AuthService } from './auth.service';

function createJwtWithExp(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'usr-test',
      email: 'test@funza.gov.co',
      exp: expSeconds,
    })
  );
  const sig = btoa('sig');
  return `${header}.${payload}.${sig}`;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), AuthService],
    });
    service = TestBed.inject(AuthService);
    service.enableLocalTestMode();
  });

  it('should detect configured Firebase credentials and start in guest mode', () => {
    expect(service).toBeTruthy();
    expect(service.isFirebaseConfigured).toBe(true);
    expect(service.isGuest()).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser().id).toBe('guest');
  });

  it('should login and issue a valid JWT token', async () => {
    const res = await service.login('prueba@funza.gov.co', '123456');
    expect(res.token).toBeTruthy();
    expect(res.token.split('.').length).toBe(3);
    expect(service.isTokenValid(res.token)).toBe(true);
    expect(res.user.authProvider).toBe('local');
    expect(res.user.email).toBe('prueba@funza.gov.co');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should reject login with invalid credentials or wrong password', async () => {
    await expect(service.login('correo-invalido', '12')).rejects.toThrow();

    await service.register('Ana Torres', 'ana@correo.com', 'clave123');
    service.logout();
    await expect(service.login('ana@correo.com', 'otra-clave')).rejects.toThrow();
  });

  it('should register a new user successfully', async () => {
    const res = await service.register('Juan Pérez', 'juan@correo.com', 'secreto1');
    expect(res.user.fullName).toBe('Juan Pérez');
    expect(res.user.email).toBe('juan@correo.com');
    expect(res.user.authProvider).toBe('local');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should authenticate via Google OAuth with provided user details', async () => {
    await expect(service.loginWithGoogle()).rejects.toThrow();

    const googleRes = await service.loginWithGoogle({
      fullName: 'Laura Gómez',
      email: 'laura@gmail.com',
    });
    expect(googleRes.user.authProvider).toBe('google');
    expect(googleRes.user.fullName).toBe('Laura Gómez');
    expect(googleRes.user.email).toBe('laura@gmail.com');
    expect(service.isTokenValid(googleRes.token)).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should reject expired or malformed JWT tokens', () => {
    const expiredToken = createJwtWithExp(Math.floor(Date.now() / 1000) - 60);
    expect(service.isTokenValid(expiredToken)).toBe(false);
    expect(service.isTokenValid('token-corrupto')).toBe(false);
    expect(service.isTokenValid(null)).toBe(false);

    localStorage.setItem(
      'planazo_auth_user',
      JSON.stringify({
        id: 'usr-expired',
        email: 'exp@funza.gov.co',
        fullName: 'Expired',
        avatarUrl: '',
        preferredCity: 'Funza',
        interestedCategories: [],
        isGuest: false,
      })
    );
    localStorage.setItem('planazo_jwt_token', expiredToken);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([]), AuthService] });
    const restored = TestBed.inject(AuthService);
    restored.enableLocalTestMode();

    expect(restored.isGuest()).toBe(true);
    expect(restored.isAuthenticated()).toBe(false);
  });

  it('should handle guest mode, restrict protected actions, and guard routes', () => {
    expect(service.isGuest()).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.canPerformProtectedAction()).toBe(false);

    service.updateProfile({ fullName: 'Intento Invitado' });
    expect(service.currentUser().fullName).toBe('Invitado');

    const guardResult = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/tabs/favoritos' } as RouterStateSnapshot)
    );
    expect(typeof guardResult).not.toBe('boolean');
    const urlTree = guardResult as UrlTree;
    expect(urlTree.toString()).toContain('/auth/login');
    expect(urlTree.queryParams['returnUrl']).toBe('/tabs/favoritos');
  });

  it('should update complete profile for authenticated user and reflect changes in signal', async () => {
    await service.register('Mateo Díaz', 'mateo@correo.com', 'clave123');
    service.updateProfile({
      fullName: 'Nuevo Nombre',
      avatarUrl: 'https://example.com/avatar.jpg',
      preferredCity: 'Mosquera',
      interestedCategories: ['cine', 'arte', 'actividad_fisica'],
    });
    expect(service.currentUser().fullName).toBe('Nuevo Nombre');
    expect(service.currentUser().avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(service.currentUser().preferredCity).toBe('Mosquera');
    expect(service.currentUser().interestedCategories).toEqual(['cine', 'arte', 'actividad_fisica']);
  });
});
