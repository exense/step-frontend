import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SortPredicate, TableLocalDataSource } from '@exense/step-core';
import { ErrorDistributionStatus } from '../../shared/error-distribution-status.enum';
import { ExecutionErrorMessageItem } from '../../shared/execution-error-message-item';
import { ExecutionErrorCodeItem } from '../../shared/execution-error-code-item';

@Component({
  selector: 'step-execution-errors',
  templateUrl: './execution-errors.component.html',
  styleUrls: ['./execution-errors.component.scss'],
  standalone: false,
})
export class ExecutionErrorsComponent implements OnChanges {
  readonly ErrorDistributionStatus = ErrorDistributionStatus;

  protected readonly distributionStatusItems = [ErrorDistributionStatus.MESSAGE, ErrorDistributionStatus.CODE];

  @Input() selectedErrorDistributionToggle: ErrorDistributionStatus = ErrorDistributionStatus.MESSAGE;
  @Output() selectedErrorDistributionToggleChange = new EventEmitter<ErrorDistributionStatus>();

  @Input() countByErrorMsg: ExecutionErrorMessageItem[] = [];
  @Input() countByErrorCode: ExecutionErrorCodeItem[] = [];
  @Input() errorDistribution!: { errorCount: number; count: number };

  @Output() searchStepByError = new EventEmitter<string>();

  countByErrorMsgDataSource?: TableLocalDataSource<ExecutionErrorMessageItem>;
  countByErrorCodeDataSource?: TableLocalDataSource<ExecutionErrorCodeItem>;

  ngOnChanges(changes: SimpleChanges): void {
    const cCountByErrorMsg = changes['countByErrorMsg'];
    const cCountByErrorCode = changes['countByErrorCode'];

    if (cCountByErrorMsg?.previousValue !== cCountByErrorMsg?.currentValue || cCountByErrorMsg?.firstChange) {
      this.createCountByErrorMsgDataSource(cCountByErrorMsg.currentValue);
    }

    if (cCountByErrorCode?.previousValue !== cCountByErrorCode?.currentValue || cCountByErrorCode?.firstChange) {
      this.createCountByErrorCodeDataSource(cCountByErrorCode.currentValue);
    }
  }

  private createCountByErrorMsgDataSource(src: ExecutionErrorMessageItem[]): void {
    const sortByErrorMessage: SortPredicate<ExecutionErrorMessageItem> = (itemA, itemB) =>
      (itemA?.errorMessage || '').localeCompare(itemB?.errorMessage || '');

    const sortByCount: SortPredicate<ExecutionErrorMessageItem> = (itemA, itemB) =>
      (itemA?.errorCount || 0) - (itemB.errorCount || 0);

    this.countByErrorMsgDataSource = new TableLocalDataSource(src, {
      sortPredicates: {
        errorMessage: sortByErrorMessage,
        errorCount: sortByCount,
        percent: sortByCount,
        overall: sortByCount,
      },
    });
  }

  private createCountByErrorCodeDataSource(src: ExecutionErrorCodeItem[]): void {
    const sortByErrorCode: SortPredicate<ExecutionErrorCodeItem> = (itemA, itemB) =>
      (itemA?.errorCode || '').localeCompare(itemB?.errorCode || '');

    const sortByCount: SortPredicate<ExecutionErrorCodeItem> = (itemA, itemB) =>
      (itemA?.errorCodeCount || 0) - (itemB?.errorCodeCount || 0);

    this.countByErrorCodeDataSource = new TableLocalDataSource(src, {
      sortPredicates: {
        errorCode: sortByErrorCode,
        errorCodeCount: sortByCount,
        percent: sortByCount,
        overall: sortByCount,
      },
    });
  }
}
