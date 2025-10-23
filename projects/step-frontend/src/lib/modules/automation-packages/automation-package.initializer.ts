import { APP_INITIALIZER, FactoryProvider, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  EDITOR_PATH,
  AP_ENTITY_ID,
  AP_ICON,
  AP_LABEL_ENTITY,
  LABEL_MENU,
  PATH,
  REGEX_EDITOR,
  AP_RESOURCE_ENTITY_ID,
  AP_RESOURCE_LABEL_ENTITY,
  AP_RESOURCE_ICON,
} from './types/constants';
import {
  AugmentedAutomationPackagesService,
  AutomationPackageEntityTableRegistryService,
  checkEntityGuardFactory,
  dialogRoute,
  EntityRegistry,
  InfoBannerService,
  MultipleProjectsService,
  SimpleOutletComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { AutomationPackageListComponent } from './components/automation-package-list/automation-package-list.component';
import { AutomationPackageUploadDialogComponent } from './components/automation-package-upload-dialog/automation-package-upload-dialog.component';
import { ActivatedRouteSnapshot } from '@angular/router';
import { AutomationPackageExecutionDialogComponent } from './components/automation-package-execution-dialog/automation-package-execution-dialog.component';
import { AutomationPackageEntitiesDialogComponent } from './components/automation-package-entities-dialog/automation-package-entities-dialog.component';
import { AutomationPackageEntityKey } from './types/automation-package-entity-key.enum';
import { TablePlansComponent } from './components/table-plans/table-plans.component';
import { TableKeywordsComponent } from './components/table-keywords/table-keywords.component';
import { TableParametersComponent } from './components/table-parameters/table-parameters.component';
import { TableTasksComponent } from './components/table-tasks/table-tasks.component';
import { AutomationPackagesBulkOperationsRegisterService } from './injectables/automation-packages-bulk-operations-register.service';
import { AutomationPackageResourceListComponent } from './components/automation-package-resource-list/automation-package-resource-list.component';

const registerEntities = () => {
  const _entityRegistry = inject(EntityRegistry);
  _entityRegistry.register(AP_ENTITY_ID, AP_LABEL_ENTITY, { icon: AP_ICON });
  _entityRegistry.register(AP_RESOURCE_ENTITY_ID, AP_RESOURCE_LABEL_ENTITY, { icon: AP_RESOURCE_ICON });
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
                  canActivate: [
                    checkEntityGuardFactory({
                      entityType: AP_ENTITY_ID,
                      getEntity: (id) => inject(AugmentedAutomationPackagesService).getAutomationPackageCached(id),
                      getEditorUrl: (id) => `${EDITOR_PATH}/${id}`,
                      isMatchEditorUrl: (url) => REGEX_EDITOR.test(url),
                      getListUrl: () => `/${PATH}/list`,
                    }),
                  ],
                  resolve: {
                    automationPackage: (route: ActivatedRouteSnapshot) =>
                      inject(AugmentedAutomationPackagesService).getAutomationPackageCached(route.params['id']),
                  },
                  canDeactivate: [
                    () => {
                      inject(AugmentedAutomationPackagesService).clearCache();
                      inject(MultipleProjectsService).cleanupProjectMessage();
                      return true;
                    },
                  ],
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
        {
          path: 'resources',
          component: AutomationPackageResourceListComponent,
        },
      ],
    },
    { accessPermissions: ['automation-package-read'] },
  );
};

const registerMenuEntries = () => {
  const _viewRegistry = inject(ViewRegistryService);
  _viewRegistry.registerMenuEntry(LABEL_MENU, PATH, AP_ICON, {
    parentId: 'automation-root',
    weight: 100,
  });
};

const registerInfoBanners = () => {
  const _infoBannerService = inject(InfoBannerService);
};

const registerEntityTables = () => {
  const _entityTableRegistry = inject(AutomationPackageEntityTableRegistryService);
  _entityTableRegistry.register(AutomationPackageEntityKey.PLANS, 'Plans', TablePlansComponent);
  _entityTableRegistry.register(AutomationPackageEntityKey.KEYWORDS, 'Keywords', TableKeywordsComponent);
  _entityTableRegistry.register(AutomationPackageEntityKey.PARAMETERS, 'Parameters', TableParametersComponent);
  _entityTableRegistry.register(AutomationPackageEntityKey.SCHEDULES, 'Tasks', TableTasksComponent);
};

const registerBulkOperations = () => inject(AutomationPackagesBulkOperationsRegisterService).register();

export const AUTOMATION_PACKAGE_INITIALIZER: FactoryProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    const _injector = inject(Injector);
    return () => {
      runInInjectionContext(_injector, registerBulkOperations);
      runInInjectionContext(_injector, registerEntities);
      runInInjectionContext(_injector, registerRoutes);
      runInInjectionContext(_injector, registerMenuEntries);
      runInInjectionContext(_injector, registerInfoBanners);
      runInInjectionContext(_injector, registerEntityTables);
    };
  },
  multi: true,
};
