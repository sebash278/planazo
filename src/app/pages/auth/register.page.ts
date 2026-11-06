import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent],
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

        <form (ngSubmit)="handleRegister()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Nombre Completo</label>
            <div class="flex items-center bg-[#1f222c] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">person</span>
              <input
                type="text"
                name="fullName"
                [(ngModel)]="fullName"
                required
                placeholder="Carlos Mendoza"
                class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Correo Electrónico</label>
            <div class="flex items-center bg-[#1f222c] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">mail</span>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                placeholder="carlos@correo.com"
                class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Contraseña</label>
            <div class="flex items-center bg-[#1f222c] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">lock</span>
              <input
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                placeholder="Al menos 6 caracteres"
                class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="mt-2 py-3.5 px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-bold shadow-lg shadow-[#e11d48]/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span *ngIf="isLoading()" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            <span>Registrarme</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-slate-400">
            ¿Ya tienes una cuenta?
            <a routerLink="/auth/login" class="text-[#e11d48] font-bold hover:underline">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </ion-content>
  `,
})
export class RegisterPage {
  authService = inject(AuthService);
  router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  isLoading = signal(false);

  async handleRegister() {
    if (!this.fullName || !this.email || !this.password) return;
    this.isLoading.set(true);
    // registrando al nuevo pana :D
    await this.authService.register(this.fullName, this.email, this.password);
    this.isLoading.set(false);
    this.router.navigate(['/tabs/explorar']);
  }
}
