import { TimeSeriesKeywordsContext } from './time-series-keywords.context';
import { Observable, Subject } from 'rxjs';

export class TimeSeriesSyncGroup {
  readonly id: string; // usually the id of the master chart

  seriesVisibility: Record<string, boolean> = {};

  allSeriesShow$ = new Subject<void>();
  allSeriesHide$ = new Subject<void>();

  seriesShow$ = new Subject<string>();
  seriesHide$ = new Subject<string>();

  allSeriesChecked = false;
  allSeriesUnchecked = false;

  constructor(id: string) {
    this.id = id;
  }

  seriesShouldBeVisible(series: string): boolean {
    let shouldBeVisible: boolean;
    if (this.allSeriesChecked) {
      shouldBeVisible = true;
    } else if (this.allSeriesUnchecked) {
      shouldBeVisible = false;
    } else {
      const currentVisibility = this.seriesVisibility[series];
      if (currentVisibility != undefined) {
        shouldBeVisible = currentVisibility;
      } else {
        // series not found
        shouldBeVisible = true;
      }
    }
    this.seriesVisibility[series] = shouldBeVisible;
    return shouldBeVisible;
  }

  setAllSeriesChecked(checked: boolean) {
    this.allSeriesChecked = checked;
    this.allSeriesUnchecked = !checked;
    if (checked) {
      this.allSeriesShow$.next();
    } else {
      this.allSeriesHide$.next();
    }
  }

  addSeries(series: string[], visible: boolean) {
    series.forEach((s) => {
      let existingSeries = this.seriesVisibility[s];
      if (!existingSeries) {
        this.seriesVisibility[s] = true;
      }
    });
  }

  showSeries(s: string) {
    this.allSeriesUnchecked = false;
    this.seriesVisibility[s] = true;
    this.seriesShow$.next(s);
  }

  hideSeries(s: string) {
    this.allSeriesChecked = false;
    this.seriesVisibility[s] = false;
    this.seriesHide$.next(s);
  }

  onAllSeriesShow(): Observable<void> {
    return this.allSeriesShow$.asObservable();
  }

  onAllSeriesHide(): Observable<void> {
    return this.allSeriesHide$.asObservable();
  }

  onSeriesShow(): Observable<string> {
    return this.seriesShow$.asObservable();
  }

  onSeriesHide(): Observable<string> {
    return this.seriesHide$.asObservable();
  }
}
