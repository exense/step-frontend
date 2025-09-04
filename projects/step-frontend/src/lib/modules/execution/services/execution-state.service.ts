import {
  Execution,
  ExecutionSummaryDto,
  Operation,
  ReportNode,
  SelectionList,
  StepDataSource,
} from '@exense/step-core';
import { ErrorDistributionStatus } from '../shared/error-distribution-status.enum';
import { ExecutionErrorMessageItem } from '../shared/execution-error-message-item';
import { ExecutionErrorCodeItem } from '../shared/execution-error-code-item';
import { ExecutionViewServices } from '../../operations/operations.module';

export abstract class ExecutionStateService extends ExecutionViewServices {
  abstract executionId?: string;
  abstract testCasesProgress?: ExecutionSummaryDto;
  abstract progress?: ExecutionSummaryDto;
  abstract execution?: Execution;
  abstract testCases?: ReportNode[];
  abstract testCasesDataSource?: StepDataSource<ReportNode>;
  abstract setupTableSelectionList(list?: SelectionList<string, ReportNode>): void;
  abstract keywordSearch?: string;
  abstract drillDownTestCase(id: string): void;
  abstract searchStepByError(error: string): void;
  abstract currentOperations: Operation[];
  abstract countByErrorMsg: ExecutionErrorMessageItem[];
  abstract errorDistribution?: { errorCount: number; count: number };
  abstract countByErrorCode: ExecutionErrorCodeItem[];
  abstract selectedErrorDistributionToggle: ErrorDistributionStatus;
}
