import { EntityObject } from '../../../../../../../../step-core/src/lib/modules/entity/types/entity-object';

export interface EntitySearchValue {
  searchValue: string;
  entity?: EntityObject; // for labeling and displaying purposes
}
