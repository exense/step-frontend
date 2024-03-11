import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService, Execution } from '@exense/step-core';

@Pipe({
  name: 'executionUrl',
})
export class ExecutionUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  transform(idOrExecution: string | Execution): string {
    return this._commonEntitiesUrls.executionUrl(idOrExecution);
  }
}
