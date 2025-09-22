import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { CheckLoadErrorsConfig, EntityEditLink, MultipleProjectsService } from '../modules/basics/step-basics.module';
import { AuthService } from '../modules/auth';
import { DEFAULT_PAGE } from '../modules/routing';

export interface CheckProjectGuardConfig {
  entityType: string;
  idParameterName?: string;
  idExtractor?: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => string;
  getListUrl?: () => string;
  isMatchEditorUrl?: (url: string) => boolean;
  getEditorUrl: (id: string, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => EntityEditLink;
  getEntity: (id: string) => Observable<unknown>;
}

export const checkEntityGuardFactory =
  (config: CheckProjectGuardConfig): CanActivateFn =>
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const _auth = inject(AuthService);
    const _multipleProjects = inject(MultipleProjectsService);
    const _injector = inject(Injector);
    const _router = inject(Router);
    const _defaultPage = inject(DEFAULT_PAGE);

    const idParameterName = config.idParameterName ?? 'id';
    const id = config.idExtractor ? config.idExtractor(route, state) : route.params[idParameterName];

    if (!id) {
      const path = route.pathFromRoot
        .flatMap((item) => item.url)
        .filter((item) => !!item)
        .join('/');
      console.warn(`Entity id of type "${config.entityType}" not found for route ${path}`);
      return false;
    }

    const entity$ = runInInjectionContext(_injector, () => config.getEntity(id)) as Observable<{
      attributes?: Record<string, string>;
    }>;

    let isMatchEditorUrl: CheckLoadErrorsConfig['isMatchEditorUrl'] = undefined;
    if (config.isMatchEditorUrl) {
      isMatchEditorUrl = (url) => runInInjectionContext(_injector, () => config.isMatchEditorUrl!(url));
    }

    let getListUrl: CheckLoadErrorsConfig['getListUrl'] = undefined;
    if (config.getListUrl) {
      getListUrl = () => runInInjectionContext(_injector, () => config.getListUrl!());
    }

    const loadErrorsConfig: CheckLoadErrorsConfig = {
      entityType: config.entityType,
      entityId: id,
      routerState: state,
      isMatchEditorUrl,
      getListUrl,
    };

    return entity$.pipe(
      _multipleProjects.checkLoadErrors(loadErrorsConfig),
      map((entityOrUrl) => {
        if (!entityOrUrl) {
          return false;
        }

        if (typeof entityOrUrl === 'string') {
          return _router.parseUrl(entityOrUrl);
        }

        const entity = entityOrUrl;

        if (_auth.hasRight('admin-no-multitenancy')) {
          return true;
        }

        if (_multipleProjects.isEntityBelongsToCurrentProject(entity)) {
          return true;
        }

        const entityEditLink = runInInjectionContext(_injector, () => config.getEditorUrl(id, route, state));

        if (_multipleProjects.isProjectAvailable(entity)) {
          const targetProject = _multipleProjects.getProject(entity);

          let openUrl = '';
          if (targetProject) {
            openUrl = _multipleProjects.getUrlForProject(
              targetProject,
              typeof entityEditLink === 'string' ? { url: entityEditLink } : entityEditLink,
            );
          }

          let message = `This entity doesn't belong to the current project.`;
          if (openUrl) {
            message += ` <a href="#${openUrl}">Open it in the "${targetProject!.name!}" project.</a>`;
          }

          _multipleProjects.showProjectMessage({
            icon: 'alert-triangle',
            message,
          });

          return true;
        }
        return false;
      }),
      map((result) => {
        const emptyUrls = ['', '/', '/login'];
        if (!result && emptyUrls.includes(_router.url)) {
          return _router.parseUrl(_defaultPage());
        }
        return result;
      }),
    );
  };
