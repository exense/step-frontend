import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { Execution } from '../../../client/step-client-module';
import { EXECUTION_VIEW_MODE } from '../injectables/execution-view-mode.token';
import { ExecutionViewMode } from '../types/execution-view-mode';

@Pipe({
  name: 'executionUrl',
  standalone: true,
})
export class ExecutionUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  private _executionViewMode = inject(EXECUTION_VIEW_MODE, { optional: true });

  transform(idOrExecution: string | Execution): string {
    return this._executionViewMode === ExecutionViewMode.NEW
      ? this._commonEntitiesUrls.altExecutionUrl(idOrExecution)
      : this._commonEntitiesUrls.executionUrl(idOrExecution);
  }
}
