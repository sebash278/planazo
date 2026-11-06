import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created and have initial session', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeTruthy();
  });

  it('should login and issue a mock JWT token', async () => {
    const res = await service.login('prueba@funza.gov.co', '123456');
    expect(res.token).toBeTruthy();
    expect(res.token.split('.').length).toBe(3); // JWT format: header.payload.sig
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should register a new user successfully', async () => {
    const res = await service.register('Juan Pérez', 'juan@correo.com', 'secreto');
    expect(res.user.fullName).toBe('Juan Pérez');
    expect(res.user.email).toBe('juan@correo.com');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should handle guest mode and restrict protected actions', () => {
    service.continueAsGuest();
    expect(service.isGuest()).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.canPerformProtectedAction()).toBe(false);
  });

  it('should update profile and reflect changes in signal', () => {
    service.updateProfile({ fullName: 'Nuevo Nombre', preferredCity: 'Mosquera' });
    expect(service.currentUser().fullName).toBe('Nuevo Nombre');
    expect(service.currentUser().preferredCity).toBe('Mosquera');
  });
});
