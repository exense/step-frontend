import { inject, Injectable } from '@angular/core';
import { ItemByIdCacheService } from '../modules/basics/step-basics.module';
import { ExecutiontTaskParameters, AugmentedSchedulerService } from '../client/step-client-module';
import { Observable } from 'rxjs';

@Injectable()
export class TaskByIdCacheService extends ItemByIdCacheService<ExecutiontTaskParameters> {
  private _api = inject(AugmentedSchedulerService);

  override loadItem(id: string): Observable<ExecutiontTaskParameters> {
    return this._api.getExecutionTaskById(id);
  }
}
