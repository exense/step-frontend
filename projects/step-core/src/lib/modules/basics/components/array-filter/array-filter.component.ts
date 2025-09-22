import { Component, computed, contentChild, forwardRef, input } from '@angular/core';
import { ArrayItemLabelValueExtractor } from '../../injectables/array-item-label-value-extractor';
import { BaseFilterComponent } from '../base-filter/base-filter.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { arrayToRegex, regexToArray } from '../../types/string-array-regex';
import { FilterAddonDirective } from '../../directives/filter-addon.directive';

@Component({
  selector: 'step-array-filter',
  templateUrl: './array-filter.component.html',
  styleUrls: ['./array-filter.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => ArrayFilterComponent),
    },
  ],
  standalone: false,
})
export class ArrayFilterComponent<T = unknown> extends BaseFilterComponent<string, unknown> {
  readonly items = input<T[] | ReadonlyArray<T>>([]);
  readonly extractor = input<ArrayItemLabelValueExtractor<T, unknown> | undefined>(undefined);

  private filterAddon = contentChild(FilterAddonDirective);

  protected readonly tplFilterAddon = computed(() => this.filterAddon()?._templateRef);

  protected override createControl(fb: FormBuilder): FormControl<unknown> {
    return fb.nonNullable.control([]);
  }

  protected override createControlChangeStream(control: FormControl<unknown>): Observable<string> {
    return control.valueChanges.pipe(map((value) => arrayToRegex((value ?? []) as string[])));
  }

  protected override transformFilterValueToControlValue(value?: string): unknown {
    return !value ? [] : regexToArray(value);
  }
}
