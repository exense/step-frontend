import { IsUsedBySearchType } from '../shared/is-used-by-search-type';

export abstract class IsUsedByDialog {
  abstract displayDialog(title: string, type: IsUsedBySearchType, id: string): void;
}
