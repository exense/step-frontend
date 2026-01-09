import { inject, Injectable, OnDestroy } from '@angular/core';
import { HeatmapPersistenceConfig } from './heatmap-persistence-config';
import { HeatmapStorageService } from './heatmap-storage.service';
import { PageEvent } from '@angular/material/paginator';

@Injectable()
export class HeatmapPersistenceStateService {
  private _config = inject(HeatmapPersistenceConfig, { optional: true });
  private _heatmapStorage = inject(HeatmapStorageService);
  private _heatmapLocalStorage = inject(HeatmapStorageService);

  protected get canStorePagination(): boolean {
    return !!this._config?.heatmapId && !!this._config?.storePagination;
  }

  private get paginationKey(): string {
    return `${this._config!.heatmapId!}_PAGE`;
  }

  private get pageSizeKey(): string {
    return `${this._config!.heatmapId}_PAGE_SIZE`;
  }

  savePage(page: PageEvent): void {
    if (!this.canStorePagination) {
      return;
    }
    this._heatmapStorage.setItem(this.paginationKey, JSON.stringify(page));
    this.savePageSize(page.pageSize);
  }

  getPage(): PageEvent | undefined {
    if (!this.canStorePagination) {
      return undefined;
    }
    const jsonString = this._heatmapStorage.getItem(this.paginationKey);
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

  private savePageSize(pageSize: number): void {
    if (!this.canStorePagination) {
      return;
    }
    this._heatmapLocalStorage.setItem(this.pageSizeKey, pageSize.toString());
  }

  private getPageSize(): number | undefined {
    if (!this.canStorePagination) {
      return undefined;
    }
    const pageSizeString = this._heatmapLocalStorage.getItem(this.pageSizeKey) ?? '';
    const pageSize = parseInt(pageSizeString);
    if (isNaN(pageSize)) {
      return undefined;
    }
    return pageSize;
  }
}
