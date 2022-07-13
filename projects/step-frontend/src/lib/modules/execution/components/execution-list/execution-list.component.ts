import { Component } from '@angular/core';
import { AJS_MODULE, AugmentedExecutionsService } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { DateFormat } from '../../../_common/shared/date-format.enum';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-list.component.html',
  styleUrls: ['./execution-list.component.scss'],
})
export class ExecutionListComponent {
  readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();

  readonly DateFormat = DateFormat;
  readonly resultItems$ = this._augmentedExecutionsService.getResultColumnItems();
  readonly statusItems$ = this._augmentedExecutionsService.getStatusColumnItems();

  constructor(public _augmentedExecutionsService: AugmentedExecutionsService) {}
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionList', downgradeComponent({ component: ExecutionListComponent }));
