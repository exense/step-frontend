import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { Observable, Subject } from 'rxjs';

export class TimeSeriesSyncGroup {
  readonly id: string;

  seriesVisibility: Record<string, boolean> = {};

  seriesShow$ = new Subject<string[]>();
  seriesHide$ = new Subject<string[]>();

  constructor(id: string) {
    this.id = id;
  }

  addSeries(series: string[], visible: boolean) {
    series.forEach((s) => {
      let existingSeries = this.seriesVisibility[s];
      if (!existingSeries) {
        this.seriesVisibility[s] = true;
      }
    });
  }

  showSeries(series: string[]) {
    series.forEach((s) => (this.seriesVisibility[s] = true));
    this.seriesShow$.next(series);
  }

  hideSeries(series: string[]) {
    series.forEach((s) => (this.seriesVisibility[s] = false));
    this.seriesHide$.next(series);
  }

  onSeriesShow(): Observable<string[]> {
    return this.seriesShow$.asObservable();
  }

  onSeriesHide(): Observable<string[]> {
    return this.seriesHide$.asObservable();
  }
}
