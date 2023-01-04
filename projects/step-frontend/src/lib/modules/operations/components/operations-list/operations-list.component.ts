import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, OperationDetails, SystemService, TableLocalDataSource } from '@exense/step-core';
import { Subject, switchMap, tap } from 'rxjs';
import { ExecutionViewServices } from '../../operations.module';

@Component({
  selector: 'step-operations-list',
  templateUrl: './operations-list.component.html',
  styleUrls: ['./operations-list.component.scss'],
})
export class OperationsListComponent implements AfterViewInit, OnDestroy {
  @Input() executionViewServices?: ExecutionViewServices;

  private readonly getOperations$ = new Subject<void>();
  private readonly operations$ = this.getOperations$.pipe(
    tap(() => {
      this.inProgress = true;
    }),
    switchMap(() => this._systemService.getCurrentOperationsList()),
    tap(() => {
      this.inProgress = false;
    })
  );

  readonly dataSource = new TableLocalDataSource<OperationDetails>(this.operations$, {
    searchPredicates: {
      tid: (element, searchValue) => {
        const value = this.getThreadId(element) || '';
        return value.toLowerCase().includes(searchValue.toLowerCase());
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
        return valueA.localeCompare(valueB);
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
  });

  inProgress = false;

  constructor(private _systemService: SystemService) {}

  ngAfterViewInit(): void {
    this.getOperations$.next();
  }

  ngOnDestroy(): void {
    this.getOperations$.complete();
  }

  triggerRefresh(): void {
    this.getOperations$.next();
  }

  private getThreadId(operationDetails: OperationDetails): string | undefined {
    const tid = operationDetails.operation?.tid;
    const threadId = tid ?? '';

    return `${threadId}`;
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
