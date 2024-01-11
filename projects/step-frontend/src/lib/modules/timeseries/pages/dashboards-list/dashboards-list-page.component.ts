import { Component, inject, OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  a1Promise2Observable,
  DashboardsService,
  DashboardView,
  DialogsService,
  StepDataSource,
  TableRemoteDataSourceFactoryService,
} from '@exense/step-core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'step-dashboards-list-page',
  templateUrl: './dashboards-list-page.component.html',
  styleUrls: ['./dashboards-list-page.component.scss'],
})
export class DashboardsListPageComponent {
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
    this._dashboardsService.saveEntity5(this.createDashboardModel).subscribe((dashboard) => {
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
        map(() => true),
        catchError(() => of(false)),
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._dashboardsService.deleteEntity5(dashboard.id!).pipe(map(() => true)) : of(false)
        )
      )
      .subscribe(() => this.dataSource.reload());
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
