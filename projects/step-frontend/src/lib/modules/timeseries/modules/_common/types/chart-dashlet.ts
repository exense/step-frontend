import { Observable } from 'rxjs';

export interface ChartDashlet {
  refresh(blur?: boolean): Observable<any>;

  showSeries(key: string): void;

  hideSeries(key: string): void;
}
