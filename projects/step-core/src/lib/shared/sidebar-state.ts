import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface SidebarState {
  readonly isOpened$: Observable<boolean>;
  readonly openedMenuItems: Readonly<Record<string, boolean>> | undefined;
  setMenuItemState(menuItem: string, isOpened: boolean): void;
}

export const SIDEBAR_STATE = new InjectionToken<SidebarState>('Sidebar state');
