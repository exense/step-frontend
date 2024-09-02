import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RangePickerStatesService } from './range-picker-state.service';

@Injectable()
export abstract class ScheduleCrossExecutionStateService extends RangePickerStatesService {
  abstract readonly executions$: Observable<{
    recordsTotal: number;
    recordsFiltered: number;
    data: any[];
  }>;
}
