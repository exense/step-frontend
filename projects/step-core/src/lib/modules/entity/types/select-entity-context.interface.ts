import { EntityObject } from './entity-object';

export interface SelectEntityContext {
  readonly multipleSelection?: boolean;
  readonly tableFilter?: string;
  handleSelect?(entity: EntityObject): void;
  getSourceId?(): string | undefined;
}
