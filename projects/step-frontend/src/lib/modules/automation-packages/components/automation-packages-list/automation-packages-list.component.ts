import { AfterViewInit, Component, forwardRef, inject, OnDestroy, ViewChild } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  AutoDeselectStrategy,
  AutomationPackage,
  DialogParentService,
  selectionCollectionProvider,
  STORE_ALL,
  TableComponent,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ENTITY_ID } from '../../types/constants';
import { AutomationPackagesActionsService } from '../../injectables/automation-packages-actions.service';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { AutomationPackagePermission } from '../../types/automation-package-permission.enum';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-automation-packages-list',
  templateUrl: './automation-packages-list.component.html',
  styleUrls: ['./automation-packages-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('automationPackagesList', STORE_ALL),
    selectionCollectionProvider<string, AutomationPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => AutomationPackagesListComponent),
    },
  ],
})
export class AutomationPackagesListComponent implements AfterViewInit, OnDestroy, DialogParentService {
  private _actions = inject(AutomationPackagesActionsService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  readonly _dataSource = inject(AugmentedAutomationPackagesService).createDataSource();

  readonly ENTITY_ID = ENTITY_ID;

  readonly AutomationPackagePermission = AutomationPackagePermission;

  private terminator$ = new Subject<void>();

  @ViewChild('table', { static: true })
  private table?: TableComponent<AutomationPackage>;

  readonly returnParentUrl = this._actions.rootUrl;

  dialogSuccessfullyClosed(): void {
    this._dataSource.reload();
  }

  ngAfterViewInit(): void {
    this.predefineAutomationPackageFileFilter();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  createPackage(): void {
    this._actions.createAutomationPackage();
  }

  editPackage(automationPackage: AutomationPackage): void {
    this._actions.editAutomationPackage(automationPackage);
  }

  deletePackage(automationPackage: AutomationPackage): void {
    this._actions.deleteAutomationPackage(automationPackage).subscribe((isSuccess) => {
      if (isSuccess) {
        this._dataSource.reload();
      }
    });
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
