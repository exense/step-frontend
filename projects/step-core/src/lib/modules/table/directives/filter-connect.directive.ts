import { AfterViewInit, DestroyRef, Directive, inject, Input, OnDestroy } from '@angular/core';
import { BaseFilterComponent, isRegexValidator } from '../../basics/step-basics.module';
import { SearchValue } from '../shared/search-value';
import { FilterCondition } from '../shared/filter-condition';
import { map } from 'rxjs';
import { SearchColumnAccessor } from '../shared/search-column-accessor';
import { FilterConditionFactoryService } from '../services/filter-condition-factory.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[stepFilterConnect]',
})
export class FilterConnectDirective<T = any, CV = T> implements AfterViewInit, OnDestroy {
  private _destroyRef = inject(DestroyRef);
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  private _searchCol = inject(SearchColumnAccessor, { optional: true });
  private _filter = inject<BaseFilterComponent<T, CV>>(BaseFilterComponent, { optional: true });

  private get isConnected(): boolean {
    return !!this._searchCol && !!this._filter;
  }

  @Input() createConditionFn?: (value: T, additionalParams?: any) => FilterCondition;
  @Input() conditionFnAdditionalParams?: any;
  @Input() useRegex?: boolean;

  ngAfterViewInit(): void {
    this.setupValueChanges();
    this.setupFilterChanges();
    this.setupFilterValidation();
  }

  ngOnDestroy(): void {
    this.destroyFilterValidation();
  }

  private setupValueChanges(): void {
    if (!this.isConnected) {
      console.warn('[stepFilterConnect] not connected');
      return;
    }

    this._searchCol!.getSearchValue$()
      .pipe(
        map((searchValue) => this.convertToFilterValue(searchValue)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((filterValue) => this._filter!.assignValue(filterValue));
  }

  private setupFilterChanges(): void {
    if (!this.isConnected) {
      console.warn('[stepFilterConnect] not connected');
      return;
    }
    this._filter!.filterChange$.pipe(
      map((filterValue) => this.convertToSearchValue(filterValue)),
      takeUntilDestroyed(this._destroyRef),
    ).subscribe((searchValue) => this._searchCol!.search(searchValue));
  }

  private setupFilterValidation(): void {
    if (!this.isConnected) {
      console.warn('[stepFilterConnect] not connected');
      return;
    }
    if (this.useRegex || !this.createConditionFn) {
      this._filter?.filterControl.addValidators(isRegexValidator);
    }
  }

  private destroyFilterValidation(): void {
    if (!this.isConnected) {
      return;
    }
    this._filter?.filterControl.removeValidators(isRegexValidator);
  }

  private convertToSearchValue(value: T): SearchValue {
    if (this.createConditionFn) {
      return this.createConditionFn.call(this._filterConditionFactory, value, this.conditionFnAdditionalParams);
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
      return value.getSearchValue() as T;
    }

    return value?.value as T;
  }
}
