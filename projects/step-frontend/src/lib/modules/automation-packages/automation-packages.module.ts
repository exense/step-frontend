import { inject, NgModule } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  dialogRoute,
  EntityRegistry,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { AutomationPackagesListComponent } from './components/automation-packages-list/automation-packages-list.component';
import { ENTITY_ID, ICON, LABEL_ENTITY, LABEL_MENU, PATH } from './types/constants';
import { AutomationPackageUploadDialogComponent } from './components/automation-package-upload-dialog/automation-package-upload-dialog.component';
import { ActivatedRouteSnapshot } from '@angular/router';

@NgModule({
  declarations: [AutomationPackagesListComponent, AutomationPackageUploadDialogComponent],
  imports: [StepCommonModule, StepCoreModule],
})
export class AutomationPackagesModule {
  constructor(private _entityRegistry: EntityRegistry, private _viewRegistry: ViewRegistryService) {
    this.registerEntities();
    this.registerRoutes();
    this.registerMenuEntries();
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
            component: AutomationPackagesListComponent,
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
            ],
          },
        ],
      },
      { accessPermissions: ['automation-package-read'] }
    );
  }

  private registerMenuEntries(): void {
    this._viewRegistry.registerMenuEntry(LABEL_MENU, PATH, ICON, {
      parentId: 'automation-root',
      weight: 100,
    });
  }
}
