import { TableRequestData } from '../../../client/table/models/table-request-data';

export interface LegacyTableHandle {
  getSelectedIds?(): ReadonlyArray<string>,
  getLastServerSideRequest?(): TableRequestData | undefined;
}
