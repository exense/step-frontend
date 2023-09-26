import { LegacyTableHandle } from '../../table/table.module';
import { EntityObject } from './entity-object';

export interface SelectEntityContext extends LegacyTableHandle {
  readonly multipleSelection?: boolean;
  handleSelect?(entity: EntityObject): void;
  getSourceId?(): string | undefined;
}
