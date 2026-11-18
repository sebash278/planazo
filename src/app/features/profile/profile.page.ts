import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';

import type { Category, EventCategory } from '../../core/models/category.model';
import { PLANAZO_CATEGORIES } from '../../core/models/category.model';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" class="bg-[#0d0e12]">
      <div class="pt-12 pb-24 px-4 max-w-lg mx-auto flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight">Mi Perfil</h1>
          @if (authService.isAuthenticated()) {
            <button
              type="button"
              (click)="handleLogout()"
              class="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">logout</span>
              <span>Cerrar sesión</span>
            </button>
          }
        </div>

        <div class="p-5 rounded-2xl bg-[#16181f] border border-white/10 flex items-center gap-4 shadow-lg">
          <div class="relative">
            <img
              [src]="editAvatarUrl || user().avatarUrl"
              [alt]="user().fullName"
              class="w-16 h-16 rounded-full object-cover ring-2 ring-[#e11d48]"
            />
            @if (!user().isGuest) {
              <button
                type="button"
                (click)="changeAvatar()"
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-md active:scale-90"
                title="Cambiar avatar"
                aria-label="Cambiar avatar"
              >
                <span class="material-symbols-outlined text-[13px]">edit</span>
              </button>
            }
          </div>

          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="font-headline font-bold text-base text-white truncate">{{ user().fullName }}</h2>
              @if (!user().isGuest) {
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e11d48]/20 text-[#e11d48] border border-[#e11d48]/40">
                  Verificado
                </span>
              } @else {
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                  Invitado
                </span>
              }
            </div>
            <p class="text-xs text-slate-400 truncate">{{ user().email }}</p>
            <span class="text-[11px] text-slate-500 mt-0.5">
              Miembro desde {{ user().memberSince || '2026' }}
            </span>
          </div>
        </div>

        @if (user().isGuest) {
          <div class="p-4 rounded-2xl bg-[#1f222c] border border-[#e11d48]/40 flex flex-col gap-2">
            <div class="flex items-center gap-2 text-white font-bold text-sm">
              <span class="material-symbols-outlined text-[#e11d48]">lock</span>
              <span>Acceso restringido para invitados</span>
            </div>
            <p class="text-xs text-slate-400">
              Inicia sesión o regístrate para editar tu perfil, guardar favoritos y personalizar tus categorías en Funza.
            </p>
            <button
              type="button"
              routerLink="/auth/login"
              class="mt-1 py-2.5 px-4 rounded-xl bg-[#e11d48] text-white text-xs font-bold text-center active:scale-95 transition-all shadow-md"
            >
              Iniciar sesión o Registrarme
            </button>
          </div>
        } @else {
          <form (ngSubmit)="saveProfile()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="profile-name" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nombre
              </label>
              <div class="flex items-center bg-[#16181f] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
                <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">badge</span>
                <input
                  id="profile-name"
                  type="text"
                  [(ngModel)]="editName"
                  name="editName"
                  required
                  class="w-full bg-transparent text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="profile-avatar" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Foto de Perfil (URL)
              </label>
              <div class="flex items-center bg-[#16181f] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
                <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">photo_camera</span>
                <input
                  id="profile-avatar"
                  type="url"
                  [(ngModel)]="editAvatarUrl"
                  name="editAvatarUrl"
                  placeholder="https://..."
                  class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="profile-city" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Ciudad de Preferencia
              </label>
              <div class="flex items-center bg-[#16181f] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
                <span class="material-symbols-outlined text-[#e11d48] text-[20px] mr-2">location_city</span>
                <select
                  id="profile-city"
                  [(ngModel)]="editCity"
                  name="editCity"
                  class="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="Funza (Centro)" class="bg-[#16181f]">Funza (Centro)</option>
                  <option value="Funza" class="bg-[#16181f]">Funza General</option>
                  <option value="Mosquera" class="bg-[#16181f]">Mosquera</option>
                  <option value="Madrid, Cund." class="bg-[#16181f]">Madrid, Cund.</option>
                  <option value="Facatativá" class="bg-[#16181f]">Facatativá</option>
                  <option value="Bojacá" class="bg-[#16181f]">Bojacá</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Categorías de Interés
              </span>
              <div class="flex flex-wrap gap-2" role="group" aria-label="Categorías de interés">
                @for (cat of allCategories; track cat.id) {
                  <button
                    type="button"
                    (click)="toggleCategory(cat.id)"
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
                    [class]="selectedCategories.includes(cat.id) ? 'bg-[#e11d48] text-white border-transparent' : 'bg-[#16181f] text-slate-400 border-white/10'"
                  >
                    <span>{{ cat.icon }}</span>
                    <span>{{ cat.name }}</span>
                    @if (selectedCategories.includes(cat.id)) {
                      <span class="material-symbols-outlined text-[14px]">check</span>
                    }
                  </button>
                }
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Apariencia</span>
              <div class="grid grid-cols-2 gap-2" role="group" aria-label="Seleccionar tema visual">
                <button
                  type="button"
                  (click)="themeService.setTheme('dark')"
                  class="py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all"
                  [class]="themeService.isDark() ? 'bg-[#e11d48] text-white border-transparent font-bold' : 'bg-[#16181f] text-slate-300 border-white/10'"
                >
                  <span class="material-symbols-outlined text-[16px]">dark_mode</span>
                  <span>Modo Oscuro</span>
                </button>
                <button
                  type="button"
                  (click)="themeService.setTheme('light')"
                  class="py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all"
                  [class]="!themeService.isDark() ? 'bg-[#e11d48] text-white border-transparent font-bold' : 'bg-[#16181f] text-slate-300 border-white/10'"
                >
                  <span class="material-symbols-outlined text-[16px]">light_mode</span>
                  <span>Modo Claro</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="mt-3 py-3.5 px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-bold shadow-lg shadow-[#e11d48]/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span class="material-symbols-outlined text-[18px]">save</span>
              <span>Guardar Preferencias</span>
            </button>

            @if (showSavedAlert()) {
              <p class="text-xs text-center font-bold text-emerald-400 animate-in fade-in">
                ¡Perfil y categorías actualizados con éxito!
              </p>
            }
          </form>
        }
      </div>
    </ion-content>
  `,
})
export class ProfilePage {
  authService = inject(AuthService);
  eventService = inject(EventService);
  themeService = inject(ThemeService);
  router = inject(Router);

  user = this.authService.currentUser;

  editName = '';
  editAvatarUrl = '';
  editCity = '';
  selectedCategories: EventCategory[] = [];
  showSavedAlert = signal(false);

  allCategories: Category[] = PLANAZO_CATEGORIES;

  private readonly avatarPresets = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  ];

  constructor() {
    effect(() => {
      const u = this.user();
      this.editName = u.fullName;
      this.editAvatarUrl = u.avatarUrl;
      this.editCity = u.preferredCity;
      this.selectedCategories = [...u.interestedCategories];
    });
  }

  toggleCategory(cat: EventCategory): void {
    if (this.selectedCategories.includes(cat)) {
      this.selectedCategories = this.selectedCategories.filter((c) => c !== cat);
    } else {
      this.selectedCategories = [...this.selectedCategories, cat];
    }
  }

  changeAvatar(): void {
    if (this.user().isGuest) {
      return;
    }
    const currentIndex = this.avatarPresets.indexOf(this.editAvatarUrl || this.user().avatarUrl);
    const next = this.avatarPresets[(currentIndex + 1) % this.avatarPresets.length];
    this.editAvatarUrl = next;
    this.authService.updateProfile({ avatarUrl: next });
  }

  saveProfile(): void {
    if (this.user().isGuest) {
      return;
    }

    const cleanName = this.editName.trim() || this.user().fullName;
    const cleanAvatar = this.editAvatarUrl.trim() || this.user().avatarUrl;

    this.authService.updateProfile({
      fullName: cleanName,
      avatarUrl: cleanAvatar,
      preferredCity: this.editCity,
      interestedCategories: [...this.selectedCategories],
    });

    const normalizedCity = this.editCity.startsWith('Funza') ? 'Funza' : this.editCity;
    this.eventService.setSelectedCity(normalizedCity);

    this.showSavedAlert.set(true);
    setTimeout(() => this.showSavedAlert.set(false), 3000);
  }

  handleLogout(): void {
    this.eventService.clearSessionFavorites();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
