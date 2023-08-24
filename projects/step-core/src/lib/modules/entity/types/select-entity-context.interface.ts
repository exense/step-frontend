import { LegacyTableHandle } from '../../table/table.module';

export interface SelectEntityContext extends LegacyTableHandle {
  readonly multipleSelection?: boolean;
  handleSelect?(selectedId: any): void;
  getSourceId?(): string | undefined;
}
