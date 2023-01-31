import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TsFilterItem, FilterBarItemType } from '../model/ts-filter-item';
import { Subject } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { DateTime } from 'luxon';
import { TimeSeriesUtils } from '../../../time-series-utils';

@Component({
  selector: 'step-ts-filter-bar-item',
  templateUrl: './filter-bar-item.component.html',
  styleUrls: ['./filter-bar-item.component.scss'],
})
export class FilterBarItemComponent implements OnInit, OnDestroy {
  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;

  @Input() item!: TsFilterItem;
  @Output() onRemoveItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() onFilterChange: EventEmitter<TsFilterItem> = new EventEmitter<TsFilterItem>();

  formattedValue? = '';

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

  applyChanges() {
    if (!this.item.isLocked) {
      this.item.label = this.item.attributeName;
    }
    switch (this.item.type) {
      case FilterBarItemType.FREE_TEXT:
        this.formattedValue = this.item.textValue;
        break;
      case FilterBarItemType.NUMERIC:
        if (this.item.min != undefined && this.item.max != undefined) {
          this.formattedValue = `${this.item.min} - ${this.item.max}`;
        } else if (this.item.min != undefined) {
          this.formattedValue = `> ${this.item.min}`;
        } else if (this.item.max != undefined) {
          this.formattedValue = `< ${this.item.max}`;
        } else {
          // both are undefined
          this.formattedValue = '';
        }
        break;
      case FilterBarItemType.DATE:
        break;
    }
    this.onFilterChange.emit(this.item);
    this.matTrigger.closeMenu();
  }

  onMinDateChanged(date: DateTime | undefined) {
    this.item.min = date ? date.toMillis() : undefined;
    this.formatDateRange();
  }

  onMaxDateChanged(date: DateTime | undefined) {
    this.item.max = date ? date.toMillis() : undefined;
    this.formatDateRange();
  }

  formatDateRange(): void {
    const min = this.item.min ? TimeSeriesUtils.formatInputDate(new Date(this.item.min), false) : undefined;
    const max = this.item.max ? TimeSeriesUtils.formatInputDate(new Date(this.item.max), false) : undefined;
    let formattedDate;
    if (min && max) {
      formattedDate = `${min} to ${max}`;
    } else if (min) {
      formattedDate = `After ${min}`;
    } else {
      formattedDate = `Before ${max}`;
    }
    this.formattedValue = formattedDate;
  }

  removeItem($event: any) {
    $event.stopPropagation();
    this.onRemoveItem.emit();
  }

  get FilterBarType() {
    return FilterBarItemType;
  }

  ngOnDestroy(): void {}
}
