import { Component, inject, TrackByFunction } from '@angular/core';
import {
  AppConfigContainerService,
  AuthService,
  BookmarkCreateDialogComponent,
  Dashlet,
  ViewRegistryService,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'step-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
})
export class MainViewComponent {
  private _viewRegistry = inject(ViewRegistryService);
  private _matDialog = inject(MatDialog);
  readonly _appConfig = inject(AppConfigContainerService);
  readonly _authService = inject(AuthService);

  readonly navBarRightMenuItems = this._viewRegistry.getDashlets('menu/navbar/right');
  readonly adminAlerts = this._viewRegistry.getDashlets('admin/alerts');

  readonly trackByDashlet: TrackByFunction<Dashlet> = (index, item) => item.id;

  addBookmark(): void {
    this._matDialog.open(BookmarkCreateDialogComponent);
  }
}
