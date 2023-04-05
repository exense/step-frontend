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
    {
      searchPredicates: {
        tid: (element, searchValue) => {
          const value = this.getThreadId(element) || '';
          return value.toString().toLowerCase().includes(searchValue.toLowerCase());
        },
        planName: (element, searchValue) => {
          const value = this.getPlanName(element) || '';
          return value.toLowerCase().includes(searchValue.toLowerCase());
        },
        execution: (element, searchValue) => {
          const value = this.getExecution(element) || '';
          return value.toLowerCase().includes(searchValue.toLowerCase());
        },
        testcase: (element, searchValue) => {
          const value = this.getTestcase(element) || '';
          return value.toLowerCase().includes(searchValue.toLowerCase());
        },
        operation: (element, searchValue) => {
          const value = this.getOperation(element) || '';
          return value.toLowerCase().includes(searchValue.toLowerCase());
        },
      },
      sortPredicates: {
        tid: (a, b) => {
          const valueA = this.getThreadId(a) || '';
          const valueB = this.getThreadId(b) || '';
          return valueA.toString().localeCompare(valueB.toString());
        },
        planName: (a, b) => {
          const valueA = this.getPlanName(a) || '';
          const valueB = this.getPlanName(b) || '';
          return valueA.localeCompare(valueB);
        },
        execution: (a, b) => {
          const valueA = this.getExecution(a) || '';
          const valueB = this.getExecution(b) || '';
          return valueA.localeCompare(valueB);
        },
        testcase: (a, b) => {
          const valueA = this.getTestcase(a) || '';
          const valueB = this.getTestcase(b) || '';
          return valueA.localeCompare(valueB);
        },
        operation: (a, b) => {
          const valueA = this.getOperation(a) || '';
          const valueB = this.getOperation(b) || '';
          return valueA.localeCompare(valueB);
        },
      },
    }
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
