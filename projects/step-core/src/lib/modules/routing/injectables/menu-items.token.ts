import { inject, InjectionToken } from '@angular/core';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { MenuItemsOverrideConfigService } from './menu-items-override-config.service';
import { ViewRegistryService } from './view-registry.service';
import { MenuEntry } from '../types/menu-entry';

export const MENU_ITEMS = new InjectionToken<Observable<MenuEntry[]>>('Menu items', {
  providedIn: 'root',
  factory: () => {
    const _viewRegistry = inject(ViewRegistryService);
    const _menuItemsOverrideConfig = inject(MenuItemsOverrideConfigService);

    return _menuItemsOverrideConfig.menuItemsOverride$.pipe(
      switchMap((items$) => items$ ?? of(undefined)),
      map((menuItemsOverride) => menuItemsOverride ?? _viewRegistry.registeredMenuEntries),
      shareReplay(1),
    );
  },
});
