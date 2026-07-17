import { Injectable, Signal } from '@angular/core';
import { GridLayoutTab } from '../types/grid-layout-tab';

@Injectable()
export abstract class GridLayoutExternalTabsService<T extends GridLayoutTab = GridLayoutTab> {
  abstract readonly externalTabs: Signal<T[]>;
  abstract readonly externalActiveTabId: Signal<string | undefined>;
  abstract isExternalTab(tab: T): boolean;
  abstract selectExternalTab(tab: T): void;
  abstract cleanupExternalState(): void;
  abstract selectExternalDefault(): void;
}
