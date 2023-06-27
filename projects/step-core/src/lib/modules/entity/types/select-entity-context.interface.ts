import { LegacyTableHandle } from '../../table/table.module';

export interface SelectEntityContext extends LegacyTableHandle {
  readonly multipleSelection?: boolean;
  handleSelect?(selectedId: string): void;
  getSourceId?(): string | undefined;
}
