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
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ArrayItemLabelValueExtractor } from '../../injectables/array-item-label-value-extractor';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { KeyValue } from '@angular/common';
import { SelectExtraOptionsDirective } from '../../directives/select-extra-options.directive';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SelectClearValueDirective } from '../../directives/select-clear-value.directive';
import {
  SelectComponentSearchCtrlContainer,
  SelectComponentSearchCtrlContainerDefaultImpl,
} from '../../injectables/select-component-search-ctrl-container.service';

type ModelValue<T> = T | T[] | null | undefined;
type OnChange<T> = (value?: ModelValue<T>) => void;
type OnTouch = () => void;

const createDefaultExtractor = <Item, Value>(): ArrayItemLabelValueExtractor<Item, Value> => ({
  getLabel: (item) => item?.toString() ?? '',
  getValue: (item) => item as unknown as Value,
});

@Component({
  selector: 'step-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [StepMaterialModule, FormsModule, ReactiveFormsModule, NgxMatSelectSearchModule],
  host: {
    '[class.with-empty-placeholder]': '!!emptyPlaceholder()',
    '[class.is-disabled]': 'isDisabled()',
  },
  hostDirectives: [
    {
      directive: SelectClearValueDirective,
      inputs: ['useClear', 'clearValue', 'clearLabel'],
    },
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
    SelectComponentSearchCtrlContainerDefaultImpl,
    {
      provide: SelectComponentSearchCtrlContainer,
      useFactory: () => {
        const parentImpl = inject(SelectComponentSearchCtrlContainer, { skipSelf: true, optional: true });
        const defaultImpl = inject(SelectComponentSearchCtrlContainerDefaultImpl, { self: true });
        return parentImpl ?? defaultImpl;
      },
    },
  ],
})
export class SelectComponent<Item, Value> implements ControlValueAccessor {
  private _searchCtrlContainer = inject(SelectComponentSearchCtrlContainer);

  protected readonly _selectClear = inject(SelectClearValueDirective, { host: true });

  private onChange?: OnChange<Value>;
  private onTouch?: OnTouch;

  /** @Input() **/
  readonly useSearch = input(true);

  /** @Input() **/
  readonly multiple = input(false);

  /** @Input() **/
  readonly items = input<Array<Item> | ReadonlyArray<Item> | undefined>(undefined);

  /** @Input() **/
  readonly emptyPlaceholder = input<string>('');

  /** @Input() **/
  readonly extractor = input<ArrayItemLabelValueExtractor<Item, Value> | undefined>(undefined);

  protected readonly isDisabled = signal(false);

  protected readonly value = signal<ModelValue<Value>>(undefined);

  protected readonly searchCtrl = this._searchCtrlContainer.searchControl;

  readonly searchValue$ = this.searchCtrl.valueChanges.pipe(startWith(this.searchCtrl.value ?? ''));

  readonly searchValue = toSignal(this.searchValue$, {
    initialValue: this.searchCtrl.value ?? '',
  });

  private extraOptions = contentChild<SelectExtraOptionsDirective<Value>>(SelectExtraOptionsDirective);
  protected readonly extraItems = computed(() => this.extraOptions()?.items() ?? []);

  private allDisplayItems = computed<KeyValue<Value, string>[]>(() => {
    const items = this.items() ?? [];
    const extractor = this.extractor() ?? createDefaultExtractor<Item, Value>();

    return items.map((item) => ({
      key: extractor.getValue(item),
      value: extractor.getLabel(item),
    }));
  });

  protected readonly displayItems = computed(() => {
    const allDisplayItems = this.allDisplayItems();
    const searchCtrlValue = this.searchValue().toLowerCase().trim();
    if (!searchCtrlValue) {
      return allDisplayItems;
    }
    return allDisplayItems.filter((item) => item.value.toLowerCase().includes(searchCtrlValue));
  });

  protected readonly selection = computed(() => {
    const value = this.value();
    const displayItems = this.displayItems();
    const extraItems = this.extraItems();
    const emptyPlaceholder = this.emptyPlaceholder();

    if (!value) {
      return emptyPlaceholder;
    }

    const allItems = [...extraItems, ...displayItems];

    if (value instanceof Array) {
      const selected = new Set(value);
      return allItems
        .filter((item) => selected.has(item.key))
        .map((item) => item.value)
        .join(', ');
    }

    const selectedItem = allItems.find((item) => item.key === value);
    return selectedItem?.value;
  });

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
    const clearInternalValue = this._selectClear.CLEAR_INTERNAL_VALUE;
    if (value === clearInternalValue || (value instanceof Array && value.includes(clearInternalValue as Value))) {
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
    this.handleChange(this._selectClear.clearValue());
  }
}
