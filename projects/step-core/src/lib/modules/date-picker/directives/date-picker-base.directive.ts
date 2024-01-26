import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DateField } from '../types/date-field';
import { DatePickerComponent } from '../components/date-picker/date-picker.component';
import { ControlValueAccessor } from '@angular/forms';
import { DateAdapterService } from '../injectables/date-adapter.service';
import { Mutable } from '../../../shared';

type FieldAccessor = Mutable<Pick<DatePickerBaseDirective<any>, 'formattedValue'>>;
type OnChange<D> = (date?: D | null) => void;
type OnTouch = () => void;

@Directive({})
export abstract class DatePickerBaseDirective<D> implements DateField<D>, OnChanges, ControlValueAccessor {
  private _elRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private _dateAdapter = inject<DateAdapterService<D>>(DateAdapterService);

  private onChange?: OnChange<D>;
  private onTouch?: OnTouch;
  private modelValue?: D | null;

  picker?: DatePickerComponent;

  @Input() showTime: boolean = false;

  @HostBinding('attr.disabled')
  protected isDisabled?: boolean;

  @Output() dateChange = new EventEmitter<D | null | undefined>();

  readonly formattedValue: string = '';

  writeValue(date?: D | null): void {
    this.modelValue = date;
    this.formatValue(date);
  }
  registerOnChange(onChange: OnChange<D>): void {
    this.onChange = onChange;
  }
  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cPicker = changes['picker'];
    if (cPicker?.previousValue !== cPicker?.currentValue || cPicker?.firstChange) {
      this.setupPicker(cPicker?.currentValue);
    }
  }

  getConnectedOverlayOrigin(): ElementRef {
    return this._elRef;
  }

  getModel(): D | undefined | null {
    return this.modelValue;
  }

  setModel(date?: D | null): void {
    this.modelValue = date;
    this.formatValue(date);
    this.onChange?.(date);
    this.dateChange.emit(date);
  }

  isFieldDisabled(): boolean {
    return !!this.isDisabled;
  }

  dateAdapter(): DateAdapterService<D> {
    return this._dateAdapter;
  }

  withTime(): boolean {
    return this.showTime;
  }

  abstract isRangeField(): boolean;

  private setupPicker(picker?: DatePickerComponent): void {
    picker?.registerInput(this);
  }

  private formatValue(value?: D | null): void {
    (this as FieldAccessor).formattedValue = this._dateAdapter.format(value, this.showTime);
    this._elRef.nativeElement.value = this.formattedValue;
  }

  @HostListener('input', ['$event'])
  private handleInput($event: Event): void {
    const value = ($event.target as HTMLInputElement).value;
    const date = this._dateAdapter.parse(value, this.showTime);

    (this as FieldAccessor).formattedValue = date ? value : '';

    const hasChanges = !this._dateAdapter.areEqual(date, this.modelValue);

    if (hasChanges) {
      this.modelValue = date;
      this.onChange?.(date);
      this.dateChange.emit(date);
    }
  }

  @HostListener('change')
  private handleChange(): void {
    this.onChange?.(this.modelValue);
    this.dateChange.emit(this.modelValue);
  }

  @HostListener('blur')
  private handleBlur(): void {
    this.formatValue(this.modelValue);
    this.onTouch?.();
  }
}
