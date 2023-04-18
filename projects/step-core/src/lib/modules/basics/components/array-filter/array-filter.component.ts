import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TrackByFunction } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ArrayItemLabelValueExtractor } from '../../shared/array-item-label-value-extractor';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-array-filter',
  templateUrl: './array-filter.component.html',
  styleUrls: ['./array-filter.component.scss'],
})
export class ArrayFilterComponent<T = unknown> implements OnChanges {
  protected trackByKeyValue: TrackByFunction<KeyValue<unknown, string>> = (index, item) => item.key;

  protected displayItems: KeyValue<unknown, string>[] = [];

  @Output() selectedItemsChange = new EventEmitter<string>();

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

  handleChange(selection: MatSelectChange): void {
    const values = selection.value as string[];
    let value = '';
    if (values.length === 1) {
      value = values[0];
    } else if (values.length > 1) {
      value = values.join('|');
      value = `(${value})`;
    }
    this.selectedItemsChange.emit(value);
  }

  private setupDisplayItems(
    items?: T[] | ReadonlyArray<T>,
    extractor?: ArrayItemLabelValueExtractor<T, unknown>
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
