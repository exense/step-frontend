import {
  Component,
  ElementRef,
  forwardRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { BehaviorSubject, combineLatest, debounceTime, map, startWith, Subject, takeUntil } from 'rxjs';
import { ArrayItemLabelValueExtractor } from '../../injectables/array-item-label-value-extractor';
import { KeyValue } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type OnChange = (value?: string[]) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-array-input',
  templateUrl: './array-input.component.html',
  styleUrls: ['./array-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArrayInputComponent),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ArrayInputComponent<T = unknown> implements ControlValueAccessor, OnChanges, OnDestroy {
  private _fb = inject(FormBuilder).nonNullable;

  private availableItems$ = new BehaviorSubject<KeyValue<string, string>[]>([]);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private selectedItems: string[] = [];

  protected isDisabled?: boolean;

  protected selectedDisplayItems: KeyValue<string, string>[] = [];
  protected filterCtrl = this._fb.control('');

  protected readonly displayItems$ = combineLatest([
    this.availableItems$,
    this.filterCtrl.valueChanges.pipe(startWith(this.filterCtrl.value), debounceTime(300), takeUntilDestroyed()),
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
  @Input() valueLabelExtractor?: ArrayItemLabelValueExtractor<T, string>;
  @Input() preventChars?: string[];
  @Input() placeholder: string = '';

  @ViewChild('inputElement', { static: false }) private inputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('inputElement', { static: false, read: MatAutocompleteTrigger })
  private autoCompleteTrigger!: MatAutocompleteTrigger;

  ngOnChanges(changes: SimpleChanges): void {
    const cPossibleItems = changes['possibleItems'];
    if (cPossibleItems?.previousValue !== cPossibleItems?.currentValue || cPossibleItems?.firstChange) {
      const possibleItems = cPossibleItems.currentValue;
      this.determineItems({ possibleItems });
    }
  }

  ngOnDestroy(): void {
    this.availableItems$.complete();
  }

  registerOnChange(onChange: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(selectedItems?: string[]): void {
    selectedItems = selectedItems ?? [];
    this.selectedItems = selectedItems;
    this.determineItems({ selectedItems });
  }

  protected removeItem(itemIndex: number): void {
    if (!this.selectedItems.length) {
      return;
    }
    this.selectedItems.splice(itemIndex, 1);
    this.determineItems();
    this.onChange?.(this.selectedItems);
    this.onTouch?.();
  }

  protected handleBlur(): void {
    // Invoke blur logic with little timeout, because otherwise it might intersect with select option logic
    // because input filter looses the focus
    setTimeout(() => {
      if (!this.filterCtrl.value) {
        this.onTouch?.();
        return;
      }
      const value = this.filterCtrl.value.trim();
      this.autoCompleteTrigger.closePanel();
      this.filterCtrl.setValue('');
      this.addItem(value);
    }, 100);
  }

  protected add(event: MatChipInputEvent): void {
    const item = event.value.trim();
    this.autoCompleteTrigger.closePanel();
    this.filterCtrl.setValue('');
    this.addItem(item);
  }

  protected select(event: MatAutocompleteSelectedEvent): void {
    const item = event.option.value;
    this.filterCtrl.setValue('');
    this.addItem(item);
  }

  private addItem(item: string): void {
    this.selectedItems.push(item);
    this.determineItems();
    this.onChange?.(this.selectedItems);
    this.onTouch?.();
  }

  private determineItems({
    selectedItems,
    possibleItems,
    extractor,
  }: { selectedItems?: string[]; possibleItems?: T[]; extractor?: ArrayItemLabelValueExtractor<T> } = {}): void {
    selectedItems = selectedItems ?? this.selectedItems ?? [];
    possibleItems = possibleItems ?? this.possibleItems ?? [];
    extractor = extractor ?? this.valueLabelExtractor;
    if (!extractor) {
      this.availableItems$.next([]);
      this.selectedDisplayItems = [];
      return;
    }
    const items = possibleItems.map((item) => {
      const key = extractor!.getValue(item);
      const value = extractor!.getLabel(item);
      return { key, value } as KeyValue<string, string>;
    });
    this.selectedDisplayItems = selectedItems.map(
      (selectedItem) => items.find((item) => item.key === selectedItem) ?? { key: selectedItem, value: selectedItem },
    );
    this.availableItems$.next(items.filter((item) => !selectedItems!.includes(item.key)));
  }
}
