import { Pipe, PipeTransform } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Pipe({
  name: 'matchingUserAuthenticator',
})
export class MatchingUserAuthenticator implements PipeTransform {
  constructor(private _authService: AuthService) {}

  transform(authenticator: string): boolean {
    return authenticator === this._authService.getConf()?.authenticatorName;
  }
}
