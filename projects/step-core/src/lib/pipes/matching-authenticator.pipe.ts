import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../modules/auth';

@Pipe({
  name: 'matchingAuthenticator',
  standalone: false,
})
export class MatchingAuthenticator implements PipeTransform {
  private _authService = inject(AuthService);

  transform(authenticator: string): boolean {
    return authenticator === this._authService.getConf()?.authenticatorName;
  }
}
