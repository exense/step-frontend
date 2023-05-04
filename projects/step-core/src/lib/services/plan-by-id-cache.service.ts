import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemByIdCacheService } from '../modules/basics/step-basics.module';
import { Plan, PlansService } from '../client/generated';

@Injectable()
export class PlanByIdCacheService extends ItemByIdCacheService<Plan> {
  private _api = inject(PlansService);
  protected loadItem(id: string): Observable<Plan> {
    return this._api.getPlanById(id);
  }
}
