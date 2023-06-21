import { Observable } from 'rxjs';

export interface CredentialsStrategy {
  login(username: string, password: string): Observable<any>;
  logout(): Observable<any>;
  changePassword(isCurrentPasswordOneTime?: boolean): Observable<any>;
}
