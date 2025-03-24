import { inject, Injectable, OnDestroy } from '@angular/core';
import { TablePersistenceConfig } from '../shared/table-persistence-config';
import { TableStorageService } from './table-storage.service';
import { SearchValue } from '../shared/search-value';
import { FilterConditionFactoryService } from './filter-condition-factory.service';
import { FilterConditionJson } from '../shared/filter-condition-json.interface';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Subject } from 'rxjs';

@Injectable()
export class TablePersistenceStateService implements OnDestroy {
  protected _config = inject(TablePersistenceConfig, { optional: true });
  protected _filterConditionFactory = inject(FilterConditionFactoryService);

  private externalSearchChangeTrigger$ = new Subject<Record<any, SearchValue>>();

  private storage = inject(TableStorageService);

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
    return !!this.storage.getItem(this.searchKey);
  }

  saveSearch(search: Record<string, SearchValue>): void {
    if (!this.canStoreSearch) {
      return;
    }
    this.storage.setItem(this.searchKey, JSON.stringify(search));
  }

  getSearch(): Record<string, SearchValue> {
    if (!this.canStoreSearch) {
      return {};
    }
    const jsonString = this.storage.getItem(this.searchKey);
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
    this.storage.setItem(this.paginationKey, JSON.stringify(page));
  }

  getPage(): PageEvent | undefined {
    if (!this.canStorePagination) {
      return undefined;
    }
    const jsonString = this.storage.getItem(this.paginationKey);
    if (!jsonString) {
      return undefined;
    }
    return JSON.parse(jsonString) as PageEvent;
  }

  saveSort(sort: Sort): void {
    if (!this.canStoreSort) {
      return;
    }
    this.storage.setItem(this.sortKey, JSON.stringify(sort));
  }

  getSort(): Sort | undefined {
    if (!this.canStoreSort) {
      return undefined;
    }
    const jsonString = this.storage.getItem(this.sortKey);
    if (!jsonString) {
      return undefined;
    }
    return JSON.parse(jsonString) as Sort;
  }
}
