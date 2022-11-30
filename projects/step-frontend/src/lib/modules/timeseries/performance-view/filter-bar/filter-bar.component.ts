import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TsFilterItem, FilterBarItemType } from './model/ts-filter-item';
import { TimeSeriesContext } from '../../time-series-context';

@Component({
  selector: 'step-ts-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() context!: TimeSeriesContext;
  @Output() onFiltersChange = new EventEmitter<TsFilterItem[]>();

  items: TsFilterItem[] = [];
  defaultFilterOptions: TsFilterItem[] = [
    {
      label: 'Status',
      attributeName: 'rnStatus',
      type: FilterBarItemType.TEXT,
      textValues: [{ value: 'PASSED' }, { value: 'FAILED' }, { value: 'TECHNICAL_ERROR' }, { value: 'INTERRUPTED' }],
    },
    {
      label: 'Type',
      attributeName: 'type',
      type: FilterBarItemType.TEXT,
      textValues: [{ value: 'keyword' }, { value: 'custom' }],
    },
  ];

  ngOnInit(): void {
    if (!this.context) {
      throw new Error('Context input is mandatory');
    }
  }

  handleFilterChange(item: TsFilterItem) {
    this.onFiltersChange.emit(this.items);
  }

  addFilterItem(item: TsFilterItem) {
    let filterExists = this.items.find((i) => i.attributeName === item.attributeName);
    if (filterExists) {
      return;
    } else {
      this.items.push(JSON.parse(JSON.stringify(item))); // make a clone
    }
  }

  removeFilterItem(index: number) {
    this.items.splice(index, 1);
  }

  ngOnDestroy(): void {}
}
