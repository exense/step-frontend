import { APP_INITIALIZER, FactoryProvider, inject, Injector, runInInjectionContext } from '@angular/core';
import { ENTITY_ID, ICON, LABEL_ENTITY, LABEL_MENU, PATH } from './types/constants';
import {
  AugmentedAutomationPackagesService,
  dialogRoute,
  EntityRegistry,
  InfoBannerService,
  SimpleOutletComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { AutomationPackageListComponent } from './components/automation-package-list/automation-package-list.component';
import { AutomationPackageUploadDialogComponent } from './components/automation-package-upload-dialog/automation-package-upload-dialog.component';
import { ActivatedRouteSnapshot } from '@angular/router';
import { AutomationPackageExecutionDialogComponent } from './components/automation-package-execution-dialog/automation-package-execution-dialog.component';
import { AutomationPackageEntitiesDialogComponent } from './components/automation-package-entities-dialog/automation-package-entities-dialog.component';

const registerEntities = () => {
  const _entityRegistry = inject(EntityRegistry);
  _entityRegistry.register(ENTITY_ID, LABEL_ENTITY, { icon: ICON });
};

const registerRoutes = () => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerRoute(
    {
      path: PATH,
      component: SimpleOutletComponent,
      children: [
        {
          path: '',
          redirectTo: 'list',
          pathMatch: 'full',
        },
        {
          path: 'list',
          component: AutomationPackageListComponent,
          children: [
            {
              path: 'upload',
              component: SimpleOutletComponent,
              children: [
                dialogRoute({
                  path: 'new',
                  dialogComponent: AutomationPackageUploadDialogComponent,
                }),
                dialogRoute({
                  path: ':id',
                  dialogComponent: AutomationPackageUploadDialogComponent,
                  resolve: {
                    automationPackage: (route: ActivatedRouteSnapshot) =>
                      inject(AugmentedAutomationPackagesService).getAutomationPackage(route.params['id']),
                  },
                }),
              ],
            },
            dialogRoute({
              path: 'execute/:id',
              dialogComponent: AutomationPackageExecutionDialogComponent,
              resolve: {
                automationPackage: (route: ActivatedRouteSnapshot) =>
                  inject(AugmentedAutomationPackagesService).getAutomationPackage(route.params['id']),
              },
            }),
            dialogRoute(
              {
                path: 'entities/:id',
                dialogComponent: AutomationPackageEntitiesDialogComponent,
                resolve: {
                  automationPackageId: (route: ActivatedRouteSnapshot) => route.params['id'],
                },
              },
              {
                minWidth: '20rem',
                width: '40%',
              },
            ),
          ],
        },
      ],
    },
    { accessPermissions: ['automation-package-read'] },
  );
};

const registerMenuEntries = () => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerMenuEntry(LABEL_MENU, PATH, ICON, {
    parentId: 'automation-root',
    weight: 100,
  });
};

const registerInfoBanners = () => {
  const _infoBannerService = inject(InfoBannerService);
};

export const AUTOMATION_PACKAGE_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    const _injector = inject(Injector);
    return () => {
      runInInjectionContext(_injector, registerEntities);
      runInInjectionContext(_injector, registerRoutes);
      runInInjectionContext(_injector, registerMenuEntries);
      runInInjectionContext(_injector, registerInfoBanners);
    };
  },
  multi: true,
};
