import { Component, forwardRef, inject } from '@angular/core';
import {
  AugmentedResourcesService,
  EntityRefDirective,
  StepCoreModule,
  Resource,
  AugmentedAutomationPackagesService,
  ResourceDialogsService,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
  entitySelectionStateProvider,
  DialogsService,
  DialogParentService,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { AutomationPackageResourceRefreshResultDialogComponent } from '../automation-package-resource-refresh-result-dialog/automation-package-resource-refresh-result-dialog.component';
import { filter, switchMap } from 'rxjs';
import { AP_RESOURCE_FILTER } from '../../types/constants';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'step-automation-package-resource-list',
  imports: [StepCoreModule, EntityRefDirective],
  templateUrl: './automation-package-resource-list.component.html',
  styleUrl: './automation-package-resource-list.component.scss',
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedResourcesService.RESOURCES_TABLE_ID,
    }),
    tablePersistenceConfigProvider('automationPackagesResourceList', STORE_ALL),
    ...entitySelectionStateProvider<string, Resource>('id'),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => AutomationPackageResourceListComponent),
    },
  ],
})
export class AutomationPackageResourceListComponent implements DialogParentService {
  private _automationPackageApi = inject(AugmentedAutomationPackagesService);
  private _resourcesService = inject(AugmentedResourcesService);
  private _resourceDialogs = inject(ResourceDialogsService);
  private _dialogs = inject(DialogsService);
  private _matDialog = inject(MatDialog);

  protected readonly _activatedRoute = inject(ActivatedRoute);
  protected readonly AP_RESOURCE_FILTER = AP_RESOURCE_FILTER;
  protected readonly dataSource = this._resourcesService.createDataSource();

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  protected deleteResource(id: string, label: string): void {
    this._dialogs.showDeleteWarning(1, `Resource "${label}"`).pipe(
      filter((result) => result),
      switchMap(() => this._automationPackageApi.deleteAutomationPackageResource(id)),
    );
  }

  protected downloadResource(id: string): void {
    this._resourceDialogs.downloadResource(id);
  }

  protected refreshResource(resource: Resource): void {
    this._automationPackageApi.refreshAutomationPackageResource(resource.id!).subscribe((result) => {
      if (!result?.resultStatus && !result?.errorMessages?.length && !result?.infoMessages?.length) {
        return;
      }
      this._matDialog.open(AutomationPackageResourceRefreshResultDialogComponent, { data: result });
    });
  }
}
