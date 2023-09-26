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
export class ArrayInputComponent implements ControlValueAccessor, OnChanges, OnDestroy {
  private _fb = inject(FormBuilder).nonNullable;

  private terminator$ = new Subject<void>();
  private availableItems$ = new BehaviorSubject<string[]>([]);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected isDisabled?: boolean;

  protected selectedItems: string[] = [];

  protected filterCtrl = this._fb.control('');

  protected readonly displayItems$ = combineLatest([
    this.availableItems$,
    this.filterCtrl.valueChanges.pipe(startWith(this.filterCtrl.value), debounceTime(300), takeUntil(this.terminator$)),
  ]).pipe(
    map(([availableItems, filter]) => {
      let result = availableItems.filter((item) => !filter || item.toLowerCase().includes(filter.trim().toLowerCase()));
      if (result.length === 0 && !!filter.trim()) {
        result = [filter.trim()];
      }
      return result;
    })
  );

  @Input() possibleItems?: string[];

  @ViewChild('inputElement', { static: false }) private inputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('inputElement', { static: false, read: MatAutocompleteTrigger })
  private autoCompleteTrigger!: MatAutocompleteTrigger;

  ngOnChanges(changes: SimpleChanges): void {
    const cPossibleItems = changes['possibleItems'];
    if (cPossibleItems?.previousValue !== cPossibleItems?.currentValue || cPossibleItems?.firstChange) {
      const possibleItems = cPossibleItems.currentValue;
      this.determineAvailableItems({ possibleItems });
    }
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
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
    this.determineAvailableItems({ selectedItems });
  }

  protected removeItem(itemIndex: number): void {
    if (!this.selectedItems.length) {
      return;
    }
    this.selectedItems.splice(itemIndex, 1);
    this.determineAvailableItems();
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
    this.determineAvailableItems();
    this.onChange?.(this.selectedItems);
    this.onTouch?.();
  }

  private determineAvailableItems({
    selectedItems,
    possibleItems,
  }: { selectedItems?: string[]; possibleItems?: string[] } = {}): void {
    selectedItems = selectedItems ?? this.selectedItems ?? [];
    possibleItems = possibleItems ?? this.possibleItems ?? [];
    this.availableItems$.next(possibleItems.filter((item) => !selectedItems!.includes(item)));
  }
}
