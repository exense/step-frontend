import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuEntry } from '../modules/routing';
import { Mutable } from '../modules/basics/step-basics.module';

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
