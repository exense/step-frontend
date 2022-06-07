import { Component } from '@angular/core';
import { TableRestService, TableRemoteDataSource, AJS_MODULE } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { DateFormat } from '../../../_common/shared/date-format.enum';

const EXECUTIONS_TABLE_ID = 'executions';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-list.component.html',
  styleUrls: ['./execution-list.component.scss'],
})
export class ExecutionListComponent {
  readonly dataSource = new TableRemoteDataSource(EXECUTIONS_TABLE_ID, this._tableRest, {
    description: 'description',
    startTime: 'startTime',
    endTime: 'endTime',
    user: 'executionParameters.userID',
    environment: 'executionParameters.customParameters.env',
    status: 'status',
    result: 'result',
  });

  readonly DateFormat = DateFormat;

  readonly resultItems$ = this._tableRest.requestColumnValues(EXECUTIONS_TABLE_ID, 'result');

  readonly statusItems$ = this._tableRest.requestColumnValues(EXECUTIONS_TABLE_ID, 'status');

  constructor(private _tableRest: TableRestService) {}
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionList', downgradeComponent({ component: ExecutionListComponent }));
