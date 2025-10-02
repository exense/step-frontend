import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  output,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { AutoRefreshModelFactoryService } from '../../services/auto-refresh-model-factory.service';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DurationPipe } from '../../modules/basics/step-basics.module';

interface AutorefreshPreset {
  label: string;
  value: number;
}

@Component({
  selector: 'step-autorefresh-toggle',
  templateUrl: './autorefresh-toggle.component.html',
  styleUrls: ['./autorefresh-toggle.component.scss'],
  providers: [DurationPipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AutorefreshToggleComponent implements OnDestroy {
  private _durationPipe = inject(DurationPipe);
  private _autoRefreshModelFactory = inject(AutoRefreshModelFactoryService);

  private initialModel = this._autoRefreshModelFactory.create();
  readonly model = input(this.initialModel);

  private model$ = toObservable(this.model);

  private isExternalModel = computed(() => {
    const model = this.model();
    return model !== this.initialModel;
  });

  readonly buttonType = input<'icon' | 'stroke'>('icon');

  readonly presets = input<ReadonlyArray<AutorefreshPreset>>([
    { label: 'OFF', value: 0 },
    { label: '5 seconds', value: 5000 },
    { label: '10 seconds', value: 10000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
  ]);

  readonly hideTooltip = input(false);
  protected readonly selectedInterval = linkedSignal(() => {
    const model = this.model();
    const presets = this.presets();
    return (
      presets.find((p) => p.value === model.interval) ?? {
        label: '',
        value: model.interval,
      }
    );
  });
  protected readonly selectedIntervalValue = computed(() => this.selectedInterval().value);

  private closestInterval = computed(() => {
    const selectedInterval = this.selectedInterval();
    const presets = this.presets();
    if (!!selectedInterval.label) {
      return selectedInterval;
    }
    let preset: AutorefreshPreset | undefined = undefined;
    for (const p of presets) {
      if (selectedInterval.value <= p.value) {
        preset = p;
        break;
      }
    }
    return preset ?? selectedInterval;
  });

  protected readonly selectedIntervalDisplayValue = computed(() => {
    const closestInterval = this.closestInterval();
    return this._durationPipe.transform(closestInterval.value, 0, { displaySingle: true });
  });
  protected readonly isOff = computed(() => this.selectedIntervalValue() === 0);

  protected readonly tooltipMessage = computed(() => {
    const hideTooltip = this.hideTooltip();
    const interval = this.closestInterval();
    if (hideTooltip) {
      return '';
    }
    const label = interval.label || this._durationPipe.transform(interval.value, 0, { displaySingle: true });
    return `refresh: ${label}`;
  });

  readonly disableAutoRefreshButton = input(false);

  readonly interval = input(0);
  private effectIntervalChange = effect(() => {
    const interval = this.interval();
    const isExternalModel = this.isExternalModel();
    if (isExternalModel) {
      return;
    }
    this.updateInterval(interval);
    untracked(() => this.model()).setInterval(interval ?? 0);
  });

  readonly disabled = input(false);
  private effectDisableChange = effect(() => {
    const disabled = this.disabled();
    const isExternalModel = this.isExternalModel();
    if (isExternalModel) {
      return;
    }
    untracked(() => this.model()).setDisabled(disabled);
  });

  readonly autoIncreaseTo = input<number | undefined>(undefined);
  private effectAutoIncreaseToChange = effect(() => {
    const autoIncreaseTo = this.autoIncreaseTo();
    const isExternalModel = this.isExternalModel();
    if (isExternalModel) {
      return;
    }
    untracked(() => this.model()).setAutoIncreaseTo(autoIncreaseTo);
  });

  readonly disabledChange = output<boolean>();
  readonly intervalChange = output<number>();
  readonly intervalChangeExplicit = output<number>();
  readonly refresh = output<void>();

  readonly refresh$ = this.model$.pipe(
    switchMap((model) => model.refresh$),
    takeUntilDestroyed(),
  );

  private disableChangeSubscription = this.model$
    .pipe(
      switchMap((model) => model.disableChange$),
      takeUntilDestroyed(),
    )
    .subscribe((disabled) => this.disabledChange.emit(disabled));

  private intervalChangeSubscription = this.model$
    .pipe(
      switchMap((model) => model.intervalChange$),
      takeUntilDestroyed(),
    )
    .subscribe((interval) => {
      this.updateInterval(interval);
      this.intervalChange.emit(interval);
    });

  private refreshSubscription = this.refresh$.subscribe(() => this.refresh.emit());

  ngOnDestroy(): void {
    this.initialModel.destroy();
  }

  changeRefreshInterval(newInterval: AutorefreshPreset): void {
    this.selectedInterval.set(newInterval);
    this.model().setInterval(newInterval.value, true);
    this.model().setDisabled(newInterval.value < 0);
    this.intervalChangeExplicit.emit(newInterval.value);
  }

  private updateInterval(interval: number): void {
    const presets = untracked(() => this.presets());
    const preset = presets.find((p) => p.value === interval) || { label: '', value: interval };
    this.selectedInterval.set(preset);
  }
}
