import { Component, inject } from '@angular/core';
import {
  DashboardsService,
  DashboardView,
  DialogsService,
  StepDataSource,
  TableRemoteDataSourceFactoryService,
} from '@exense/step-core';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'step-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss'],
})
export class DashboardListComponent {
  private readonly TABLE_ID = 'dashboards';
  private _matDialog = inject(MatDialog);
  private readonly _dialogs = inject(DialogsService);
  private readonly _router = inject(Router);
  private readonly _dashboardsService = inject(DashboardsService);
  private readonly _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  readonly dataSource: StepDataSource<DashboardView> = this._dataSourceFactory.createDataSource(this.TABLE_ID, {
    name: 'name',
    description: 'description',
    actions: '',
  });

  createDashboardModel: DashboardView = this.createEmptyDashboardObject();

  openDialog(template: any) {
    this._matDialog.open(template);
  }

  saveNewDashboard(edit = false) {
    this._dashboardsService.saveDashboard(this.createDashboardModel).subscribe((dashboard) => {
      if (edit) {
        this.navigateToDashboard(dashboard, true);
      } else {
        this.dataSource.reload();
      }
      this._matDialog.closeAll();
      this.createDashboardModel = this.createEmptyDashboardObject();
    });
  }

  private createEmptyDashboardObject(): DashboardView {
    return {
      name: '',
      timeRange: { type: 'RELATIVE', relativeSelection: { timeInMs: 3600_000 } },
      grouping: [],
      filters: [],
      dashlets: [],
    };
  }

  delete(dashboard: DashboardView) {
    this._dialogs
      .showDeleteWarning(1, `Dashboard "${dashboard.name}"`)
      .pipe(
        filter((confirm) => confirm),
        catchError(() => of(false)),
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._dashboardsService.deleteDashboard(dashboard.id!).pipe(map(() => true)) : of(false)
        )
      )
      .subscribe((deleteConfirmed) => {
        if (deleteConfirmed) {
          this.dataSource.reload();
        }
      });
  }

  navigateToDashboard(dashboard: DashboardView, editMode = false) {
    if (dashboard.metadata?.['isLegacy']) {
      const link = dashboard.metadata?.['link'];
      if (link) {
        this._router.navigate(['root', link]);
      } else {
        console.error('No link specified for dashboard');
      }
    } else {
      this._router.navigate(['root', 'dashboards', dashboard.id], {
        queryParams: { edit: editMode ? '1' : '0' },
        queryParamsHandling: 'merge',
      });
    }
  }
}
