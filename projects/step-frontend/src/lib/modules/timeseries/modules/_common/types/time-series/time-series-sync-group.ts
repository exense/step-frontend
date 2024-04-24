import { Observable, Subject } from 'rxjs';

export class TimeSeriesSyncGroup {
  readonly id: string; // usually the id of the master chart

  private seriesVisibility: Record<string, boolean> = {};

  private allSeriesShow$ = new Subject<void>();
  private allSeriesHide$ = new Subject<void>();

  private seriesShow$ = new Subject<string>();
  private seriesHide$ = new Subject<string>();

  private allSeriesChecked = false;
  private allSeriesUnchecked = false;

  constructor(id: string) {
    this.id = id;
  }

  destroy() {
    this.allSeriesShow$?.complete();
    this.allSeriesHide$?.complete();
    this.seriesShow$?.complete();
    this.seriesHide$?.complete();
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
