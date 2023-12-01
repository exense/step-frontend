import { NgModule } from '@angular/core';
import { EntityRegistry, SimpleOutletComponent, StepCoreModule, ViewRegistryService } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { AutomationPackagesListComponent } from './components/automation-packages-list/automation-packages-list.component';
import { ENTITY_ID, ICON, LABEL_ENTITY, LABEL_MENU } from './types/constants';
import { AutomationPackageUploadDialogComponent } from './components/automation-package-upload-dialog/automation-package-upload-dialog.component';

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
    this._viewRegistry.registerRoute({
      path: ENTITY_ID,
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
        },
      ],
    });
  }

  private registerMenuEntries(): void {
    this._viewRegistry.registerMenuEntry(LABEL_MENU, ENTITY_ID, ICON, {
      parentId: 'automation-root',
      weight: 10,
    });
  }
}
