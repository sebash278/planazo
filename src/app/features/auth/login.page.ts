import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" class="bg-[#0d0e12]">
      <div class="min-h-screen px-6 py-12 flex flex-col justify-center max-w-sm mx-auto">
        <div class="flex flex-col items-center text-center gap-2 mb-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-white flex items-center justify-center shadow-xl shadow-[#e11d48]/40 mb-2">
            <span class="material-symbols-outlined text-white text-[36px]">explore</span>
          </div>
          <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight">Planazo Funza</h1>
          <p class="text-xs text-slate-400">Descubre, explora y vive los mejores planes de la Sabana</p>
        </div>

        @if (redirectMessage()) {
          <div
            role="status"
            class="mb-4 p-3 rounded-xl bg-[#e11d48]/15 border border-[#e11d48]/40 flex items-center gap-2 text-xs text-rose-300"
          >
            <span class="material-symbols-outlined text-[#e11d48] text-[18px]">lock</span>
            <span>{{ redirectMessage() }}</span>
          </div>
        }

        @if (errorMessage()) {
          <div
            role="alert"
            class="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center gap-2 text-xs text-red-200"
          >
            <span class="material-symbols-outlined text-red-400 text-[18px]">error</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="handleLogin()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="login-email" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div class="flex items-center bg-[#1f222c] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">mail</span>
              <input
                id="login-email"
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                autocomplete="email"
                placeholder="tucorreo@ejemplo.com"
                class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="login-password" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Contraseña
            </label>
            <div class="flex items-center bg-[#1f222c] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">lock</span>
              <input
                id="login-password"
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="mt-2 py-3.5 px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-[#e11d48]/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            @if (isLoading()) {
              <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            }
            <span>Iniciar Sesión</span>
          </button>
        </form>

        <div class="my-6 flex items-center gap-3">
          <div class="flex-1 h-[1px] bg-white/10"></div>
          <span class="text-[11px] font-semibold text-slate-500 uppercase">o continúa con</span>
          <div class="flex-1 h-[1px] bg-white/10"></div>
        </div>

        <button
          type="button"
          [disabled]="isLoading()"
          (click)="handleGoogleLogin()"
          class="w-full py-3 px-4 rounded-xl bg-[#16181f] hover:bg-[#1f222c] disabled:opacity-60 text-xs font-bold text-white border border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span class="material-symbols-outlined text-[18px] text-red-400">g_mobiledata</span>
          <span>Continuar con Google</span>
        </button>

        <div class="mt-8 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            (click)="continueGuest()"
            class="text-xs font-semibold text-slate-400 hover:text-white underline"
          >
            Explorar como Invitado
          </button>

          <p class="text-xs text-slate-400">
            ¿No tienes cuenta?
            <a
              routerLink="/auth/register"
              queryParamsHandling="preserve"
              [replaceUrl]="true"
              class="text-[#e11d48] font-bold hover:underline"
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </ion-content>
  `,
})
export class LoginPage implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  email = '';
  password = '';
  isLoading = signal(false);
  redirectMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const msg = this.route.snapshot.queryParamMap.get('message');
    if (msg) {
      this.redirectMessage.set(msg);
    }
  }

  async handleLogin(): Promise<void> {
    this.errorMessage.set(null);
    const cleanEmail = this.email.trim();
    if (!cleanEmail.includes('@') || this.password.trim().length < 4) {
      this.errorMessage.set('Ingresa un correo válido y una contraseña de al menos 4 caracteres.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.login(cleanEmail, this.password);
      this.navigateBackOrHome();
    } catch (err) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'No fue posible iniciar sesión. Verifica tus datos.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleGoogleLogin(): Promise<void> {
    this.errorMessage.set(null);
    this.isLoading.set(true);
    try {
      await this.authService.loginWithGoogle();
      this.navigateBackOrHome();
    } catch (err) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Error al iniciar sesión con Google.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  continueGuest(): void {
    this.authService.continueAsGuest();
    this.router.navigateByUrl('/tabs/explorar', { replaceUrl: true });
  }

  private navigateBackOrHome(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl || '/tabs/explorar', { replaceUrl: true });
  }
}
