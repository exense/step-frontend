import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AugmentedKeywordPackagesService, AuthService, MultipleProjectsService } from '@exense/step-core';
import { of, switchMap } from 'rxjs';

export const functionPackageCheckProjectGuard: CanActivateFn = (route) => {
  const _functionPackageApi = inject(AugmentedKeywordPackagesService);
  const _multipleProjects = inject(MultipleProjectsService);
  const _auth = inject(AuthService);

  const id = route.params['id'];
  if (!id) {
    return false;
  }

  return _functionPackageApi.getFunctionPackageCached(id).pipe(
    switchMap((functionPackage) => {
      if (
        _auth.hasRight('admin-no-multitenancy') ||
        _multipleProjects.isEntityBelongsToCurrentProject(functionPackage)
      ) {
        return of(true);
      }
      return _multipleProjects.confirmEntityEditInASeparateProject(
        functionPackage,
        `/functionPackages/editor/${id}`,
        'keyword package',
      );
    }),
  );
};
