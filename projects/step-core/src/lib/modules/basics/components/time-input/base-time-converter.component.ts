import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { KeyValue } from '@angular/common';
import { TimeUnit } from '../../types/time-unit.enum';
import { TimeConverter } from '../../types/time-converter';

type OnChange = (value: number) => void;
type OnTouch = () => void;

export type TimeUnitDictionary = Partial<Record<TimeUnit, string>>;

export const DEFAULT_TIME_LABELS_DICTIONARY: TimeUnitDictionary = {
  [TimeUnit.MILLISECOND]: 'Millisecond(s)',
  [TimeUnit.SECOND]: 'Second(s)',
  [TimeUnit.MINUTE]: 'Minute(s)',
  [TimeUnit.HOUR]: 'Hour(s)',
  [TimeUnit.DAY]: 'Day(s)',
  [TimeUnit.WEEK]: 'Week(s)',
  [TimeUnit.MONTH]: 'Month(s)',
  [TimeUnit.YEAR]: 'Year(s)',
};

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseTimeConverterComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() label?: string;
  @Input() tooltip?: string;
  @Input() showRequiredMarker: boolean = false;
  @Input() errorsDictionary?: Record<string, string>;
  @Output() blur = new EventEmitter<void>();
  protected separator?: string;

  @Input() allowedMeasures: TimeUnit[] = [
    TimeUnit.MILLISECOND,
    TimeUnit.SECOND,
    TimeUnit.MINUTE,
    TimeUnit.HOUR,
    TimeUnit.DAY,
    TimeUnit.WEEK,
    TimeUnit.MONTH,
    TimeUnit.YEAR,
  ];

  @Input() measuresDictionary?: TimeUnitDictionary;

  protected internalDisplayMeasure?: TimeUnit;
  @Input() defaultDisplayMeasure?: TimeUnit;
  @Input() displayMeasure?: TimeUnit;
  @Output() displayMeasureChange = new EventEmitter<TimeUnit | undefined>();

  @Input() modelMeasure = TimeUnit.MILLISECOND;

  private onChange?: OnChange;
  private onTouch?: OnTouch;
  private modelValue: number = 0;

  protected isDisabled?: boolean;
  protected measureItems: KeyValue<TimeUnit, string>[] = [];
  protected displayValue: number = 0;

  protected abstract timeConverter: TimeConverter;

  protected constructor(readonly _ngControl: NgControl) {
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
    if (!this.displayMeasure) {
      this.internalDisplayMeasure = this.timeConverter.autoDetermineDisplayMeasure(
        value,
        this.modelMeasure,
        this.allowedMeasures,
        this.defaultDisplayMeasure,
      );
    }
    this.modelValue = value;
    this.displayValue = this.timeConverter.calculateDisplayValue(
      this.modelValue,
      this.modelMeasure,
      this.internalDisplayMeasure,
    );
  }

  ngOnInit(): void {
    if (!this.measureItems.length) {
      this.fillMeasureItems(this.allowedMeasures, this.measuresDictionary);
    }
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
      this.displayValue = this.timeConverter.calculateDisplayValue(
        this.modelValue,
        cModelMeasure!.currentValue,
        this.internalDisplayMeasure,
      );
    }

    const cDisplayMeasure = changes['displayMeasure'];
    if (cDisplayMeasure?.previousValue !== cDisplayMeasure?.currentValue || cDisplayMeasure?.firstChange) {
      const measure = cDisplayMeasure?.currentValue;
      if (measure) {
        this.internalDisplayMeasure = measure;
        this.displayValue = this.timeConverter.calculateDisplayValue(
          this.modelValue,
          this.modelMeasure,
          this.internalDisplayMeasure,
        );
      }
    }
  }

  protected handleDisplayValueChange(value: number): void {
    if (this.isDisabled) {
      return;
    }
    this.displayValue = value;
    this.modelValue = this.timeConverter.calculateModelValue(
      this.displayValue,
      this.modelMeasure,
      this.internalDisplayMeasure,
    );
    this.onChange?.(this.modelValue);
  }

  protected handleDisplayMeasureChange(value: TimeUnit): void {
    if (this.isDisabled) {
      return;
    }
    if (this.displayMeasure) {
      this.displayMeasure = value;
      this.displayMeasureChange.emit(value);
    }
    this.internalDisplayMeasure = value;
    this.modelValue = this.timeConverter.calculateModelValue(
      this.displayValue,
      this.modelMeasure,
      this.internalDisplayMeasure,
    );
    this.onChange?.(this.modelValue);
  }

  protected handleBlur(): void {
    this.onTouch?.();
    this.blur.emit();
  }

  private fillMeasureItems(allowedMeasures?: TimeUnit[], measuresDictionary?: TimeUnitDictionary): void {
    allowedMeasures = allowedMeasures ?? this.allowedMeasures ?? [];
    measuresDictionary = measuresDictionary ?? this.measuresDictionary ?? {};

    this.measureItems = allowedMeasures.map((key) => {
      const value = measuresDictionary?.[key] ?? DEFAULT_TIME_LABELS_DICTIONARY[key]!;
      return { key, value };
    });

    if (allowedMeasures.includes(this.internalDisplayMeasure!)) {
      return;
    }

    if (this.displayMeasure) {
      this.internalDisplayMeasure = allowedMeasures[0];
      this.displayMeasure = allowedMeasures[0];
      this.displayMeasureChange.emit(this.displayMeasure);
    }
  }
}
