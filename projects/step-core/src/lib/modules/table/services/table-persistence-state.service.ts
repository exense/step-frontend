import { inject, Injectable } from '@angular/core';
import { TablePersistenceConfig } from '../shared/table-persistence-config';
import { TableStorageService } from './table-storage.service';
import { SearchValue } from '../shared/search-value';
import { FilterConditionFactoryService } from './filter-condition-factory.service';
import { FilterConditionJson } from '../shared/filter-condition-json.interface';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

@Injectable()
export class TablePersistenceStateService {
  private config = inject(TablePersistenceConfig, { optional: true });
  private storage = inject(TableStorageService);
  private filterConditionFactory = inject(FilterConditionFactoryService);

  private get canStoreSearch(): boolean {
    return !!this.config?.tableId && !!this.config?.storeSearch;
  }
  private get canStoreSort(): boolean {
    return !!this.config?.tableId && !!this.config?.storeSort;
  }

  private get canStorePagination(): boolean {
    return !!this.config?.tableId && !!this.config?.storePagination;
  }

  private get searchKey(): string {
    return `${this.config!.tableId!}_SEARCH`;
  }

  private get sortKey(): string {
    return `${this.config!.tableId!}_SORT`;
  }

  private get paginationKey(): string {
    return `${this.config!.tableId!}_PAGE`;
  }

  saveState(search: Record<string, SearchValue>, page: PageEvent, sort?: Sort): void {
    this.saveSearch(search);
    this.savePage(page);
    if (sort) {
      this.saveSort(sort);
    }
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
    return Object.entries(json).reduce((res, [key, value]) => {
      if ((value as FilterConditionJson).filterConditionType !== undefined) {
        const filterCondition = this.filterConditionFactory.create(value as FilterConditionJson);
        if (filterCondition) {
          res[key] = filterCondition;
        }
      } else {
        res[key] = value as SearchValue;
      }
      return res;
    }, {} as Record<string, SearchValue>);
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
