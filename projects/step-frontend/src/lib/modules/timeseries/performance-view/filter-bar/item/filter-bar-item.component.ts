import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TsFilterItem, FilterBarItemType } from '../model/ts-filter-item';
import { Subject } from 'rxjs';

@Component({
  selector: 'step-ts-filter-bar-item',
  templateUrl: './filter-bar-item.component.html',
  styleUrls: ['./filter-bar-item.component.scss'],
})
export class FilterBarItemComponent implements OnInit, OnDestroy {
  @Input() item!: TsFilterItem;
  @Output() onRemoveItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() onFilterChange: EventEmitter<TsFilterItem> = new EventEmitter<TsFilterItem>();

  formattedValue = '';

  ngOnInit(): void {
    if (!this.item) {
      throw new Error('Item input is mandatory');
    }
  }

  handleTextOptionClick(option: { value: string; isSelected?: boolean }, checked: boolean) {
    option.isSelected = checked;
    this.formattedValue = this.item
      .textValues!.filter((v) => v.isSelected)
      .map((v) => v.value)
      .join(', ');
    this.onFilterChange.emit(this.item);
  }

  applyChanges() {}

  removeItem($event: any) {
    $event.stopPropagation();
    this.onRemoveItem.emit();
  }

  get FilterBarType() {
    return FilterBarItemType;
  }

  ngOnDestroy(): void {}
}
