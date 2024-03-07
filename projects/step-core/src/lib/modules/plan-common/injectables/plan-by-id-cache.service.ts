import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemByIdCacheService } from '../../basics/step-basics.module';
import { Plan, PlansService } from '../../../client/step-client-module';

@Injectable()
export class PlanByIdCacheService extends ItemByIdCacheService<Plan> {
  private _api = inject(PlansService);
  protected loadItem(id: string): Observable<Plan> {
    return this._api.getPlanById(id);
  }
}
