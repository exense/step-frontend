import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { DateTime } from 'luxon';
import { TimeSeriesUtils } from '../../../time-series-utils';
import { FilterBarItemType, TsFilterItem } from '../model/ts-filter-item';
import { MatCheckbox } from '@angular/material/checkbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

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

  freeTextValues: string[] = [];
  chipInputValue = '';
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  minValue?: number; // for numbers or dates
  maxValue?: number; // for numbers or dates

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
    this.formattedValue = this.getFormattedValue(this.item);
  }

  toggleOption(option: { value: string; isSelected?: boolean }, checked: boolean, checkbox?: MatCheckbox) {
    option.isSelected = checked;

    if (checkbox) {
      checkbox.ripple.launch({
        centered: true,
      });
    }

    this.formattedValue = this.getFormattedValue(this.item);
    this.onFilterChange.emit(this.item);
    this.changesApplied = true;
  }

  applyChanges() {
    if (this.chipInputValue) {
      this.addSearchValue(this.chipInputValue);
    }
    if (!this.item.isLocked) {
      this.item.label = this.item.attributeName;
    }
    switch (this.item.type) {
      case FilterBarItemType.OPTIONS:
        break;
      case FilterBarItemType.FREE_TEXT:
        this.item.freeTextValues = this.freeTextValues;
        break;
      case FilterBarItemType.NUMERIC:
      case FilterBarItemType.DATE:
        this.item.min = this.minValue;
        this.item.max = this.maxValue;
        break;
    }
    this.formattedValue = this.getFormattedValue(this.item);
    this.onFilterChange.emit(this.item);
    this.changesApplied = true;
    this.matTrigger.closeMenu();
  }

  onMinDateChanged(date: DateTime | undefined) {
    this.minValue = date ? date.toMillis() : undefined;
    this.formattedValue = this.getFormattedValue(this.item);
  }

  onMaxDateChanged(date: DateTime | undefined) {
    this.maxValue = date ? date.toMillis() : undefined;
    this.formattedValue = this.getFormattedValue(this.item);
  }

  private getFormattedValue(filter: TsFilterItem): string | undefined {
    let formattedValue: string | undefined = '';
    switch (filter.type) {
      case FilterBarItemType.FREE_TEXT:
        formattedValue = this.item.freeTextValues?.join(', ');
        break;
      case FilterBarItemType.NUMERIC:
        if (filter.min != undefined && filter.max != undefined) {
          formattedValue = `${filter.min} - ${filter.max}`;
        } else if (filter.min != undefined) {
          formattedValue = `> ${filter.min}`;
        } else if (filter.max != undefined) {
          formattedValue = `< ${filter.max}`;
        } else {
          // both are undefined
          formattedValue = '';
        }

        break;

      case FilterBarItemType.DATE:
        const min = filter.min ? TimeSeriesUtils.formatInputDate(new Date(filter.min), false) : '';
        const max = filter.max ? TimeSeriesUtils.formatInputDate(new Date(filter.max), false) : '';

        if (min && max) {
          formattedValue = `${min} to ${max}`;
        } else if (min) {
          formattedValue = `After ${min}`;
        } else if (max) {
          formattedValue = `Before ${max}`;
        }

        break;

      case FilterBarItemType.OPTIONS:
        const selectedValues = filter.textValues
          ? filter.textValues.filter((v) => v.isSelected).map((v) => v.value)
          : [];

        formattedValue = selectedValues.join(', ');

        break;
    }
    return formattedValue;
  }

  addSearchValue(text: string): void {
    const value = (text || '').trim();

    if (value) {
      this.freeTextValues.push(value);
    }

    // Clear the input value
    this.chipInputValue = '';
  }
}
