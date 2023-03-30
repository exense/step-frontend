import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuEntry } from './view-registry.service';
import { Mutable } from '../shared';

type FieldAccessor = Mutable<Pick<MenuItemsOverrideConfigService, 'menuItemsOverride$'>>;

@Injectable({
  providedIn: 'root',
})
export class MenuItemsOverrideConfigService {
  readonly menuItemsOverride$?: Observable<MenuEntry[]>;
  configure(items$: Observable<MenuEntry[]>): void {
    (this as FieldAccessor).menuItemsOverride$ = items$;
  }
}
