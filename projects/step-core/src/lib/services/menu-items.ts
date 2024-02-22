import { inject, InjectionToken } from '@angular/core';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { MenuEntry, ViewRegistryService } from './view-registry.service';
import { MenuItemsOverrideConfigService } from './menu-items-override-config.service';

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
