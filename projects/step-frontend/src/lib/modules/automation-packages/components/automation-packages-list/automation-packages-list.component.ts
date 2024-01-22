import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  AutoDeselectStrategy,
  AutomationPackage,
  selectionCollectionProvider,
  STORE_ALL,
  TableComponent,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ENTITY_ID } from '../../types/constants';
import { AutomationPackagesDialogsService } from '../../injectables/automation-packages-dialogs.service';
import { filter, map, pipe, Subject, takeUntil, tap } from 'rxjs';
import { AutomationPackagePermission } from '../../types/automation-package-permission.enum';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-automation-packages-list',
  templateUrl: './automation-packages-list.component.html',
  styleUrls: ['./automation-packages-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('automationPackagesList', STORE_ALL),
    selectionCollectionProvider<string, AutomationPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class AutomationPackagesListComponent implements AfterViewInit, OnDestroy {
  private _dialogs = inject(AutomationPackagesDialogsService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  readonly _dataSource = inject(AugmentedAutomationPackagesService).createDataSource();

  readonly ENTITY_ID = ENTITY_ID;

  readonly AutomationPackagePermission = AutomationPackagePermission;

  private terminator$ = new Subject<void>();

  @ViewChild('table', { static: true })
  private table?: TableComponent<AutomationPackage>;

  private updateDataSourceAfterChange = pipe(
    tap((changeResult?: boolean) => {
      if (changeResult) {
        this._dataSource.reload();
      }
    })
  );

  ngAfterViewInit(): void {
    this._dialogs.resolveEditLinkIfExists().pipe(this.updateDataSourceAfterChange).subscribe();
    this.predefineAutomationPackageFileFilter();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
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

  private predefineAutomationPackageFileFilter(): void {
    this._activatedRoute.queryParams
      .pipe(
        map((params) => params?.['automationPackageFileName']),
        filter((automationPackageFileName) => !!automationPackageFileName),
        takeUntil(this.terminator$)
      )
      .subscribe((automationPackageFileName) => {
        this.table?.onSearch('fileName', automationPackageFileName);
        this._router.navigate([], {
          queryParams: { automationPackageFileName: undefined },
          queryParamsHandling: 'merge',
          relativeTo: this._activatedRoute,
        });
      });
  }
}
