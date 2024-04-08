import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mutable } from '../../basics/step-basics.module';
import { MenuEntry } from '../types/menu-entry';

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
