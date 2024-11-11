import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { KeyValue } from '@angular/common';
import { ArrayItemLabelValueExtractor } from '../../injectables/array-item-label-value-extractor';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';

type OnChange = (value: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AutocompleteInputComponent<T = unknown> implements ControlValueAccessor {
  private _fb = inject(FormBuilder).nonNullable;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private selectedValue = signal('');

  protected filterCtrl = this._fb.control('');

  private filterValue = toSignal(
    this.filterCtrl.valueChanges.pipe(startWith(this.filterCtrl.value), distinctUntilChanged(), debounceTime(300)),
  );

  /** @Input **/
  readonly possibleItems = input<T[] | undefined>(undefined);

  /** @Input **/
  readonly placeholder = input<string>('');

  /** @Input **/
  readonly valueLabelExtractor = input<ArrayItemLabelValueExtractor<T, string> | undefined>(undefined);

  /** @ViewChild **/
  private autoCompleteTrigger = viewChild('inputElement', { read: MatAutocompleteTrigger });

  /** @ViewChild **/
  private inputElement = viewChild('inputElement', { read: ElementRef<HTMLInputElement> });

  private availableItems = computed(() => {
    const possibleItems = this.possibleItems() ?? [];
    const extractor = this.valueLabelExtractor();
    if (!extractor) {
      return [];
    }
    return possibleItems.map((item) => {
      const key = extractor!.getValue(item);
      const value = extractor!.getLabel(item);
      return { key, value } as KeyValue<string, string>;
    });
  });

  private effectDetermineFilterValue = effect(() => {
    const selectedValue = this.selectedValue();
    const extractor = this.valueLabelExtractor();
    const availAbleItems = this.availableItems();
    if (!extractor) {
      this.filterCtrl.setValue('', { emitEvent: false });
      return;
    }
    const selectedItem = availAbleItems.find((item) => item.key === selectedValue)?.value ?? selectedValue;
    this.filterCtrl.setValue(selectedItem);
  });

  protected readonly displayItems = computed(() => {
    const availableItems = this.availableItems();
    const filter = (this.filterValue() ?? '').toLowerCase().trim();

    let result = availableItems.filter(({ value }) => !filter || value.toLowerCase().includes(filter));

    if (result.length === 0 && !!filter) {
      result = [{ key: filter, value: this.filterValue()! }];
    }
    return result;
  });

  writeValue(selectedValue?: string): void {
    selectedValue = selectedValue ?? '';
    this.selectedValue.set(selectedValue);
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.filterCtrl.disable({ emitEvent: false });
    } else {
      this.filterCtrl.enable({ emitEvent: false });
    }
  }

  protected select(event: MatAutocompleteSelectedEvent): void {
    const selectedValue = event.option.value;
    this.updateValue(selectedValue);
  }

  protected handleBlur($event: FocusEvent): void {
    // Menu items are not focusable.
    // If panel is open, and there is no related target - it means that menu item has been clicked.
    // In that case ignore blur's logic
    if (this.autoCompleteTrigger()?.panelOpen && !$event.relatedTarget) {
      return;
    }
    const value = this.filterCtrl.value.trim();
    this.autoCompleteTrigger()?.closePanel();
    if (value !== this.selectedValue()) {
      this.updateValue(value);
    }
  }

  private updateValue(value: string): void {
    if (this.filterCtrl.disabled) {
      return;
    }
    this.selectedValue.set(value);
    this.onChange?.(value);
    this.onTouch?.();
  }

  @HostListener('click')
  private handleClick(): void {
    this.inputElement()?.nativeElement?.focus();
  }
}
