/**
 * PWA & Web API Type Declarations
 * Definitions for non-standard or modern browser APIs used in PWA hooks
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

export interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync: SyncManager;
}

export interface NetworkInformation extends EventTarget {
  readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' | string;
  readonly downlink?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
  onchange?: ((this: NetworkInformation, ev: Event) => void) | null;
}

export interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
  onchargingchange?: ((this: BatteryManager, ev: Event) => void) | null;
  onchargingtimechange?: ((this: BatteryManager, ev: Event) => void) | null;
  ondischargingtimechange?: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange?: ((this: BatteryManager, ev: Event) => void) | null;
}

export interface NavigatorExtended extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  getBattery?: () => Promise<BatteryManager>;
}
