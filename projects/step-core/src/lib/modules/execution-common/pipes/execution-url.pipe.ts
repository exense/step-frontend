import { inject, Pipe, PipeTransform } from '@angular/core';
import { CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { Execution } from '../../../client/step-client-module';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ExecutionViewModeService, ExecutionViewMode } from '@exense/step-core';

@Pipe({
  name: 'executionUrl',
  standalone: true,
})
export class ExecutionUrlPipe implements PipeTransform {
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  private _executionViewMode: ExecutionViewModeService = inject(ExecutionViewModeService);

  transform(idOrExecution: string | Execution): Observable<string> {
    return this._executionViewMode
      .resolveExecution(idOrExecution)
      .pipe(switchMap((execution: Execution) => of(this.determineUrl(execution))));
  }

  private determineUrl(execution: Execution): string {
    const mode = this._executionViewMode.getExecutionMode(execution);
    return mode === ExecutionViewMode.NEW
      ? this._commonEntitiesUrls.executionUrl(execution)
      : this._commonEntitiesUrls.legacyExecutionUrl(execution);
  }
}
