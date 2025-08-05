import { inject, Pipe, PipeTransform } from '@angular/core';
import { Execution } from '../../../client/generated';
import { Observable } from 'rxjs';
import { ExecutionViewModeService } from '../services/execution-view-mode.service';

@Pipe({
  name: 'executionUrl',
})
export class ExecutionUrlPipe implements PipeTransform {
  private _executionViewMode = inject(ExecutionViewModeService);

  transform(execution: Execution): Observable<string> {
    return this._executionViewMode.determineUrl(execution);
  }
}
