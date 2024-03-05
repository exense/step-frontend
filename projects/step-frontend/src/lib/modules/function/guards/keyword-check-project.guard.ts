import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import {
  AugmentedKeywordsService,
  AuthService,
  CommonEditorUrlsService,
  MultipleProjectsService,
} from '@exense/step-core';
import { of, switchMap } from 'rxjs';

export const keywordCheckProjectGuard: CanActivateFn = (route) => {
  const _keywordsApi = inject(AugmentedKeywordsService);
  const _auth = inject(AuthService);
  const _multipleProjects = inject(MultipleProjectsService);
  const _commonEditorUrls = inject(CommonEditorUrlsService);

  const id = route.params['id'];
  if (!id) {
    return false;
  }

  return _keywordsApi.getFunctionByIdCached(id).pipe(
    switchMap((keyword) => {
      if (_auth.hasRight('admin-no-multitenancy') || _multipleProjects.isEntityBelongsToCurrentProject(keyword)) {
        return of(true);
      }
      return _multipleProjects.confirmEntityEditInASeparateProject(
        keyword,
        _commonEditorUrls.keywordConfigurerUrl(keyword),
        'keyword',
      );
    }),
  );
};
