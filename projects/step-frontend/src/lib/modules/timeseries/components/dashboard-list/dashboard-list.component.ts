import { Component, forwardRef, inject } from '@angular/core';
import {
  AugmentedDashboardsService,
  AutoDeselectStrategy,
  DashboardView,
  DialogParentService,
  DialogsService,
  entitySelectionStateProvider,
  Plan,
  selectionCollectionProvider,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { COMMON_IMPORTS, TimeSeriesConfig } from '../../modules/_common';
import { Params } from '@angular/router';

@Component({
  selector: 'step-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss'],
  imports: [COMMON_IMPORTS],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedDashboardsService.TABLE_ID,
    }),
    tablePersistenceConfigProvider('analyticsDashboard', STORE_ALL),
    ...entitySelectionStateProvider<string, DashboardView>('id'),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => DashboardListComponent),
    },
  ],
})
export class DashboardListComponent implements DialogParentService {
  private readonly _dialogs = inject(DialogsService);
  private readonly _dashboardsService = inject(AugmentedDashboardsService);
  readonly dataSource = this._dashboardsService.createDataSource();

  readonly editModeParams: Params = {
    [`${TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX}edit`]: '1',
  };

  readonly returnParentUrl = '/dashboards';

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  duplicateDashboard(id: string): void {
    this._dashboardsService.cloneDashboard(id).subscribe(() => {
      this.dataSource.reload();
    });
  }

  delete(dashboard: DashboardView) {
    this._dialogs
      .showDeleteWarning(1, `Dashboard "${dashboard.attributes?.['name']}"`)
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
}
