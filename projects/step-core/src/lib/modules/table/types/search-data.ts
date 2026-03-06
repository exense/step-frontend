import { SearchValue } from '@exense/step-core';

export interface SearchData {
  search: Record<string, SearchValue>;
  resetPagination: boolean;
  isForce: boolean;
  hideProgress?: boolean;
  immediateHideProgress?: boolean;
}
