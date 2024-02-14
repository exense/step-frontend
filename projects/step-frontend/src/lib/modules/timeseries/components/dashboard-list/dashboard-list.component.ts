import { Component, forwardRef, inject } from '@angular/core';
import {
  DashboardsService,
  DashboardView,
  DialogParentService,
  DialogsService,
  StepDataSource,
  STORE_ALL,
  tablePersistenceConfigProvider,
  TableRemoteDataSourceFactoryService,
} from '@exense/step-core';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { DashboardNavigatorService } from '../../injectables/dashboard-navigator.service';
import { COMMON_IMPORTS } from '../../modules/_common';

@Component({
  selector: 'step-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
  providers: [
    tablePersistenceConfigProvider('analyticsDashboard', STORE_ALL),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => DashboardListComponent),
    },
  ],
})
export class DashboardListComponent implements DialogParentService {
  private readonly TABLE_ID = 'dashboards';
  private readonly _dialogs = inject(DialogsService);
  private _dashboardNavigator = inject(DashboardNavigatorService);
  private readonly _dashboardsService = inject(DashboardsService);
  private readonly _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  readonly dataSource: StepDataSource<DashboardView> = this._dataSourceFactory.createDataSource(this.TABLE_ID, {
    name: 'name',
    description: 'description',
    actions: '',
  });

  readonly returnParentUrl = '/dashboards';

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  createNewDashboard(): void {
    this._dashboardNavigator.createDashboard();
  }

  delete(dashboard: DashboardView) {
    this._dialogs
      .showDeleteWarning(1, `Dashboard "${dashboard.name}"`)
      .pipe(
        filter((confirm) => confirm),
        catchError(() => of(false)),
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._dashboardsService.deleteDashboard(dashboard.id!).pipe(map(() => true)) : of(false),
        ),
      )
      .subscribe((deleteConfirmed) => {
        if (deleteConfirmed) {
          this.dataSource.reload();
        }
      });
  }

  navigateToDashboard(dashboard: DashboardView, editMode = false): void {
    this._dashboardNavigator.navigateToDashboard(dashboard, editMode);
  }
}
