import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { Subject } from 'rxjs';

export class TimeSeriesSyncGroup {
  private id: string;

  seriesVisibility: Record<string, boolean> = {};

  seriesShow$ = new Subject();
  seriesHide$ = new Subject();

  addSeries(series: string[], visible: boolean) {}

  onSeriesShow() {
    return this.seriesShow$.asObservable();
  }

  onSeriesHide() {
    return this.seriesHide$.asObservable();
  }
}
