import { Observable } from 'rxjs';

export interface ChartDashlet {
  refresh(blur?: boolean): Observable<any>;
}
