import { Injectable } from '@angular/core';
import { TableRequestData } from '../models/table-request-data';
import { TableResponse } from '../models/table-response';
import { Observable } from 'rxjs';
import { ExportService } from '../../../services/export.service';
import { ExportStatus, TablesService } from '../../generated';

@Injectable({
  providedIn: 'root',
})
export class TableApiWrapperService {
  constructor(private _tables: TablesService, private _exportService: ExportService) {}

  requestTable<T>(tableId: string, tableRequest: TableRequestData): Observable<TableResponse<T>> {
    return this._tables.request(tableId, tableRequest) as Observable<TableResponse<T>>;
  }

  exportTable(tableId: string, tableRequest: TableRequestData, fields: string[]): Observable<ExportStatus> {
    return this._tables.createExport(tableId, { tableRequest, fields });
  }

  exportAsCSV(tableId: string, fields: string[], tableRequest: TableRequestData = {}): void {
    this.exportTable(tableId, tableRequest, fields).subscribe((exportStatus) => {
      this._exportService.poll(exportStatus.id!);
    });
  }
}
