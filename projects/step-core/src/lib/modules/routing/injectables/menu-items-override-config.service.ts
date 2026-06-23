import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuEntry } from '../types/menu-entry';

@Injectable({
  providedIn: 'root',
})
export class MenuItemsOverrideConfigService {
  private readonly _menuItemsOverride$ = new BehaviorSubject<Observable<MenuEntry[]> | undefined>(undefined);

  readonly menuItemsOverride$ = this._menuItemsOverride$.asObservable();

  configure(items$: Observable<MenuEntry[]>): void {
    this._menuItemsOverride$.next(items$);
  }
}
