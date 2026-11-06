import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'planazo_auth_user';
  private readonly TOKEN_KEY = 'planazo_jwt_token';

  // usuario fantasma por si entra a chismosear
  private readonly guestUser: UserProfile = {
    id: 'guest',
    email: 'invitado@planazo.funza.gov.co',
    fullName: 'Invitado',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    preferredCity: 'Funza',
    interestedCategories: ['musica', 'teatro', 'gastronomia'],
    isGuest: true,
  };

  // doña Sofía carreando la demo :)
  private readonly demoUser: UserProfile = {
    id: 'usr-sofia-funza',
    email: 'sofia.rodriguez@funza.gov.co',
    fullName: 'Sofía Rodríguez',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    preferredCity: 'Funza (Centro)',
    interestedCategories: ['musica', 'cultura', 'gastronomia', 'ecologia'],
    isGuest: false,
    memberSince: 'Marzo 2026',
  };

  private currentUserSignal = signal<UserProfile>(this.demoUser);
  private tokenSignal = signal<string | null>(this.generateMockJWT(this.demoUser));

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !this.currentUserSignal().isGuest);
  readonly isGuest = computed(() => this.currentUserSignal().isGuest);

  constructor() {
    this.restoreSession();
  }

  // login con delay para que parezca que consulta una base de datos xd
  login(email: string, _password: string):Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: UserProfile = {
          ...this.demoUser,
          email,
          fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
          isGuest: false,
        };
        const token = this.generateMockJWT(user);
        this.saveSession(user, token);
        resolve({ user, token });
      }, 400);
    });
  }

  register(fullName: string, email: string, _password: string): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: UserProfile = {
          id: 'usr-' + Date.now(),
          email,
          fullName,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          preferredCity: 'Funza',
          interestedCategories: ['musica', 'gastronomia'],
          isGuest: false,
          memberSince: 'Noviembre 2026',
        };
        const token = this.generateMockJWT(user);
        this.saveSession(user, token);
        resolve({ user, token });
      }, 400);
    });
  }

  // simulación de OAuth
  loginWithOAuth(provider: 'google' | 'apple'): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: UserProfile = {
          ...this.demoUser,
          fullName: provider === 'google' ? 'Sofía Rodríguez (Google)' : 'Sofía Rodríguez (Apple)',
          isGuest: false,
        };
        const token = this.generateMockJWT(user);
        this.saveSession(user, token);
        resolve({ user, token });
      }, 450);
    });
  }

  continueAsGuest() {
    this.currentUserSignal.set(this.guestUser);
    this.tokenSignal.set(null);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    } catch {
      // f en el chat :c
    }
  }

  updateProfile(partial: Partial<UserProfile>) {
    this.currentUserSignal.update((curr) => {
      const updated = { ...curr, ...partial };
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // no guardó, ni modo
      }
      return updated;
    });
  }

  canPerformProtectedAction(): boolean {
    return this.isAuthenticated();
  }

  logout() {
    this.continueAsGuest();
  }

  private saveSession(user: UserProfile, token: string) {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch {
      // storage rip
    }
  }

  private restoreSession() {
    try {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      if (storedUser && storedToken) {
        this.currentUserSignal.set(JSON.parse(storedUser));
        this.tokenSignal.set(storedToken);
      }
    } catch {
      // si falló volvemos a doña Sofía 
    }
  }

  // JWT artesanal
  private generateMockJWT(user: UserProfile): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        name: user.fullName,
        city: user.preferredCity,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      })
    );
    const signature = btoa('funza-civic-dark-secret-signature');
    return `${header}.${payload}.${signature}`;
  }
}
