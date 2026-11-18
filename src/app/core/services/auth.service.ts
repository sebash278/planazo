import { computed, Injectable, signal } from '@angular/core';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import type { Auth, User as FirebaseUser } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';

import { environment } from '../../../environments/environment';
import type { AuthResponse, UserProfile } from '../models/user.model';

interface JwtPayload {
  sub?: unknown;
  exp?: unknown;
}

interface StoredAccount {
  user: UserProfile;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'planazo_auth_user';
  private readonly TOKEN_KEY = 'planazo_jwt_token';
  private readonly ACCOUNTS_KEY = 'planazo_registered_users';

  readonly isFirebaseConfigured = Boolean(
    environment.firebase.apiKey && environment.firebase.projectId
  );

  private useLocalMode = !this.isFirebaseConfigured;
  private firebaseAuth: Auth | null = null;
  private unsubscribeAuth: (() => void) | null = null;

  private readonly guestUser: UserProfile = {
    id: 'guest',
    email: 'invitado@planazo.app',
    fullName: 'Invitado',
    avatarUrl:
      'https://ui-avatars.com/api/?name=Invitado&background=1f222c&color=94a3b8&bold=true',
    preferredCity: 'Funza',
    interestedCategories: [],
    isGuest: true,
  };

  private currentUserSignal = signal<UserProfile>(this.guestUser);
  private tokenSignal = signal<string | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(
    () => !this.currentUserSignal().isGuest && this.isTokenValid(this.tokenSignal())
  );
  readonly isGuest = computed(() => !this.isAuthenticated());

  constructor() {
    if (!this.useLocalMode) {
      this.restoreSession();
      const app = getApps().length > 0 ? getApp() : initializeApp(environment.firebase);
      this.firebaseAuth = getAuth(app);
      void isSupported()
        .then((supported) => {
          if (supported) {
            getAnalytics(app);
          }
        })
        .catch(() => {
          // Analytics opcional en entornos donde no está soportado.
        });
      this.unsubscribeAuth = onAuthStateChanged(this.firebaseAuth, (fbUser) => {
        void this.syncFirebaseUser(fbUser);
      });
    } else {
      this.restoreSession();
    }
  }

  // Permite ejecutar pruebas unitarias en JSDOM sin popups ni red hacia Firebase.
  enableLocalTestMode(): void {
    this.useLocalMode = true;
    this.unsubscribeAuth?.();
    this.unsubscribeAuth = null;
    this.firebaseAuth = null;
    this.restoreSession();
  }

  isTokenValid(token: string | null): boolean {
    if (!token) {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3 || parts.some((part) => part.trim().length === 0)) {
      return false;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payload = JSON.parse(atob(padded)) as JwtPayload;

      const hasSubject = typeof payload.sub === 'string' && payload.sub.length > 0;
      const hasValidExp =
        typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);

      return hasSubject && hasValidExp;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || password.trim().length < 4) {
      throw new Error('Ingresa un correo válido y una contraseña de al menos 4 caracteres.');
    }

    if (!this.useLocalMode && this.firebaseAuth) {
      try {
        const cred = await signInWithEmailAndPassword(
          this.firebaseAuth,
          normalizedEmail,
          password
        );
        const token = await cred.user.getIdToken();
        const user = this.mapFirebaseUserToProfile(cred.user, 'local');
        this.saveSession(user, token);
        return { user, token };
      } catch (err) {
        throw new Error(this.translateFirebaseError(err), { cause: err });
      }
    }

