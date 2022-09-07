import { BaseFilter } from './base-filter';
import { Filter } from '../../generated';

export interface CompoundFilter<T extends BaseFilter> extends Filter {
  children?: Array<T>;
}
