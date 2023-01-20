import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TsFilterItem, FilterBarItemType } from './model/ts-filter-item';
import { TimeSeriesContext } from '../../time-series-context';
import { debounce, debounceTime, Subject } from 'rxjs';
import { FilterUtils } from '../../util/filter-utils';

@Component({
  selector: 'step-ts-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  readonly EMIT_DEBOUNCE_TIME = 300;
  @Input() context!: TimeSeriesContext;
  @Output() onFiltersChange = new EventEmitter<TsFilterItem[]>();
  emitFilterChange$ = new Subject<void>();

  items: TsFilterItem[] = [];

  @Input() defaultFilterOptions: TsFilterItem[] = [];

  ngOnInit(): void {
    if (!this.context) {
      throw new Error('Context input is mandatory');
    }
    this.emitFilterChange$.pipe(debounceTime(this.EMIT_DEBOUNCE_TIME)).subscribe(() => {
      this.onFiltersChange.emit(this.items.filter(FilterUtils.filterItemIsValid)); // we ignore empty filters
    });
  }

  handleFilterChange(item: TsFilterItem) {
    this.emitFilterChange$.next();
  }

  addFilterItem(item: TsFilterItem) {
    let filterExists = this.items.find((i) => i.attributeName === item.attributeName);
    if (filterExists) {
      return;
    } else {
      this.items.push(JSON.parse(JSON.stringify(item))); // make a clone
    }
  }

  addCustomFilter(type: FilterBarItemType) {
    this.items.push({
      attributeName: '',
      type: type,
      label: '',
    });
  }

  removeFilterItem(index: number) {
    let itemToDelete = this.items[index];
    this.items.splice(index, 1);
    if (FilterUtils.filterItemIsValid(itemToDelete)) {
      this.emitFilterChange$.next();
    }
  }

  get FilterBarItemType() {
    return FilterBarItemType;
  }

  ngOnDestroy(): void {}
}
