import { inject, Injectable } from '@angular/core';
import { ControllerService, ReportNode } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';

@Injectable({
  providedIn: 'root',
})
export class AugmentedControllerService extends ControllerService {
  private readonly REPORT_TABLE_ID = 'leafReports';

  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  createDataSource(): StepDataSource<ReportNode> {
    return this._dataSourceFactory.createDataSource(this.REPORT_TABLE_ID, {
      executionTime: 'executionTime',
      step: 'step',
      status: 'status',
    });
  }
}
