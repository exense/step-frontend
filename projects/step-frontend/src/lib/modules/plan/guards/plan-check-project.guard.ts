import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import {
  AugmentedPlansService,
  AuthService,
  CommonEditorUrlsService,
  MultipleProjectsService,
} from '@exense/step-core';
import { Observable, of, switchMap } from 'rxjs';

export const planCheckProjectGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | Observable<boolean> => {
  const _plansApi = inject(AugmentedPlansService);
  const _auth = inject(AuthService);
  const _multipleProjects = inject(MultipleProjectsService);
  const _commonEditorUrls = inject(CommonEditorUrlsService);

  const id = route.params['id'];
  if (!id) {
    return false;
  }
  return _plansApi.getPlanByIdCached(id).pipe(
    switchMap((plan) => {
      if (_auth.hasRight('admin-no-multitenancy') || _multipleProjects.isEntityBelongsToCurrentProject(plan)) {
        return of(true);
      }

      const planEditLink = _commonEditorUrls.planEditorUrl(id);
      const artefactId = route.queryParams['artefactId'];

      const editLinkParams = !artefactId
        ? planEditLink
        : {
            url: planEditLink,
            search: { ['artefactId']: artefactId },
          };

      return _multipleProjects.confirmEntityEditInASeparateProject(plan, editLinkParams, 'plan');
    }),
  );
};
