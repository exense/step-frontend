import { Component, EventEmitter, Inject, Input, OnDestroy, Output } from '@angular/core';
import { IRootScopeService } from 'angular';
import { interval, Observable, Subscription } from 'rxjs';
import { AJS_ROOT_SCOPE } from '../../shared';

interface AutorefreshPreset {
  label: string;
  value: number;
}

@Component({
  selector: 'step-autorefresh-toggle',
  templateUrl: './autorefresh-toggle.component.html',
  styleUrls: ['./autorefresh-toggle.component.scss'],
})
export class AutorefreshToggleComponent implements OnDestroy {
  private _intervalSubscription?: Subscription;
  private _interval$?: Observable<unknown>;

  private _isManuallyChanged: boolean = false;

  readonly presets: ReadonlyArray<AutorefreshPreset> = [
    { label: 'OFF', value: 0 },
    { label: '5 seconds', value: 5000 },
    { label: '10 seconds', value: 10000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
  ];
  selectedInterval: AutorefreshPreset = this.presets[0];

  @Input() autoIncreaseTo?: number;

  _disabled: boolean = false;

  get disabled(): boolean {
    return this._disabled;
  }

  @Input() set disabled(value: boolean) {
    if (this.disabled === value) {
      return;
    }
    this._disabled = value;
    this.disabledChange.emit(value);
    this._$rootScope.$broadcast('globalsettings-globalRefreshToggle', { new: !value });
    if (!value) {
      this.refresh.emit();
    } else {
      this.interval = 0;
    }
  }

  private _interval: number = 0;

  get interval(): number {
    return this._interval;
  }

  @Input() set interval(value: number) {
    if (value === this._interval) {
      return;
    }
    this.stopTimer();
    this._interval = value;
    this.selectedInterval = this.presets.find((p) => p.value === value) || { label: '', value: value };
    this.intervalChange.emit(value);
    this._$rootScope.$broadcast('globalsettings-refreshInterval', { new: value });
    this.startTimer();
  }

  @Output() disabledChange = new EventEmitter<boolean>();
  @Output() intervalChange = new EventEmitter<number>();

  @Output() refresh = new EventEmitter<unknown>();

  constructor(@Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService) {}

  ngOnDestroy(): void {
    this.stopTimer();
  }

  changeRefreshInterval(newInterval: AutorefreshPreset): void {
    this._isManuallyChanged = true;
    this.selectedInterval = newInterval;
    this.interval = newInterval.value;
    this.disabled = this.interval <= 0;
  }

  private stopTimer(): void {
    if (this._intervalSubscription) {
      this._intervalSubscription.unsubscribe();
      this._intervalSubscription = undefined;
    }
    this._interval$ = undefined;
  }

  private startTimer(): void {
    if (this._interval$ || this.interval <= 0) {
      return;
    }

    this._interval$ = interval(this.interval);
    this._intervalSubscription = this._interval$.subscribe((_) => {
      this.refresh.emit();

      if (this.autoIncreaseTo && !this._isManuallyChanged && this._interval < this.autoIncreaseTo) {
        const newInterval = this.interval * 2;
        this.interval = newInterval < this.autoIncreaseTo ? newInterval : this.autoIncreaseTo;
      }
      this._isManuallyChanged = false;
    });
  }
}
