import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ArrayItemLabelValueExtractor } from '../../injectables/array-item-label-value-extractor';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { KeyValue } from '@angular/common';
import { SelectExtraOptionsDirective } from '../../directives/select-extra-options.directive';

const CLEAR_INTERNAL_VALUE = Symbol('Clear value');

type ModelValue<T> = T | T[] | null | undefined;
type OnChange<T> = (value?: ModelValue<T>) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.with-empty-placeholder]': '!!emptyPlaceholder()',
    '[class.is-disabled]': 'isDisabled()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<Item, Value> implements ControlValueAccessor {
  private _fb = inject(FormBuilder).nonNullable;

  private onChange?: OnChange<Value>;
  private onTouch?: OnTouch;

  /** @Input() **/
  readonly useSearch = input(true);

  /** @Input() **/
  readonly useClear = input(true);

  /** @Input() **/
  readonly clearLabel = input('Clear');

  /** @Input() **/
  readonly clearValue = input<null | undefined>(undefined);

  protected readonly CLEAR_INTERNAL_VALUE = CLEAR_INTERNAL_VALUE;

  /** @Input() **/
  readonly multiple = input(false);

  /** @Input() **/
  readonly items = input<Array<Item> | ReadonlyArray<Item> | undefined>(undefined);

  /** @Input() **/
  readonly emptyPlaceholder = input<string>('');

  /** @Input() **/
  readonly extractor = input<ArrayItemLabelValueExtractor<Item, Value>>({
    getLabel: (item) => item?.toString() ?? '',
    getValue: (item) => item as unknown as Value,
  });

  protected readonly isDisabled = signal(false);

  protected readonly value = signal<ModelValue<Value>>(undefined);

  protected readonly searchCtrl = this._fb.control('');

  private searchCtrlValue = toSignal(
    this.searchCtrl.valueChanges.pipe(
      map((value) => value?.toLowerCase()?.trim()),
      takeUntilDestroyed(),
    ),
    { initialValue: (this.searchCtrl.value ?? '').trim() },
  );

  private allDisplayItems = computed<KeyValue<Value, string>[]>(() => {
    const items = this.items() ?? [];
    const extractor = this.extractor();

    return items.map((item) => ({
      key: extractor.getValue(item),
      value: extractor.getLabel(item),
    }));
  });

  protected readonly displayItems = computed(() => {
    const allDisplayItems = this.allDisplayItems();
    const searchCtrlValue = this.searchCtrlValue();
    if (!searchCtrlValue) {
      return allDisplayItems;
    }
    return allDisplayItems.filter((item) => item.value.toLowerCase().includes(searchCtrlValue));
  });

  protected readonly selection = computed(() => {
    const value = this.value();
    const displayItems = this.displayItems();
    const emptyPlaceholder = this.emptyPlaceholder();

    if (!value) {
      return emptyPlaceholder;
    }

    if (value instanceof Array) {
      const selected = new Set(value);
      return displayItems
        .filter((item) => selected.has(item.key))
        .map((item) => item.value)
        .join(', ');
    }

    const selectedItem = displayItems.find((item) => item.key === value);
    return selectedItem!.value;
  });

  private extraOptions = contentChild<SelectExtraOptionsDirective<Value>>(SelectExtraOptionsDirective);

  protected readonly extraItems = computed(() => this.extraOptions()?.items() ?? []);

  writeValue(value?: ModelValue<Value>): void {
    this.value.set(value);
  }

  registerOnChange(onChange: OnChange<Value>): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected handleChange(value?: ModelValue<Value>): void {
    if (value === CLEAR_INTERNAL_VALUE || (value instanceof Array && value.includes(CLEAR_INTERNAL_VALUE as Value))) {
      return;
    }
    this.value.set(value);
    this.onChange?.(value);
  }

  protected handleBlur(): void {
    this.onTouch?.();
  }

  protected clear(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.handleChange(this.clearValue());
  }
}
