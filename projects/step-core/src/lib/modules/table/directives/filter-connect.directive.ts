import {
  AfterViewInit,
  computed,
  DestroyRef,
  Directive,
  effect,
  forwardRef,
  inject,
  input,
  model,
  OnDestroy,
  signal,
} from '@angular/core';
import { BaseFilterComponent, FilterRegexSwitcherService, isRegexValidator } from '../../basics/step-basics.module';
import { SearchValue } from '../shared/search-value';
import { FilterCondition } from '../shared/filter-condition';
import { map } from 'rxjs';
import { SearchColumnAccessor } from '../shared/search-column-accessor';
import { FilterConditionFactoryService } from '../services/filter-condition-factory.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CreateConditionFn<T> = (value: T, additionalParams?: any) => FilterCondition;

@Directive({
  selector: '[stepFilterConnect]',
  providers: [
    {
      provide: FilterRegexSwitcherService,
      useExisting: forwardRef(() => FilterConnectDirective),
    },
  ],
})
export class FilterConnectDirective<T = any, CV = T> implements AfterViewInit, OnDestroy, FilterRegexSwitcherService {
  private _destroyRef = inject(DestroyRef);
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  private _searchCol = inject(SearchColumnAccessor, { optional: true });
  private _filter = inject<BaseFilterComponent<T, CV>>(BaseFilterComponent, { optional: true });

  private isInitialized = signal(false);

  private get isConnected(): boolean {
    return !!this._searchCol && !!this._filter;
  }

  /** @Input() **/
  readonly createConditionFn = input<CreateConditionFn<T> | undefined>(undefined);

  /** @Input() **/
  readonly conditionFnAdditionalParams = input<any>(undefined);

  /** @Input() **/
  readonly useRegex = model<boolean>(true);

  readonly hasRegex = computed(() => {
    const useRegex = this.useRegex();
    const hasFilterCondition = !!this.createConditionFn();
    if (hasFilterCondition) {
      return false;
    }
    return useRegex;
  });

  readonly isRegex = this.useRegex.asReadonly();

  switchToRegex(): void {
    this.useRegex.set(true);
    this._filter?.filterControl?.updateValueAndValidity();
  }

  switchToText() {
    this.useRegex.set(false);
    this._filter?.filterControl?.updateValueAndValidity();
  }

  ngAfterViewInit(): void {
    this.setupValueChanges();
    this.setupFilterChanges();
    this.isInitialized.set(true);
  }

  ngOnDestroy(): void {
    this.destroyFilterValidation();
  }

  private effectSetupFilterValidation = effect(() => {
    const isInitialized = this.isInitialized();
    const hasRegex = this.hasRegex();
    if (!isInitialized) {
      return;
    }
    if (!this.isConnected) {
      console.warn('[stepFilterConnect] not connected');
      return;
    }

    this.toggleValidator(hasRegex);
  });

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
      .subscribe(({ value, regex }) => {
        if (regex !== undefined) {
          this.useRegex.set(regex);
        }
        this._filter!.assignValue(value);
      });
  }

  private setupFilterChanges(): void {
    if (!this.isConnected) {
      console.warn('[stepFilterConnect] not connected');
      return;
    }
    this._filter!.filterChange.pipe(
      map((filterValue) => this.convertToSearchValue(filterValue)),
      takeUntilDestroyed(this._destroyRef),
    ).subscribe((searchValue) => this._searchCol!.search(searchValue));
  }

  private destroyFilterValidation(): void {
    if (!this.isConnected) {
      return;
    }
    this.toggleValidator(false);
  }

  private convertToSearchValue(value: T): SearchValue {
    const createConditionFn = this.createConditionFn();
    if (createConditionFn) {
      return createConditionFn.call(this._filterConditionFactory, value, this.conditionFnAdditionalParams());
    }

    return { value: value as string, regex: this.hasRegex() };
  }

  private convertToFilterValue(value?: SearchValue): { value: T | undefined; regex?: boolean } {
    if (!value) {
      return { value: undefined };
    }
    if (typeof value === 'string') {
      return { value: value as T };
    }
    if (value instanceof FilterCondition) {
      return { value: value.getSearchValue() as T };
    }

    return { value: value?.value as T, regex: value?.regex };
  }

  private toggleValidator(isActive: boolean): void {
    const filterControl = this._filter?.filterControl;
    if (!filterControl) {
      return;
    }
    if (isActive && !filterControl.hasValidator(isRegexValidator)) {
      filterControl.addValidators(isRegexValidator);
    } else if (!isActive && filterControl.hasValidator(isRegexValidator)) {
      filterControl.removeValidators(isRegexValidator);
    }
  }
}
