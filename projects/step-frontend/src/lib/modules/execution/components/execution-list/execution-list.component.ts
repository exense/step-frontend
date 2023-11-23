import { Component, inject } from '@angular/core';
import {
  AJS_MODULE,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  BulkSelectionType,
  DateFormat,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { EXECUTION_RESULT, EXECUTION_STATUS } from '../../../_common/shared/status.enum';
import { from, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ExecutionOpenNotificatorService } from '../../services/execution-open-notificator.service';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-list.component.html',
  styleUrls: ['./execution-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('executionList', STORE_ALL),
    selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class ExecutionListComponent {
  private _router = inject(Router);
  private _executionOpenNotifier = inject(ExecutionOpenNotificatorService, { optional: true });
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();
  readonly DateFormat = DateFormat;
  readonly resultItems$ = of(EXECUTION_RESULT);
  readonly statusItems$ = of(EXECUTION_STATUS);
  autoRefreshDisabled: boolean = false;

  changeType(selectionType: BulkSelectionType): void {
    this.autoRefreshDisabled = selectionType !== BulkSelectionType.NONE;

    if (this.autoRefreshDisabled) {
      this.dataSource.skipOngoingRequest();
    }
  }

  refreshTable(): void {
    this.dataSource.reload({ hideProgress: true });
  }

  navigateToExecution(id: string): void {
    from(this._router.navigate(['root', 'executions', id], { queryParamsHandling: 'preserve' })).subscribe(() => {
      this._executionOpenNotifier?.openNotify(id);
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionList', downgradeComponent({ component: ExecutionListComponent }));
