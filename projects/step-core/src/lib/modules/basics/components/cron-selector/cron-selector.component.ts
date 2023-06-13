import { Component, inject, Input, OnDestroy, TrackByFunction } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { KeyValue } from '@angular/common';
import { CRON_PRESETS } from '../../services/cron-presets.token';

type OnChange = (value: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-cron-selector',
  templateUrl: './cron-selector.component.html',
  styleUrls: ['./cron-selector.component.scss'],
})
export class CronSelectorComponent implements ControlValueAccessor, OnDestroy {
  readonly _cronPresets = inject(CRON_PRESETS);
  readonly trackByKeyValue: TrackByFunction<KeyValue<string, string>> = (index, item) => item.key;

  @Input() label?: string;
  @Input() placeholder?: string;

  private onChange: OnChange = noop;
  private onTouch: OnTouch = noop;

  protected cronString?: string;
  protected isDisabled: boolean = false;

  constructor(readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  ngOnDestroy(): void {
    this.onChange = noop;
    this.onTouch = noop;
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

  writeValue(value: string): void {
    this.cronString = value;
  }

  valueChange(value: string): void {
    this.cronString = value;
    this.onTouch();
    this.onChange(value);
  }

  handleBlur(): void {
    this.onTouch();
  }
}
