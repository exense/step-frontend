import { Component, inject, TrackByFunction } from '@angular/core';
import {
  AppConfigContainerService,
  AuthService,
  BookmarkCreateDialogComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { UserStateService } from '../../modules/admin/admin.module';

@Component({
  selector: 'step-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  providers: [UserStateService],
})
export class MainViewComponent {
  private _viewRegistry = inject(ViewRegistryService);
  private _matDialog = inject(MatDialog);
  readonly _appConfig = inject(AppConfigContainerService);
  readonly _authService = inject(AuthService);

  readonly navBarRightMenuItems = this._viewRegistry.getDashlets('menu/navbar/right');
  readonly adminAlerts = this._viewRegistry.getDashlets('admin/alerts');

  addBookmark(): void {
    this._matDialog.open(BookmarkCreateDialogComponent);
  }
}
