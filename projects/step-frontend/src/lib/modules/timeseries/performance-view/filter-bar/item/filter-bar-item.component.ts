import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TsFilterItem, FilterBarItemType } from '../model/ts-filter-item';

@Component({
  selector: 'step-ts-filter-bar-item',
  templateUrl: './filter-bar-item.component.html',
  styleUrls: ['./filter-bar-item.component.scss'],
})
export class FilterBarItemComponent implements OnInit, OnDestroy {
  @Input() item!: TsFilterItem;
  formattedValue = '';

  ngOnInit(): void {
    if (!this.item) {
      throw new Error('Item input is mandatory');
    }
  }

  handleTextValueChange(option: { value: string; isSelected?: boolean }, checked: boolean) {
    option.isSelected = checked;
    this.formattedValue = this.item
      .textValues!.filter((v) => v.isSelected)
      .map((v) => v.value)
      .join(', ');
  }

  removeItem($event: any) {
    $event.stopPropagation();
  }

  get FilterBarType() {
    return FilterBarItemType;
  }

  ngOnDestroy(): void {}
}
