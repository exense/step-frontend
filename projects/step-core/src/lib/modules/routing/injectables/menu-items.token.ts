import { inject, InjectionToken } from '@angular/core';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { MenuItemsOverrideConfigService } from './menu-items-override-config.service';
import { ViewRegistryService } from './view-registry.service';
import { MenuEntry } from '../types/menu-entry';

export const MENU_ITEMS = new InjectionToken<Observable<MenuEntry[]>>('Menu items', {
  providedIn: 'root',
  factory: () => {
    const viewRegistry = inject(ViewRegistryService);
    const menuItemsOverrideConfig = inject(MenuItemsOverrideConfigService);

    return of(undefined).pipe(
      switchMap(() => menuItemsOverrideConfig.menuItemsOverride$ || of(undefined)),
      map((menuItemsOverride) => menuItemsOverride ?? viewRegistry.registeredMenuEntries),
      shareReplay(1),
    );
  },
});
