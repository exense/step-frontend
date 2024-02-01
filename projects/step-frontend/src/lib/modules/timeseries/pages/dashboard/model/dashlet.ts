import { Observable } from 'rxjs';

export interface Dashlet {
  refresh(): Observable<any>;
}
