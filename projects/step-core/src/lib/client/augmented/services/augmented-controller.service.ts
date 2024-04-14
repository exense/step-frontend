import { inject, Injectable } from '@angular/core';
import { ControllerService, ReportNode, TableParameters } from '../../generated';
import {
  SortDirection,
  StepDataSource,
  TableApiWrapperService,
  TableRemoteDataSourceFactoryService,
} from '../../table/step-table-client.module';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AugmentedControllerService extends ControllerService {
  readonly REPORT_TABLE_ID = 'leafReports';

  private _tableApi = inject(TableApiWrapperService);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  createDataSource(): StepDataSource<ReportNode> {
    return this._dataSourceFactory.createDataSource(this.REPORT_TABLE_ID, {
      executionTime: 'executionTime',
      step: 'step',
      status: 'status',
    });
  }

  getReportNodes<T extends TableParameters>(tableParameters: T): Observable<ReportNode[]> {
    return this._tableApi
      .requestTable<ReportNode>(this.REPORT_TABLE_ID, {
        skip: 0,
        sort: {
          field: 'executionTime',
          direction: SortDirection.DESCENDING,
        },
        tableParameters,
      })
      .pipe(map((response) => response.data));
  }
}
