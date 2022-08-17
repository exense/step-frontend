import { Injectable } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../shared';
import { TableRequestData } from '../../../client/table/models/table-request-data';
import { SortDirection } from '../../../client/table/models/sort-direction.enum';
import { OQLFilter } from '../../../client/table/models/oql-filter';
import { TableParameters } from '../../../client/table/models/table-parameters';
import { FieldSort } from '../../../client/table/models/field-sort';
import { TableResponse } from '../../../client/table/models/table-response';

export interface LegacyColumnOrder {
  column: number;
  dir: 'asc' | 'desc';
}

export interface LegacyTableSearch {
  value: string;
  regex: boolean;
}

export interface LegacyTableColumn {
  data?: string | number;
  name: string;
  searchable?: boolean;
  orderable?: boolean;
  search?: LegacyTableSearch;
}

export interface LegacyTableRequestData {
  draw: number;
  columns: LegacyTableColumn[];
  order: LegacyColumnOrder[];
  start: number;
  length: number;
  search: LegacyTableSearch;
  filter?: string;
  params?: unknown;
}

export interface LegacyTableResponse {
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
  data: (string | null)[][];
}

@Injectable({
  providedIn: 'root',
})
export class TableLegacyUtilsService {
  transformRequestLegacy2New(req: LegacyTableRequestData): TableRequestData {
    const result: TableRequestData = {
      skip: req.start || 0,
      limit: req.length || 10,
    };
    const searchableColumns = (req.columns || []).filter((col) => col.searchable && !!col.name);
    if (searchableColumns.length) {
      result.filters = searchableColumns
        .map((legacyCol) => {
          const field = legacyCol.name;
          const value = legacyCol.search?.value || '';
          const isRegex = !!legacyCol?.search?.regex;
          return { field, value, isRegex };
        })
        .filter((col) => !!col.value);
    }
    const order = req.order?.[0];

    const sort: FieldSort = order
      ? {
          field: req.columns[order!.column].name,
          direction: order.dir === 'asc' ? SortDirection.ASCENDING : SortDirection.DESCENDING,
        }
      : {
          field: req.columns[0].name,
          direction: SortDirection.ASCENDING,
        };
    if (sort.field) {
      result.sort = sort;
    }

    if (req.filter) {
      const oql: OQLFilter = { oql: req.filter };
      result.filters = !!result.filters ? [...result.filters, oql] : [oql];
    }

    if (req.params) {
      result.tableParameters = req.params as TableParameters;
    }

    return result;
  }

  transformResponseNew2Legacy(resp: TableResponse<any>, columnsCount: number): LegacyTableResponse {
    const transformResultRow = (data: any): (string | null)[] => {
      const row: (string | null)[] = new Array(columnsCount).fill(null);
      row[0] = JSON.stringify(data);
      return row;
    };

    const result: LegacyTableResponse = {
      draw: 1,
      recordsTotal: resp.recordsTotal,
      recordsFiltered: resp.recordsFiltered,
      data: resp.data.map(transformResultRow),
    };

    return result;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('tableLegacyUtilsService', downgradeInjectable(TableLegacyUtilsService));
