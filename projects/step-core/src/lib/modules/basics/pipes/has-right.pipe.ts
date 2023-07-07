import { Pipe, PipeTransform } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Pipe({
  name: 'hasRight',
})
export class HasRightPipe implements PipeTransform {
  constructor(private _authService: AuthService) {}

  transform(right: string, marker?: string): Observable<boolean> {
    return this._authService.triggerRightCheck$.pipe(map(() => this._authService.hasRight(right)));
  }
}
