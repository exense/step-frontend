import { inject, Pipe, PipeTransform } from '@angular/core';
import { Plan, RepositoryObjectReference } from '@exense/step-core';
import { PurePlanContextApiService } from '../injectables/pure-plan-context-api.service';

@Pipe({
  name: 'planRepoRef',
  standalone: true,
})
export class PlanRepoRefPipe implements PipeTransform {
  private _planContextApi = inject(PurePlanContextApiService);

  transform(plan?: Plan): RepositoryObjectReference | undefined {
    if (!plan?.id) {
      return undefined;
    }
    return this._planContextApi.createRepositoryObjectReference(plan.id);
  }
}
