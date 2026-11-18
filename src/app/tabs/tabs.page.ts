import { Component, inject } from '@angular/core';
import { IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';

import { AuthService } from '../core/services/auth.service';
import { EventService } from '../core/services/event.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="border-t border-white/10">
        <ion-tab-button tab="explorar" class="active:text-[#e11d48]">
          <span class="material-symbols-outlined text-[22px]">explore</span>
          <ion-label class="text-[11px] font-semibold tracking-wide">Explorar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="buscar">
          <span class="material-symbols-outlined text-[22px]">search</span>
          <ion-label class="text-[11px] font-semibold tracking-wide">Buscar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="favoritos">
          <div class="relative flex items-center justify-center">
            <span class="material-symbols-outlined text-[22px]">favorite</span>
            @if (eventService.favoriteEvents().length > 0) {
              <span class="absolute -top-1 -right-2.5 bg-[#e11d48] text-white text-[9px] font-bold rounded-full px-1.5 py-0.2 shadow-sm">
                {{ eventService.favoriteEvents().length }}
              </span>
            }
          </div>
          <ion-label class="text-[11px] font-semibold tracking-wide">Favoritos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="perfil">
          <span class="material-symbols-outlined text-[22px]">account_circle</span>
          <ion-label class="text-[11px] font-semibold tracking-wide">Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [
    `
      ion-tab-button {
        --color: var(--app-text-medium);
        --color-selected: #e11d48;
      }
      ion-tab-button.tab-selected .material-symbols-outlined {
        color: #e11d48;
        font-variation-settings: 'FILL' 1;
      }
    `,
  ],
})
export class TabsPage {
  authService = inject(AuthService);
  eventService = inject(EventService);
}
