import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { DateTime } from 'luxon';
import { TimeSeriesUtils } from '../../../time-series-utils';
import { FilterBarItemType, FilterBarItem } from '../model/filter-bar-item';
import { MatCheckbox } from '@angular/material/checkbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'step-ts-filter-bar-item',
  templateUrl: './filter-bar-item.component.html',
  styleUrls: ['./filter-bar-item.component.scss'],
})
export class FilterBarItemComponent implements OnInit, OnChanges {
  @Input() item!: FilterBarItem;
  @Input() removable?: boolean;
  @Input() compact = false;

  @Output() removeItem: EventEmitter<void> = new EventEmitter<void>();
  @Output() filterChange: EventEmitter<FilterBarItem> = new EventEmitter<FilterBarItem>();

  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;
  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;

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
    this.freeTextValues = this.item.freeTextValues || [];
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
    this.filterChange.emit(this.item);
    this.changesApplied = true;
  }

  applyChanges() {
    if (this.chipInputValue) {
      this.addSearchValue(this.chipInputValue);
    }
    let isEntityFilter = false;
    switch (this.item.type) {
      case 'EXECUTION':
      case 'PLAN':
      case 'TASK':
        this.item.freeTextValues = this.item.searchEntities.map((e) => e.searchValue);
        isEntityFilter = true;
        break;
      case 'OPTIONS':
        break;
      case 'FREE_TEXT':
        this.item.freeTextValues = this.freeTextValues;
        break;
      case 'NUMERIC':
      case 'DATE':
        this.item.min = this.minValue;
        this.item.max = this.maxValue;
        break;
      default:
        throw new Error('Unhandled item type: ' + this.item.type);
    }
    if (!this.item.isLocked && !isEntityFilter) {
      this.item.label = this.item.attributeName;
    }

    this.formattedValue = this.getFormattedValue(this.item);
    this.filterChange.emit(this.item);
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

  private getFormattedValue(item: FilterBarItem): string | undefined {
    let formattedValue: string | undefined = '';
    switch (item.type) {
      case 'EXECUTION':
      case 'PLAN':
      case 'TASK':
        const count = this.item.searchEntities?.length;
        formattedValue = count ? (count > 1 ? `${count} items` : `1 item`) : '-';
        break;
      case 'FREE_TEXT':
        formattedValue = this.item.freeTextValues?.join(', ');
        break;
      case 'NUMERIC':
        if (item.min != undefined && item.max != undefined) {
          formattedValue = `${item.min} - ${item.max}`;
        } else if (item.min != undefined) {
          formattedValue = `> ${item.min}`;
        } else if (item.max != undefined) {
          formattedValue = `< ${item.max}`;
        } else {
          // both are undefined
          formattedValue = '';
        }

        break;

      case 'DATE':
        const min = item.min ? TimeSeriesUtils.formatInputDate(new Date(item.min), false) : '';
        const max = item.max ? TimeSeriesUtils.formatInputDate(new Date(item.max), false) : '';

        if (min && max) {
          formattedValue = `${min} to ${max}`;
        } else if (min) {
          formattedValue = `After ${min}`;
        } else if (max) {
          formattedValue = `Before ${max}`;
        }

        break;

      case 'OPTIONS':
        const selectedValues = item.textValues ? item.textValues.filter((v) => v.isSelected).map((v) => v.value) : [];

        formattedValue = selectedValues.join(', ');

        break;
      default:
        throw new Error('Filter type not handled: ' + item.type);
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
