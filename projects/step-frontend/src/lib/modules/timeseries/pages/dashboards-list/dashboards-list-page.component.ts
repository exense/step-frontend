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

@Component({
  selector: 'step-dashboards-list-page',
  templateUrl: './dashboards-list-page.component.html',
  styleUrls: ['./dashboards-list-page.component.scss'],
})
export class DashboardsListPageComponent {
  private readonly TABLE_ID = 'dashboards';
  private readonly _dialogs = inject(DialogsService);
  private readonly _router = inject(Router);
  private readonly _dashboardsService = inject(DashboardsService);
  private readonly _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  readonly dataSource: StepDataSource<DashboardView> = this._dataSourceFactory.createDataSource(this.TABLE_ID, {
    name: 'name',
    description: 'description',
    actions: '',
  });

  delete(dashboard: DashboardView) {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Dashboard "${dashboard.name}"`))
      .pipe(
        map(() => true),
        catchError(() => of(false)),
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._dashboardsService.deleteEntity5(dashboard.id!).pipe(map(() => true)) : of(false)
        )
      )
      .subscribe();
  }

  navigateToDashboard(id: string, editMode = false) {
    this._router.navigate(['root', 'dashboards', id]);
  }
}