    const accounts = this.readAccounts();
    const existing = accounts.find((acc) => acc.user.email === normalizedEmail);
    if (existing && existing.password !== undefined && existing.password !== password) {
      throw new Error('Contraseña incorrecta. Verifica tus credenciales.');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const user: UserProfile = existing
          ? { ...existing.user, isGuest: false, authProvider: existing.user.authProvider ?? 'local' }
          : this.createUserFromEmail(normalizedEmail, 'local');

        if (!existing) {
          this.upsertAccount({ user, password });
        }

        const token = this.generateMockJWT(user);
        this.saveSession(user, token);
        resolve({ user, token });
      }, 300);
    });
  }

  async register(fullName: string, email: string, password: string): Promise<AuthResponse> {
    const cleanName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (cleanName.length < 2 || !normalizedEmail.includes('@') || password.trim().length < 6) {
      throw new Error('Verifica tu nombre, correo electrónico y contraseña (mínimo 6 caracteres).');
    }

    if (!this.useLocalMode && this.firebaseAuth) {
      try {
        const cred = await createUserWithEmailAndPassword(
          this.firebaseAuth,
          normalizedEmail,
          password
        );
        await updateFirebaseProfile(cred.user, {
          displayName: cleanName,
          photoURL: this.buildAvatarUrl(cleanName),
        });
        const token = await cred.user.getIdToken(true);
        const user = this.mapFirebaseUserToProfile(cred.user, 'local', cleanName);
        this.saveSession(user, token);
        return { user, token };
      } catch (err) {
        throw new Error(this.translateFirebaseError(err), { cause: err });
      }
    }

    const accounts = this.readAccounts();
    const existing = accounts.find((acc) => acc.user.email === normalizedEmail);
    if (existing) {
      throw new Error('Ya existe una cuenta registrada con este correo. Inicia sesión.');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const user: UserProfile = {
          id: 'usr-' + Date.now(),
          email: normalizedEmail,
          fullName: cleanName,
          avatarUrl: this.buildAvatarUrl(cleanName),
          preferredCity: 'Funza',
          interestedCategories: ['musica', 'gastronomia'],
          isGuest: false,
          memberSince: 'Noviembre 2026',
          authProvider: 'local',
        };
        this.upsertAccount({ user, password });
        const token = this.generateMockJWT(user);
        this.saveSession(user, token);
        resolve({ user, token });
      }, 300);
    });
  }

  async loginWithGoogle(fallbackAccount?: {
    fullName: string;
    email: string;
  }): Promise<AuthResponse> {
    if (!this.useLocalMode && this.firebaseAuth) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const cred = await signInWithPopup(this.firebaseAuth, provider);
        const token = await cred.user.getIdToken();
        const user = this.mapFirebaseUserToProfile(cred.user, 'google');
        this.saveSession(user, token);
        return { user, token };
      } catch (err) {
        throw new Error(this.translateFirebaseError(err), { cause: err });
      }
    }

    const cleanName = fallbackAccount?.fullName.trim() ?? '';
    const cleanEmail = fallbackAccount?.email.trim().toLowerCase() ?? '';

    if (cleanName.length < 2 || !cleanEmail.includes('@')) {
      throw new Error('Ingresa tu nombre y correo de Google para continuar.');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const accounts = this.readAccounts();
        const existing = accounts.find((acc) => acc.user.email === cleanEmail);

        const user: UserProfile = existing
          ? {
              ...existing.user,
              fullName: cleanName,
              isGuest: false,
              authProvider: 'google',
            }
          : {
              id: `usr-google-${Date.now()}`,
              email: cleanEmail,
              fullName: cleanName,
              avatarUrl: this.buildAvatarUrl(cleanName),
              preferredCity: 'Funza',
              interestedCategories: ['musica', 'gastronomia'],
              isGuest: false,
              memberSince: 'Noviembre 2026',
              authProvider: 'google',
            };

        this.upsertAccount({ user, password: existing?.password });
        const token = this.generateMockJWT(user);
        this.saveSession(user, token);
        resolve({ user, token });
      }, 300);
    });
  }

  loginWithOAuth(
    _provider: 'google',
    account?: { fullName: string; email: string }
  ): Promise<AuthResponse> {
    return this.loginWithGoogle(account);
  }

  continueAsGuest(): void {
    this.currentUserSignal.set(this.guestUser);
    this.tokenSignal.set(null);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    } catch {
      // Ignora fallo si localStorage no está disponible en el entorno.
    }
  }

  updateProfile(partial: Partial<UserProfile>): void {
    if (this.isGuest()) {
      return;
    }

    this.currentUserSignal.update((curr) => {
      const updated = { ...curr, ...partial };
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
        const accounts = this.readAccounts();
        const existing = accounts.find((acc) => acc.user.email === updated.email);
        this.upsertAccount({ user: updated, password: existing?.password });
      } catch {
        // Ignora fallo de cuota o bloqueo de almacenamiento web.
      }

      if (this.firebaseAuth?.currentUser && (partial.fullName || partial.avatarUrl)) {
        void updateFirebaseProfile(this.firebaseAuth.currentUser, {
          displayName: updated.fullName,
          photoURL: updated.avatarUrl,
        });
      }

      return updated;
    });
  }

  canPerformProtectedAction(): boolean {
    return this.isAuthenticated();
  }

  logout(): void {
    if (this.firebaseAuth) {
      void signOut(this.firebaseAuth);
    }
    this.continueAsGuest();
  }

  private async syncFirebaseUser(fbUser: FirebaseUser | null): Promise<void> {
    if (!fbUser) {
      this.continueAsGuest();
      return;
    }

    try {
      const token = await fbUser.getIdToken();
      const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');
      const user = this.mapFirebaseUserToProfile(fbUser, isGoogle ? 'google' : 'local');
      this.saveSession(user, token);
    } catch {
      this.continueAsGuest();
    }
  }

  private mapFirebaseUserToProfile(
    fbUser: FirebaseUser,
    provider: 'local' | 'google',
    overrideName?: string
  ): UserProfile {
    const email = fbUser.email?.toLowerCase() ?? '';
    const savedProfile = this.readAccounts().find((acc) => acc.user.email === email)?.user;
    const displayName =
      overrideName ||
      fbUser.displayName?.trim() ||
      savedProfile?.fullName ||
      email.split('@')[0] ||
      'Usuario Planazo';

    return {
      id: fbUser.uid,
      email,
      fullName: displayName,
      avatarUrl: fbUser.photoURL || savedProfile?.avatarUrl || this.buildAvatarUrl(displayName),
      preferredCity: savedProfile?.preferredCity ?? 'Funza',
      interestedCategories: savedProfile?.interestedCategories ?? ['musica', 'gastronomia'],
      isGuest: false,
      memberSince: savedProfile?.memberSince ?? 'Noviembre 2026',
      authProvider: provider,
    };
  }

  private translateFirebaseError(err: unknown): string {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code: unknown }).code)
        : '';

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Correo o contraseña incorrectos.';
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta registrada con este correo.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de Google antes de completar el ingreso.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana de Google. Permite popups e inténtalo de nuevo.';
      case 'auth/unauthorized-domain':
        return 'Este dominio aún no está autorizado en Firebase Authentication.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Espera un momento e inténtalo nuevamente.';
      case 'auth/network-request-failed':
        return 'No hay conexión con el servicio de autenticación.';
      default:
        return err instanceof Error ? err.message : 'Error de autenticación con Firebase.';
    }
  }

  private createUserFromEmail(email: string, provider: 'local' | 'google'): UserProfile {
    const rawName = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    const formattedName = rawName.replace(/\b\w/g, (ch) => ch.toUpperCase()) || 'Usuario Planazo';
    return {
      id: 'usr-' + Date.now(),
      email,
      fullName: formattedName,
      avatarUrl: this.buildAvatarUrl(formattedName),
      preferredCity: 'Funza',
      interestedCategories: ['musica', 'gastronomia'],
      isGuest: false,
      memberSince: 'Noviembre 2026',
      authProvider: provider,
    };
  }

  private buildAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e11d48&color=ffffff&bold=true`;
  }

  private readAccounts(): StoredAccount[] {
    try {
      const raw = localStorage.getItem(this.ACCOUNTS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as StoredAccount[]) : [];
    } catch {
      return [];
    }
  }

  private upsertAccount(account: StoredAccount): void {
    try {
      const accounts = this.readAccounts().filter(
        (acc) => acc.user.email !== account.user.email
      );
      accounts.push(account);
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // Ignora fallo de acceso a localStorage.
    }
  }

  private saveSession(user: UserProfile, token: string): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch {
      // Ignora fallo de cuota o bloqueo de almacenamiento web.
    }
  }

  private restoreSession(): void {
    try {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      const storedToken = localStorage.getItem(this.TOKEN_KEY);

      if (!storedUser || !this.isTokenValid(storedToken)) {
        this.continueAsGuest();
        return;
      }

      const parsed = JSON.parse(storedUser) as UserProfile;
      if (parsed.isGuest) {
        this.continueAsGuest();
        return;
      }

      this.currentUserSignal.set(parsed);
      this.tokenSignal.set(storedToken);
    } catch {
      this.continueAsGuest();
    }
  }

  private generateMockJWT(user: UserProfile): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        name: user.fullName,
        city: user.preferredCity,
        provider: user.authProvider ?? 'local',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 7,
      })
    );
    const signature = btoa('planazo-jwt-signature');
    return `${header}.${payload}.${signature}`;
  }
}
