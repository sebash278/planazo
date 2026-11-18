import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" class="bg-[#0d0e12]">
      <div class="min-h-screen px-6 py-12 flex flex-col justify-center max-w-sm mx-auto">
        <div class="flex flex-col items-center text-center gap-2 mb-6">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-white flex items-center justify-center shadow-xl shadow-[#e11d48]/40 mb-2">
            <span class="material-symbols-outlined text-white text-[32px]">person_add</span>
          </div>
          <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight">Crear Cuenta</h1>
          <p class="text-xs text-slate-400">Únete a Planazo y no te pierdas ningún plan en Funza</p>
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

        <form (ngSubmit)="handleRegister()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="register-fullname" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Nombre Completo
            </label>
            <div class="flex items-center bg-[#1f222c] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">person</span>
              <input
                id="register-fullname"
                type="text"
                name="fullName"
                [(ngModel)]="fullName"
                required
                autocomplete="name"
                placeholder="Carlos Mendoza"
                class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="register-email" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div class="flex items-center bg-[#1f222c] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">mail</span>
              <input
                id="register-email"
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                autocomplete="email"
                placeholder="carlos@correo.com"
                class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="register-password" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Contraseña
            </label>
            <div class="flex items-center bg-[#1f222c] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">lock</span>
              <input
                id="register-password"
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                minlength="6"
                autocomplete="new-password"
                placeholder="Al menos 6 caracteres"
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
            <span>Registrarme</span>
          </button>
        </form>

        <div class="my-5 flex items-center gap-3">
          <div class="flex-1 h-[1px] bg-white/10"></div>
          <span class="text-[11px] font-semibold text-slate-500 uppercase">o regístrate con</span>
          <div class="flex-1 h-[1px] bg-white/10"></div>
        </div>

        <button
          type="button"
          [disabled]="isLoading()"
          (click)="handleGoogleRegister()"
          class="w-full py-3 px-4 rounded-xl bg-[#16181f] hover:bg-[#1f222c] disabled:opacity-60 text-xs font-bold text-white border border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span class="material-symbols-outlined text-[18px] text-red-400">g_mobiledata</span>
          <span>Continuar con Google</span>
        </button>

        <div class="mt-6 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            (click)="continueGuest()"
            class="text-xs font-semibold text-slate-400 hover:text-white underline"
          >
            Explorar como Invitado
          </button>

          <p class="text-xs text-slate-400">
            ¿Ya tienes una cuenta?
            <a
              routerLink="/auth/login"
              queryParamsHandling="preserve"
              [replaceUrl]="true"
              class="text-[#e11d48] font-bold hover:underline"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </ion-content>
  `,
})
export class RegisterPage implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  fullName = '';
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

  async handleRegister(): Promise<void> {
    this.errorMessage.set(null);

    if (this.fullName.trim().length < 2) {
      this.errorMessage.set('Ingresa tu nombre completo (mínimo 2 caracteres).');
      return;
    }

    if (!this.email.trim().includes('@')) {
      this.errorMessage.set('Ingresa un correo electrónico válido.');
      return;
    }

    if (this.password.trim().length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.register(this.fullName, this.email, this.password);
      this.navigateAfterAuth();
    } catch (err) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'No fue posible completar el registro.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleGoogleRegister(): Promise<void> {
    this.errorMessage.set(null);
    this.isLoading.set(true);
    try {
      await this.authService.loginWithGoogle();
      this.navigateAfterAuth();
    } catch (err) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Error al registrarse con Google.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  continueGuest(): void {
    this.authService.continueAsGuest();
    this.router.navigateByUrl('/tabs/explorar', { replaceUrl: true });
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl || '/tabs/explorar', { replaceUrl: true });
  }
}
