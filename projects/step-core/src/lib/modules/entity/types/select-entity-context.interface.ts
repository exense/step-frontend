import { LegacyTableHandle } from '../../table/table.module';
import { EntityObject } from './entity-object';

export interface SelectEntityContext extends LegacyTableHandle {
  readonly multipleSelection?: boolean;
  readonly tableFilter?: string;
  handleSelect?(entity: EntityObject): void;
  getSourceId?(): string | undefined;
}
