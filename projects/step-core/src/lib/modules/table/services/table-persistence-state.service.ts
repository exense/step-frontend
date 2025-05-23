import { inject, Injectable, OnDestroy } from '@angular/core';
import { TablePersistenceConfig } from '../shared/table-persistence-config';
import { TableStorageService } from './table-storage.service';
import { SearchValue } from '../shared/search-value';
import { FilterConditionFactoryService } from './filter-condition-factory.service';
import { FilterConditionJson } from '../shared/filter-condition-json.interface';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { TableLocalStorageService } from './table-local-storage.service';

@Injectable()
export class TablePersistenceStateService implements OnDestroy {
  protected _config = inject(TablePersistenceConfig, { optional: true });
  protected _filterConditionFactory = inject(FilterConditionFactoryService);

  private externalSearchChangeTrigger$ = new Subject<Record<any, SearchValue>>();

  private tableStorage = inject(TableStorageService);
  private tableLocalStorage = inject(TableLocalStorageService);

  readonly externalSearchChange$ = this.externalSearchChangeTrigger$.asObservable();

  protected get canStoreSearch(): boolean {
    return !!this._config?.tableId && !!this._config?.storeSearch;
  }
  protected get canStoreSort(): boolean {
    return !!this._config?.tableId && !!this._config?.storeSort;
  }

  protected get canStorePagination(): boolean {
    return !!this._config?.tableId && !!this._config?.storePagination;
  }

  private get searchKey(): string {
    return `${this._config!.tableId!}_SEARCH`;
  }

  private get sortKey(): string {
    return `${this._config!.tableId!}_SORT`;
  }

  private get paginationKey(): string {
    return `${this._config!.tableId!}_PAGE`;
  }

  private get pageSizeKey(): string {
    return `${this._config!.tableId}_PAGE_SIZE`;
  }

  protected triggerExternalSearchChange(search: Record<string, SearchValue>): void {
    if (!this.canStoreSearch) {
      return;
    }
    this.saveSearch(search);
    this.externalSearchChangeTrigger$.next(search);
  }

  ngOnDestroy(): void {
    this.externalSearchChangeTrigger$.complete();
  }

  initialize(): void {}

  saveState(search: Record<string, SearchValue>, page: PageEvent, sort?: Sort): void {
    this.saveSearch(search);
    this.savePage(page);
    if (sort) {
      this.saveSort(sort);
    }
  }

  hasSearch(): boolean {
    if (!this.canStoreSearch) {
      return false;
    }
    return !!this.tableStorage.getItem(this.searchKey);
  }

  saveSearch(search: Record<string, SearchValue>): void {
    if (!this.canStoreSearch) {
      return;
    }
    this.tableStorage.setItem(this.searchKey, JSON.stringify(search));
  }

  getSearch(): Record<string, SearchValue> {
    if (!this.canStoreSearch) {
      return {};
    }
    const jsonString = this.tableStorage.getItem(this.searchKey);
    if (!jsonString) {
      return {};
    }
    const json = JSON.parse(jsonString);
    return Object.entries(json).reduce(
      (res, [key, value]) => {
        if ((value as FilterConditionJson).filterConditionType !== undefined) {
          const filterCondition = this._filterConditionFactory.create(value as FilterConditionJson);
          if (filterCondition) {
            res[key] = filterCondition;
          }
        } else {
          res[key] = value as SearchValue;
        }
        return res;
      },
      {} as Record<string, SearchValue>,
    );
  }

  savePage(page: PageEvent): void {
    if (!this.canStorePagination) {
      return;
    }
    this.tableStorage.setItem(this.paginationKey, JSON.stringify(page));
    this.savePageSize(page.pageSize);
  }

  getPage(): PageEvent | undefined {
    if (!this.canStorePagination) {
      return undefined;
    }
    const jsonString = this.tableStorage.getItem(this.paginationKey);
    const pageSize = this.getPageSize();
    if (!jsonString && pageSize === undefined) {
      return undefined;
    }
    let result: PageEvent;
    if (jsonString) {
      result = JSON.parse(jsonString);
    } else {
      result = { pageIndex: 0, pageSize: 0, length: 0 };
    }
    if (pageSize !== undefined) {
      result.pageSize = pageSize;
    }

    return result;
  }

  saveSort(sort: Sort): void {
    if (!this.canStoreSort) {
      return;
    }
    this.tableStorage.setItem(this.sortKey, JSON.stringify(sort));
  }

  getSort(): Sort | undefined {
    if (!this.canStoreSort) {
      return undefined;
    }
    const jsonString = this.tableStorage.getItem(this.sortKey);
    if (!jsonString) {
      return undefined;
    }
    return JSON.parse(jsonString) as Sort;
  }

  private savePageSize(pageSize: number): void {
    if (!this.canStorePagination) {
      return;
    }
    this.tableLocalStorage.setItem(this.pageSizeKey, pageSize.toString());
  }

  private getPageSize(): number | undefined {
    if (!this.canStorePagination) {
      return undefined;
    }
    const pageSizeString = this.tableLocalStorage.getItem(this.pageSizeKey) ?? '';
    const pageSize = parseInt(pageSizeString);
    if (isNaN(pageSize)) {
      return undefined;
    }
    return pageSize;
  }
}
