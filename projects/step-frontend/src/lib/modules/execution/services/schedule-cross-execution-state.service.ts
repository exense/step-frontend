import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RangePickerStatesService } from './range-picker-state.service';
import { ExecutiontTaskParameters } from '@exense/step-core';

@Injectable()
export abstract class ScheduleCrossExecutionStateService extends RangePickerStatesService {
  abstract readonly taskId$: Observable<string>;
  abstract readonly executions$: Observable<{
    recordsTotal: number;
    recordsFiltered: number;
    data: any[];
  }>;
}
