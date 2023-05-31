import { TableRequestData } from '../../../client/table/shared/table-request-data';

export interface LegacyTableHandle {
  getSelectedIds?(): ReadonlyArray<string>;
  getLastServerSideRequest?(): TableRequestData | undefined;
}
