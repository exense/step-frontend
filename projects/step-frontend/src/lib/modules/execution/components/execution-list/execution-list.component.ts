import { Component } from '@angular/core';
import { AJS_MODULE, AugmentedExecutionsService, DateFormat } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { EXECUTION_RESULT, EXECUTION_STATUS } from '../../../_common/shared/status.enum';
import { of } from 'rxjs';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-list.component.html',
  styleUrls: ['./execution-list.component.scss'],
})
export class ExecutionListComponent {
  readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();

  readonly DateFormat = DateFormat;
  readonly resultItems$ = of(EXECUTION_RESULT);
  readonly statusItems$ = of(EXECUTION_STATUS);

  constructor(public _augmentedExecutionsService: AugmentedExecutionsService) {}
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionList', downgradeComponent({ component: ExecutionListComponent }));
