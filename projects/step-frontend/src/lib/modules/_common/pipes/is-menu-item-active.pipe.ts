import { inject, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { NavigatorService } from '@exense/step-core';

@Pipe({
  name: 'isMenuItemActive',
})
export class IsMenuItemActivePipe implements PipeTransform {
  private _navigator = inject(NavigatorService);

  transform(menuItemId: string): Observable<boolean> {
    return this._navigator.isViewIdActive(menuItemId);
  }
}
