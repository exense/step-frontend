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
  IsUsedByDialogService,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { AutomationPackageResourceRefreshResultDialogComponent } from '../automation-package-resource-refresh-result-dialog/automation-package-resource-refresh-result-dialog.component';
import { filter, switchMap } from 'rxjs';
import { AP_RESOURCE_LIBRARY_FILTER } from '../../types/constants';
import { ActivatedRoute } from '@angular/router';
import { AutomationPackageResourceType } from '../../types/automation-package-resource-type.enum';

@Component({
  selector: 'step-automation-package-library-list',
  imports: [StepCoreModule, EntityRefDirective],
  templateUrl: './automation-package-library-list.component.html',
  styleUrl: './automation-package-library-list.component.scss',
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedResourcesService.RESOURCES_TABLE_ID,
    }),
    tablePersistenceConfigProvider('automationPackagesResourceList', STORE_ALL),
    ...entitySelectionStateProvider<string, Resource>('id'),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => AutomationPackageLibraryListComponent),
    },
  ],
})
export class AutomationPackageLibraryListComponent implements DialogParentService {
  private _automationPackageApi = inject(AugmentedAutomationPackagesService);
  private _resourcesService = inject(AugmentedResourcesService);
  private _resourceDialogs = inject(ResourceDialogsService);
  private _dialogs = inject(DialogsService);
  private _matDialog = inject(MatDialog);
  private _isUsedBy = inject(IsUsedByDialogService);

  protected readonly _activatedRoute = inject(ActivatedRoute);
  protected readonly AP_RESOURCE_LIBRARY_FILTER = AP_RESOURCE_LIBRARY_FILTER;
  protected readonly dataSource = this._resourcesService.createDataSource();

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  protected deleteResource(id: string, label: string): void {
    this._dialogs
      .showDeleteWarning(1, `Library "${label}"`)
      .pipe(
        filter((result) => result),
        switchMap(() => this._automationPackageApi.deleteAutomationPackageResource(id)),
      )
      .subscribe(() => this.dataSource.reload());
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

  protected searchUsages(resource: Resource): void {
    this._isUsedBy.displayDialog(resource.resourceName || '', 'AUTOMATION_PACKAGE', resource.id!);
  }

  protected readonly AutomationPackageResourceType = AutomationPackageResourceType;
}
