import { Component, effect, forwardRef, inject, OnInit, viewChild } from '@angular/core';
import {
  AugmentedAutomationPackagesService,
  AutoDeselectStrategy,
  AutomationPackage,
  DialogParentService,
  selectionCollectionProvider,
  StepCoreModule,
  STORE_ALL,
  tableColumnsConfigProvider,
  TableComponent,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ENTITY_ID } from '../../types/constants';
import { AutomationPackagesActionsService } from '../../injectables/automation-packages-actions.service';
import { map, Observable, of } from 'rxjs';
import { AutomationPackagePermission } from '../../types/automation-package-permission.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { ExecutionModule } from '../../../execution/execution.module';

@Component({
  selector: 'step-automation-package-list',
  templateUrl: './automation-package-list.component.html',
  styleUrls: ['./automation-package-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedAutomationPackagesService.AUTOMATION_PACKAGE_TABLE_ID,
    }),
    tablePersistenceConfigProvider('automationPackagesList', STORE_ALL),
    selectionCollectionProvider<string, AutomationPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => AutomationPackageListComponent),
    },
  ],
  imports: [StepCoreModule, ExecutionModule],
})
export class AutomationPackageListComponent implements OnInit, DialogParentService {
  private _actions = inject(AutomationPackagesActionsService);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  readonly _dataSource = inject(AugmentedAutomationPackagesService).createDataSource();

  readonly ENTITY_ID = ENTITY_ID;

  readonly AutomationPackagePermission = AutomationPackagePermission;

  protected isReady = false;

  private automationPackageFileName?: string;
  private table = viewChild('table', { read: TableComponent<AutomationPackage> });

  private effectTableChange = effect(() => {
    const table = this.table();
    if (table && this.automationPackageFileName) {
      table?.onSearch('fileName', this.automationPackageFileName);
      this.automationPackageFileName = undefined;
    }
  });

  readonly returnParentUrl = this._actions.rootUrl;

  dialogSuccessfullyClosed(): void {
    this._dataSource.reload();
  }

  ngOnInit(): void {
    this.getAutomationPackageFileFilter().subscribe((automationPackageFileName) => {
      this.automationPackageFileName = automationPackageFileName;
      this.isReady = true;
    });
  }

  protected createPackage(): void {
    this._actions.createAutomationPackage();
  }

  protected executePackage(automationPackage: AutomationPackage): void {
    this._actions.executeAutomationPackage(automationPackage);
  }

  protected editPackage(automationPackage: AutomationPackage): void {
    this._actions.editAutomationPackage(automationPackage);
  }

  protected showEntities(automationPackage: AutomationPackage): void {
    this._actions.showAutomationPackageEntities(automationPackage);
  }

  protected deletePackage(automationPackage: AutomationPackage): void {
    this._actions.deleteAutomationPackage(automationPackage).subscribe((isSuccess) => {
      if (isSuccess) {
        this._dataSource.reload();
      }
    });
  }

  private getAutomationPackageFileFilter(): Observable<string | undefined> {
    const automationPackageFileName = this._activatedRoute.snapshot.queryParams?.['automationPackageFileName'];
    if (!automationPackageFileName) {
      return of(undefined);
    }
    return fromPromise(
      this._router.navigate([], {
        queryParams: { automationPackageFileName: undefined },
        queryParamsHandling: 'merge',
        relativeTo: this._activatedRoute,
      }),
    ).pipe(map(() => automationPackageFileName));
  }
}
