import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { MultipleProjectsService } from '../modules/basics/step-basics.module';
import { AuthService } from '../modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DEFAULT_PAGE } from '../modules/routing';

type EntityEditLink = Parameters<MultipleProjectsService['confirmEntityEditInASeparateProject']>[1];

export interface CheckProjectGuardConfig {
  entityType: string;
  idParameterName?: string;
  idExtractor?: (route: ActivatedRouteSnapshot) => string;
  getEditorUrl: (id: string, route: ActivatedRouteSnapshot) => EntityEditLink;
  getEntity: (id: string) => Observable<unknown>;
}

export const checkEntityGuardFactory =
  (config: CheckProjectGuardConfig): CanActivateFn =>
  (route: ActivatedRouteSnapshot) => {
    const _auth = inject(AuthService);
    const _multipleProjects = inject(MultipleProjectsService);
    const _snackBar = inject(MatSnackBar);
    const _injector = inject(Injector);
    const _router = inject(Router);
    const _defaultPage = inject(DEFAULT_PAGE);

    const idParameterName = config.idParameterName ?? 'id';
    const id = config.idExtractor ? config.idExtractor(route) : route.params[idParameterName];

    if (!id) {
      return false;
    }

    const entity$ = runInInjectionContext(_injector, () => config.getEntity(id)) as Observable<{
      attributes?: Record<string, string>;
    }>;

    return entity$.pipe(
      switchMap((entity) => {
        if (!entity) {
          _snackBar.open(`Entity "${config.entityType}" with id "${id}" doesn't exist`, 'dismiss');
          return of(false);
        }

        if (_auth.hasRight('admin-no-multitenancy')) {
          return of(true);
        }

        if (_multipleProjects.isEntityBelongsToCurrentProject(entity)) {
          return of(true);
        }

        const entityEditLink = runInInjectionContext(_injector, () => config.getEditorUrl(id, route));
        return _multipleProjects.confirmEntityEditInASeparateProject(entity, entityEditLink, config.entityType);
      }),
      map((result) => {
        if (!result && _router.url === '/') {
          return _router.parseUrl(_defaultPage());
        }
        return result;
      }),
    );
  };
