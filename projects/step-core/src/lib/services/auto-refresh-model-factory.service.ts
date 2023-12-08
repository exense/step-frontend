import { inject, Injectable } from '@angular/core';
import { interval, Observable, Subject, Subscription, take, tap } from 'rxjs';
import { AJS_ROOT_SCOPE, Mutable, AutoRefreshModel } from '../shared';
import { IRootScopeService } from 'angular';

type FieldAccessor = Mutable<Pick<AutoRefreshModel, 'autoIncreaseTo' | 'disabled' | 'interval'>>;

class AutoRefreshModelImpl implements AutoRefreshModel {
  private intervalSubscription?: Subscription;
  private interval$?: Observable<unknown>;
  private isManuallyChanged = false;
  private lastInterval?: number;

  private disableChangeInternal$ = new Subject<boolean>();
  private intervalChangeInternal$ = new Subject<number>();
  private refreshInternal$ = new Subject<void>();

  readonly autoIncreaseTo?: number;
  readonly disabled: boolean = false;
  readonly interval: number = 0;

  readonly disableChange$ = this.disableChangeInternal$.asObservable();
  readonly intervalChange$ = this.intervalChangeInternal$.asObservable();
  readonly refresh$ = this.refreshInternal$.asObservable();

  constructor(private $rootScope: IRootScopeService) {}

  destroy(): void {
    this.disableChangeInternal$.complete();
    this.intervalChangeInternal$.complete();
    this.refreshInternal$.complete();
    this.stopTimer();
  }

  setAutoIncreaseTo(autoIncreaseTo?: number): void {
    if (autoIncreaseTo === this.autoIncreaseTo) {
      return;
    }
    (this as FieldAccessor).autoIncreaseTo = autoIncreaseTo;
  }

  setDisabled(disabled: boolean): void {
    if (disabled === this.disabled) {
      return;
    }
    (this as FieldAccessor).disabled = disabled;
    this.disableChangeInternal$.next(disabled);
    this.$rootScope.$broadcast('globalsettings-globalRefreshToggle', { new: !disabled });
    if (!disabled) {
      if (this.lastInterval) {
        this.setInterval(this.lastInterval);
      }
      this.refreshInternal$.next();
    } else {
      this.lastInterval = this.interval;
      this.setInterval(0);
    }
  }

  setInterval(interval: number, isManualChange: boolean = false): void {
    this.isManuallyChanged = isManualChange;
    if (interval === this.interval) {
      return;
    }
    this.stopTimer();
    (this as FieldAccessor).interval = interval;
    this.intervalChangeInternal$.next(interval);
    this.$rootScope.$broadcast('globalsettings-refreshInterval', { new: interval });
    this.startTimer();
    if (interval !== 0) {
      this.lastInterval = undefined;
    }
  }

  private stopTimer(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = undefined;
    }
    this.interval$ = undefined;
  }

  private startTimer(): void {
    if (this.interval$ || this.interval <= 0) {
      return;
    }
    this.interval$ = interval(this.interval);
    this.intervalSubscription = this.interval$.subscribe(() => {
      this.refreshInternal$.next();
      if (this.autoIncreaseTo && !this.isManuallyChanged && this.interval < this.autoIncreaseTo) {
        let newInterval = this.interval * 2;
        newInterval = newInterval < this.autoIncreaseTo ? newInterval : this.autoIncreaseTo;
        this.setInterval(newInterval);
      }
      this.isManuallyChanged = false;
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class AutoRefreshModelFactoryService {
  private _$rootScope = inject(AJS_ROOT_SCOPE);

  create(): AutoRefreshModel {
    return new AutoRefreshModelImpl(this._$rootScope);
  }
}
