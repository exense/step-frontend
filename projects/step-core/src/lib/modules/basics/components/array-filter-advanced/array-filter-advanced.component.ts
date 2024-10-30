import { Component, computed, forwardRef, inject, input, Input } from '@angular/core';
import { ArrayItemLabelValueExtractor } from '../../injectables/array-item-label-value-extractor';
import { KeyValue } from '@angular/common';
import { BaseFilterComponent } from '../base-filter/base-filter.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, map, Observable, startWith } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

export const UNSET_VALUE = 'unset';

@Component({
  selector: 'step-array-filter-advanced',
  templateUrl: './array-filter-advanced.component.html',
  styleUrls: ['./array-filter-advanced.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => ArrayFilterAdvancedComponent),
    },
  ],
})
export class ArrayFilterAdvancedComponent<T = unknown> extends BaseFilterComponent<string[], unknown> {
  private _fb = inject(FormBuilder);

  /** @Input() **/
  readonly items = input<T[] | ReadonlyArray<T>>([]);

  /** @Input() **/
  readonly extractor = input<ArrayItemLabelValueExtractor<T, unknown> | undefined>(undefined);

  /** @Input() **/
  readonly useUnsetItem = input(false);

  protected readonly UNSET_VALUE = UNSET_VALUE;

  protected readonly searchCtrl = this._fb.control('');

  private searchCtrlValue = toSignal(
    this.searchCtrl.valueChanges.pipe(
      map((value) => value?.toLowerCase()),
      takeUntilDestroyed(),
    ),
    { initialValue: this.searchCtrl.value ?? '' },
  );

  protected displayItems = computed<KeyValue<unknown, string>[]>(() => {
    const items = this.items();
    const extractor = this.extractor();
    const searchCtrlValue = this.searchCtrlValue();

    const result = (items || []).map((item) => {
      const key = extractor ? extractor.getValue(item) : item;
      const value = extractor ? extractor.getLabel(item) : item?.toString() ?? '';
      return { key, value };
    });

    if (!searchCtrlValue) {
      return result;
    }

    return result.filter((item) => item.value.toLowerCase().includes(searchCtrlValue));
  });

  @Input() remapValues?: Record<string, string>;

  protected override createControl(fb: FormBuilder): FormControl<unknown> {
    return fb.nonNullable.control([]);
  }

  protected override createControlChangeStream(control: FormControl<unknown>): Observable<string[]> {
    return control.valueChanges.pipe(
      map((value) => (value ?? []) as string[]),
      map((values) => {
        if (!this.remapValues) {
          return values;
        }
        return values.reduce((res, value) => {
          const addValues = !!this.remapValues![value] ? [value, this.remapValues![value]] : [value];
          return res.concat(addValues);
        }, [] as string[]);
      }),
    );
  }

  protected override transformFilterValueToControlValue(value?: string[]): unknown {
    return value ?? [];
  }
}
