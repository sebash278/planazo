import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  private isOfflineSignal = signal<boolean>(!navigator.onLine);
  readonly isOffline = this.isOfflineSignal.asReadonly();

  constructor() {
    this.initNetworkListener();
  }

  private async initNetworkListener() {
    try {
      const status = await Network.getStatus();
      this.isOfflineSignal.set(!status.connected);

      Network.addListener('networkStatusChange', (status) => {
        this.isOfflineSignal.set(!status.connected);
      });
    } catch {
      // si capacitor molesta, usamos los eventos del navegador
      window.addEventListener('online', () => this.isOfflineSignal.set(false));
      window.addEventListener('offline', () => this.isOfflineSignal.set(true));
    }
  }

  // botón trampa para probar si el modo offline esta gucci
  toggleSimulatedOffline(): boolean {
    const next = !this.isOfflineSignal();
    this.isOfflineSignal.set(next);
    return next;
  }
}
