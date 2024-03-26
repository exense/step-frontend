import { Component, forwardRef, Input, OnChanges, SimpleChanges, TrackByFunction } from '@angular/core';
import { ArrayItemLabelValueExtractor } from '../../injectables/array-item-label-value-extractor';
import { KeyValue } from '@angular/common';
import { BaseFilterComponent } from '../base-filter/base-filter.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { arrayToRegex, regexToArray } from '../../types/string-array-regex';

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
})
export class ArrayFilterComponent<T = unknown> extends BaseFilterComponent<string, unknown> implements OnChanges {
  protected trackByKeyValue: TrackByFunction<KeyValue<unknown, string>> = (index, item) => item.key;

  protected displayItems: KeyValue<unknown, string>[] = [];

  @Input() items: T[] | ReadonlyArray<T> = [];

  @Input() extractor?: ArrayItemLabelValueExtractor<T, unknown>;

  ngOnChanges(changes: SimpleChanges): void {
    const cItems = changes['items'];
    const cExtractor = changes['extractor'];

    let items: T[] | ReadonlyArray<T> | undefined = undefined;
    let extractor: ArrayItemLabelValueExtractor<T, unknown> | undefined = undefined;

    if (cItems?.previousValue !== cItems?.currentValue || cItems?.firstChange) {
      items = cItems.currentValue;
    }

    if (cExtractor?.previousValue !== cExtractor?.currentValue || cExtractor?.firstChange) {
      extractor = cExtractor.currentValue;
    }

    if (items || extractor) {
      this.setupDisplayItems(items, extractor);
    }
  }

  protected override createControl(fb: FormBuilder): FormControl<unknown> {
    return fb.nonNullable.control([]);
  }

  protected override createControlChangeStream(control: FormControl<unknown>): Observable<string> {
    return control.valueChanges.pipe(map((value) => arrayToRegex(value as string[])));
  }

  protected override transformFilterValueToControlValue(value?: string): unknown {
    return !value ? [] : regexToArray(value);
  }

  private setupDisplayItems(
    items?: T[] | ReadonlyArray<T>,
    extractor?: ArrayItemLabelValueExtractor<T, unknown>,
  ): void {
    items = items ?? this.items;
    extractor = extractor ?? this.extractor;

    this.displayItems = (items || []).map((item) => {
      const key = extractor ? extractor.getValue(item) : item;
      const value = extractor ? extractor.getLabel(item) : item?.toString() ?? '';
      return { key, value };
    });
  }
}
