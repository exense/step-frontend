import { DestroyRef, Directive, forwardRef, inject, input, OnDestroy, OnInit, untracked } from '@angular/core';
import { HasFilter } from '../../entities-selection';
import { TableSearch, TableSearchParams } from '../services/table-search';
import { TablePersistenceStateService } from '../services/table-persistence-state.service';
import { SearchData } from '../types/search-data';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { FilterCondition } from '../shared/filter-condition';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SearchValue } from '../shared/search-value';
import { isValidRegex } from '../../basics/step-basics.module';

@Directive({
  selector: '[stepTablePartSearch]',
  providers: [
    {
      provide: TableSearch,
      useExisting: forwardRef(() => TablePartSearchDirective),
    },
    {
      provide: HasFilter,
      useExisting: forwardRef(() => TablePartSearchDirective),
    },
  ],
})
export class TablePartSearchDirective implements OnInit, TableSearch, HasFilter, OnDestroy {
  private _tableState = inject(TablePersistenceStateService);
  private _destroyRef = inject(DestroyRef);

  readonly defaultSearch = input<Record<string, SearchValue> | undefined>(undefined);

  private searchInternal$ = new BehaviorSubject<SearchData>({
    search: this._tableState.getSearch(),
    resetPagination: true,
    isForce: true,
  });

  get search(): SearchData {
    return this.searchInternal$.value;
  }

  readonly search$ = this.searchInternal$.asObservable();

  readonly hasFilter$ = this.searchInternal$.pipe(
    map((value) => value.search),
    map((search) => {
      const values = Object.values(search);
      if (values.length === 0) {
        return false;
      }

      const hasFilter = values.some((searchValue) => {
        if (searchValue instanceof FilterCondition) {
          return !searchValue.isEmpty();
        }
        if (typeof searchValue === 'string') {
          return !!searchValue;
        }
        return !!searchValue?.value;
      });

      return hasFilter;
    }),
  );

  readonly hasFilter = toSignal(this.hasFilter$, { initialValue: false });

  ngOnInit(): void {
    this.setupDefaultSearch();
    this.setupExternalSearchChangeHandle();
  }

  ngOnDestroy(): void {
    this.searchInternal$.complete();
  }

  onSearch(column: string, searchValue: SearchValue, params?: TableSearchParams): void;
  onSearch(column: string, value: string, regex?: boolean, params?: TableSearchParams): void;
  onSearch(
    column: string,
    searchValue: string | SearchValue,
    regexOrParams?: boolean | TableSearchParams,
    params?: TableSearchParams,
  ): void {
    const search = { ...this.searchInternal$.value.search };
    let searchCol: SearchValue;
    let regex: boolean;
    let resetPagination: boolean;
    let isForce: boolean;
    let hideProgress: boolean | undefined;
    let immediateHideProgress: boolean | undefined;
    if (typeof searchValue === 'string') {
      regex = (regexOrParams as boolean | undefined) ?? true;
      resetPagination = params?.resetPagination ?? true;
      isForce = params?.isForce ?? true;
      hideProgress = params?.hideProgress;
      immediateHideProgress = params?.immediateHideProgress;
      searchCol = regex ? { value: searchValue, regex } : searchValue;
    } else {
      const searchParams = regexOrParams as TableSearchParams | undefined;
      resetPagination = searchParams?.resetPagination ?? true;
      isForce = searchParams?.isForce ?? true;
      hideProgress = searchParams?.hideProgress;
      immediateHideProgress = searchParams?.immediateHideProgress;
      searchCol = searchValue;
    }
    type RegexSearchValue = { regex?: boolean; value: string };
    if ((searchCol as RegexSearchValue)?.regex) {
      if (!isValidRegex((searchCol as RegexSearchValue).value)) {
        return;
      }
    }
    search[column] = searchCol;
    this.searchInternal$.next({ search, resetPagination, isForce, hideProgress, immediateHideProgress });
  }

  getSearchValue$(column: string): Observable<SearchValue | undefined> {
    return this.searchInternal$.pipe(map((value) => value.search[column]));
  }

  private setupDefaultSearch(): void {
    const defaultSearch = untracked(() => this.defaultSearch());
    if (!defaultSearch) {
      return;
    }
    const searchValue = { ...defaultSearch, ...this.searchInternal$.value };
    this.searchInternal$.next(searchValue);
  }

  private setupExternalSearchChangeHandle(): void {
    this._tableState.externalSearchChange$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((externalSearch) => {
      this.searchInternal$.next({ search: externalSearch, resetPagination: true, isForce: true });
    });
  }
}
