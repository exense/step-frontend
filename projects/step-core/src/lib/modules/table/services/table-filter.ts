import { TableRequestData } from '../../../client/step-client-module';

export abstract class TableFilter {
  abstract getTableFilterRequest(): TableRequestData | undefined;
}
