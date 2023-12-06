import { AfterViewInit, Component, inject } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  AutoDeselectStrategy,
  AutomationPackage,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ENTITY_ID } from '../../types/constants';
import { AutomationPackagesDialogsService } from '../../injectables/automation-packages-dialogs.service';
import { pipe, tap } from 'rxjs';
import { AutomationPackagePermission } from '../../types/automation-package-permission.enum';

@Component({
  selector: 'step-automation-packages-list',
  templateUrl: './automation-packages-list.component.html',
  styleUrls: ['./automation-packages-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('automationPackagesList', STORE_ALL),
    selectionCollectionProvider<string, AutomationPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class AutomationPackagesListComponent implements AfterViewInit {
  private _dialogs = inject(AutomationPackagesDialogsService);
  readonly _dataSource = inject(AugmentedAutomationPackagesService).createDataSource();

  readonly ENTITY_ID = ENTITY_ID;

  readonly AutomationPackagePermission = AutomationPackagePermission;

  private updateDataSourceAfterChange = pipe(
    tap((changeResult?: boolean) => {
      if (changeResult) {
        this._dataSource.reload();
      }
    })
  );

  ngAfterViewInit(): void {
    this._dialogs.resolveEditLinkIfExists().pipe(this.updateDataSourceAfterChange).subscribe();
  }

  createPackage(): void {
    this._dialogs.createAutomationPackage().pipe(this.updateDataSourceAfterChange).subscribe();
  }

  editPackage(automationPackage: AutomationPackage): void {
    this._dialogs.editAutomationPackage(automationPackage).pipe(this.updateDataSourceAfterChange).subscribe();
  }

  deletePackage(automationPackage: AutomationPackage): void {
    this._dialogs.deleteAutomationPackage(automationPackage).pipe(this.updateDataSourceAfterChange).subscribe();
  }
}
