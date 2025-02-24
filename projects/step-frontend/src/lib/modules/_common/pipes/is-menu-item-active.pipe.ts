import { inject, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuEntry, NavigatorService } from '@exense/step-core';
import { DisplayMenuEntry } from '../types/display-menu-entry.type';

@Pipe({
  name: 'isMenuItemActive',
})
export class IsMenuItemActivePipe implements PipeTransform {
  private _navigator = inject(NavigatorService);

  transform(menuItem: MenuEntry | DisplayMenuEntry): Observable<boolean> {
    return this._navigator.isViewIdActive(menuItem);
  }
}
