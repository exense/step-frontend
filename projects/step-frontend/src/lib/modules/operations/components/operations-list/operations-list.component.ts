import { Component, Input } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, OperationDetails, SystemService, TableFetchLocalDataSource } from '@exense/step-core';
import { ExecutionViewServices } from '../../operations.module';

@Component({
  selector: 'step-operations-list',
  templateUrl: './operations-list.component.html',
  styleUrls: ['./operations-list.component.scss'],
})
export class OperationsListComponent {
  @Input() executionViewServices?: ExecutionViewServices;

  readonly dataSource = new TableFetchLocalDataSource<OperationDetails>(
    () => this._systemService.getCurrentOperationsList(),
    TableFetchLocalDataSource.configBuilder<OperationDetails>()
      .addSearchStringPredicate('tid', (item) => this.getThreadId(item)?.toString())
      .addSearchStringPredicate('planName', (item) => this.getPlanName(item))
      .addSearchStringPredicate('execution', (item) => this.getExecution(item))
      .addSearchStringPredicate('testcase', (item) => this.getTestcase(item))
      .addSearchStringPredicate('operation', (item) => this.getOperation(item))
      .addSortStringPredicate('tid', (item) => this.getThreadId(item)?.toString())
      .addSortStringPredicate('planName', (item) => this.getPlanName(item))
      .addSortStringPredicate('execution', (item) => this.getExecution(item))
      .addSortStringPredicate('testcase', (item) => this.getTestcase(item))
      .addSortStringPredicate('operation', (item) => this.getOperation(item))
      .build()
  );

  constructor(private _systemService: SystemService) {}

  triggerRefresh(): void {
    this.dataSource.reload();
  }

  private getThreadId(operationDetails: OperationDetails): number | undefined {
    return operationDetails.operation?.tid;
  }

  private getPlanName(operationDetails: OperationDetails): string | undefined {
    return operationDetails.planName;
  }

  private getExecution(operationDetails: OperationDetails): string | undefined {
    return operationDetails.execId;
  }

  private getTestcase(operationDetails: OperationDetails): string | undefined {
    return operationDetails.testcase;
  }

  private getOperation(operationDetails: OperationDetails): string | undefined {
    return operationDetails.operation?.name;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(
    'stepOperationsList',
    downgradeComponent({
      component: OperationsListComponent,
    })
  );
