import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AugmentedPlansService, EntityActionInvokerService, PlanAction } from '@exense/step-core';
import { switchMap } from 'rxjs';

export const planActivate: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const _plansService = inject(AugmentedPlansService);
  const _entityActionInvoker = inject(EntityActionInvokerService);

  const id = route.params['id'];
  const artefactId = route.queryParams['artefactId'];

  if (!id) {
    return false;
  }

  return _plansService
    .getPlanById(id)
    .pipe(switchMap((plan) => _entityActionInvoker.invokeAction('plans', PlanAction.EDIT, plan, { artefactId })));
};
