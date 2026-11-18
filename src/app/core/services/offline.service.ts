import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  private isOfflineSignal = signal<boolean>(!navigator.onLine);
  private isSimulatedSignal = signal<boolean>(false);

  readonly isOffline = this.isOfflineSignal.asReadonly();
  readonly isSimulated = this.isSimulatedSignal.asReadonly();

  constructor() {
    void this.initNetworkListener();
  }

  private async initNetworkListener(): Promise<void> {
    try {
      const status = await Network.getStatus();
      if (!this.isSimulatedSignal()) {
        this.isOfflineSignal.set(!status.connected);
      }

      await Network.addListener('networkStatusChange', (nextStatus) => {
        if (!this.isSimulatedSignal()) {
          this.isOfflineSignal.set(!nextStatus.connected);
        }
      });
    } catch {
      // Fallback a eventos estándar del navegador cuando el plugin nativo no aplica.
      window.addEventListener('online', () => {
        if (!this.isSimulatedSignal()) {
          this.isOfflineSignal.set(false);
        }
      });
      window.addEventListener('offline', () => {
        this.isOfflineSignal.set(true);
      });
    }
  }

  toggleSimulatedOffline(): boolean {
    const nextSimulated = !this.isSimulatedSignal();
    this.isSimulatedSignal.set(nextSimulated);
    this.isOfflineSignal.set(nextSimulated ? true : !navigator.onLine);
    return this.isOfflineSignal();
  }
}
