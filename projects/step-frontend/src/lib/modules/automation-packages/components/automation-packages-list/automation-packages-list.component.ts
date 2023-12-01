import { Component, inject } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  AutoDeselectStrategy,
  AutomationPackage,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ENTITY_ID } from '../../types/constants';
import { MatDialog } from '@angular/material/dialog';
import { AutomationPackageUploadDialogComponent } from '../automation-package-upload-dialog/automation-package-upload-dialog.component';

@Component({
  selector: 'step-automation-packages-list',
  templateUrl: './automation-packages-list.component.html',
  styleUrls: ['./automation-packages-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('automationPackagesList', STORE_ALL),
    selectionCollectionProvider<string, AutomationPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class AutomationPackagesListComponent {
  private _matDialog = inject(MatDialog);
  private _api = inject(AugmentedAutomationPackagesService);
  readonly dataSource = this._api.createDataSource();
  readonly ENTITY_ID = ENTITY_ID;

  uploadPackage(): void {
    this._matDialog
      .open(AutomationPackageUploadDialogComponent)
      .afterClosed()
      .subscribe((packageId) => {
        if (packageId) {
          this.dataSource.reload();
        }
      });
  }

  deletePackage(automationPackage: AutomationPackage): void {
    const name = automationPackage.attributes?.['name'] ?? '';
    if (!name) {
      return;
    }
    this._api.deleteAutomationPackage(name).subscribe(() => this.dataSource.reload());
  }
}
