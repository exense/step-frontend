import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TrackByFunction,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TimeUnit } from '../../shared/time-unit.enum';
import { KeyValue } from '@angular/common';

type OnChange = (value: number) => void;
type OnTouch = () => void;

export type TimeUnitDictionary = Partial<Record<TimeUnit, string>>;

const DEFAULT_TIME_LABELS_DICTIONARY: TimeUnitDictionary = {
  [TimeUnit.MILLISECOND]: 'Millisecond(s)',
  [TimeUnit.SECOND]: 'Second(s)',
  [TimeUnit.MINUTE]: 'Minute(s)',
  [TimeUnit.HOUR]: 'Hour(s)',
  [TimeUnit.DAY]: 'Day(s)',
};

@Component({
  selector: 'step-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeInputComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() label?: string;
  @Input() tooltip?: string;
  @Input() showRequiredMarker: boolean = false;
  @Input() errorsDictionary?: Record<string, string>;
  @Input() separator?: string;

  @Input() allowedMeasures: TimeUnit[] = [
    TimeUnit.MILLISECOND,
    TimeUnit.SECOND,
    TimeUnit.MINUTE,
    TimeUnit.HOUR,
    TimeUnit.DAY,
  ];

  @Input() measuresDictionary?: TimeUnitDictionary;
  @Input() displayMeasure?: TimeUnit;
  @Output() displayMeasureChange = new EventEmitter<TimeUnit | undefined>();

  @Input() modelMeasure = TimeUnit.MILLISECOND;

  private onChange?: OnChange;
  private onTouch?: OnTouch;
  private modelValue: number = 0;

  protected isDisabled?: boolean;
  protected measureItems: KeyValue<TimeUnit, string>[] = [];
  protected displayValue: number = 0;

  protected readonly trackByMeasureItem: TrackByFunction<KeyValue<TimeUnit, string>> = (index, { key }) => key;

  constructor(readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(value: number): void {
    this.modelValue = value;
    this.displayValue = this.calculateDisplayValue(this.modelValue, this.modelMeasure, this.displayMeasure);
  }

  ngOnInit(): void {
    this.fillMeasureItems(this.allowedMeasures, this.measuresDictionary);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cAllowedMeasures = changes['allowedMeasures'];
    const cMeasuredDictionary = changes['measuresDictionary'];

    let measures: TimeUnit[] | undefined = undefined;
    let dictionary: Record<TimeUnit, string> | undefined = undefined;

    if (cAllowedMeasures?.previousValue !== cAllowedMeasures?.currentValue || cAllowedMeasures?.firstChange) {
      measures = cAllowedMeasures?.currentValue;
    }

    if (cMeasuredDictionary?.previousValue !== cMeasuredDictionary?.currentValue || cAllowedMeasures?.firstChange) {
      dictionary = cMeasuredDictionary?.currentValue;
    }

    if (measures !== undefined || dictionary !== undefined) {
      this.fillMeasureItems(measures, dictionary);
    }

    const cModelMeasure = changes['modelMeasure'];
    if (cModelMeasure?.previousValue !== cModelMeasure?.currentValue || cModelMeasure?.firstChange) {
      this.displayValue = this.calculateDisplayValue(this.modelValue, cModelMeasure!.currentValue, this.displayMeasure);
    }

    const cDisplayMeasure = changes['displayMeasure'];
    if (cDisplayMeasure?.previousValue !== cDisplayMeasure?.currentValue || cDisplayMeasure?.firstChange) {
      this.displayValue = this.calculateDisplayValue(this.modelValue, this.modelMeasure, cDisplayMeasure!.currentValue);
    }
  }

  protected handleDisplayValueChange(value: number): void {
    this.displayValue = value;
    this.modelValue = this.calculateModelValue(this.displayValue, this.modelMeasure, this.displayMeasure);
    this.onChange?.(this.modelValue);
  }

  protected handleDisplayMeasureChange(value: TimeUnit): void {
    this.displayMeasure = value;
    this.displayMeasureChange.emit(value);
    this.modelValue = this.calculateModelValue(this.displayValue, this.modelMeasure, this.displayMeasure);
    this.onChange?.(this.modelValue);
  }

  protected handleBlur(): void {
    this.onTouch?.();
  }

  private fillMeasureItems(allowedMeasures?: TimeUnit[], measuresDictionary?: TimeUnitDictionary): void {
    allowedMeasures = allowedMeasures ?? this.allowedMeasures ?? [];
    measuresDictionary = measuresDictionary ?? this.measuresDictionary ?? {};

    this.measureItems = allowedMeasures.map((key) => {
      const value = measuresDictionary?.[key] ?? DEFAULT_TIME_LABELS_DICTIONARY[key]!;
      return { key, value };
    });

    if (allowedMeasures.includes(this.displayMeasure!)) {
      return;
    }

    this.displayMeasure = allowedMeasures[0];
    this.displayMeasureChange.emit(this.displayMeasure);
  }

  private calculateDisplayValue(modelValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number {
    if (!displayMeasure) {
      return modelValue;
    }
    const ms = modelValue * modelMeasure;
    return Math.round(ms / displayMeasure);
  }

  private calculateModelValue(displayValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number {
    if (!displayMeasure) {
      return displayValue;
    }
    const ms = displayValue * displayMeasure;
    return Math.round(ms / modelMeasure);
  }
}
