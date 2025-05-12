import {
  AfterViewInit,
  Component,
  EventEmitter,
  input,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { DateTime } from 'luxon';
import { TimeSeriesUtils, FilterBarItemType, FilterBarItem, COMMON_IMPORTS, FilterUtils } from '../../../_common';
import { MatCheckbox } from '@angular/material/checkbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FilterBarPlanItemComponent } from '../filter-bar-plan-item/filter-bar-plan-item.component';
import { FilterBarTaskItemComponent } from '../filter-bar-task-item/filter-bar-task-item.component';
import { FilterBarExecutionItemComponent } from '../filter-bar-execution-execution-item/filter-bar-execution-item.component';
import { Execution, ExecutiontTaskParameters, Plan } from '@exense/step-core';

@Component({
  selector: 'step-ts-filter-bar-item',
  templateUrl: './filter-bar-item.component.html',
  styleUrls: ['./filter-bar-item.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, FilterBarPlanItemComponent, FilterBarTaskItemComponent, FilterBarExecutionItemComponent],
})
export class FilterBarItemComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() item!: FilterBarItem; // should not make edits on it
  itemDraft!: FilterBarItem;
  @Input() removable?: boolean;
  @Input() compact = false;
  @Input() highlightRemoveButton = false;
  @Input() updateTimeRangeOption = true; // execution filter item provide the 'Update time range' option.
  openOnInit = input<boolean>();

  @Output() removeItem: EventEmitter<void> = new EventEmitter<void>();
  @Output() filterChange: EventEmitter<FilterBarItem> = new EventEmitter<FilterBarItem>();

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

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

  ngAfterViewInit(): void {
    if (this.openOnInit()) {
      setTimeout(() => {
        this.menuTrigger.openMenu();
      });
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

  ngOnChanges(changes: SimpleChanges): void {
    this.formattedValue = this.getFormattedValue(this.item);

    if (changes['item'] && changes['item'].currentValue) {
      // Create a clone of the input item to work with as a draft
      this.itemDraft = JSON.parse(JSON.stringify(this.item));
      this.freeTextValues = [...(this.item.freeTextValues || [])];
    }
  }

  removeTextValue(index: number) {
    this.freeTextValues.splice(index, 1);
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
    this.item = this.itemDraft;
    if (this.chipInputValue) {
      this.addSearchValue(this.chipInputValue);
    }
    let isEntityFilter = false;
    switch (this.item.type) {
      case FilterBarItemType.EXECUTION:
      case FilterBarItemType.PLAN:
      case FilterBarItemType.TASK:
        this.item.searchEntities = [...this.itemDraft.searchEntities];
        this.item.freeTextValues = this.item.searchEntities.map((e) => e.searchValue);
        isEntityFilter = true;
        break;
      case FilterBarItemType.OPTIONS:
        break;
      case FilterBarItemType.FREE_TEXT:
        this.item.freeTextValues = [...this.freeTextValues];
        break;
      case FilterBarItemType.NUMERIC:
      case FilterBarItemType.DATE:
        this.item.min = this.minValue;
        this.item.max = this.maxValue;
        break;
      default:
        throw new Error('Unhandled item type: ' + this.item.type);
    }
    if (!this.item.isLocked && !isEntityFilter) {
      this.item.label = this.item.attributeName;
    }
    this.filterChange.emit(this.item);
    this.changesApplied = true;
    this.menuTrigger.closeMenu();
    this.formattedValue = this.getFormattedValue(this.item);
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
    const searchEntitiesCount = this.item.searchEntities?.length;
    switch (item.type) {
      case FilterBarItemType.EXECUTION:
        if (searchEntitiesCount > 1) {
          formattedValue = this.getFormattedValueForMultipleValues(searchEntitiesCount);
        } else {
          formattedValue =
            (item.searchEntities[0]?.entity as Execution)?.description || item.searchEntities[0]?.searchValue;
        }
        break;
      case FilterBarItemType.PLAN:
        if (searchEntitiesCount > 1) {
          formattedValue = this.getFormattedValueForMultipleValues(searchEntitiesCount);
        } else {
          formattedValue =
            (item.searchEntities[0]?.entity as Plan)?.attributes?.['name'] || item.searchEntities[0]?.searchValue;
        }
        break;
      case FilterBarItemType.TASK:
        if (searchEntitiesCount > 1) {
          formattedValue = this.getFormattedValueForMultipleValues(searchEntitiesCount);
        } else {
          formattedValue =
            (item.searchEntities[0]?.entity as ExecutiontTaskParameters)?.attributes?.['name'] ||
            item.searchEntities[0]?.searchValue;
        }
        break;
      case FilterBarItemType.FREE_TEXT:
        formattedValue = this.item.freeTextValues?.join(', ');
        break;
      case FilterBarItemType.NUMERIC:
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
      case FilterBarItemType.DATE:
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

      case FilterBarItemType.OPTIONS:
        const selectedValues = item.textValues ? item.textValues.filter((v) => v.isSelected).map((v) => v.value) : [];

        formattedValue = selectedValues.join(', ');

        break;
      default:
        throw new Error('Filter type not handled: ' + item.type);
    }
    return formattedValue;
  }

  private getFormattedValueForMultipleValues(count?: number): string {
    return count ? (count > 1 ? `${count} items` : `1 item`) : '';
  }

  addSearchValue(text: string): void {
    const value = (text || '').trim();

    if (value) {
      this.freeTextValues.push(value);
    }

    // Clear the input value
    this.chipInputValue = '';
  }

  get FilterBarItemType() {
    return FilterBarItemType;
  }
}
