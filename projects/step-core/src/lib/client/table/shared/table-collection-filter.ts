import { CollectionFilter } from '../../generated';
import { CompoundFilter } from './compound-filter';
import { BaseFilter } from './base-filter';

export interface TableCollectionFilter extends CollectionFilter {
  collectionFilter?: CompoundFilter<any> | BaseFilter;
}
