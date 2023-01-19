import { Observable } from 'rxjs';

export interface LoginStrategy {
  login(username: string, password: string): Observable<any>;
  logout(): Observable<any>;
}
