import { inject, Injector, Pipe, PipeTransform } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../injectables/auth.service';
import { EntityRefService } from '../../entity/injectables/entity-ref.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Pipe({
  name: 'hasRight',
})
export class HasRightPipe implements PipeTransform {
  private _authService = inject(AuthService);
  private _injector = inject(Injector);
  private _entityRef = inject(EntityRefService, { optional: true });

  private entityChange$ = !this._entityRef ? of(true) : toObservable(this._entityRef.currentEntity);

  transform(right: string): Observable<boolean> {
    return this.entityChange$.pipe(switchMap(() => this._authService.hasRight$(right, this._injector)));
  }
}
