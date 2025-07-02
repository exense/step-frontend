import { inject, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../injectables/auth.service';

@Pipe({
  name: 'hasRight',
})
export class HasRightPipe implements PipeTransform {
  private _authService = inject(AuthService);

  transform(right: string): Observable<boolean> {
    return this._authService.hasRight$(right);
  }
}
