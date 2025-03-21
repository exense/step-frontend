import { Component, forwardRef, input, ViewEncapsulation } from '@angular/core';
import { ArrayItemLabelValueExtractor } from '../../injectables/array-item-label-value-extractor';
import { BaseFilterComponent } from '../base-filter/base-filter.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';

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
  encapsulation: ViewEncapsulation.None,
})
export class ArrayFilterAdvancedComponent<T = unknown> extends BaseFilterComponent<string[], unknown> {
  readonly items = input<T[] | ReadonlyArray<T>>([]);
  readonly extractor = input<ArrayItemLabelValueExtractor<T, unknown> | undefined>(undefined);
  readonly useUnsetItem = input(false);

  protected readonly UNSET_VALUE = UNSET_VALUE;

  readonly remapValues = input<Record<string, string> | undefined>(undefined);

  protected override createControl(fb: FormBuilder): FormControl<unknown> {
    return fb.nonNullable.control([]);
  }

  protected override createControlChangeStream(control: FormControl<unknown>): Observable<string[]> {
    return control.valueChanges.pipe(
      map((value) => (value ?? []) as string[]),
      map((values) => {
        const remapValues = this.remapValues();
        if (!remapValues) {
          return values;
        }
        return values.reduce((res, value) => {
          const addValues = !!remapValues![value] ? [value, remapValues![value]] : [value];
          return res.concat(addValues);
        }, [] as string[]);
      }),
    );
  }

  protected override transformFilterValueToControlValue(value?: string[]): unknown {
    return value ?? [];
  }
}
