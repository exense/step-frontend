import { SearchValue } from '../shared/search-value';

export interface SearchData {
  search: Record<string, SearchValue>;
  resetPagination: boolean;
  isForce: boolean;
  hideProgress?: boolean;
  immediateHideProgress?: boolean;
}
