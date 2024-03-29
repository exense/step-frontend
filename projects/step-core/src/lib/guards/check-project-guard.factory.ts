import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { MultipleProjectsService } from '../modules/basics/step-basics.module';
import { AuthService } from '../modules/auth';

type EntityEditLink = Parameters<MultipleProjectsService['confirmEntityEditInASeparateProject']>[1];

export interface CheckProjectGuardConfig {
  entityType: string;
  idParameterName?: string;
  getEditorUrl: (id: string, route: ActivatedRouteSnapshot) => EntityEditLink;
  getEntity: (id: string) => Observable<unknown>;
}

export const checkProjectGuardFactory =
  (config: CheckProjectGuardConfig): CanActivateFn =>
  (route: ActivatedRouteSnapshot) => {
    const _auth = inject(AuthService);
    const _multipleProjects = inject(MultipleProjectsService);
    const _injector = inject(Injector);

    const idParameterName = config.idParameterName ?? 'id';
    const id = route.params[idParameterName];

    if (!id) {
      return false;
    }

    if (_auth.hasRight('admin-no-multitenancy')) {
      return true;
    }

    const entity$ = runInInjectionContext(_injector, () => config.getEntity(id)) as Observable<{
      attributes?: Record<string, string>;
    }>;
    return entity$.pipe(
      switchMap((entity) => {
        if (_multipleProjects.isEntityBelongsToCurrentProject(entity)) {
          return of(true);
        }

        const entityEditLink = runInInjectionContext(_injector, () => config.getEditorUrl(id, route));
        return _multipleProjects.confirmEntityEditInASeparateProject(entity, entityEditLink, config.entityType);
      }),
    );
  };
