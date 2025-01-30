import { inject, Pipe, PipeTransform } from '@angular/core';
import { Execution } from '../../../client/generated';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ExecutionViewModeService } from '../services/execution-view-mode.service';

@Pipe({
  name: 'executionUrl',
  standalone: true,
})
export class ExecutionUrlPipe implements PipeTransform {
  private _executionViewMode = inject(ExecutionViewModeService);

  transform(idOrExecution: string | Execution): Observable<string> {
    return this._executionViewMode
      .resolveExecution(idOrExecution)
      .pipe(switchMap((execution: Execution) => of(this._executionViewMode.determineUrl(execution))));
  }
}
