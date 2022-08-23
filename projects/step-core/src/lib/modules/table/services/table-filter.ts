import { TableRequestData } from '../../../client/table/models/table-request-data';

export abstract class TableFilter {
  abstract getTableFilterRequest(): TableRequestData | undefined;
}
