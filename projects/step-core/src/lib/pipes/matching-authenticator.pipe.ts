import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../modules/auth';

@Pipe({
  name: 'matchingAuthenticator',
})
export class MatchingAuthenticator implements PipeTransform {
  constructor(private _authService: AuthService) {}

  transform(authenticator: string): boolean {
    return authenticator === this._authService.getConf()?.authenticatorName;
  }
}
