import { Component } from '@angular/core';
import {
  AJS_MODULE,
  AugmentedExecutionsService,
  DateFormat,
  FilterConditionFactoryService,
  SearchColDirective,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { EXECUTION_RESULT, EXECUTION_STATUS } from '../../../_common/shared/status.enum';
import { of } from 'rxjs';
import { DateTime } from 'luxon';

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

  constructor(
    private _filterConditionFactory: FilterConditionFactoryService,
    public _augmentedExecutionsService: AugmentedExecutionsService
  ) {}

  searchByDate(col: SearchColDirective, date?: DateTime): void {
    const condition = this._filterConditionFactory.singleDateFilterCondition(date);
    col.search(condition);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionList', downgradeComponent({ component: ExecutionListComponent }));
