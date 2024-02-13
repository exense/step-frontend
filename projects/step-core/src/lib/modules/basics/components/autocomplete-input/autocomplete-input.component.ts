import {
  Component,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TrackByFunction,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, Subject, combineLatest, startWith, debounceTime, takeUntil, map } from 'rxjs';
import { KeyValue } from '@angular/common';
import { ArrayItemLabelValueExtractor } from '../../services/array-item-label-value-extractor';
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
  encapsulation: ViewEncapsulation.None,
})
export class AutocompleteInputComponent<T = unknown> implements ControlValueAccessor, OnChanges, OnDestroy {
  private _fb = inject(FormBuilder).nonNullable;

  private terminator$ = new Subject<void>();
  private availableItems$ = new BehaviorSubject<KeyValue<string, string>[]>([]);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private selectedValue: string = '';

  protected filterCtrl = this._fb.control('');

  protected readonly trackByKeyValue: TrackByFunction<KeyValue<string, string>> = (index, item) => item.key;

  protected readonly displayItems$ = combineLatest([
    this.availableItems$,
    this.filterCtrl.valueChanges.pipe(startWith(this.filterCtrl.value), debounceTime(300), takeUntil(this.terminator$)),
  ]).pipe(
    map(([availableItems, filter]) => {
      let result = availableItems.filter(
        ({ value }) => !filter || value.toLowerCase().includes(filter.trim().toLowerCase()),
      );
      if (result.length === 0 && !!filter.trim()) {
        result = [{ key: filter, value: filter }];
      }
      return result;
    }),
  );

  @Input() possibleItems?: T[];
  @Input() placeHolder?: string;
  @Input() valueLabelExtractor?: ArrayItemLabelValueExtractor<T, string>;

  @ViewChild('inputElement', { static: true, read: MatAutocompleteTrigger })
  private autoCompleteTrigger!: MatAutocompleteTrigger;

  writeValue(selectedValue?: string): void {
    selectedValue = selectedValue ?? '';
    this.selectedValue = selectedValue;
    this.determineItems({ selectedValue });
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

  ngOnChanges(changes: SimpleChanges): void {
    const cPossibleItems = changes['possibleItems'];
    if (cPossibleItems?.previousValue !== cPossibleItems?.currentValue || cPossibleItems?.firstChange) {
      const possibleItems = cPossibleItems.currentValue;
      this.determineItems({ possibleItems });
    }
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
    this.availableItems$.complete();
  }

  protected select(event: MatAutocompleteSelectedEvent): void {
    const selectedValue = event.option.value;
    this.updateValue(selectedValue);
  }

  protected handleBlur(): void {
    // Invoke blur logic with little timeout, because otherwise it might intersect with select option logic
    // because input filter looses the focus
    setTimeout(() => {
      const value = this.filterCtrl.value.trim();
      this.autoCompleteTrigger.closePanel();
      if (value !== this.selectedValue) {
        this.updateValue(value);
      }
    }, 100);
  }

  private determineItems({
    selectedValue,
    possibleItems,
    extractor,
  }: {
    selectedValue?: string;
    possibleItems?: T[];
    extractor?: ArrayItemLabelValueExtractor<T>;
  } = {}): void {
    selectedValue = selectedValue ?? this.selectedValue ?? '';
    possibleItems = possibleItems ?? this.possibleItems ?? [];
    extractor = extractor ?? this.valueLabelExtractor;
    if (!extractor) {
      this.availableItems$.next([]);
      this.filterCtrl.setValue('', { emitEvent: false });
      return;
    }
    const items = possibleItems.map((item) => {
      const key = extractor!.getValue(item);
      const value = extractor!.getLabel(item);
      return { key, value } as KeyValue<string, string>;
    });
    const selectedItem = items.find((item) => item.key === selectedValue)?.value ?? selectedValue;
    this.filterCtrl.setValue(selectedItem);
    this.availableItems$.next(items);
  }

  private updateValue(value: string): void {
    if (this.filterCtrl.disabled) {
      return;
    }
    this.selectedValue = value;
    this.onChange?.(this.selectedValue);
    this.onTouch?.();
  }
}
