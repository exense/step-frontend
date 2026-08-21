import { Injectable } from '@angular/core';
import { TableRequestFilter } from '../../../client/table';

@Injectable({
  providedIn: 'root',
})
export class ExecutionListFiltersService {
  private readonly filtersByKey = new Map<string, TableRequestFilter[]>();

  register(key: string, filters: TableRequestFilter[]): void {
    this.filtersByKey.set(key, filters);
  }

  getFilters(): TableRequestFilter[] {
    return Array.from(this.filtersByKey.values()).flat();
  }
}
