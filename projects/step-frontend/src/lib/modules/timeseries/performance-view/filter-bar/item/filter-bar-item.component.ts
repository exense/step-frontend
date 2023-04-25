import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { DateTime } from 'luxon';
import { TimeSeriesUtils } from '../../../time-series-utils';
import { FilterBarItemType, TsFilterItem } from '../model/ts-filter-item';
import { Subscription } from 'rxjs';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'step-ts-filter-bar-item',
  templateUrl: './filter-bar-item.component.html',
  styleUrls: ['./filter-bar-item.component.scss'],
})
export class FilterBarItemComponent implements OnInit, OnChanges {
  @Input() item!: TsFilterItem;
  @Input() removable?: boolean;

  @Output() onRemoveItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() onFilterChange: EventEmitter<TsFilterItem> = new EventEmitter<TsFilterItem>();

  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;
  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;

  readonly FilterBarType = FilterBarItemType;

  formattedValue? = '';
  changesApplied = false;

  active: boolean = false;

  ngOnInit(): void {
    if (!this.item) {
      throw new Error('Item input is mandatory');
    }
  }

  onMenuClose(): void {
    this.active = false;
  }

  onMenuOpen() {
    this.active = true;
  }

  openMenu() {
    this.menuTrigger?.openMenu();
  }

  ngOnChanges(): void {
    this.initFormattedValue(this.item);
  }

  toggleOption(option: { value: string; isSelected?: boolean }, checked: boolean, checkbox?: MatCheckbox) {
    option.isSelected = checked;

    if (checkbox) {
      checkbox.ripple.launch({
        centered: true,
      });
    }

    this.initFormattedValue(this.item);
    this.onFilterChange.emit(this.item);
    this.changesApplied = true;
  }

  applyChanges() {
    if (!this.item.isLocked) {
      this.item.label = this.item.attributeName;
    }

    this.initFormattedValue(this.item);
    this.onFilterChange.emit(this.item);
    this.changesApplied = true;
    this.matTrigger.closeMenu();
  }

  onMinDateChanged(date: DateTime | undefined) {
    this.item.min = date ? date.toMillis() : undefined;
    this.initFormattedValue(this.item);
  }

  onMaxDateChanged(date: DateTime | undefined) {
    this.item.max = date ? date.toMillis() : undefined;
    this.initFormattedValue(this.item);
  }

  private initFormattedValue(filter: TsFilterItem): void {
    switch (filter.type) {
      case FilterBarItemType.FREE_TEXT:
        this.formattedValue = this.item.textValue;

        break;

      case FilterBarItemType.NUMERIC:
        if (filter.min != undefined && filter.max != undefined) {
          this.formattedValue = `${filter.min} - ${filter.max}`;
        } else if (filter.min != undefined) {
          this.formattedValue = `> ${filter.min}`;
        } else if (filter.max != undefined) {
          this.formattedValue = `< ${filter.max}`;
        } else {
          // both are undefined
          this.formattedValue = '';
        }

        break;

      case FilterBarItemType.DATE:
        const min = filter.min ? TimeSeriesUtils.formatInputDate(new Date(filter.min), false) : '';
        const max = filter.max ? TimeSeriesUtils.formatInputDate(new Date(filter.max), false) : '';

        let formattedDate = '';

        if (min && max) {
          formattedDate = `${min} to ${max}`;
        } else if (min) {
          formattedDate = `After ${min}`;
        } else if (max) {
          formattedDate = `Before ${max}`;
        }

        this.formattedValue = formattedDate;

        break;

      case FilterBarItemType.OPTIONS:
        const selectedValues = filter.textValues
          ? filter.textValues.filter((v) => v.isSelected).map((v) => v.value)
          : [];

        this.formattedValue = selectedValues.join(', ');

        break;
    }
  }
}
