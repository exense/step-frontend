import { AfterViewInit, Directive, inject, Input, OnDestroy } from '@angular/core';
import { BaseFilterComponent } from '../../basics/step-basics.module';
import { SearchValue } from '../shared/search-value';
import { FilterCondition } from '../shared/filter-condition';
import { map, Subject, takeUntil } from 'rxjs';
import { SearchColumnAccessor } from '../shared/search-column-accessor';

@Directive({
  selector: '[stepFilterConnect]',
})
export class FilterConnectDirective<T = any, CV = T> implements AfterViewInit, OnDestroy {
  private terminator$ = new Subject<void>();

  private _searchCol = inject(SearchColumnAccessor, { optional: true });
  private _filter = inject<BaseFilterComponent<T, CV>>(BaseFilterComponent, { optional: true });

  private get isConnected(): boolean {
    return !!this._searchCol && !!this._filter;
  }

  @Input() createConditionFn?: (value: T) => FilterCondition;
  @Input() useRegex?: boolean;

  ngAfterViewInit(): void {
    this.initializeValue();
    this.setupFilterChanges();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  private initializeValue(): void {
    if (!this.isConnected) {
      console.warn('[stepFilterConnect] not connected');
      return;
    }
    const searchValue = this._searchCol!.getSearchValue();
    const filterValue = this.convertToFilterValue(searchValue);
    if (filterValue) {
      this._filter!.assignValue(filterValue);
    }
  }

  private setupFilterChanges(): void {
    if (!this.isConnected) {
      console.warn('[stepFilterConnect] not connected');
      return;
    }
    this._filter!.filterChange.pipe(
      map((filterValue) => this.convertToSearchValue(filterValue)),
      takeUntil(this.terminator$)
    ).subscribe((searchValue) => this._searchCol!.search(searchValue));
  }

  private convertToSearchValue(value: T): SearchValue {
    console.warn('this is called', this.useRegex);

    if (this.createConditionFn) {
      return this.createConditionFn(value);
    }

    if (this.useRegex !== undefined) {
      return { value: value as string, regex: this.useRegex };
    }

    return value as string;
  }

  private convertToFilterValue(value?: SearchValue): T | undefined {
    if (!value) {
      return undefined;
    }
    if (typeof value === 'string') {
      return value as T;
    }
    if (value instanceof FilterCondition) {
      return value.sourceObject;
    }

    return value?.value as T;
  }
}
