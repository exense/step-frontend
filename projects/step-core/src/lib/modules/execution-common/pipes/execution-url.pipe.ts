import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { Execution } from '../../../client/step-client-module';
import { IS_ALT_EXECUTION_MODE } from '../injectables/is-alt-execution-mode';

@Pipe({
  name: 'executionUrl',
  standalone: true,
})
export class ExecutionUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  private _isAltExecutionMode = !!inject(IS_ALT_EXECUTION_MODE, { optional: true });

  transform(idOrExecution: string | Execution): string {
    return this._isAltExecutionMode
      ? this._commonEntitiesUrls.altExecutionUrl(idOrExecution)
      : this._commonEntitiesUrls.executionUrl(idOrExecution);
  }
}
