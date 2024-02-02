import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { AugmentedPlansService, EntityActionInvokerService, Plan, PlanAction } from '@exense/step-core';
import { map, switchMap } from 'rxjs';

export const planResolver: ResolveFn<Plan | undefined> = (route) => {
  const _plansService = inject(AugmentedPlansService);
  const _entityActionInvoker = inject(EntityActionInvokerService);

  const id = route.params['id'];
  if (!id) {
    return undefined;
  }

  return _plansService.getPlanById(id).pipe(
    switchMap((plan) => {
      return _entityActionInvoker
        .invokeAction('plans', PlanAction.AFTER_LOAD, plan)
        .pipe(map((result) => (result ? plan : undefined)));
    })
  );
};
