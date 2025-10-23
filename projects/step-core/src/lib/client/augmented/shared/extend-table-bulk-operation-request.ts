import { OQLFilter, TableBulkOperationRequest } from '../../generated';

export const extendTableBulkOperationRequest = (
  bulkRequest?: TableBulkOperationRequest,
  filter?: string,
): TableBulkOperationRequest | undefined => {
  if (!bulkRequest || !filter || bulkRequest.targetType === 'LIST' || isOqlFilterApplied(bulkRequest, filter)) {
    return bulkRequest;
  }
  const result: TableBulkOperationRequest = {
    ...bulkRequest,
    targetType: 'FILTER',
    filters: [...(bulkRequest.filters ?? []), { oql: filter }],
  };
  return result;
};

const isOqlFilterApplied = (bulkRequest?: TableBulkOperationRequest, filter?: string): boolean => {
  const filters = bulkRequest?.filters ?? [];
  if (!filters?.length) {
    return false;
  }
  return filters.some((item) => (item as OQLFilter).oql === filter);
};
