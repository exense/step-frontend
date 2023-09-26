import { EntityObject } from '@exense/step-core';

export interface EntitySearchValue {
  searchValue: string;
  entity?: EntityObject; // for labeling and displaying purposes
}
