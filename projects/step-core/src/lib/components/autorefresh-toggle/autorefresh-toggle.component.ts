import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { AutoRefreshModelFactoryService } from '../../services/auto-refresh-model-factory.service';
import { Subject, takeUntil } from 'rxjs';
import { AutoRefreshModel } from '../../shared';

interface AutorefreshPreset {
  label: string;
  value: number;
}

@Component({
  selector: 'step-autorefresh-toggle',
  templateUrl: './autorefresh-toggle.component.html',
  styleUrls: ['./autorefresh-toggle.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AutorefreshToggleComponent implements OnInit, OnChanges, OnDestroy {
  private terminator$?: Subject<void>;
  private isExternalModel = false;

  private _autoRefreshModelFactory = inject(AutoRefreshModelFactoryService);
  @Input() model = this._autoRefreshModelFactory.create();
  @Input() buttonType: 'icon' | 'stroke' = 'icon';

  @Input() presets: ReadonlyArray<AutorefreshPreset> = [
    { label: 'OFF', value: 0 },
    { label: '5 seconds', value: 5000 },
    { label: '10 seconds', value: 10000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
  ];

  readonly hideTooltip = input(false);
  protected readonly selectedInterval = signal(this.presets[0]);
  protected readonly tooltipMessage = computed(() => {
    const hideTooltip = this.hideTooltip();
    const interval = this.selectedInterval();
    if (hideTooltip) {
      return '';
    }
    const label = interval.label || this.presets[1].label;
    return `refresh: ${label}`;
  });

  @Input() autoIncreaseTo?: number;
  @Input() interval: number = 0;
  @Input() disabled: boolean = false;
  @Input() disableAutoRefreshButton = false;

  @Output() disabledChange = new EventEmitter<boolean>();
  @Output() intervalChange = new EventEmitter<number>();
  @Output() refresh = new EventEmitter<unknown>();

  ngOnInit(): void {
    if (!this.isExternalModel) {
      this.setupModelChanges(this.model);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cModel = changes['model'];
    if (cModel?.previousValue !== cModel?.currentValue || cModel?.firstChange) {
      this.setModel(cModel?.currentValue);
    }

    const cInterval = changes['interval'];
    if (cInterval?.previousValue !== cInterval?.currentValue || cInterval?.firstChange) {
      this.setInterval(cInterval?.currentValue);
    }

    const cDisabled = changes['disabled'];
    if (cDisabled?.previousValue !== cDisabled?.currentValue || cDisabled?.firstChange) {
      this.setIsDisabled(cDisabled?.currentValue);
    }

    const cAutoIncreaseTo = changes['autoIncreaseTo'];
    if (cAutoIncreaseTo?.previousValue !== cAutoIncreaseTo?.currentValue || cAutoIncreaseTo?.firstChange) {
      this.setAutoIncrease(cAutoIncreaseTo?.currentValue);
    }
  }

  ngOnDestroy(): void {
    if (!this.isExternalModel) {
      this.model.destroy();
    }
    this.terminate();
  }

  changeRefreshInterval(newInterval: AutorefreshPreset): void {
    this.selectedInterval.set(newInterval);
    this.model.setInterval(newInterval.value, true);
    this.model.setDisabled(newInterval.value < 0);
  }

  private terminate(): void {
    if (!this.terminator$) {
      return;
    }
    this.terminator$.next();
    this.terminator$.complete();
    this.terminator$ = undefined;
  }

  private setupModelChanges(model: AutoRefreshModel): void {
    this.terminate();
    this.terminator$ = new Subject<void>();
    model.disableChange$.pipe(takeUntil(this.terminator$)).subscribe((disabled) => this.disabledChange.emit(disabled));
    model.intervalChange$.pipe(takeUntil(this.terminator$)).subscribe((interval) => this.intervalChange.emit(interval));
    model.refresh$.pipe(takeUntil(this.terminator$)).subscribe(() => this.refresh.emit());
  }

  private setModel(model: AutoRefreshModel): void {
    this.isExternalModel = true;
    this.setupModelChanges(model);
    this.selectedInterval.set(
      this.presets.find((p) => p.value === model.interval) || {
        label: '',
        value: model.interval,
      },
    );
  }

  private setInterval(interval: number): void {
    if (this.isExternalModel) {
      return;
    }
    this.selectedInterval.set(this.presets.find((p) => p.value === interval) || { label: '', value: interval });
    this.model.setInterval(interval ?? 0);
  }

  private setIsDisabled(disabled: boolean): void {
    if (this.isExternalModel) {
      return;
    }
    this.model.setDisabled(disabled);
  }

  private setAutoIncrease(autoIncreaseTo: number): void {
    if (this.isExternalModel) {
      return;
    }
    this.model.setAutoIncreaseTo(autoIncreaseTo);
  }
}
