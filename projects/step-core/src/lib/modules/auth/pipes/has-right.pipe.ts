import { inject, Injector, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../injectables/auth.service';
import { EntityRefService } from '../../entity/injectables/entity-ref.service';

@Pipe({
  name: 'hasRight',
})
export class HasRightPipe implements PipeTransform {
  private _authService = inject(AuthService);
  private _injector = inject(Injector);

  transform(right: string): Observable<boolean> {
    console.log('CHECK FROM PIPE', this._injector.get(EntityRefService, null));
    return this._authService.hasRight$(right, this._injector);
  }
}
