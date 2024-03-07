import { IsUsedBySearchType } from '../types/is-used-by-search-type';

export abstract class IsUsedByDialog {
  abstract displayDialog(title: string, type: IsUsedBySearchType, id: string): void;
}
