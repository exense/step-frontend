import { Observable } from 'rxjs';

export abstract class ChartDashlet {
  abstract refresh(blur?: boolean): Observable<any>;

  abstract getType(): 'TABLE' | 'CHART';

  abstract showSeries(key: string): void;

  abstract hideSeries(key: string): void;
}
