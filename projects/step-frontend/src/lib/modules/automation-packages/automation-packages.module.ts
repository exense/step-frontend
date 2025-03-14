import { inject, NgModule } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  dialogRoute,
  EntityRegistry,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
  InfoBannerService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { AutomationPackageListComponent } from './components/automation-package-list/automation-package-list.component';
import { ENTITY_ID, ICON, LABEL_ENTITY, LABEL_MENU, PATH } from './types/constants';
import { AutomationPackageUploadDialogComponent } from './components/automation-package-upload-dialog/automation-package-upload-dialog.component';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ExecutionModule } from '../execution/execution.module';
import { AutomationPackageExecutionDialogComponent } from './components/automation-package-execution-dialog/automation-package-execution-dialog.component';

@NgModule({
  declarations: [
    AutomationPackageListComponent,
    AutomationPackageUploadDialogComponent,
    AutomationPackageExecutionDialogComponent,
  ],
  imports: [StepCommonModule, StepCoreModule, ExecutionModule],
})
export class AutomationPackagesModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _viewRegistry: ViewRegistryService,
    private _infoBanner: InfoBannerService,
  ) {
    this.registerEntities();
    this.registerRoutes();
    this.registerMenuEntries();
    this.registerInfoBanners();
  }

  private registerEntities(): void {
    this._entityRegistry.register(ENTITY_ID, LABEL_ENTITY, { icon: ICON });
  }

  private registerRoutes(): void {
    this._viewRegistry.registerRoute(
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
            ],
          },
        ],
      },
      { accessPermissions: ['automation-package-read'] },
    );
  }

  private registerMenuEntries(): void {
    this._viewRegistry.registerMenuEntry(LABEL_MENU, PATH, ICON, {
      parentId: 'automation-root',
      weight: 100,
    });
  }

  private registerInfoBanners(): void {}
}
