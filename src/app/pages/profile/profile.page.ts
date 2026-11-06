import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { EventCategory } from '../../core/models/event.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" class="bg-[#0d0e12]">
      <div class="pt-12 pb-24 px-4 max-w-lg mx-auto flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight">Mi Perfil</h1>
          <button
            *ngIf="authService.isAuthenticated()"
            type="button"
            (click)="handleLogout()"
            class="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-[16px]">logout</span>
            <span>Cerrar sesión</span>
          </button>
        </div>

        <div class="p-5 rounded-2xl bg-[#16181f] border border-white/10 flex items-center gap-4 shadow-lg">
          <div class="relative">
            <img
              [src]="user().avatarUrl"
              [alt]="user().fullName"
              class="w-16 h-16 rounded-full object-cover ring-2 ring-[#e11d48]"
            />
            <button
              type="button"
              (click)="changeAvatar()"
              class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-md active:scale-90"
              title="Cambiar avatar"
            >
              <span class="material-symbols-outlined text-[13px]">edit</span>
            </button>
          </div>

          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h2 class="font-headline font-bold text-base text-white truncate">{{ user().fullName }}</h2>
              <span
                *ngIf="!user().isGuest"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e11d48]/20 text-[#e11d48] border border-[#e11d48]/40"
              >
                Verificado
              </span>
              <span
                *ngIf="user().isGuest"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300"
              >
                Invitado
              </span>
            </div>
            <p class="text-xs text-slate-400 truncate">{{ user().email }}</p>
            <span class="text-[11px] text-slate-500 mt-0.5">Miembro desde {{ user().memberSince || '2026' }}</span>
          </div>
        </div>

        <div
          *ngIf="user().isGuest"
          class="p-4 rounded-2xl bg-[#1f222c] border border-[#e11d48]/40 flex flex-col gap-2"
        >
          <div class="flex items-center gap-2 text-white font-bold text-sm">
            <span class="material-symbols-outlined text-[#e11d48]">account_circle</span>
            <span>Inicia sesión para una experiencia completa</span>
          </div>
          <p class="text-xs text-slate-400">
            Guarda tus planes favoritos y recibe recomendaciones personalizadas en Funza.
          </p>
          <button
            type="button"
            routerLink="/auth/login"
            class="mt-1 py-2.5 px-4 rounded-xl bg-[#e11d48] text-white text-xs font-bold text-center active:scale-95 transition-all shadow-md"
          >
            Iniciar sesión o Registrarme
          </button>
        </div>

        <form (ngSubmit)="saveProfile()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Nombre</label>
            <div class="flex items-center bg-[#16181f] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-slate-400 text-[20px] mr-2">badge</span>
              <input
                type="text"
                [(ngModel)]="editName"
                name="editName"
                class="w-full bg-transparent text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Ciudad de Preferencia</label>
            <div class="flex items-center bg-[#16181f] rounded-xl px-3.5 py-3 border border-white/10 focus-within:border-[#e11d48]">
              <span class="material-symbols-outlined text-[#e11d48] text-[20px] mr-2">location_city</span>
              <select
                [(ngModel)]="editCity"
                name="editCity"
                class="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="Funza (Centro)" class="bg-[#16181f]">Funza (Centro)</option>
                <option value="Funza" class="bg-[#16181f]">Funza General</option>
                <option value="Mosquera" class="bg-[#16181f]">Mosquera</option>
                <option value="Madrid, Cund." class="bg-[#16181f]">Madrid, Cund.</option>
                <option value="Facatativá" class="bg-[#16181f]">Facatativá</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Categorías de Interés</label>
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let cat of allCategories"
                type="button"
                (click)="toggleCategory(cat.id)"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5"
                [ngClass]="selectedCategories.includes(cat.id) ? 'bg-[#e11d48] text-white border-transparent' : 'bg-[#16181f] text-slate-400 border-white/10'"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
                <span *ngIf="selectedCategories.includes(cat.id)" class="material-symbols-outlined text-[14px]">check</span>
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

          <p *ngIf="showSavedAlert()" class="text-xs text-center font-bold text-emerald-400 animate-in fade-in">
            ¡Perfil y categorías actualizados con éxito!
          </p>
        </form>
      </div>
    </ion-content>
  `,
})
export class ProfilePage {
  authService = inject(AuthService);
  router = inject(Router);

  user = this.authService.currentUser;

  editName = '';
  editCity = '';
  selectedCategories: EventCategory[] = [];
  showSavedAlert = signal(false);

  allCategories: { id: EventCategory; label: string; icon: string }[] = [
    { id: 'musica', label: 'Música', icon: '🎵' },
    { id: 'teatro', label: 'Teatro', icon: '🎭' },
    { id: 'gastronomia', label: 'Gastronomía', icon: '🥘' },
    { id: 'deportes', label: 'Deportes', icon: '⚽' },
    { id: 'ecologia', label: 'Ecología', icon: '🌾' },
    { id: 'cine', label: 'Cine', icon: '🎬' },
    { id: 'arte', label: 'Arte', icon: '🎨' },
  ];

  constructor() {
    const u = this.user();
    this.editName = u.fullName;
    this.editCity = u.preferredCity;
    this.selectedCategories = [...u.interestedCategories];
  }

  toggleCategory(cat: EventCategory) {
    if (this.selectedCategories.includes(cat)) {
      this.selectedCategories = this.selectedCategories.filter((c) => c !== cat);
    } else {
      this.selectedCategories.push(cat);
    }
  }

  changeAvatar() {
    const urls = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    ];
    const next = urls[(urls.indexOf(this.user().avatarUrl) + 1) % urls.length];
    this.authService.updateProfile({ avatarUrl: next });
  }

  saveProfile() {
    this.authService.updateProfile({
      fullName: this.editName,
      preferredCity: this.editCity,
      interestedCategories: this.selectedCategories,
    });
    this.showSavedAlert.set(true);
    setTimeout(() => this.showSavedAlert.set(false), 3000);
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
