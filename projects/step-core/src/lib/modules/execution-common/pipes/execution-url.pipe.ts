import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { Execution } from '../../../client/step-client-module';

@Pipe({
  name: 'executionUrl',
  standalone: true,
})
export class ExecutionUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  transform(idOrExecution: string | Execution): string {
    return this._commonEntitiesUrls.executionUrl(idOrExecution);
  }
}
